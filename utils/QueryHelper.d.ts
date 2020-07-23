import { AnyEntity, Dictionary, EntityMetadata, FilterDef, FilterQuery } from '../typings';
import { MetadataStorage } from '../metadata';
export declare class QueryHelper {
    static readonly SUPPORTED_OPERATORS: string[];
    static processParams(params: any, root?: boolean): any;
    static inlinePrimaryKeyObjects<T extends AnyEntity<T>>(where: Dictionary, meta: EntityMetadata<T>, metadata: MetadataStorage, key?: string): boolean;
    static processWhere<T extends AnyEntity<T>>(where: FilterQuery<T>, entityName: string, metadata: MetadataStorage): FilterQuery<T>;
    static getActiveFilters(entityName: string, options: Dictionary<boolean | Dictionary> | string[] | boolean, filters: Dictionary<FilterDef<any>>): FilterDef<any>[];
    static isFilterActive(entityName: string, filterName: string, filter: FilterDef<any>, options: Dictionary<boolean | Dictionary>): boolean;
    private static processEntity;
    private static processExpression;
    private static isSupported;
}
