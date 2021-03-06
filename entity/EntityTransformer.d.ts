import { AnyEntity, EntityData } from '../typings';
export declare class EntityTransformer {
    static toObject<T extends AnyEntity<T>>(entity: T, ignoreFields?: string[], visited?: string[]): EntityData<T>;
    private static isVisible;
    private static processProperty;
    private static processEntity;
    private static processCollection;
}
