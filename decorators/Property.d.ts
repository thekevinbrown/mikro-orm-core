import { Cascade, LoadStrategy } from '../entity';
import { EntityName, AnyEntity, Constructor } from '../typings';
import { Type } from '../types';
export declare function Property<T>(options?: PropertyOptions<T>): (target: AnyEntity, propertyName: string) => void;
export declare type PropertyOptions<T> = {
    name?: string;
    fieldName?: string;
    fieldNames?: string[];
    customType?: Type<any>;
    columnType?: string;
    type?: 'string' | 'number' | 'boolean' | 'bigint' | 'ObjectId' | string | unknown | bigint | Date | Constructor<Type<any>> | Type<any>;
    length?: number;
    onCreate?: (entity: T) => any;
    onUpdate?: (entity: T) => any;
    default?: string | number | boolean | null;
    defaultRaw?: string;
    formula?: string | ((alias: string) => string);
    nullable?: boolean;
    unsigned?: boolean;
    persist?: boolean;
    hidden?: boolean;
    version?: boolean;
    index?: boolean | string;
    unique?: boolean | string;
    lazy?: boolean;
    primary?: boolean;
    serializedPrimaryKey?: boolean;
    comment?: string;
};
export interface ReferenceOptions<T, O> extends PropertyOptions<O> {
    entity?: string | (() => EntityName<T>);
    cascade?: Cascade[];
    eager?: boolean;
    strategy?: LoadStrategy;
}
