import { Kafka, logLevel, Producer, Partitioners } from "kafkajs";

const BROKER = process.env.KAFKA_BOOTSTRAP_SERVERS || process.env.KAFKA_BROKER || "localhost:9092";
const API_KEY = process.env.KAFKA_API_KEY;
const API_SECRET = process.env.KAFKA_API_SECRET;
const TOPIC = process.env.KAFKA_TOPIC || "user-events";

// Only log if we're in development or debug mode
// if (process.env.NODE_ENV !== 'production') {
//   console.log('🔑 Kafka Configuration:');
//   console.log('  Broker:', BROKER);
//   console.log('  API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'Not set');
//   console.log('  Has Secret:', !!API_SECRET);
//   console.log('  Topic:', TOPIC);
// }

// Create Kafka client
export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: [BROKER],
  ssl: BROKER !== "localhost:9092", // Enable SSL for Confluent Cloud, disable for local
  sasl: API_KEY && API_SECRET ? {
    mechanism: "plain",
    username: API_KEY,
    password: API_SECRET,
  } : undefined,
  connectionTimeout: 30000, // Increased from 7000 to 30000
  requestTimeout: 60000,    // Increased from 30000 to 60000
  retry: {
    initialRetryTime: 100,
    retries: 10,            // Increased retries
    factor: 2,              // Changed from 0.2 to 2 (exponential backoff)
    multiplier: 1.5,
    maxRetryTime: 30000,
  },
  logLevel: process.env.NODE_ENV === 'development' ? logLevel.DEBUG : logLevel.ERROR,
  logCreator: () => ({ namespace, level, log }) => {
    // Only log errors and warnings in production
    if (process.env.NODE_ENV !== 'production' || level <= logLevel.ERROR) {
      console.log(` [${namespace}]`);
    }
  },
});

// Singleton producer
let producer: Producer | null = null;
let connectionPromise: Promise<void> | null = null;

export async function getProducer(): Promise<Producer> {
  // If producer exists and is connected, return it
  if (producer) {
    try {
      // Quick health check (optional, removes if causing issues)
      // await producer.send({
      //   topic: TOPIC,
      //   messages: [{ value: JSON.stringify({ ping: true }) }],
      //   timeout: 5000,
      // });
      return producer;
    } catch (error) {
      console.log('⚠️ Producer disconnected, reconnecting...');
      producer = null;
      connectionPromise = null;
    }
  }

  // Prevent multiple simultaneous connect() calls
  if (connectionPromise) {
    await connectionPromise;
    return producer!;
  }

  // Create new producer
  producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
    metadataMaxAge: 60000,
    allowAutoTopicCreation: true, // Add this to auto-create topics
    maxInFlightRequests: 1,
    idempotent: false,
  });

  // Store the connection promise
  connectionPromise = (async () => {
    try {
      console.log('🚀 Connecting to Kafka...');
      await producer!.connect();
      console.log('✅ Kafka producer connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect Kafka producer:', error);
      producer = null;
      throw error;
    } finally {
      connectionPromise = null;
    }
  })();

  await connectionPromise;
  return producer!;
}

// Helper function to send events with retry logic
export async function sendKafkaEvent(eventData: {
  userId?: string;
  productId?: string;
  shopId?: string;
  action: string;
  device?: string;
  country?: string;
  city?: string;
}) {
  // Skip if no credentials in development
  if (process.env.NODE_ENV === 'development' && (!API_KEY || API_KEY === 'your-api-key')) {
    console.log('📝 [DEV] Event (skipped):', eventData.action);
    return;
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const producer = await getProducer();
      
      const message = {
        ...eventData,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'user-ui',
          environment: process.env.NODE_ENV,
          attempt: attempt,
        },
      };
      
      await producer.send({
        topic: TOPIC,
        messages: [{
          key: eventData.userId || eventData.productId || 'unknown',
          value: JSON.stringify(message),
        }],
      });
      
      if (attempt > 1) {
        console.log(`✅ Event sent on attempt ${attempt}: ${eventData.action}`);
      } else {
        console.log(`✅ Event sent: ${eventData.action}`);
      }
      return;
      
    } catch (error : any) {
      lastError = error as Error;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed for ${eventData.action}:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Reset producer on failure
        producer = null;
        connectionPromise = null;
      }
    }
  }
  
  console.error(`❌ All ${maxRetries} attempts failed for ${eventData.action}`);
  throw lastError;
}

// Optional: Health check function
export async function checkKafkaHealth(): Promise<boolean> {
  try {
    const producer = await getProducer();
    await producer.send({
      topic: TOPIC,
      messages: [{ value: JSON.stringify({ health: true, timestamp: Date.now() }) }],
      timeout: 5000,
    });
    return true;
  } catch (error) {
    console.error('Kafka health check failed:', error);
    return false;
  }
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  const shutdown = async () => {
    console.log('🛑 Shutting down Kafka producer...');
    if (producer) {
      await producer.disconnect();
      console.log('✅ Kafka producer disconnected');
    }
    process.exit(0);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}