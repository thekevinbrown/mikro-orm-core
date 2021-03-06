"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeSetComputer = void 0;
const utils_1 = require("../utils");
const ChangeSet_1 = require("./ChangeSet");
const entity_1 = require("../entity");
class ChangeSetComputer {
    constructor(validator, originalEntityData, identifierMap, collectionUpdates, removeStack, metadata, platform) {
        this.validator = validator;
        this.originalEntityData = originalEntityData;
        this.identifierMap = identifierMap;
        this.collectionUpdates = collectionUpdates;
        this.removeStack = removeStack;
        this.metadata = metadata;
        this.platform = platform;
    }
    computeChangeSet(entity) {
        const changeSet = { entity };
        const meta = this.metadata.get(entity.constructor.name);
        changeSet.name = meta.name;
        changeSet.type = this.originalEntityData[entity_1.wrap(entity, true).__uuid] ? ChangeSet_1.ChangeSetType.UPDATE : ChangeSet_1.ChangeSetType.CREATE;
        changeSet.collection = meta.collection;
        changeSet.payload = this.computePayload(entity);
        if (changeSet.type === ChangeSet_1.ChangeSetType.UPDATE) {
            changeSet.originalEntity = this.originalEntityData[entity_1.wrap(entity, true).__uuid];
        }
        this.validator.validate(changeSet.entity, changeSet.payload, meta);
        for (const prop of Object.values(meta.properties)) {
            this.processReference(changeSet, prop);
        }
        if (changeSet.type === ChangeSet_1.ChangeSetType.UPDATE && Object.keys(changeSet.payload).length === 0) {
            return null;
        }
        return changeSet;
    }
    computePayload(entity) {
        const wrapped = entity_1.wrap(entity, true);
        if (this.originalEntityData[wrapped.__uuid]) {
            return utils_1.Utils.diffEntities(this.originalEntityData[wrapped.__uuid], entity, this.metadata, this.platform);
        }
        return utils_1.Utils.prepareEntity(entity, this.metadata, this.platform);
    }
    processReference(changeSet, prop) {
        const isToOneOwner = prop.reference === entity_1.ReferenceType.MANY_TO_ONE || (prop.reference === entity_1.ReferenceType.ONE_TO_ONE && prop.owner);
        if ([entity_1.ReferenceType.ONE_TO_MANY, entity_1.ReferenceType.MANY_TO_MANY].includes(prop.reference) && changeSet.entity[prop.name].isInitialized()) {
            const collection = changeSet.entity[prop.name];
            collection.getItems()
                .filter(item => this.removeStack.includes(item))
                .forEach(item => collection.remove(item));
        }
        if (prop.reference === entity_1.ReferenceType.MANY_TO_MANY && prop.owner && changeSet.entity[prop.name].isDirty()) {
            this.collectionUpdates.push(changeSet.entity[prop.name]);
        }
        else if (isToOneOwner && changeSet.entity[prop.name]) {
            this.processManyToOne(prop, changeSet);
        }
        if (prop.reference === entity_1.ReferenceType.ONE_TO_ONE) {
            this.processOneToOne(prop, changeSet);
        }
    }
    processManyToOne(prop, changeSet) {
        const pks = this.metadata.get(prop.type).primaryKeys;
        const entity = changeSet.entity[prop.name];
        if (pks.length === 1 && !utils_1.Utils.isDefined(entity[pks[0]], true)) {
            changeSet.payload[prop.name] = this.identifierMap[entity_1.wrap(entity, true).__uuid];
        }
    }
    processOneToOne(prop, changeSet) {
        // check diff, if we had a value on 1:1 before and now it changed (nulled or replaced), we need to trigger orphan removal
        const wrapped = entity_1.wrap(changeSet.entity, true);
        const data = this.originalEntityData[wrapped.__uuid];
        const em = wrapped.__em;
        if (prop.orphanRemoval && data && data[prop.name] && prop.name in changeSet.payload && em) {
            const orphan = em.getReference(prop.type, data[prop.name]);
            em.getUnitOfWork().scheduleOrphanRemoval(orphan);
        }
    }
}
exports.ChangeSetComputer = ChangeSetComputer;
