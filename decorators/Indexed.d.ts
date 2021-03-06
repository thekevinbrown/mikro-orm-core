import { AnyEntity, Dictionary } from '../typings';
export declare function Index(options?: IndexOptions): (target: AnyEntity<any, string | number | symbol>, propertyName?: string | undefined) => void;
export declare function Unique(options?: UniqueOptions): (target: AnyEntity<any, string | number | symbol>, propertyName?: string | undefined) => void;
export interface UniqueOptions {
    name?: string;
    properties?: string | string[];
    options?: Dictionary;
}
export interface IndexOptions extends UniqueOptions {
    type?: string;
}
