import { PropertyOptions } from '.';
import { AnyEntity } from '../typings';
export declare function PrimaryKey<T>(options?: PrimaryKeyOptions<T>): (target: AnyEntity<any, string | number | symbol>, propertyName: string) => void;
export declare function SerializedPrimaryKey<T>(options?: SerializedPrimaryKeyOptions<T>): (target: AnyEntity<any, string | number | symbol>, propertyName: string) => void;
export interface PrimaryKeyOptions<T> extends PropertyOptions<T> {
}
export interface SerializedPrimaryKeyOptions<T> extends PropertyOptions<T> {
    type?: any;
}
