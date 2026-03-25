// apps/api-gateway/src/routes/track.route.ts
import { getProducer } from '../../../../packages/utils/kafka';
import { NextFunction, Request, Response } from "express";


export const track_router_kafka = async (
  req: Request,
  res: Response,
  next: NextFunction
)  =>  {
  
  const { userId, productId, shopId, action, device, country, city } = req.body;
  
  if (!action) {
    return res.status(400).json({ ok: false, error: 'action required' });
  }

  try {
    const producer = await getProducer();
    
    await producer.send({
      topic: process.env.KAFKA_TOPIC || 'user-events',
      messages: [{ 
        value: JSON.stringify({ 
          userId, 
          productId, 
          shopId, 
          action, 
          device, 
          country, 
          city,
          timestamp: new Date().toISOString(),
          source: 'user-ui'
        }),
        key: userId || productId || 'unknown',
      }],
    });
    return res.json({ ok: true });
    
  } catch (error) {
    console.error('[Kafka] Track error:', (error as Error).message);
    return res.status(500).json({ ok: false, error: 'Kafka error' });
  }

  
}
export default track_router_kafka;


// Optional: Batch endpoint
export const kafka_batch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  const { events } = req.body;
  
  if (!events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ ok: false, error: 'events array required' });
  }

  try {
    const producer = await getProducer();
    const messages = events.map(event => ({
      value: JSON.stringify({ 
        ...event,
        timestamp: new Date().toISOString(),
        source: 'user-ui'
      }),
      key: event.userId || event.productId || 'unknown',
    }));
    
    await producer.send({
      topic: process.env.KAFKA_TOPIC || 'user-events',
      messages,
    });
    
    console.log(`✅ Batch sent: ${messages.length} events`);
    return res.json({ ok: true, count: messages.length });
    
  } catch (error) {
    console.error('[Kafka] Batch error:', error);
    return res.status(500).json({ ok: false, error: 'Kafka error' });
  }

}

