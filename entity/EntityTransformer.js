"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityTransformer = void 0;
const utils_1 = require("../utils");
const ArrayCollection_1 = require("./ArrayCollection");
const Reference_1 = require("./Reference");
const wrap_1 = require("./wrap");
class EntityTransformer {
    static toObject(entity, ignoreFields = [], visited = []) {
        const wrapped = wrap_1.wrap(entity, true);
        const platform = wrapped.__internal.platform;
        const meta = wrapped.__meta;
        const ret = {};
        meta.primaryKeys
            .filter(pk => !utils_1.Utils.isDefined(entity[pk], true) || !(meta.properties[pk].hidden || ignoreFields.includes(pk)))
            .map(pk => [pk, utils_1.Utils.getPrimaryKeyValue(entity, [pk])])
            .forEach(([pk, value]) => ret[platform.getSerializedPrimaryKeyField(pk)] = platform.normalizePrimaryKey(value));
        if ((!wrapped.isInitialized() && utils_1.Utils.isDefined(wrapped.__primaryKey, true)) || visited.includes(wrapped.__uuid)) {
            return ret;
        }
        visited.push(wrapped.__uuid);
        // normal properties
        Object.keys(entity)
            .filter(prop => this.isVisible(meta, prop, ignoreFields))
            .map(prop => [prop, EntityTransformer.processProperty(prop, entity, ignoreFields, visited)])
            .filter(([, value]) => typeof value !== 'undefined')
            .forEach(([prop, value]) => ret[prop] = value);
        // decorated getters
        Object.values(meta.properties)
            .filter(prop => prop.getter && !prop.hidden && typeof entity[prop.name] !== 'undefined')
            .forEach(prop => ret[prop.name] = entity[prop.name]);
        // decorated get methods
        Object.values(meta.properties)
            .filter(prop => prop.getterName && !prop.hidden && entity[prop.getterName] instanceof Function)
            .forEach(prop => ret[prop.name] = entity[prop.getterName]());
        return ret;
    }
    static isVisible(meta, prop, ignoreFields) {
        const visible = meta.properties[prop] && !meta.properties[prop].hidden;
        return visible && !meta.primaryKeys.includes(prop) && !prop.startsWith('_') && !ignoreFields.includes(prop);
    }
    static processProperty(prop, entity, ignoreFields, visited) {
        const wrapped = wrap_1.wrap(entity, true);
        const property = wrapped.__meta.properties[prop];
        const platform = wrapped.__internal.platform;
        /* istanbul ignore next */
        if (property === null || property === void 0 ? void 0 : property.customType) {
            return property.customType.toJSON(entity[prop], platform);
        }
        if (entity[prop] instanceof ArrayCollection_1.ArrayCollection) {
            return EntityTransformer.processCollection(prop, entity);
        }
        if (utils_1.Utils.isEntity(entity[prop]) || entity[prop] instanceof Reference_1.Reference) {
            return EntityTransformer.processEntity(prop, entity, ignoreFields, visited);
        }
        return entity[prop];
    }
    static processEntity(prop, entity, ignoreFields, visited) {
        const child = entity[prop];
        const wrapped = wrap_1.wrap(child, true);
        if (wrapped.isInitialized() && wrapped.__populated && child !== entity && !wrapped.__lazyInitialized) {
            const args = [...wrapped.__meta.toJsonParams.map(() => undefined), ignoreFields, visited];
            return wrap_1.wrap(child).toJSON(...args);
        }
        return wrapped.__internal.platform.normalizePrimaryKey(wrapped.__primaryKey);
    }
    static processCollection(prop, entity) {
        const col = entity[prop];
        if (col.isInitialized(true) && col.shouldPopulate()) {
            return col.toArray();
        }
        if (col.isInitialized()) {
            return col.getIdentifiers();
        }
    }
}
exports.EntityTransformer = EntityTransformer;
