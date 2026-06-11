const { Kafka, logLevel } = require('kafkajs');

const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];

const kafka = new Kafka({
  clientId: 'gamification-service',
  brokers: KAFKA_BROKERS,
  logLevel: logLevel.INFO,
});

const producer = kafka.producer();
let isProducerConnected = false;

const getProducer = async () => {
  if (!isProducerConnected) {
    await producer.connect();
    isProducerConnected = true;
    console.log('Kafka Producer connected for Gamification Service');
  }
  return producer;
};

const disconnectProducer = async () => {
  if (isProducerConnected) {
    await producer.disconnect();
    isProducerConnected = false;
    console.log('Kafka Producer disconnected for Gamification Service');
  }
};

module.exports = { getProducer, disconnectProducer };