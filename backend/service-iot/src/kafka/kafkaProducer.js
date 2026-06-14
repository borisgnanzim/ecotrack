import { Kafka, Partitioners } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const kafka = new Kafka({
  clientId: "service-iot",
  brokers: (process.env.KAFKA_BROKERS || "localhost:19092").split(","),
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
  allowAutoTopicCreation: true,
});

let connected = false;

async function ensureConnected() {
  if (!connected) {
    await producer.connect();
    connected = true;
    console.log("✅ Kafka Producer IoT connecté");
  }
}

export async function publishToKafka(topic, payload) {
  await ensureConnected();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload), key: payload.containerId }],
  });
}

export async function disconnectKafka() {
  if (connected) {
    await producer.disconnect();
    connected = false;
  }
}
