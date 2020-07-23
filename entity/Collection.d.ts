import { AnyEntity, FilterQuery } from '../typings';
import { ArrayCollection } from './index';
import { QueryOrderMap } from '../enums';
import { Reference } from './Reference';
export declare class Collection<T extends AnyEntity<T>, O extends AnyEntity<O> = AnyEntity> extends ArrayCollection<T, O> {
    private snapshot;
    private initialized;
    private dirty;
    private _populated;
    constructor(owner: O, items?: T[], initialized?: boolean);
    /**
     * Initializes the collection and returns the items
     */
    loadItems(): Promise<T[]>;
    /**
     * Returns the items (the collection must be initialized)
     */
    getItems(check?: boolean): T[];
    add(...items: (T | Reference<T>)[]): void;
    set(items: (T | Reference<T>)[]): void;
    /**
     * @internal
     */
    hydrate(items: T[], validate?: boolean, takeSnapshot?: boolean): void;
    remove(...items: (T | Reference<T>)[]): void;
    contains(item: (T | Reference<T>), check?: boolean): boolean;
    count(): number;
    isInitialized(fully?: boolean): boolean;
    shouldPopulate(): boolean;
    populated(populated?: boolean): void;
    isDirty(): boolean;
    setDirty(dirty?: boolean): void;
    init(options?: InitOptions<T>): Promise<this>;
    init(populate?: string[], where?: FilterQuery<T>, orderBy?: QueryOrderMap): Promise<this>;
    /**
     * @internal
     */
    takeSnapshot(): void;
    /**
     * @internal
     */
    getSnapshot(): T[] | undefined;
    private createCondition;
    private createOrderBy;
    private createManyToManyCondition;
    private modify;
    private checkInitialized;
    /**
     * re-orders items after searching with `$in` operator
     */
    private reorderItems;
    private cancelOrphanRemoval;
    private validateItemType;
    private validateModification;
}
export interface InitOptions<T> {
    populate?: string[];
    orderBy?: QueryOrderMap;
    where?: FilterQuery<T>;
}
