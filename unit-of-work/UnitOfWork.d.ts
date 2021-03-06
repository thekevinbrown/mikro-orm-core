import { AnyEntity, Dictionary, EntityData, FilterQuery, Primary } from '../typings';
import { ChangeSet } from './ChangeSet';
import { EntityManager } from '../index';
import { LockMode } from './enums';
export declare class UnitOfWork {
    private readonly em;
    /** map of references to managed entities */
    private readonly identityMap;
    /** holds copy of identity map so we can compute changes when persisting managed entities */
    private readonly originalEntityData;
    /** map of wrapped primary keys so we can compute change set without eager commit */
    private readonly identifierMap;
    private readonly persistStack;
    private readonly removeStack;
    private readonly orphanRemoveStack;
    private readonly changeSets;
    private readonly collectionUpdates;
    private readonly extraUpdates;
    private readonly metadata;
    private readonly platform;
    private readonly changeSetComputer;
    private readonly changeSetPersister;
    private working;
    constructor(em: EntityManager);
    merge<T extends AnyEntity<T>>(entity: T, visited?: AnyEntity[], mergeData?: boolean): void;
    /**
     * Returns entity from the identity map. For composite keys, you need to pass an array of PKs in the same order as they are defined in `meta.primaryKeys`.
     */
    getById<T extends AnyEntity<T>>(entityName: string, id: Primary<T> | Primary<T>[]): T;
    tryGetById<T extends AnyEntity<T>>(entityName: string, where: FilterQuery<T>, strict?: boolean): T | null;
    getIdentityMap(): Dictionary<AnyEntity>;
    getOriginalEntityData(): Dictionary<EntityData<AnyEntity>>;
    getPersistStack(): AnyEntity[];
    getRemoveStack(): AnyEntity[];
    getChangeSets(): ChangeSet<AnyEntity>[];
    computeChangeSet<T>(entity: T): void;
    recomputeSingleChangeSet<T>(entity: T): void;
    persist<T extends AnyEntity<T>>(entity: T, visited?: AnyEntity[], checkRemoveStack?: boolean): void;
    remove(entity: AnyEntity, visited?: AnyEntity[]): void;
    commit(): Promise<void>;
    lock<T extends AnyEntity<T>>(entity: T, mode: LockMode, version?: number | Date): Promise<void>;
    clear(): void;
    unsetIdentity(entity: AnyEntity): void;
    computeChangeSets(): void;
    scheduleOrphanRemoval(entity: AnyEntity): void;
    cancelOrphanRemoval(entity: AnyEntity): void;
    private findNewEntities;
    private initIdentifier;
    private processReference;
    private processToOneReference;
    private processToManyReference;
    private commitChangeSet;
    private runHooks;
    /**
     * clean up persist/remove stack from previous persist/remove calls for this entity done before flushing
     */
    private cleanUpStack;
    private postCommitCleanup;
    private cascade;
    private cascadeReference;
    private isCollectionSelfReferenced;
    private shouldCascade;
    private lockPessimistic;
    private lockOptimistic;
    private fixMissingReference;
    private unwrapReference;
    private persistToDatabase;
    /**
     * Orders change sets so FK constrains are maintained, ensures stable order (needed for node < 11)
     */
    private reorderChangeSets;
    private getCommitOrder;
    private addCommitDependency;
}
