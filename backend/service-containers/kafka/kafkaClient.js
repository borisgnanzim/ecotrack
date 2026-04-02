// kafka/kafkaClient.js - Client Kafka pour service-containers (ES6 modules)
import { Kafka, logLevel } from 'kafkajs';

const kafkaClient = new Kafka({
  clientId: `${process.env.SERVICE_NAME || 'service-containers'}-${Date.now()}`,
  brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
  logLevel: process.env.NODE_ENV === 'production' ? logLevel.ERROR : logLevel.DEBUG,
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
    randomizationFactor: 0.2,
  },
});

// Producteur Global
let producer = null;

export const getProducer = async () => {
  if (!producer) {
    producer = kafkaClient.producer({
      idempotent: true,
      transactionTimeout: 30000,
    });
    await producer.connect();
    console.log('✅ Kafka Producer connecté (service-containers)');
  }
  return producer;
};

// Consommateur Global
let consumers = {};

/**
 * Créer un consommateur pour un topic
 * @param {string} groupId - ID du groupe de consommation
 * @param {string|string[]} topics - Topic(s) à écouter
 * @param {Function} messageHandler - Fonction appelée pour chaque message reçu
 */
export const createConsumer = async (groupId, topics, messageHandler) => {
  const consumerKey = `${groupId}-${Array.isArray(topics) ? topics.join('-') : topics}`;
  
  if (consumers[consumerKey]) {
    return consumers[consumerKey];
  }

  const consumer = kafkaClient.consumer({ groupId });
  await consumer.connect();

  const topicsArray = Array.isArray(topics) ? topics : [topics];
  await consumer.subscribe({ topics: topicsArray, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const value = message.value.toString();
        const parsedMessage = JSON.parse(value);
        
        console.log(`📨 Message reçu - Topic: ${topic}, Partition: ${partition}`);
        console.log(`   Contenu:`, parsedMessage);
        
        // Appeler le handler
        await messageHandler(parsedMessage, topic);
      } catch (error) {
        console.error(`❌ Erreur message processing:`, error.message);
      }
    },
  });

  consumers[consumerKey] = consumer;
  console.log(`✅ Kafka Consumer connecté - Groupe: ${groupId}, Topics: ${topicsArray.join(', ')}`);
  
  return consumer;
};

/**
 * Publier un message sur un topic
 * @param {string} topic - Topic Kafka
 * @param {Object} message - Message à publier
 * @param {string} key - Clé du partitionnement (optionnel)
 */
export const publishMessage = async (topic, message, key = null) => {
  try {
    const producer = await getProducer();
    
    const record = {
      topic,
      messages: [
        {
          key: key ? Buffer.from(key) : null,
          value: JSON.stringify({
            ...message,
            timestamp: new Date().toISOString(),
            source: 'service-containers',
          }),
          headers: {
            'content-type': 'application/json',
          },
        },
      ],
    };

    const result = await producer.send(record);
    console.log(`✅ Message publié - Topic: ${topic}, Partition: ${result[0].partition}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur publication message:`, error.message);
    throw error;
  }
};

/**
 * Créer des topics s'ils n'existent pas
 * @param {string[]} topicsToCreate - Liste des topics à créer
 */
export const ensureTopicsExist = async (topicsToCreate) => {
  try {
    const admin = kafkaClient.admin();
    await admin.connect();

    const existingTopics = await admin.listTopics();
    
    const topicsToAdd = topicsToCreate.filter(
      topic => !existingTopics.includes(topic)
    );

    if (topicsToAdd.length > 0) {
      await admin.createTopics({
        topics: topicsToAdd.map(topic => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
          configEntries: [
            { name: 'retention.ms', value: '604800000' }, // 7 jours
            { name: 'segment.ms', value: '86400000' }, // 1 jour
          ],
        })),
      });
      console.log(`✅ Topics créés: ${topicsToAdd.join(', ')}`);
    } else {
      console.log(`✅ Tous les topics existent déjà`);
    }

    await admin.disconnect();
  } catch (error) {
    console.error(`❌ Erreur création topics:`, error.message);
    throw error;
  }
};

/**
 * Graceful shutdown
 */
export const disconnectKafka = async () => {
  try {
    if (producer) {
      await producer.disconnect();
      console.log('✅ Kafka Producer déconnecté (service-containers)');
    }
    
    for (const [key, consumer] of Object.entries(consumers)) {
      await consumer.disconnect();
      console.log(`✅ Kafka Consumer déconnecté: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Erreur déconnexion Kafka:`, error.message);
  }
};
