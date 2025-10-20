import { EventEmitter } from 'events';

export type EventPayload<P> = {
  type: string;
  payload: P;
  metadata?: Record<string, unknown>;
};

type EventHandler<P> = (payload: EventPayload<P>) => void | Promise<void>;

/**
 * Basit EventEmitter tabanlı EventBus uygulaması.
 */
export class EventBus {
  private readonly emitter = new EventEmitter();

  publish<P>(event: EventPayload<P>): void {
    this.emitter.emit(event.type, event);
  }

  subscribe<P>(eventType: string, handler: EventHandler<P>): () => void {
    const wrappedHandler = async (event: EventPayload<P>) => {
      await handler(event);
    };
    this.emitter.on(eventType, wrappedHandler);

    return () => {
      this.emitter.off(eventType, wrappedHandler);
    };
  }
}
