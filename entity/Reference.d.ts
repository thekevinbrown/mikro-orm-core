import { AnyEntity, Dictionary, EntityProperty } from '../typings';
export declare type IdentifiedReference<T, PK extends keyof T = 'id' & keyof T> = {
    [K in PK]: T[K];
} & Reference<T>;
export declare class Reference<T> {
    private entity;
    private __helper?;
    constructor(entity: T);
    static create<T, PK extends keyof T>(entity: T | IdentifiedReference<T, PK>): IdentifiedReference<T, PK>;
    /**
     * Checks whether the argument is instance or `Reference` wrapper.
     */
    static isReference<T extends AnyEntity<T>>(data: any): data is Reference<T>;
    /**
     * Wraps the entity in a `Reference` wrapper if the property is defined as `wrappedReference`.
     */
    static wrapReference<T extends AnyEntity<T>>(entity: T | Reference<T>, prop: EntityProperty<T>): Reference<T> | T;
    /**
     * Returns wrapped entity.
     */
    static unwrapReference<T extends AnyEntity<T>>(ref: T | Reference<T>): T;
    load(): Promise<T>;
    get<K extends keyof T>(prop: K): Promise<T[K]>;
    set(entity: T | IdentifiedReference<T>): void;
    unwrap(): T;
    getEntity(): T;
    getProperty<K extends keyof T>(prop: K): T[K];
    isInitialized(): boolean;
    populated(populated?: boolean): void;
    toJSON(...args: any[]): Dictionary;
}
