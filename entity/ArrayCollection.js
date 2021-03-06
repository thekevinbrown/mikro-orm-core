"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayCollection = void 0;
const enums_1 = require("./enums");
const Reference_1 = require("./Reference");
const wrap_1 = require("./wrap");
class ArrayCollection {
    constructor(owner, items) {
        this.owner = owner;
        this.items = [];
        if (items) {
            this.items = items;
            Object.assign(this, items);
        }
        Object.defineProperty(this, 'items', { enumerable: false });
        Object.defineProperty(this, 'owner', { enumerable: false, writable: true });
        Object.defineProperty(this, '_property', { enumerable: false, writable: true });
    }
    getItems() {
        return [...this.items];
    }
    toArray() {
        return this.getItems().map(item => {
            const meta = wrap_1.wrap(item, true).__meta;
            const args = [...meta.toJsonParams.map(() => undefined), [this.property.name]];
            return wrap_1.wrap(item).toJSON(...args);
        });
    }
    getIdentifiers(field) {
        const items = this.getItems();
        if (items.length === 0) {
            return [];
        }
        field = field || wrap_1.wrap(this.items[0], true).__meta.serializedPrimaryKey;
        return this.getItems().map(i => i[field]);
    }
    add(...items) {
        for (const item of items) {
            const entity = Reference_1.Reference.unwrapReference(item);
            if (!this.contains(entity, false)) {
                this.items.push(entity);
                this.propagate(entity, 'add');
            }
        }
        Object.assign(this, this.items);
    }
    set(items) {
        this.removeAll();
        this.add(...items);
    }
    /**
     * @internal
     */
    hydrate(items) {
        this.items.length = 0;
        this.items.push(...items);
        Object.assign(this, this.items);
    }
    remove(...items) {
        for (const item of items) {
            const entity = Reference_1.Reference.unwrapReference(item);
            const idx = this.items.findIndex(i => wrap_1.wrap(i, true).__serializedPrimaryKey === wrap_1.wrap(entity, true).__serializedPrimaryKey);
            if (idx !== -1) {
                delete this[this.items.length - 1]; // remove last item
                this.items.splice(idx, 1);
                Object.assign(this, this.items); // reassign array access
            }
            this.propagate(entity, 'remove');
        }
    }
    removeAll() {
        this.remove(...this.items);
    }
    contains(item, check) {
        const entity = Reference_1.Reference.unwrapReference(item);
        return !!this.items.find(i => {
            const objectIdentity = i === entity;
            const primaryKeyIdentity = !!wrap_1.wrap(i, true).__primaryKey && !!wrap_1.wrap(entity, true).__primaryKey && wrap_1.wrap(i, true).__serializedPrimaryKey === wrap_1.wrap(entity, true).__serializedPrimaryKey;
            return objectIdentity || primaryKeyIdentity;
        });
    }
    count() {
        return this.items.length;
    }
    get length() {
        return this.count();
    }
    *[Symbol.iterator]() {
        for (const item of this.items) {
            yield item;
        }
    }
    /**
     * @internal
     */
    get property() {
        if (!this._property) {
            const meta = wrap_1.wrap(this.owner, true).__meta;
            const field = Object.keys(meta.properties).find(k => this.owner[k] === this);
            this._property = meta.properties[field];
        }
        return this._property;
    }
    propagate(item, method) {
        if (this.property.owner && this.property.inversedBy) {
            this.propagateToInverseSide(item, method);
        }
        else if (!this.property.owner && this.property.mappedBy) {
            this.propagateToOwningSide(item, method);
        }
    }
    propagateToInverseSide(item, method) {
        const collection = item[this.property.inversedBy];
        if (this.shouldPropagateToCollection(collection, method)) {
            collection[method](this.owner);
        }
    }
    propagateToOwningSide(item, method) {
        const collection = item[this.property.mappedBy];
        if (this.property.reference === enums_1.ReferenceType.MANY_TO_MANY && this.shouldPropagateToCollection(collection, method)) {
            collection[method](this.owner);
        }
        else if (this.property.reference === enums_1.ReferenceType.ONE_TO_MANY && !(this.property.orphanRemoval && method === 'remove')) {
            item[this.property.mappedBy] = method === 'add' ? this.owner : null;
        }
    }
    shouldPropagateToCollection(collection, method) {
        if (!collection) {
            return false;
        }
        if (method === 'add') {
            return !collection.contains(this.owner, false);
        }
        // remove
        return collection.contains(this.owner, false);
    }
}
exports.ArrayCollection = ArrayCollection;
