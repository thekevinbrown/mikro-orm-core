import { Theme } from 'cli-highlight';
import { NamingStrategy } from '../naming-strategy';
import { CacheAdapter, FileCacheAdapter } from '../cache';
import { EntityFactory, EntityRepository } from '../entity';
import { AnyEntity, Constructor, Dictionary, EntityClass, EntityClassGroup, FilterDef, IPrimaryKey } from '../typings';
import { Hydrator, ObjectHydrator } from '../hydration';
import { Logger, LoggerNamespace, NotFoundError } from '../utils';
import { EntityManager } from '../EntityManager';
import { EntityOptions, EntitySchema, IDatabaseDriver } from '..';
import { MetadataProvider, ReflectMetadataProvider } from '../metadata';
import { EventSubscriber } from '../events';
export declare class Configuration<D extends IDatabaseDriver = IDatabaseDriver> {
    static readonly DEFAULTS: {
        pool: {};
        entities: never[];
        entitiesTs: never[];
        subscribers: never[];
        filters: {};
        discovery: {
            warnWhenNoEntities: boolean;
            requireEntitiesArray: boolean;
            alwaysAnalyseProperties: boolean;
            disableDynamicFileAccess: boolean;
        };
        strict: boolean;
        logger: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        findOneOrFailHandler: (entityName: string, where: Dictionary | IPrimaryKey) => NotFoundError<AnyEntity<any, string | number | symbol>>;
        baseDir: string;
        hydrator: typeof ObjectHydrator;
        autoJoinOneToOneOwner: boolean;
        propagateToOneOwner: boolean;
        forceUtcTimezone: boolean;
        ensureIndexes: boolean;
        debug: boolean;
        verbose: boolean;
        driverOptions: {};
        migrations: {
            tableName: string;
            path: string;
            pattern: RegExp;
            transactional: boolean;
            disableForeignKeys: boolean;
            allOrNothing: boolean;
            dropTables: boolean;
            safe: boolean;
            emit: string;
            fileName: (timestamp: string) => string;
        };
        cache: {
            pretty: boolean;
            adapter: typeof FileCacheAdapter;
            options: {
                cacheDir: string;
            };
        };
        metadataProvider: typeof ReflectMetadataProvider;
        highlight: boolean;
        highlightTheme: {
            keyword: string[];
            built_in: string[];
            string: string[];
            literal: string;
            meta: string[];
        };
    };
    static readonly PLATFORMS: {
        mongo: {
            className: string;
            module: () => any;
        };
        mysql: {
            className: string;
            module: () => any;
        };
        mariadb: {
            className: string;
            module: () => any;
        };
        postgresql: {
            className: string;
            module: () => any;
        };
        sqlite: {
            className: string;
            module: () => any;
        };
    };
    private readonly options;
    private readonly logger;
    private readonly driver;
    private readonly platform;
    private readonly cache;
    private readonly highlightTheme;
    constructor(options: Options, validate?: boolean);
    /**
     * Gets specific configuration option. Falls back to specified `defaultValue` if provided.
     */
    get<T extends keyof MikroORMOptions<D>, U extends MikroORMOptions<D>[T]>(key: T, defaultValue?: U): U;
    /**
     * Overrides specified configuration value.
     */
    set<T extends keyof MikroORMOptions<D>, U extends MikroORMOptions<D>[T]>(key: T, value: U): void;
    /**
     * Gets Logger instance.
     */
    getLogger(): Logger;
    /**
     * Gets current client URL (connection string).
     */
    getClientUrl(hidePassword?: boolean): string;
    /**
     * Gets current database driver instance.
     */
    getDriver(): D;
    /**
     * Gets instance of NamingStrategy. (cached)
     */
    getNamingStrategy(): NamingStrategy;
    /**
     * Gets instance of Hydrator. Hydrator cannot be cached as it would have reference to wrong (global) EntityFactory.
     */
    getHydrator(factory: EntityFactory, em: EntityManager): Hydrator;
    /**
     * Gets instance of MetadataProvider. (cached)
     */
    getMetadataProvider(): MetadataProvider;
    /**
     * Gets instance of CacheAdapter. (cached)
     */
    getCacheAdapter(): CacheAdapter;
    /**
     * Gets EntityRepository class to be instantiated.
     */
    getRepositoryClass(customRepository: EntityOptions<any>['customRepository']): MikroORMOptions<D>['entityRepository'];
    /**
     * Gets highlight there used when logging SQL.
     */
    getHighlightTheme(): Theme;
    private init;
    private validateOptions;
    private initDriver;
    private cached;
}
export interface ConnectionOptions {
    dbName?: string;
    name?: string;
    clientUrl?: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    charset?: string;
    multipleStatements?: boolean;
    pool?: PoolConfig;
}
export declare type MigrationsOptions = {
    tableName?: string;
    path?: string;
    pattern?: RegExp;
    transactional?: boolean;
    disableForeignKeys?: boolean;
    allOrNothing?: boolean;
    dropTables?: boolean;
    safe?: boolean;
    emit?: 'js' | 'ts';
    fileName?: (timestamp: string) => string;
};
export interface PoolConfig {
    name?: string;
    afterCreate?: (...a: unknown[]) => unknown;
    min?: number;
    max?: number;
    refreshIdle?: boolean;
    idleTimeoutMillis?: number;
    reapIntervalMillis?: number;
    returnToHead?: boolean;
    priorityRange?: number;
    log?: (message: string, logLevel: string) => void;
    maxWaitingClients?: number;
    testOnBorrow?: boolean;
    acquireTimeoutMillis?: number;
    fifo?: boolean;
    autostart?: boolean;
    evictionRunIntervalMillis?: number;
    numTestsPerRun?: number;
    softIdleTimeoutMillis?: number;
    Promise?: any;
}
export interface MikroORMOptions<D extends IDatabaseDriver = IDatabaseDriver> extends ConnectionOptions {
    entities: (string | EntityClass<AnyEntity> | EntityClassGroup<AnyEntity> | EntitySchema<any>)[];
    entitiesTs: (string | EntityClass<AnyEntity> | EntityClassGroup<AnyEntity> | EntitySchema<any>)[];
    subscribers: EventSubscriber[];
    filters: Dictionary<{
        name?: string;
    } & Omit<FilterDef<AnyEntity>, 'name'>>;
    discovery: {
        warnWhenNoEntities?: boolean;
        requireEntitiesArray?: boolean;
        alwaysAnalyseProperties?: boolean;
        disableDynamicFileAccess?: boolean;
    };
    type?: keyof typeof Configuration.PLATFORMS;
    driver?: {
        new (config: Configuration): D;
    };
    driverOptions: Dictionary;
    namingStrategy?: {
        new (): NamingStrategy;
    };
    implicitTransactions?: boolean;
    autoJoinOneToOneOwner: boolean;
    propagateToOneOwner: boolean;
    forceUtcTimezone: boolean;
    timezone?: string;
    ensureIndexes: boolean;
    hydrator: {
        new (factory: EntityFactory, em: EntityManager): Hydrator;
    };
    entityRepository?: Constructor<EntityRepository<any>>;
    replicas?: Partial<ConnectionOptions>[];
    strict: boolean;
    logger: (message: string) => void;
    findOneOrFailHandler: (entityName: string, where: Dictionary | IPrimaryKey) => Error;
    debug: boolean | LoggerNamespace[];
    highlight: boolean;
    highlightTheme?: Dictionary<string | string[]>;
    tsNode?: boolean;
    baseDir: string;
    migrations: MigrationsOptions;
    cache: {
        enabled?: boolean;
        pretty?: boolean;
        adapter?: {
            new (...params: any[]): CacheAdapter;
        };
        options?: Dictionary;
    };
    metadataProvider: {
        new (config: Configuration): MetadataProvider;
    };
}
export declare type Options<D extends IDatabaseDriver = IDatabaseDriver> = Pick<MikroORMOptions<D>, Exclude<keyof MikroORMOptions<D>, keyof typeof Configuration.DEFAULTS>> | MikroORMOptions<D>;
