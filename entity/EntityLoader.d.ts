import { AnyEntity, Dictionary, FilterQuery } from '../typings';
import { EntityManager } from '../index';
import { QueryOrderMap } from '../enums';
import { PopulateOptions } from '../drivers';
declare type Options<T extends AnyEntity<T>> = {
    where?: FilterQuery<T>;
    orderBy?: QueryOrderMap;
    refresh?: boolean;
    validate?: boolean;
    lookup?: boolean;
    filters?: Dictionary<boolean | Dictionary> | string[] | boolean;
};
export declare class EntityLoader {
    private readonly em;
    private readonly metadata;
    private readonly driver;
    constructor(em: EntityManager);
    populate<T extends AnyEntity<T>>(entityName: string, entities: T[], populate: PopulateOptions<T>[] | boolean, options: Options<T>): Promise<void>;
    normalizePopulate<T>(entityName: string, populate: PopulateOptions<T>[] | true, lookup?: boolean): PopulateOptions<T>[];
    /**
     * Expands `books.perex` like populate to use `children` array instead of the dot syntax
     */
    private expandNestedPopulate;
    /**
     * preload everything in one call (this will update already existing references in IM)
     */
    private populateMany;
    private initializeCollections;
    private initializeOneToMany;
    private initializeManyToMany;
    private findChildren;
    private populateField;
    private findChildrenFromPivotTable;
    private getChildReferences;
    private filterCollections;
    private filterReferences;
    private lookupAllRelationships;
    private lookupEagerLoadedRelationships;
}
export {};
