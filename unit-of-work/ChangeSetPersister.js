"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeSetPersister = void 0;
const entity_1 = require("../entity");
const ChangeSet_1 = require("./ChangeSet");
const utils_1 = require("../utils");
class ChangeSetPersister {
    constructor(driver, identifierMap, metadata) {
        this.driver = driver;
        this.identifierMap = identifierMap;
        this.metadata = metadata;
    }
    async persistToDatabase(changeSet, ctx) {
        const meta = this.metadata.get(changeSet.name);
        // process references first
        for (const prop of Object.values(meta.properties)) {
            this.processReference(changeSet, prop);
        }
        // persist the entity itself
        await this.persistEntity(changeSet, meta, ctx);
    }
    async persistEntity(changeSet, meta, ctx) {
        let res;
        const wrapped = entity_1.wrap(changeSet.entity, true);
        if (changeSet.type === ChangeSet_1.ChangeSetType.DELETE) {
            await this.driver.nativeDelete(changeSet.name, wrapped.__primaryKey, ctx);
        }
        else if (changeSet.type === ChangeSet_1.ChangeSetType.UPDATE) {
            res = await this.updateEntity(meta, changeSet, ctx);
            this.mapReturnedValues(changeSet.entity, res, meta);
        }
        else if (utils_1.Utils.isDefined(wrapped.__primaryKey, true)) { // ChangeSetType.CREATE with primary key
            res = await this.driver.nativeInsert(changeSet.name, changeSet.payload, ctx);
            this.mapReturnedValues(changeSet.entity, res, meta);
            wrapped.__initialized = true;
        }
        else { // ChangeSetType.CREATE without primary key
            res = await this.driver.nativeInsert(changeSet.name, changeSet.payload, ctx);
            this.mapReturnedValues(changeSet.entity, res, meta);
            this.mapPrimaryKey(meta, res.insertId, changeSet);
            wrapped.__initialized = true;
        }
        await this.processOptimisticLock(meta, changeSet, res, ctx);
        changeSet.persisted = true;
    }
    mapPrimaryKey(meta, value, changeSet) {
        const prop = meta.properties[meta.primaryKeys[0]];
        const insertId = prop.customType ? prop.customType.convertToJSValue(value, this.driver.getPlatform()) : value;
        const wrapped = entity_1.wrap(changeSet.entity, true);
        wrapped.__primaryKey = utils_1.Utils.isDefined(wrapped.__primaryKey, true) ? wrapped.__primaryKey : insertId;
        this.identifierMap[wrapped.__uuid].setValue(changeSet.entity[prop.name]);
    }
    async updateEntity(meta, changeSet, ctx) {
        if (!meta.versionProperty || !changeSet.entity[meta.versionProperty]) {
            return this.driver.nativeUpdate(changeSet.name, entity_1.wrap(changeSet.entity, true).__primaryKey, changeSet.payload, ctx);
        }
        const cond = Object.assign(Object.assign({}, utils_1.Utils.getPrimaryKeyCond(changeSet.entity, meta.primaryKeys)), { [meta.versionProperty]: changeSet.entity[meta.versionProperty] });
        return this.driver.nativeUpdate(changeSet.name, cond, changeSet.payload, ctx);
    }
    async processOptimisticLock(meta, changeSet, res, ctx) {
        if (meta.versionProperty && changeSet.type === ChangeSet_1.ChangeSetType.UPDATE && res && !res.affectedRows) {
            throw utils_1.ValidationError.lockFailed(changeSet.entity);
        }
        if (meta.versionProperty && [ChangeSet_1.ChangeSetType.CREATE, ChangeSet_1.ChangeSetType.UPDATE].includes(changeSet.type)) {
            const e = await this.driver.findOne(meta.name, entity_1.wrap(changeSet.entity, true).__primaryKey, {
                populate: [{
                        field: meta.versionProperty,
                    }],
            }, ctx);
            changeSet.entity[meta.versionProperty] = e[meta.versionProperty];
        }
    }
    processReference(changeSet, prop) {
        const value = changeSet.payload[prop.name];
        if (value instanceof entity_1.EntityIdentifier) {
            changeSet.payload[prop.name] = value.getValue();
        }
        if (prop.onCreate && changeSet.type === ChangeSet_1.ChangeSetType.CREATE) {
            changeSet.entity[prop.name] = changeSet.payload[prop.name] = prop.onCreate(changeSet.entity);
            if (prop.primary) {
                this.mapPrimaryKey(entity_1.wrap(changeSet.entity, true).__meta, changeSet.entity[prop.name], changeSet);
            }
        }
        if (prop.onUpdate && changeSet.type === ChangeSet_1.ChangeSetType.UPDATE) {
            changeSet.entity[prop.name] = changeSet.payload[prop.name] = prop.onUpdate(changeSet.entity);
        }
    }
    /**
     * Maps values returned via `returning` statement (postgres) or the inserted id (other sql drivers).
     * No need to handle composite keys here as they need to be set upfront.
     */
    mapReturnedValues(entity, res, meta) {
        if (res.row && Object.keys(res.row).length > 0) {
            Object.values(meta.properties).forEach(prop => {
                if (prop.fieldNames && res.row[prop.fieldNames[0]] && !utils_1.Utils.isDefined(entity[prop.name], true)) {
                    entity[prop.name] = res.row[prop.fieldNames[0]];
                }
            });
        }
    }
}
exports.ChangeSetPersister = ChangeSetPersister;
