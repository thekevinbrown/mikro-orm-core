import { AnyEntity, Constructor, Dictionary, EntityMetadata, EntityName, EntityProperty, NonFunctionPropertyNames } from '../typings';
import { EmbeddedOptions, EnumOptions, IndexOptions, ManyToManyOptions, ManyToOneOptions, OneToManyOptions, OneToOneOptions, PrimaryKeyOptions, PropertyOptions, SerializedPrimaryKeyOptions, UniqueOptions } from '../decorators';
import { Collection, EntityRepository, ReferenceType } from '../entity';
import { Type } from '../types';
declare type CollectionItem<T> = T extends Collection<infer K> ? K : T;
declare type TypeType = string | NumberConstructor | StringConstructor | BooleanConstructor | DateConstructor | ArrayConstructor | Constructor<Type<any>>;
declare type TypeDef<T> = {
    type: TypeType;
} | {
    customType: Type<any>;
} | {
    entity: string | (() => string | EntityName<T>);
};
declare type Property<T, O> = ({
    reference: ReferenceType.MANY_TO_ONE | 'm:1';
} & TypeDef<T> & ManyToOneOptions<T, O>) | ({
    reference: ReferenceType.ONE_TO_ONE | '1:1';
} & TypeDef<T> & OneToOneOptions<T, O>) | ({
    reference: ReferenceType.ONE_TO_MANY | '1:m';
} & TypeDef<T> & OneToManyOptions<T, O>) | ({
    reference: ReferenceType.MANY_TO_MANY | 'm:n';
} & TypeDef<T> & ManyToManyOptions<T, O>) | ({
    reference: ReferenceType.EMBEDDED | 'embedded';
} & TypeDef<T> & EmbeddedOptions & PropertyOptions<O>) | ({
    enum: true;
} & EnumOptions<O>) | (TypeDef<T> & PropertyOptions<O>);
declare type PropertyKey<T, U> = NonFunctionPropertyNames<Omit<T, keyof U>>;
declare type Metadata<T, U> = Omit<Partial<EntityMetadata<T>>, 'name' | 'properties'> & ({
    name: string;
} | {
    class: Constructor<T>;
    name?: string;
}) & {
    properties?: {
        [K in PropertyKey<T, U> & string]-?: Property<CollectionItem<NonNullable<T[K]>>, T>;
    };
};
export declare class EntitySchema<T extends AnyEntity<T> = AnyEntity, U extends AnyEntity<U> | undefined = undefined> {
    private readonly _meta;
    private internal;
    private initialized;
    constructor(meta: Metadata<T, U>);
    static fromMetadata<T extends AnyEntity<T> = AnyEntity, U extends AnyEntity<U> | undefined = undefined>(meta: EntityMetadata<T>): EntitySchema<T, U>;
    addProperty(name: string & keyof T, type?: TypeType, options?: PropertyOptions<T> | EntityProperty): void;
    addEnum(name: string & keyof T, type?: TypeType, options?: EnumOptions<T>): void;
    addVersion(name: string & keyof T, type: TypeType, options?: PropertyOptions<T>): void;
    addPrimaryKey(name: string & keyof T, type: TypeType, options?: PrimaryKeyOptions<T>): void;
    addSerializedPrimaryKey(name: string & keyof T, type: TypeType, options?: SerializedPrimaryKeyOptions<T>): void;
    addEmbedded<K = unknown>(name: string & keyof T, options: EmbeddedOptions): void;
    addManyToOne<K = unknown>(name: string & keyof T, type: TypeType, options: ManyToOneOptions<K, T>): void;
    addManyToMany<K = unknown>(name: string & keyof T, type: TypeType, options: ManyToManyOptions<K, T>): void;
    addOneToMany<K = unknown>(name: string & keyof T, type: TypeType, options: OneToManyOptions<K, T>): void;
    addOneToOne<K = unknown>(name: string & keyof T, type: TypeType, options: OneToOneOptions<K, T>): void;
    addIndex(options: Required<Omit<IndexOptions, 'name' | 'type' | 'options'>> & {
        name?: string;
        type?: string;
        options?: Dictionary;
    }): void;
    addUnique(options: Required<Omit<UniqueOptions, 'name' | 'options'>> & {
        name?: string;
        options?: Dictionary;
    }): void;
    setCustomRepository(repository: () => Constructor<EntityRepository<T>>): void;
    setExtends(base: string): void;
    setClass(proto: Constructor<T>): void;
    get meta(): EntityMetadata<T>;
    get name(): string;
    /**
     * @internal
     */
    init(): this;
    private initProperties;
    private initPrimaryKeys;
    private normalizeType;
    private createProperty;
}
export {};
