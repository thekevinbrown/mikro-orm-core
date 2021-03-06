"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrappedEntity = void 0;
const uuid_1 = require("uuid");
const Reference_1 = require("./Reference");
const EntityTransformer_1 = require("./EntityTransformer");
const EntityAssigner_1 = require("./EntityAssigner");
const EntityHelper_1 = require("./EntityHelper");
const utils_1 = require("../utils");
const wrap_1 = require("./wrap");
class WrappedEntity {
    constructor(entity, __meta, em) {
        this.entity = entity;
        this.__meta = __meta;
        this.__initialized = true;
        this.__populated = false;
        this.__lazyInitialized = false;
        this.__uuid = uuid_1.v4();
        this.__internal = {
            platform: em.getDriver().getPlatform(),
            metadata: em.getMetadata(),
            validator: em.getValidator(),
        };
    }
    isInitialized() {
        return this.__initialized;
    }
    populated(populated = true) {
        this.__populated = populated;
    }
    toReference() {
        return Reference_1.Reference.create(this.entity);
    }
    toObject(ignoreFields = []) {
        return EntityTransformer_1.EntityTransformer.toObject(this.entity, ignoreFields);
    }
    toJSON(...args) {
        // toJSON methods is added to thee prototype during discovery to support automatic serialization via JSON.stringify()
        return this.entity.toJSON(...args);
    }
    assign(data, options) {
        if ('assign' in this.entity) {
            return this.entity.assign(data, options);
        }
        return EntityAssigner_1.EntityAssigner.assign(this.entity, data, options);
    }
    init(populated = true) {
        return EntityHelper_1.EntityHelper.init(this.entity, populated);
    }
    get __primaryKey() {
        return utils_1.Utils.getPrimaryKeyValue(this.entity, this.__meta.primaryKeys);
    }
    set __primaryKey(id) {
        this.entity[this.__meta.primaryKeys[0]] = id;
    }
    get __primaryKeys() {
        return utils_1.Utils.getPrimaryKeyValues(this.entity, this.__meta.primaryKeys);
    }
    get __serializedPrimaryKey() {
        if (this.__meta.compositePK) {
            return utils_1.Utils.getCompositeKeyHash(this.entity, this.__meta);
        }
        if (utils_1.Utils.isEntity(this.entity[this.__meta.serializedPrimaryKey])) {
            return wrap_1.wrap(this.entity[this.__meta.serializedPrimaryKey], true).__serializedPrimaryKey;
        }
        return this.entity[this.__meta.serializedPrimaryKey];
    }
}
exports.WrappedEntity = WrappedEntity;
