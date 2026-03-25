import {kafka} from '@packages/utils/kafka'
import { updateUserAnalytics } from './services/analytics.service';

const consumer = kafka.consumer({heartbeatInterval: 3000, sessionTimeout: 30000, groupId: 'user-events-group'})
const eventQueue: any[] = [];
let isRunning = false;

async function processQueue() {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;
  
    for (const event of events) {

    const validActions = [
        "add_to_wishlist",
        "add_to_cart",
        "product_view",
        "remove_from_cart",
        "remove_from_wishlist"
    ];

  if (event.action === "shop_visit") {
    // update shop analytics
    }

  if (!event.action || !validActions.includes(event.action)) {
      continue
      }
      try {
          await updateUserAnalytics(event)
      } catch(error){
          console.log(error)
          }
      }
}

setInterval(processQueue, 3000);

export async function consumeKafkaMessages(): Promise<void> {
   if (isRunning) {
    console.warn('[Consumer] Already running, skipping duplicate start');
    return;
  }
  isRunning = true;

  // connect to the kafka broker
  await consumer.connect();
  await consumer.subscribe({ 
    topic: process.env.KAFKA_TOPIC!,
    fromBeginning: false 
  });
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    }
  });
};
  consumer.on(consumer.events.CRASH, async ({ payload }) => {
    console.error('[Consumer] Crashed:', payload.error.message);
    isRunning = false;
    await consumer.disconnect().catch(() => {});
    setTimeout(() => consumeKafkaMessages(), 5000);  // backoff retry
  });

consumeKafkaMessages().catch(console.error)