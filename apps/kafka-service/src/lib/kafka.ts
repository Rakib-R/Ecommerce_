import { Kafka } from "kafkajs";

const broker =
  process.env.KAFKA_BOOTSTRAP_SERVERS ||
  process.env.KAFKA_BROKER ||
  "localhost:9092";

const apiKey = process.env.KAFKA_API_KEY;
const apiSecret = process.env.KAFKA_API_SECRET;

export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: [broker],
  ssl: broker !== "localhost:9092",
  sasl:
    apiKey && apiSecret
      ? {
          mechanism: "plain",
          username: apiKey,
          password: apiSecret,
        }
      : undefined,
});
