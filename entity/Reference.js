"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reference = void 0;
const wrap_1 = require("./wrap");
class Reference {
    constructor(entity) {
        this.entity = entity;
        this.set(entity);
        const wrapped = wrap_1.wrap(this.entity, true);
        Object.defineProperty(this, '__reference', { value: true });
        wrapped.__meta.primaryKeys.forEach(primaryKey => {
            Object.defineProperty(this, primaryKey, {
                get() {
                    return this.entity[primaryKey];
                },
            });
        });
        if (wrapped.__meta.serializedPrimaryKey && wrapped.__meta.primaryKeys[0] !== wrapped.__meta.serializedPrimaryKey) {
            Object.defineProperty(this, wrapped.__meta.serializedPrimaryKey, {
                get() {
                    return wrap_1.wrap(this.entity, true).__serializedPrimaryKey;
                },
            });
        }
    }
    static create(entity) {
        if (Reference.isReference(entity)) {
            return entity;
        }
        return new Reference(entity);
    }
    /**
     * Checks whether the argument is instance or `Reference` wrapper.
     */
    static isReference(data) {
        return data && !!data.__reference;
    }
    /**
     * Wraps the entity in a `Reference` wrapper if the property is defined as `wrappedReference`.
     */
    static wrapReference(entity, prop) {
        if (entity && prop.wrappedReference && !Reference.isReference(entity)) {
            return Reference.create(entity);
        }
        return entity;
    }
    /**
     * Returns wrapped entity.
     */
    static unwrapReference(ref) {
        return Reference.isReference(ref) ? ref.unwrap() : ref;
    }
    async load() {
        if (this.isInitialized()) {
            return this.entity;
        }
        return wrap_1.wrap(this.entity, true).init();
    }
    async get(prop) {
        await this.load();
        return this.entity[prop];
    }
    set(entity) {
        if (entity instanceof Reference) {
            entity = entity.unwrap();
        }
        this.entity = entity;
        this.__helper = wrap_1.wrap(this.entity, true);
    }
    unwrap() {
        return this.entity;
    }
    getEntity() {
        if (!this.isInitialized()) {
            throw new Error(`Reference<${wrap_1.wrap(this, true).__meta.name}> ${wrap_1.wrap(this.entity, true).__primaryKey} not initialized`);
        }
        return this.entity;
    }
    getProperty(prop) {
        return this.getEntity()[prop];
    }
    isInitialized() {
        return wrap_1.wrap(this.entity, true).isInitialized();
    }
    populated(populated) {
        wrap_1.wrap(this.entity, true).populated(populated);
    }
    toJSON(...args) {
        return wrap_1.wrap(this.entity).toJSON(...args);
    }
}
exports.Reference = Reference;
