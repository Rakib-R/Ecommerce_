
// apps/user-ui/src/app/lib/track.ts
export function sendKafkaEvent(eventData: {
  userId?: string;
  productId?: string;
  shopId?: string;
  action: string;
  device?: string;
  country?: string;
  city?: string;
}): void {
  fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/track-user-kafka`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  }).catch(console.error);
}

// "use server";
// import {getProducer} from "../../../../packages/utils/kafka"
// export async function sendKafkaEvent(eventData: {
  //   userId?: string;
  //   productId?: string;
  //   shopId?: string;
  //   action: string;
  //   device?: string;
  //   country?: string;
  //   city?: string;
  // }) {
    
  //todo  TRY LATER WITH REMOVING THIS PRODUCER
//    const producer = await getProducer(); 

//   try {
//     await producer.connect();
//     await producer.send({
//       topic: process.env.KAFKA_TOPIC!,
//       messages: [{ value: JSON.stringify(eventData) }],
//     });

//   } catch (error) {
//     console.error('[Kafka] Failed to send event:', (error as Error).message);

//   } finally {
//     if (producer) {
//       await producer.disconnect();
//     }
//   }

// }