import { EntityData, EntityProperty } from '../typings';
import { Hydrator } from './Hydrator';
export declare class ObjectHydrator extends Hydrator {
    protected hydrateProperty<T>(entity: T, prop: EntityProperty, data: EntityData<T>, newEntity: boolean): void;
    private hydrateOneToMany;
    private hydrateScalar;
    private hydrateEmbeddable;
    private hydrateManyToMany;
    private hydrateManyToManyOwner;
    private hydrateManyToManyInverse;
    private hydrateManyToOne;
    private createCollectionItem;
}
