import { AnyEntity } from '../typings';
import { EventArgs, EventSubscriber, FlushEventArgs } from './EventSubscriber';
import { EventType } from './EventType';
export declare class EventManager {
    private readonly listeners;
    private readonly entities;
    constructor(subscribers: EventSubscriber[]);
    registerSubscriber(subscriber: EventSubscriber): void;
    dispatchEvent<T extends AnyEntity<T>>(event: EventType.onInit, args: Partial<EventArgs<T>>): unknown;
    dispatchEvent<T extends AnyEntity<T>>(event: EventType, args: Partial<EventArgs<T> | FlushEventArgs>): Promise<unknown>;
    private getSubscribedEntities;
}
