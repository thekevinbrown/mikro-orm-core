import { QueryOrder } from './enums';
import { AssignOptions, Cascade, Collection, EntityRepository, EntityValidator, IdentifiedReference, LoadStrategy, Reference, ReferenceType } from './entity';
import { EntityManager } from './EntityManager';
import { LockMode } from './unit-of-work';
import { Platform } from './platforms';
import { EntitySchema, MetadataStorage } from './metadata';
import { Type } from './types';
import { EventType } from './events';
export declare type Constructor<T> = new (...args: any[]) => T;
export declare type Dictionary<T = any> = {
    [k: string]: T;
};
export declare type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export declare type PartialEntityProperty<T, P extends keyof T> = null | (T extends Date | RegExp ? T : T[P] | (true extends IsEntity<T[P]> ? PartialEntity<T[P]> | Primary<T[P]> : never));
export declare type PartialEntity<T> = T extends Reference<infer U> ? {
    [P in keyof U]?: PartialEntityProperty<U, P>;
} : {
    [P in keyof T]?: PartialEntityProperty<T, P>;
};
export declare type DeepPartialEntity<T> = {
    [P in keyof T]?: null | (T[P] extends (infer U)[] ? DeepPartialEntity<U>[] : T[P] extends readonly (infer U)[] ? readonly DeepPartialEntity<U>[] : T extends Date | RegExp ? T : DeepPartialEntity<T[P]> | PartialEntity<T[P]> | Primary<T[P]> | OperatorMap<T[P]> | StringProp<T[P]>);
};
export declare const PrimaryKeyType: unique symbol;
export declare type Primary<T> = T extends {
    [PrimaryKeyType]: infer PK;
} ? PK : T extends {
    _id: infer PK;
} ? PK | string : T extends {
    uuid: infer PK;
} ? PK : T extends {
    id: infer PK;
} ? PK : never;
export declare type PrimaryMap<T extends AnyEntity<T>> = Record<keyof T, Primary<T>>;
export declare type IPrimaryKeyValue = number | string | bigint | {
    toHexString(): string;
};
export declare type IPrimaryKey<T extends IPrimaryKeyValue = IPrimaryKeyValue> = T;
export declare type IsScalar<T> = T extends number | string | bigint | Date | RegExp ? true : never;
export declare type IsEntity<T> = T extends Reference<T> | {
    [PrimaryKeyType]: any;
} | {
    _id: any;
} | {
    uuid: string;
} | {
    id: number | string | bigint;
} ? true : never;
export declare type OneOrArray<T> = T | T[];
export declare type OperatorMap<T> = {
    $and?: Query<T>[];
    $or?: Query<T>[];
    $eq?: Query<T>;
    $ne?: Query<T>;
    $in?: Query<T>[];
    $nin?: Query<T>[];
    $not?: Query<T>;
    $gt?: Query<T>;
    $gte?: Query<T>;
    $lt?: Query<T>;
    $lte?: Query<T>;
    $like?: string;
    $re?: string;
};
export declare type StringProp<T> = T extends string ? string | RegExp : never;
export declare type EntityOrPrimary<T> = true extends IsScalar<T> ? never : DeepPartialEntity<ReferencedEntity<T>> | PartialEntity<ReferencedEntity<T>> | Primary<ReferencedEntity<T>> | ReferencedEntity<T>;
export declare type CollectionItem<T extends AnyEntity<T>> = T extends Collection<infer K> ? EntityOrPrimary<K> : never;
export declare type ReferencedEntity<T extends AnyEntity<T>> = T extends Reference<infer K> ? K : T;
export declare type FilterValue<T> = T | OperatorMap<T> | StringProp<T> | OneOrArray<CollectionItem<T> | EntityOrPrimary<T>> | null;
export declare type Query<T> = true extends IsEntity<T> ? {
    [K in keyof T]?: Query<ReferencedEntity<T[K]>> | FilterValue<ReferencedEntity<T[K]>> | null;
} | FilterValue<ReferencedEntity<T>> : T extends Collection<infer K> ? {
    [KK in keyof K]?: Query<K[KK]> | FilterValue<K[KK]> | null;
} | FilterValue<K> : FilterValue<T>;
export declare type FilterQuery<T> = Query<T> | {
    [PrimaryKeyType]?: any;
};
export declare type QBFilterQuery<T = any> = FilterQuery<T> & Dictionary;
export interface IWrappedEntity<T, PK extends keyof T> {
    isInitialized(): boolean;
    populated(populated?: boolean): void;
    init(populated?: boolean, lockMode?: LockMode): Promise<T>;
    toReference(): IdentifiedReference<T, PK>;
    toObject(ignoreFields?: string[]): Dictionary;
    toJSON(...args: any[]): Dictionary;
    assign(data: any, options?: AssignOptions | boolean): T;
}
export interface IWrappedEntityInternal<T, PK extends keyof T> extends IWrappedEntity<T, PK> {
    __uuid: string;
    __meta: EntityMetadata<T>;
    __internal: {
        platform: Platform;
        metadata: MetadataStorage;
        validator: EntityValidator;
    };
    __data: Dictionary;
    __em?: EntityManager;
    __initialized?: boolean;
    __populated: boolean;
    __lazyInitialized: boolean;
    __primaryKey: PrimaryMap<T>;
    __primaryKeys: Primary<T>[];
    __serializedPrimaryKey: string & keyof T;
}
export declare type AnyEntity<T = any, PK extends keyof T = keyof T> = {
    [K in PK]?: T[K];
} & {
    [PrimaryKeyType]?: T[PK];
};
export declare type EntityClass<T extends AnyEntity<T>> = Function & {
    prototype: T;
};
export declare type EntityClassGroup<T extends AnyEntity<T>> = {
    entity: EntityClass<T>;
    schema: EntityMetadata<T> | EntitySchema<T>;
};
export declare type EntityName<T extends AnyEntity<T>> = string | EntityClass<T>;
export declare type EntityData<T extends AnyEntity<T>> = {
    [K in keyof T]?: T[K] | Primary<T[K]> | EntityData<T[K]> | CollectionItem<T[K]>[];
} & Dictionary;
export interface EntityProperty<T extends AnyEntity<T> = any> {
    name: string & keyof T;
    entity: () => EntityName<T>;
    type: string;
    columnTypes: string[];
    customType: Type<any>;
    primary: boolean;
    serializedPrimaryKey: boolean;
    lazy?: boolean;
    discriminator?: boolean;
    length?: any;
    reference: ReferenceType;
    wrappedReference?: boolean;
    fieldNames: string[];
    default?: string | number | boolean | null;
    defaultRaw?: string;
    formula?: (alias: string) => string;
    prefix?: string | boolean;
    embedded?: [string, string];
    embeddable: Constructor<T>;
    embeddedProps: Dictionary<EntityProperty>;
    index?: boolean | string;
    unique?: boolean | string;
    nullable?: boolean;
    inherited?: boolean;
    unsigned: boolean;
    persist?: boolean;
    hidden?: boolean;
    enum?: boolean;
    items?: (number | string)[];
    version?: boolean;
    eager?: boolean;
    setter?: boolean;
    getter?: boolean;
    getterName?: keyof T;
    cascade: Cascade[];
    orphanRemoval?: boolean;
    onCreate?: (entity: T) => any;
    onUpdate?: (entity: T) => any;
    onDelete?: 'cascade' | 'no action' | 'set null' | 'set default' | string;
    onUpdateIntegrity?: 'cascade' | 'no action' | 'set null' | 'set default' | string;
    strategy?: LoadStrategy;
    owner: boolean;
    inversedBy: string;
    mappedBy: string;
    orderBy?: {
        [field: string]: QueryOrder;
    };
    fixedOrder?: boolean;
    fixedOrderColumn?: string;
    pivotTable: string;
    joinColumns: string[];
    inverseJoinColumns: string[];
    referencedColumnNames: string[];
    referencedTableName: string;
    comment?: string;
}
export interface EntityMetadata<T extends AnyEntity<T> = any> {
    name: string;
    className: string;
    tableName: string;
    pivotTable: boolean;
    discriminatorColumn?: string;
    discriminatorValue?: string;
    discriminatorMap?: Dictionary<string>;
    embeddable: boolean;
    constructorParams: string[];
    toJsonParams: string[];
    extends: string;
    collection: string;
    path: string;
    primaryKeys: (keyof T & string)[];
    compositePK: boolean;
    versionProperty: keyof T & string;
    serializedPrimaryKey: keyof T & string;
    properties: {
        [K in keyof T & string]: EntityProperty<T>;
    };
    indexes: {
        properties: string | string[];
        name?: string;
        type?: string;
        options?: Dictionary;
    }[];
    uniques: {
        properties: string | string[];
        name?: string;
        options?: Dictionary;
    }[];
    customRepository: () => Constructor<EntityRepository<T>>;
    hooks: Partial<Record<keyof typeof EventType, (string & keyof T)[]>>;
    prototype: T;
    class: Constructor<T>;
    abstract: boolean;
    useCache: boolean;
    filters: Dictionary<FilterDef<T>>;
    comment?: string;
}
export interface ISchemaGenerator {
    generate(): Promise<string>;
    createSchema(wrap?: boolean): Promise<void>;
    ensureDatabase(): Promise<void>;
    getCreateSchemaSQL(wrap?: boolean): Promise<string>;
    dropSchema(wrap?: boolean, dropMigrationsTable?: boolean, dropDb?: boolean): Promise<void>;
    getDropSchemaSQL(wrap?: boolean, dropMigrationsTable?: boolean): Promise<string>;
    updateSchema(wrap?: boolean, safe?: boolean, dropDb?: boolean, dropTables?: boolean): Promise<void>;
    getUpdateSchemaSQL(wrap?: boolean, safe?: boolean, dropDb?: boolean, dropTables?: boolean): Promise<string>;
    createDatabase(name: string): Promise<void>;
    dropDatabase(name: string): Promise<void>;
    execute(sql: string): Promise<void>;
}
export interface IEntityGenerator {
    generate(options?: {
        baseDir?: string;
        save?: boolean;
    }): Promise<string[]>;
}
declare type UmzugMigration = {
    path?: string;
    file: string;
};
declare type MigrateOptions = {
    from?: string | number;
    to?: string | number;
    migrations?: string[];
};
declare type MigrationResult = {
    fileName: string;
    code: string;
    diff: string[];
};
declare type MigrationRow = {
    name: string;
    executed_at: Date;
};
export interface IMigrator {
    createMigration(path?: string, blank?: boolean): Promise<MigrationResult>;
    getExecutedMigrations(): Promise<MigrationRow[]>;
    getPendingMigrations(): Promise<UmzugMigration[]>;
    up(options?: string | string[] | MigrateOptions): Promise<UmzugMigration[]>;
    down(options?: string | string[] | MigrateOptions): Promise<UmzugMigration[]>;
}
export declare type FilterDef<T extends AnyEntity<T>> = {
    name: string;
    cond: FilterQuery<T> | ((args: Dictionary, type: 'read' | 'update' | 'delete') => FilterQuery<T>);
    default?: boolean;
    entity?: string[];
};
export {};
