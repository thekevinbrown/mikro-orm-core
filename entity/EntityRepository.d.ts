import { EntityManager, FindOneOrFailOptions } from '../EntityManager';
import { EntityData, EntityName, AnyEntity, Primary } from '../typings';
import { QueryOrderMap } from '../enums';
import { FilterQuery, FindOneOptions, FindOptions, IdentifiedReference } from '..';
export declare class EntityRepository<T> {
    protected readonly em: EntityManager;
    protected readonly entityName: EntityName<T>;
    constructor(em: EntityManager, entityName: EntityName<T>);
    persist(entity: AnyEntity | AnyEntity[]): EntityManager;
    persistAndFlush(entity: AnyEntity | AnyEntity[]): Promise<void>;
    /**
     * @deprecated use `persist()`
     */
    persistLater(entity: AnyEntity | AnyEntity[]): void;
    findOne(where: FilterQuery<T>, populate?: string[] | boolean, orderBy?: QueryOrderMap): Promise<T | null>;
    findOne(where: FilterQuery<T>, populate?: FindOneOptions<T>, orderBy?: QueryOrderMap): Promise<T | null>;
    findOneOrFail(where: FilterQuery<T>, populate?: string[] | boolean, orderBy?: QueryOrderMap): Promise<T>;
    findOneOrFail(where: FilterQuery<T>, populate?: FindOneOrFailOptions<T>, orderBy?: QueryOrderMap): Promise<T>;
    find(where: FilterQuery<T>, options?: FindOptions<T>): Promise<T[]>;
    find(where: FilterQuery<T>, populate?: string[] | boolean, orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<T[]>;
    findAndCount(where: FilterQuery<T>, options?: FindOptions<T>): Promise<[T[], number]>;
    findAndCount(where: FilterQuery<T>, populate?: string[] | boolean, orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<[T[], number]>;
    findAll(options?: FindOptions<T>): Promise<T[]>;
    findAll(populate?: string[] | boolean | true, orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<T[]>;
    remove(entity: AnyEntity): EntityManager;
    removeAndFlush(entity: AnyEntity): Promise<void>;
    /**
     * @deprecated use `remove()`
     */
    removeLater(entity: AnyEntity): void;
    flush(): Promise<void>;
    nativeInsert(data: EntityData<T>): Promise<Primary<T>>;
    nativeUpdate(where: FilterQuery<T>, data: EntityData<T>): Promise<number>;
    nativeDelete(where: FilterQuery<T> | any): Promise<number>;
    map(result: EntityData<T>): T;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<PK extends keyof T>(id: Primary<T>, wrapped: true): IdentifiedReference<T, PK>;
    getReference<PK extends keyof T = keyof T>(id: Primary<T>): T;
    getReference<PK extends keyof T = keyof T>(id: Primary<T>, wrapped: false): T;
    canPopulate(property: string): boolean;
    populate(entities: T, populate: string | string[] | boolean, where?: FilterQuery<T>, orderBy?: QueryOrderMap, refresh?: boolean, validate?: boolean): Promise<T>;
    populate(entities: T[], populate: string | string[] | boolean, where?: FilterQuery<T>, orderBy?: QueryOrderMap, refresh?: boolean, validate?: boolean): Promise<T[]>;
    /**
     * Creates new instance of given entity and populates it with given data
     */
    create(data: EntityData<T>): T;
    count(where?: FilterQuery<T>): Promise<number>;
}
