import { Dictionary, EntityMetadata, EntityProperty, AnyEntity, IPrimaryKey, Constructor } from '../typings';
import { Type } from '../types';
export declare class ValidationError<T extends AnyEntity = AnyEntity> extends Error {
    private readonly entity?;
    constructor(message: string, entity?: T | undefined);
    /**
     * Gets instance of entity that caused this error.
     */
    getEntity(): AnyEntity | undefined;
    static fromWrongPropertyType(entity: AnyEntity, property: string, expectedType: string, givenType: string, givenValue: string): ValidationError;
    static fromCollectionNotInitialized(entity: AnyEntity, prop: EntityProperty): ValidationError;
    static fromMergeWithoutPK(meta: EntityMetadata): void;
    static transactionRequired(): ValidationError;
    static entityNotManaged(entity: AnyEntity): ValidationError;
    static notEntity(owner: AnyEntity, prop: EntityProperty, data: any): ValidationError;
    static notVersioned(meta: EntityMetadata): ValidationError;
    static lockFailed(entityOrName: AnyEntity | string): ValidationError;
    static lockFailedVersionMismatch(entity: AnyEntity, expectedLockVersion: number | Date, actualLockVersion: number | Date): ValidationError;
    static invalidPropertyName(entityName: string, invalid: string): ValidationError;
    static invalidType(type: Constructor<Type<any>>, value: any, mode: string): ValidationError;
    static cannotModifyInverseCollection(owner: AnyEntity, property: EntityProperty): ValidationError;
    static invalidCompositeIdentifier(meta: EntityMetadata): ValidationError;
    static cannotCommit(): ValidationError;
    static cannotUseOperatorsInsideEmbeddables(className: string, propName: string, payload: Dictionary): ValidationError;
}
export declare class MetadataError<T extends AnyEntity = AnyEntity> extends ValidationError {
    static fromMissingPrimaryKey(meta: EntityMetadata): MetadataError;
    static fromWrongReference(meta: EntityMetadata, prop: EntityProperty, key: keyof EntityProperty, owner?: EntityProperty): MetadataError;
    static fromWrongTypeDefinition(meta: EntityMetadata, prop: EntityProperty): MetadataError;
    static fromWrongOwnership(meta: EntityMetadata, prop: EntityProperty, key: keyof EntityProperty): MetadataError;
    static entityNotFound(name: string, path: string): MetadataError;
    static multipleVersionFields(meta: EntityMetadata, fields: string[]): MetadataError;
    static invalidVersionFieldType(meta: EntityMetadata): MetadataError;
    static fromUnknownEntity(className: string, source: string): MetadataError;
    static fromUnknownBaseEntity(meta: EntityMetadata): MetadataError;
    static noEntityDiscovered(): MetadataError;
    static onlyAbstractEntitiesDiscovered(): MetadataError;
    static duplicateEntityDiscovered(paths: string[]): MetadataError;
    static multipleDecorators(entityName: string, propertyName: string): MetadataError;
    static missingMetadata(entity: string): MetadataError;
    private static fromMessage;
}
export declare class NotFoundError<T extends AnyEntity = AnyEntity> extends ValidationError {
    static findOneFailed(name: string, where: Dictionary | IPrimaryKey): NotFoundError;
}
