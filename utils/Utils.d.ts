import { GlobbyOptions } from 'globby';
import { MetadataStorage } from '../metadata';
import { AnyEntity, Dictionary, EntityData, EntityMetadata, EntityProperty, Primary } from '../typings';
import { Collection, ReferenceType } from '../entity';
import { Platform } from '../platforms';
export declare class Utils {
    /**
     * Checks if the argument is not undefined
     */
    static isDefined<T = Record<string, unknown>>(data: any, considerNullUndefined?: boolean): data is T;
    /**
     * Checks if the argument is instance of `Object`. Returns false for arrays.
     * `not` argument allows to blacklist classes that should be considered as not object.
     */
    static isObject<T = Dictionary>(o: any, not?: any[]): o is T;
    /**
     * Checks if the argument is string
     */
    static isString(s: any): s is string;
    /**
     * Checks if the argument is number
     */
    static isNumber<T = number>(s: any): s is T;
    /**
     * Checks if arguments are deeply (but not strictly) equal.
     */
    static equals(a: any, b: any): boolean;
    /**
     * Gets array without duplicates.
     */
    static unique<T = string>(items: T[]): T[];
    /**
     * Merges all sources into the target recursively.
     */
    static merge(target: any, ...sources: any[]): any;
    static getRootEntity(metadata: MetadataStorage, meta: EntityMetadata): EntityMetadata;
    /**
     * Computes difference between two objects, ignoring items missing in `b`.
     */
    static diff(a: Dictionary, b: Dictionary): Record<keyof (typeof a & typeof b), any>;
    /**
     * Computes difference between two entities. First calls `prepareEntity` on both, then uses the `diff` method.
     */
    static diffEntities<T extends AnyEntity<T>>(a: T, b: T, metadata: MetadataStorage, platform: Platform): EntityData<T>;
    /**
     * Removes ORM specific code from entities and prepares it for serializing. Used before change set computation.
     * References will be mapped to primary keys, collections to arrays of primary keys.
     */
    static prepareEntity<T extends AnyEntity<T>>(entity: T, metadata: MetadataStorage, platform: Platform): EntityData<T>;
    private static shouldIgnoreProperty;
    /**
     * Creates deep copy of given entity.
     */
    static copy<T>(entity: T): T;
    /**
     * Normalize the argument to always be an array.
     */
    static asArray<T>(data?: T | T[], strict?: boolean): T[];
    /**
     * Renames object key, keeps order of properties.
     */
    static renameKey<T>(payload: T, from: string | keyof T, to: string): void;
    /**
     * Returns array of functions argument names. Uses `acorn` for source code analysis.
     */
    static getParamNames(func: {
        toString(): string;
    } | string, methodName?: string): string[];
    /**
     * Checks whether the argument looks like primary key (string, number or ObjectId).
     */
    static isPrimaryKey<T>(key: any, allowComposite?: boolean): key is Primary<T>;
    /**
     * Extracts primary key from `data`. Accepts objects or primary keys directly.
     */
    static extractPK<T extends AnyEntity<T>>(data: any, meta?: EntityMetadata, strict?: boolean): Primary<T> | null;
    static getCompositeKeyHash<T>(entity: T, meta: EntityMetadata<T>): string;
    static getPrimaryKeyHash(pks: string[]): string;
    static splitPrimaryKeys(key: string): string[];
    static getPrimaryKeyValue<T extends AnyEntity<T>>(entity: T, primaryKeys: string[]): any;
    static getPrimaryKeyValues<T extends AnyEntity<T>>(entity: T, primaryKeys: string[], allowScalar?: boolean): any;
    static getPrimaryKeyCond<T extends AnyEntity<T>>(entity: T, primaryKeys: string[]): Record<string, Primary<T>> | null;
    static getPrimaryKeyCondFromArray<T extends AnyEntity<T>>(pks: Primary<T>[], primaryKeys: string[]): Record<string, Primary<T>>;
    static getOrderedPrimaryKeys<T extends AnyEntity<T>>(id: Primary<T> | Record<string, Primary<T>>, meta: EntityMetadata<T>): Primary<T>[];
    /**
     * Checks whether given object is an entity instance.
     */
    static isEntity<T = AnyEntity>(data: any, allowReference?: boolean): data is T;
    /**
     * Checks whether the argument is ObjectId instance
     */
    static isObjectID(key: any): boolean;
    /**
     * Checks whether the argument is empty (array without items, object without keys or falsy value).
     */
    static isEmpty(data: any): boolean;
    /**
     * Gets string name of given class.
     */
    static className(classOrName: string | {
        name: string;
    }): string;
    /**
     * Tries to detect `ts-node` runtime.
     */
    static detectTsNode(): boolean;
    /**
     * Uses some dark magic to get source path to caller where decorator is used.
     * Analyses stack trace of error created inside the function call.
     */
    static lookupPathFromDecorator(stack?: string[]): string;
    /**
     * Gets the type of the argument.
     */
    static getObjectType(value: any): string;
    /**
     * Checks whether the value is POJO (e.g. `{ foo: 'bar' }`, and not instance of `Foo`)
     */
    static isPlainObject(value: any): boolean;
    /**
     * Executes the `cb` promise serially on every element of the `items` array and returns array of resolved values.
     */
    static runSerial<T = any, U = any>(items: Iterable<U>, cb: (item: U) => Promise<T>): Promise<T[]>;
    static isCollection(item: any, prop?: EntityProperty, type?: ReferenceType): item is Collection<AnyEntity>;
    static normalizePath(...parts: string[]): string;
    static relativePath(path: string, relativeTo: string): string;
    static absolutePath(path: string, baseDir?: string): string;
    static hash(data: string): string;
    static runIfNotEmpty(clause: () => any, data: any): void;
    static defaultValue<T extends Dictionary>(prop: T, option: keyof T, defaultValue: any): void;
    static findDuplicates<T>(items: T[]): T[];
    static randomInt(min: number, max: number): number;
    static pathExists(path: string, options?: GlobbyOptions): Promise<boolean>;
    /**
     * Extracts all possible values of a TS enum. Works with both string and numeric enums.
     */
    static extractEnumValues(target: Dictionary): (string | number)[];
    static flatten<T>(arrays: T[][]): T[];
    static isOperator(key: string, includeGroupOperators?: boolean): boolean;
    static getGlobalStorage(namespace: string): Dictionary;
    /**
     * Require a module from a specific location
     * @param id The module to require
     * @param from Location to start the node resolution
     */
    static requireFrom(id: string, from: string): any;
}
