/// <reference types="node" />
import { inspect } from 'util';
import { Configuration } from './utils';
import { EntityFactory, EntityRepository, EntityValidator, IdentifiedReference, Reference } from './entity';
import { LockMode, UnitOfWork } from './unit-of-work';
import { CountOptions, DeleteOptions, EntityManagerType, FindOneOptions, FindOptions, IDatabaseDriver, Populate, UpdateOptions } from './drivers';
import { AnyEntity, Dictionary, EntityData, EntityName, FilterQuery, IPrimaryKey, Primary } from './typings';
import { QueryOrderMap } from './enums';
import { MetadataStorage } from './metadata';
import { Transaction } from './connections';
import { EventManager } from './events';
/**
 * The EntityManager is the central access point to ORM functionality. It is a facade to all different ORM subsystems
 * such as UnitOfWork, Query Language and Repository API.
 */
export declare class EntityManager<D extends IDatabaseDriver = IDatabaseDriver> {
    readonly config: Configuration;
    private readonly driver;
    private readonly metadata;
    private readonly useContext;
    readonly id: string;
    private readonly validator;
    private readonly repositoryMap;
    private readonly entityLoader;
    private readonly unitOfWork;
    private readonly entityFactory;
    private readonly eventManager;
    private filters;
    private filterParams;
    private transactionContext?;
    constructor(config: Configuration, driver: D, metadata: MetadataStorage, useContext?: boolean);
    /**
     * Gets the Driver instance used by this EntityManager
     */
    getDriver(): D;
    /**
     * Gets the Connection instance, by default returns write connection
     */
    getConnection(type?: 'read' | 'write'): ReturnType<D['getConnection']>;
    /**
     * Gets repository for given entity. You can pass either string name or entity class reference.
     */
    getRepository<T extends AnyEntity<T>, U extends EntityRepository<T> = EntityRepository<T>>(entityName: EntityName<T>): U;
    /**
     * Gets EntityValidator instance
     */
    getValidator(): EntityValidator;
    /**
     * Finds all entities matching your `where` query. You can pass additional options via the `options` parameter.
     */
    find<T>(entityName: EntityName<T>, where: FilterQuery<T>, options?: FindOptions<T>): Promise<T[]>;
    /**
     * Finds all entities matching your `where` query.
     */
    find<T>(entityName: EntityName<T>, where: FilterQuery<T>, populate?: Populate<T>, orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<T[]>;
    addFilter<T1>(name: string, cond: FilterQuery<T1> | ((args: Dictionary) => FilterQuery<T1>), entityName?: EntityName<T1> | [EntityName<T1>], enabled?: boolean): void;
    addFilter<T1, T2>(name: string, cond: FilterQuery<T1 | T2> | ((args: Dictionary) => FilterQuery<T1 | T2>), entityName?: [EntityName<T1>, EntityName<T2>], enabled?: boolean): void;
    addFilter<T1, T2, T3>(name: string, cond: FilterQuery<T1 | T2 | T3> | ((args: Dictionary) => FilterQuery<T1 | T2 | T3>), entityName?: [EntityName<T1>, EntityName<T2>, EntityName<T3>], enabled?: boolean): void;
    setFilterParams(name: string, args: Dictionary): void;
    protected applyFilters<T>(entityName: string, where: FilterQuery<T>, options: Dictionary<boolean | Dictionary> | string[] | boolean, type: 'read' | 'update' | 'delete'): Promise<FilterQuery<T>>;
    /**
     * Calls `em.find()` and `em.count()` with the same arguments (where applicable) and returns the results as tuple
     * where first element is the array of entities and the second is the count.
     */
    findAndCount<T>(entityName: EntityName<T>, where: FilterQuery<T>, options?: FindOptions<T>): Promise<[T[], number]>;
    /**
     * Calls `em.find()` and `em.count()` with the same arguments (where applicable) and returns the results as tuple
     * where first element is the array of entities and the second is the count.
     */
    findAndCount<T>(entityName: EntityName<T>, where: FilterQuery<T>, populate?: Populate<T>, orderBy?: QueryOrderMap, limit?: number, offset?: number): Promise<[T[], number]>;
    /**
     * Finds first entity matching your `where` query.
     */
    findOne<T>(entityName: EntityName<T>, where: FilterQuery<T>, options?: FindOneOptions<T>): Promise<T | null>;
    /**
     * Finds first entity matching your `where` query.
     */
    findOne<T>(entityName: EntityName<T>, where: FilterQuery<T>, populate?: Populate<T>, orderBy?: QueryOrderMap): Promise<T | null>;
    /**
     * Finds first entity matching your `where` query. If nothing found, it will throw an error.
     * You can override the factory for creating this method via `options.failHandler` locally
     * or via `Configuration.findOneOrFailHandler` globally.
     */
    findOneOrFail<T>(entityName: EntityName<T>, where: FilterQuery<T>, options?: FindOneOrFailOptions<T>): Promise<T>;
    /**
     * Finds first entity matching your `where` query. If nothing found, it will throw an error.
     * You can override the factory for creating this method via `options.failHandler` locally
     * or via `Configuration.findOneOrFailHandler` globally.
     */
    findOneOrFail<T>(entityName: EntityName<T>, where: FilterQuery<T>, populate?: Populate<T>, orderBy?: QueryOrderMap): Promise<T>;
    /**
     * Runs your callback wrapped inside a database transaction.
     */
    transactional<T>(cb: (em: D[typeof EntityManagerType]) => Promise<T>, ctx?: any): Promise<T>;
    /**
     * Runs your callback wrapped inside a database transaction.
     */
    lock(entity: AnyEntity, lockMode: LockMode, lockVersion?: number | Date): Promise<void>;
    /**
     * Fires native insert query. Calling this has no side effects on the context (identity map).
     */
    nativeInsert<T>(entityName: EntityName<T>, data: EntityData<T>): Promise<Primary<T>>;
    /**
     * Fires native update query. Calling this has no side effects on the context (identity map).
     */
    nativeUpdate<T>(entityName: EntityName<T>, where: FilterQuery<T>, data: EntityData<T>, options?: UpdateOptions<T>): Promise<number>;
    /**
     * Fires native delete query. Calling this has no side effects on the context (identity map).
     */
    nativeDelete<T>(entityName: EntityName<T>, where: FilterQuery<T>, options?: DeleteOptions<T>): Promise<number>;
    /**
     * Maps raw database result to an entity and merges it to this EntityManager.
     */
    map<T>(entityName: EntityName<T>, result: EntityData<T>): T;
    /**
     * Merges given entity to this EntityManager so it becomes managed. You can force refreshing of existing entities
     * via second parameter. By default it will return already loaded entities without modifying them.
     */
    merge<T>(entity: T, refresh?: boolean): T;
    /**
     * Merges given entity to this EntityManager so it becomes managed. You can force refreshing of existing entities
     * via second parameter. By default it will return already loaded entities without modifying them.
     */
    merge<T>(entityName: EntityName<T>, data: EntityData<T>, refresh?: boolean): T;
    /**
     * Creates new instance of given entity and populates it with given data
     */
    create<T>(entityName: EntityName<T>, data: EntityData<T>): T;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T, PK extends keyof T>(entityName: EntityName<T>, id: Primary<T>, wrapped: true): IdentifiedReference<T, PK>;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T>(entityName: EntityName<T>, id: Primary<T> | Primary<T>[]): T;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T>(entityName: EntityName<T>, id: Primary<T>, wrapped: false): T;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T>(entityName: EntityName<T>, id: Primary<T>, wrapped: boolean): T | Reference<T>;
    /**
     * Returns total number of entities matching your `where` query.
     */
    count<T>(entityName: EntityName<T>, where?: FilterQuery<T>, options?: CountOptions<T>): Promise<number>;
    /**
     * Tells the EntityManager to make an instance managed and persistent.
     * The entity will be entered into the database at or before transaction commit or as a result of the flush operation.
     */
    persist(entity: AnyEntity | Reference<AnyEntity> | (AnyEntity | Reference<AnyEntity>)[]): this;
    /**
     * Persists your entity immediately, flushing all not yet persisted changes to the database too.
     * Equivalent to `em.persist(e).flush()`.
     */
    persistAndFlush(entity: AnyEntity | Reference<AnyEntity> | (AnyEntity | Reference<AnyEntity>)[]): Promise<void>;
    /**
     * Tells the EntityManager to make an instance managed and persistent.
     * The entity will be entered into the database at or before transaction commit or as a result of the flush operation.
     *
     * @deprecated use `persist()`
     */
    persistLater(entity: AnyEntity | AnyEntity[]): void;
    /**
     * Removes an entity instance. You can force flushing via second parameter.
     * A removed entity will be removed from the database at or before transaction commit or as a result of the flush operation.
     *
     * To remove entities by condition, use `em.nativeDelete()`.
     */
    remove<T extends AnyEntity<T>>(entity: T | Reference<T> | (T | Reference<T>)[]): this;
    /**
     * Removes an entity instance immediately, flushing all not yet persisted changes to the database too.
     * Equivalent to `em.remove(e).flush()`
     */
    removeAndFlush(entity: AnyEntity | Reference<AnyEntity>): Promise<void>;
    /**
     * Removes an entity instance.
     * A removed entity will be removed from the database at or before transaction commit or as a result of the flush operation.
     *
     * @deprecated use `remove()`
     */
    removeLater(entity: AnyEntity): void;
    /**
     * Flushes all changes to objects that have been queued up to now to the database.
     * This effectively synchronizes the in-memory state of managed objects with the database.
     */
    flush(): Promise<void>;
    /**
     * Clears the EntityManager. All entities that are currently managed by this EntityManager become detached.
     */
    clear(): void;
    /**
     * Checks whether given property can be populated on the entity.
     */
    canPopulate<T>(entityName: EntityName<T>, property: string): boolean;
    populate<T extends AnyEntity<T>>(entities: T, populate: string | Populate<T>, where?: FilterQuery<T>, orderBy?: QueryOrderMap, refresh?: boolean, validate?: boolean): Promise<T>;
    populate<T extends AnyEntity<T>>(entities: T[], populate: string | Populate<T>, where?: FilterQuery<T>, orderBy?: QueryOrderMap, refresh?: boolean, validate?: boolean): Promise<T[]>;
    /**
     * Returns new EntityManager instance with its own identity map
     *
     * @param clear do we want clear identity map? defaults to true
     * @param useContext use request context? should be used only for top level request scope EM, defaults to false
     */
    fork(clear?: boolean, useContext?: boolean): D[typeof EntityManagerType];
    /**
     * Gets the UnitOfWork used by the EntityManager to coordinate operations.
     */
    getUnitOfWork(): UnitOfWork;
    /**
     * Gets the EntityFactory used by the EntityManager.
     */
    getEntityFactory(): EntityFactory;
    getEventManager(): EventManager;
    /**
     * Checks whether this EntityManager is currently operating inside a database transaction.
     */
    isInTransaction(): boolean;
    /**
     * Gets the transaction context (driver dependent object used to make sure queries are executed on same connection).
     */
    getTransactionContext<T extends Transaction = Transaction>(): T | undefined;
    /**
     * Gets the MetadataStorage.
     */
    getMetadata(): MetadataStorage;
    private checkLockRequirements;
    private lockAndPopulate;
    private preparePopulate;
    private preparePopulateObject;
    [inspect.custom](): string;
}
export interface FindOneOrFailOptions<T> extends FindOneOptions<T> {
    failHandler?: (entityName: string, where: Dictionary | IPrimaryKey | any) => Error;
}
