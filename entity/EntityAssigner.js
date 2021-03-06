"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityAssigner = void 0;
const util_1 = require("util");
const EntityFactory_1 = require("./EntityFactory");
const utils_1 = require("../utils");
const enums_1 = require("./enums");
const Reference_1 = require("./Reference");
const wrap_1 = require("./wrap");
class EntityAssigner {
    static assign(entity, data, onlyProperties = false) {
        const options = (typeof onlyProperties === 'boolean' ? { onlyProperties } : onlyProperties);
        const wrapped = wrap_1.wrap(entity, true);
        const em = options.em || wrapped.__em;
        const meta = wrapped.__meta;
        const root = utils_1.Utils.getRootEntity(wrapped.__internal.metadata, meta);
        const validator = wrapped.__internal.validator;
        const platform = wrapped.__internal.platform;
        const props = meta.properties;
        Object.keys(data).forEach(prop => {
            var _a, _b, _c, _d, _e, _f;
            if (options.onlyProperties && !(prop in props)) {
                return;
            }
            if (((_a = props[prop]) === null || _a === void 0 ? void 0 : _a.inherited) || root.discriminatorColumn === prop || ((_b = props[prop]) === null || _b === void 0 ? void 0 : _b.embedded)) {
                return;
            }
            let value = data[prop];
            if (((_c = props[prop]) === null || _c === void 0 ? void 0 : _c.customType) && !utils_1.Utils.isEntity(data)) {
                value = props[prop].customType.convertToJSValue(value, platform);
            }
            if ([enums_1.ReferenceType.MANY_TO_ONE, enums_1.ReferenceType.ONE_TO_ONE].includes((_d = props[prop]) === null || _d === void 0 ? void 0 : _d.reference) && utils_1.Utils.isDefined(value, true) && EntityAssigner.validateEM(em)) {
                return EntityAssigner.assignReference(entity, value, props[prop], em, options);
            }
            if (props[prop] && utils_1.Utils.isCollection(entity[prop], props[prop]) && Array.isArray(value) && EntityAssigner.validateEM(em)) {
                return EntityAssigner.assignCollection(entity, entity[prop], value, props[prop], em, options);
            }
            if (((_e = props[prop]) === null || _e === void 0 ? void 0 : _e.reference) === enums_1.ReferenceType.SCALAR && EntityFactory_1.SCALAR_TYPES.includes(props[prop].type) && (props[prop].setter || !props[prop].getter)) {
                return entity[prop] = validator.validateProperty(props[prop], value, entity);
            }
            if (((_f = props[prop]) === null || _f === void 0 ? void 0 : _f.reference) === enums_1.ReferenceType.EMBEDDED) {
                const Embeddable = props[prop].embeddable;
                entity[props[prop].name] = Object.create(Embeddable.prototype);
                utils_1.Utils.merge(entity[prop], value);
                return;
            }
            if (options.mergeObjects && utils_1.Utils.isObject(value)) {
                utils_1.Utils.merge(entity[prop], value);
            }
            else if (!props[prop] || !props[prop].getter || props[prop].setter) {
                entity[prop] = value;
            }
        });
        return entity;
    }
    /**
     * auto-wire 1:1 inverse side with owner as in no-sql drivers it can't be joined
     * also makes sure the link is bidirectional when creating new entities from nested structures
     * @internal
     */
    static autoWireOneToOne(prop, entity) {
        if (prop.reference !== enums_1.ReferenceType.ONE_TO_ONE) {
            return;
        }
        const meta2 = wrap_1.wrap(entity[prop.name], true).__meta;
        const prop2 = meta2.properties[prop.inversedBy || prop.mappedBy];
        if (prop2 && !entity[prop.name][prop2.name]) {
            if (Reference_1.Reference.isReference(entity[prop.name])) {
                entity[prop.name].unwrap()[prop2.name] = Reference_1.Reference.wrapReference(entity, prop2);
            }
            else {
                entity[prop.name][prop2.name] = Reference_1.Reference.wrapReference(entity, prop2);
            }
        }
    }
    static validateEM(em) {
        if (!em) {
            throw new Error(`To use assign() on not managed entities, explicitly provide EM instance: wrap(entity).assign(data, { em: orm.em })`);
        }
        return true;
    }
    static assignReference(entity, value, prop, em, options) {
        let valid = false;
        if (utils_1.Utils.isEntity(value, true)) {
            entity[prop.name] = value;
            valid = true;
        }
        else if (utils_1.Utils.isPrimaryKey(value, true)) {
            entity[prop.name] = Reference_1.Reference.wrapReference(em.getReference(prop.type, value), prop);
            valid = true;
        }
        else if (utils_1.Utils.isObject(value) && options.merge) {
            entity[prop.name] = Reference_1.Reference.wrapReference(em.merge(prop.type, value), prop);
            valid = true;
        }
        else if (utils_1.Utils.isObject(value)) {
            entity[prop.name] = Reference_1.Reference.wrapReference(em.create(prop.type, value), prop);
            valid = true;
        }
        if (!valid) {
            const name = entity.constructor.name;
            throw new Error(`Invalid reference value provided for '${name}.${prop.name}' in ${name}.assign(): ${JSON.stringify(value)}`);
        }
        EntityAssigner.autoWireOneToOne(prop, entity);
    }
    static assignCollection(entity, collection, value, prop, em, options) {
        const invalid = [];
        const items = value.map((item) => this.createCollectionItem(item, em, prop, invalid, options));
        if (invalid.length > 0) {
            const name = entity.constructor.name;
            throw new Error(`Invalid collection values provided for '${name}.${prop.name}' in ${name}.assign(): ${util_1.inspect(invalid)}`);
        }
        collection.hydrate(items, true, !!options.merge);
        collection.setDirty();
    }
    static createCollectionItem(item, em, prop, invalid, options) {
        if (utils_1.Utils.isEntity(item)) {
            return item;
        }
        if (utils_1.Utils.isPrimaryKey(item)) {
            return em.getReference(prop.type, item);
        }
        if (utils_1.Utils.isObject(item) && options.merge) {
            return em.merge(prop.type, item);
        }
        if (utils_1.Utils.isObject(item)) {
            return em.create(prop.type, item);
        }
        invalid.push(item);
        return item;
    }
}
exports.EntityAssigner = EntityAssigner;
