"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityFactory = exports.SCALAR_TYPES = void 0;
const utils_1 = require("../utils");
const enums_1 = require("./enums");
const __1 = require("..");
exports.SCALAR_TYPES = ['string', 'number', 'boolean', 'Date', 'Buffer', 'RegExp'];
class EntityFactory {
    constructor(unitOfWork, em) {
        this.unitOfWork = unitOfWork;
        this.em = em;
        this.driver = this.em.getDriver();
        this.config = this.em.config;
        this.metadata = this.em.getMetadata();
        this.hydrator = this.config.getHydrator(this, this.em);
    }
    create(entityName, data, initialized = true, newEntity = false) {
        if (utils_1.Utils.isEntity(data)) {
            return data;
        }
        entityName = utils_1.Utils.className(entityName);
        const meta = this.metadata.get(entityName);
        meta.primaryKeys.forEach(pk => this.denormalizePrimaryKey(data, pk, meta.properties[pk]));
        const entity = this.createEntity(data, meta);
        const wrapped = __1.wrap(entity, true);
        if (initialized && !utils_1.Utils.isEntity(data)) {
            this.hydrator.hydrate(entity, meta, data, newEntity);
        }
        wrapped.__initialized = initialized;
        this.runHooks(entity, meta);
        return entity;
    }
    createReference(entityName, id) {
        entityName = utils_1.Utils.className(entityName);
        const meta = this.metadata.get(entityName);
        if (Array.isArray(id)) {
            id = utils_1.Utils.getPrimaryKeyCondFromArray(id, meta.primaryKeys);
        }
        const pks = utils_1.Utils.getOrderedPrimaryKeys(id, meta);
        if (utils_1.Utils.isPrimaryKey(id)) {
            id = { [meta.primaryKeys[0]]: id };
        }
        if (this.unitOfWork.getById(entityName, pks)) {
            return this.unitOfWork.getById(entityName, pks);
        }
        return this.create(entityName, id, false);
    }
    createEntity(data, meta) {
        const root = utils_1.Utils.getRootEntity(this.metadata, meta);
        if (root.discriminatorColumn) {
            const value = data[root.discriminatorColumn];
            delete data[root.discriminatorColumn];
            const type = root.discriminatorMap[value];
            meta = type ? this.metadata.get(type) : meta;
        }
        const Entity = meta.class;
        const pks = utils_1.Utils.getOrderedPrimaryKeys(data, meta);
        if (meta.primaryKeys.some(pk => !utils_1.Utils.isDefined(data[pk], true))) {
            const params = this.extractConstructorParams(meta, data);
            meta.constructorParams.forEach(prop => delete data[prop]);
            // creates new instance via constructor as this is the new entity
            return new Entity(...params);
        }
        if (this.unitOfWork.getById(meta.name, pks)) {
            return this.unitOfWork.getById(meta.name, pks);
        }
        // creates new entity instance, bypassing constructor call as its already persisted entity
        const entity = Object.create(Entity.prototype);
        meta.primaryKeys.forEach(pk => {
            const prop = meta.properties[pk];
            if (prop.reference === enums_1.ReferenceType.SCALAR) {
                entity[pk] = data[pk];
            }
            else {
                entity[pk] = this.createReference(prop.type, data[pk]);
            }
        });
        return entity;
    }
    /**
     * denormalize PK to value required by driver (e.g. ObjectId)
     */
    denormalizePrimaryKey(data, primaryKey, prop) {
        const platform = this.driver.getPlatform();
        const pk = platform.getSerializedPrimaryKeyField(primaryKey);
        if (utils_1.Utils.isDefined(data[pk], true) || utils_1.Utils.isDefined(data[primaryKey], true)) {
            let id = data[pk] || data[primaryKey];
            if (prop.type.toLowerCase() === 'objectid') {
                id = platform.denormalizePrimaryKey(id);
            }
            delete data[pk];
            data[primaryKey] = id;
        }
    }
    /**
     * returns parameters for entity constructor, creating references from plain ids
     */
    extractConstructorParams(meta, data) {
        return meta.constructorParams.map(k => {
            if (meta.properties[k] && [enums_1.ReferenceType.MANY_TO_ONE, enums_1.ReferenceType.ONE_TO_ONE].includes(meta.properties[k].reference) && data[k]) {
                const entity = this.unitOfWork.getById(meta.properties[k].type, data[k]);
                if (entity) {
                    return entity;
                }
                if (utils_1.Utils.isEntity(data[k])) {
                    return data[k];
                }
                return this.createReference(meta.properties[k].type, data[k]);
            }
            return data[k];
        });
    }
    runHooks(entity, meta) {
        var _a;
        /* istanbul ignore next */
        const hooks = ((_a = meta.hooks) === null || _a === void 0 ? void 0 : _a.onInit) || [];
        if (hooks.length > 0) {
            hooks.forEach(hook => entity[hook]());
        }
        this.em.getEventManager().dispatchEvent(__1.EventType.onInit, { entity, em: this.em });
    }
}
exports.EntityFactory = EntityFactory;
