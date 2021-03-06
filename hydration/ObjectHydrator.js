"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectHydrator = void 0;
const Hydrator_1 = require("./Hydrator");
const entity_1 = require("../entity");
const utils_1 = require("../utils");
class ObjectHydrator extends Hydrator_1.Hydrator {
    hydrateProperty(entity, prop, data, newEntity) {
        if (prop.reference === entity_1.ReferenceType.MANY_TO_ONE || prop.reference === entity_1.ReferenceType.ONE_TO_ONE) {
            this.hydrateManyToOne(data[prop.name], entity, prop);
        }
        else if (prop.reference === entity_1.ReferenceType.ONE_TO_MANY) {
            this.hydrateOneToMany(entity, prop, data[prop.name], newEntity);
        }
        else if (prop.reference === entity_1.ReferenceType.MANY_TO_MANY) {
            this.hydrateManyToMany(entity, prop, data[prop.name], newEntity);
        }
        else if (prop.reference === entity_1.ReferenceType.EMBEDDED) {
            this.hydrateEmbeddable(entity, prop, data);
        }
        else { // ReferenceType.SCALAR
            this.hydrateScalar(entity, prop, data[prop.name]);
        }
    }
    hydrateOneToMany(entity, prop, value, newEntity) {
        entity[prop.name] = new entity_1.Collection(entity, undefined, !!value || newEntity);
    }
    hydrateScalar(entity, prop, value) {
        if (typeof value === 'undefined' || (prop.getter && !prop.setter)) {
            return;
        }
        if (prop.customType) {
            value = prop.customType.convertToJSValue(value, this.em.getDriver().getPlatform());
        }
        entity[prop.name] = value;
    }
    hydrateEmbeddable(entity, prop, data) {
        const value = {};
        Object.values(entity_1.wrap(entity, true).__meta.properties).filter(p => { var _a; return ((_a = p.embedded) === null || _a === void 0 ? void 0 : _a[0]) === prop.name; }).forEach(childProp => {
            value[childProp.embedded[1]] = data[childProp.name];
        });
        entity[prop.name] = Object.create(prop.embeddable.prototype);
        Object.keys(value).forEach(k => entity[prop.name][k] = value[k]);
    }
    hydrateManyToMany(entity, prop, value, newEntity) {
        if (prop.owner) {
            return this.hydrateManyToManyOwner(entity, prop, value, newEntity);
        }
        this.hydrateManyToManyInverse(entity, prop, newEntity);
    }
    hydrateManyToManyOwner(entity, prop, value, newEntity) {
        if (Array.isArray(value)) {
            const items = value.map((value) => this.createCollectionItem(prop, value));
            const coll = new entity_1.Collection(entity, items);
            entity[prop.name] = coll;
            coll.setDirty();
        }
        else if (!entity[prop.name]) {
            const items = this.em.getDriver().getPlatform().usesPivotTable() ? undefined : [];
            entity[prop.name] = new entity_1.Collection(entity, items, newEntity);
        }
    }
    hydrateManyToManyInverse(entity, prop, newEntity) {
        if (!entity[prop.name]) {
            entity[prop.name] = new entity_1.Collection(entity, undefined, newEntity);
        }
    }
    hydrateManyToOne(value, entity, prop) {
        if (typeof value === 'undefined') {
            return;
        }
        if (utils_1.Utils.isPrimaryKey(value)) {
            entity[prop.name] = entity_1.Reference.wrapReference(this.factory.createReference(prop.type, value), prop);
        }
        else if (utils_1.Utils.isObject(value)) {
            entity[prop.name] = entity_1.Reference.wrapReference(this.factory.create(prop.type, value), prop);
        }
        if (entity[prop.name]) {
            entity_1.EntityAssigner.autoWireOneToOne(prop, entity);
        }
    }
    createCollectionItem(prop, value) {
        const meta = this.em.getMetadata().get(prop.type);
        if (utils_1.Utils.isPrimaryKey(value, meta.compositePK)) {
            const ref = this.factory.createReference(prop.type, value);
            this.em.merge(ref);
            return ref;
        }
        if (utils_1.Utils.isEntity(value)) {
            return value;
        }
        return this.factory.create(prop.type, value);
    }
}
exports.ObjectHydrator = ObjectHydrator;
