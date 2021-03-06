"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityHelper = void 0;
const util_1 = require("util");
const EntityTransformer_1 = require("./EntityTransformer");
const Reference_1 = require("./Reference");
const utils_1 = require("../utils");
const enums_1 = require("./enums");
const wrap_1 = require("./wrap");
const WrappedEntity_1 = require("./WrappedEntity");
class EntityHelper {
    static async init(entity, populated = true, lockMode) {
        const wrapped = wrap_1.wrap(entity, true);
        const em = wrapped.__em;
        if (!em) {
            throw utils_1.ValidationError.entityNotManaged(entity);
        }
        await em.findOne(entity.constructor.name, entity, { refresh: true, lockMode });
        wrapped.populated(populated);
        wrapped.__lazyInitialized = true;
        return entity;
    }
    static decorate(meta, em) {
        if (meta.embeddable) {
            return;
        }
        const pk = meta.properties[meta.primaryKeys[0]];
        if (pk.name === '_id') {
            EntityHelper.defineIdProperty(meta, em.getDriver().getPlatform());
        }
        EntityHelper.defineBaseProperties(meta, meta.prototype, em);
        const prototype = meta.prototype;
        if (em.config.get('propagateToOneOwner')) {
            EntityHelper.defineReferenceProperties(meta);
        }
        if (!prototype.toJSON) { // toJSON can be overridden
            prototype.toJSON = function (...args) {
                return EntityTransformer_1.EntityTransformer.toObject(this, ...args.slice(meta.toJsonParams.length));
            };
        }
    }
    /**
     * defines magic id property getter/setter if PK property is `_id` and there is no `id` property defined
     */
    static defineIdProperty(meta, platform) {
        Object.defineProperty(meta.prototype, 'id', {
            get() {
                return this._id ? platform.normalizePrimaryKey(this._id) : null;
            },
            set(id) {
                this._id = id ? platform.denormalizePrimaryKey(id) : null;
            },
        });
    }
    static defineBaseProperties(meta, prototype, em) {
        Object.defineProperties(prototype, {
            __entity: { value: true },
            __helper: {
                get() {
                    if (!this.___helper) {
                        const helper = new WrappedEntity_1.WrappedEntity(this, meta, em);
                        Object.defineProperty(this, '___helper', { value: helper });
                    }
                    return this.___helper;
                },
            },
        });
    }
    /**
     * Defines getter and setter for every owning side of m:1 and 1:1 relation. This is then used for propagation of
     * changes to the inverse side of bi-directional relations.
     * First defines a setter on the prototype, once called, actual get/set handlers are registered on the instance rather
     * than on its prototype. Thanks to this we still have those properties enumerable (e.g. part of `Object.keys(entity)`).
     */
    static defineReferenceProperties(meta) {
        Object
            .values(meta.properties)
            .filter(prop => [enums_1.ReferenceType.ONE_TO_ONE, enums_1.ReferenceType.MANY_TO_ONE].includes(prop.reference) && (prop.inversedBy || prop.mappedBy))
            .forEach(prop => {
            Object.defineProperty(meta.prototype, prop.name, {
                set(val) {
                    if (!('__data' in this)) {
                        Object.defineProperty(this, '__data', { value: {} });
                    }
                    EntityHelper.defineReferenceProperty(prop, this, val);
                },
            });
        });
        meta.prototype[util_1.inspect.custom] = function (depth) {
            const ret = util_1.inspect(Object.assign({}, this), { depth });
            return ret === '[Object]' ? `[${meta.name}]` : meta.name + ' ' + ret;
        };
    }
    static defineReferenceProperty(prop, ref, val) {
        Object.defineProperty(ref, prop.name, {
            get() {
                return this.__data[prop.name];
            },
            set(val) {
                this.__data[prop.name] = Reference_1.Reference.wrapReference(val, prop);
                const entity = Reference_1.Reference.unwrapReference(val);
                EntityHelper.propagate(entity, this, prop);
            },
            enumerable: true,
            configurable: true,
        });
        ref[prop.name] = val;
    }
    static propagate(entity, owner, prop) {
        const inverse = entity && entity[prop.inversedBy || prop.mappedBy];
        if (prop.reference === enums_1.ReferenceType.MANY_TO_ONE && inverse && wrap_1.wrap(inverse, true).isInitialized()) {
            inverse.add(owner);
        }
        if (prop.reference === enums_1.ReferenceType.ONE_TO_ONE && entity && wrap_1.wrap(entity, true).isInitialized() && Reference_1.Reference.unwrapReference(inverse) !== owner) {
            EntityHelper.propagateOneToOne(entity, owner, prop);
        }
    }
    static propagateOneToOne(entity, owner, prop) {
        const inverse = entity[prop.inversedBy || prop.mappedBy];
        if (Reference_1.Reference.isReference(inverse)) {
            inverse.set(owner);
        }
        else {
            entity[prop.inversedBy || prop.mappedBy] = Reference_1.Reference.wrapReference(owner, prop);
        }
    }
}
exports.EntityHelper = EntityHelper;
