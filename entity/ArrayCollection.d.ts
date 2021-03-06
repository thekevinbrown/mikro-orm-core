import { AnyEntity, Dictionary, EntityProperty, IPrimaryKey, Primary } from '../typings';
import { Collection } from './Collection';
import { Reference } from './Reference';
export declare class ArrayCollection<T extends AnyEntity<T>, O extends AnyEntity<O>> {
    readonly owner: O;
    [k: number]: T;
    protected readonly items: T[];
    private _property?;
    constructor(owner: O, items?: T[]);
    getItems(): T[];
    toArray(): Dictionary[];
    getIdentifiers<U extends IPrimaryKey = Primary<T> & IPrimaryKey>(field?: string): U[];
    add(...items: (T | Reference<T>)[]): void;
    set(items: (T | Reference<T>)[]): void;
    /**
     * @internal
     */
    hydrate(items: T[]): void;
    remove(...items: (T | Reference<T>)[]): void;
    removeAll(): void;
    contains(item: T | Reference<T>, check?: boolean): boolean;
    count(): number;
    get length(): number;
    [Symbol.iterator](): IterableIterator<T>;
    /**
     * @internal
     */
    get property(): EntityProperty;
    protected propagate(item: T, method: 'add' | 'remove'): void;
    protected propagateToInverseSide(item: T, method: 'add' | 'remove'): void;
    protected propagateToOwningSide(item: T, method: 'add' | 'remove'): void;
    protected shouldPropagateToCollection(collection: Collection<O, T>, method: 'add' | 'remove'): boolean;
}
