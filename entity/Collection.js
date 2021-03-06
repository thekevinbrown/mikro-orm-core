"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const index_1 = require("./index");
const enums_1 = require("./enums");
const utils_1 = require("../utils");
const enums_2 = require("../enums");
const Reference_1 = require("./Reference");
const wrap_1 = require("./wrap");
class Collection extends index_1.ArrayCollection {
    constructor(owner, items, initialized = true) {
        super(owner, items);
        this.snapshot = []; // used to create a diff of the collection at commit time
        this.initialized = false;
        this.dirty = false;
        this._populated = false;
        this.initialized = !!items || initialized;
        Object.defineProperty(this, 'snapshot', { enumerable: false });
        Object.defineProperty(this, '_populated', { enumerable: false });
    }
    /**
     * Initializes the collection and returns the items
     */
    async loadItems() {
        if (!this.isInitialized(true)) {
            await this.init();
        }
        return super.getItems();
    }
    /**
     * Returns the items (the collection must be initialized)
     */
    getItems(check = true) {
        if (check) {
            this.checkInitialized();
        }
        return super.getItems();
    }
    add(...items) {
        const unwrapped = items.map(i => Reference_1.Reference.unwrapReference(i));
        unwrapped.map(item => this.validateItemType(item));
        this.modify('add', unwrapped);
        this.cancelOrphanRemoval(unwrapped);
    }
    set(items) {
        const unwrapped = items.map(i => Reference_1.Reference.unwrapReference(i));
        unwrapped.map(item => this.validateItemType(item));
        this.validateModification(unwrapped);
        super.set(unwrapped);
        this.setDirty();
        this.cancelOrphanRemoval(unwrapped);
    }
    /**
     * @internal
     */
    hydrate(items, validate = false, takeSnapshot = true) {
        if (validate) {
            this.validateModification(items);
        }
        const wasInitialized = this.initialized;
        this.initialized = true;
        super.hydrate(items);
        if (!wasInitialized) {
            this.snapshot = undefined;
        }
        else if (takeSnapshot) {
            this.takeSnapshot();
        }
    }
    remove(...items) {
        const unwrapped = items.map(i => Reference_1.Reference.unwrapReference(i));
        this.modify('remove', unwrapped);
        const em = wrap_1.wrap(this.owner, true).__em;
        if (this.property.orphanRemoval && em) {
            for (const item of unwrapped) {
                em.getUnitOfWork().scheduleOrphanRemoval(item);
            }
        }
    }
    contains(item, check = true) {
        if (check) {
            this.checkInitialized();
        }
        return super.contains(item);
    }
    count() {
        this.checkInitialized();
        return super.count();
    }
    isInitialized(fully = false) {
        if (fully) {
            return this.initialized && this.items.every(item => wrap_1.wrap(item, true).isInitialized());
        }
        return this.initialized;
    }
    shouldPopulate() {
        return this._populated;
    }
    populated(populated = true) {
        this._populated = populated;
    }
    isDirty() {
        return this.dirty;
    }
    setDirty(dirty = true) {
        this.dirty = dirty && !!this.property.owner; // set dirty flag only to owning side
    }
    async init(populate = [], where, orderBy) {
        const options = utils_1.Utils.isObject(populate) ? populate : { populate, where, orderBy };
        const em = wrap_1.wrap(this.owner, true).__em;
        if (!em) {
            throw utils_1.ValidationError.entityNotManaged(this.owner);
        }
        if (!this.initialized && this.property.reference === enums_1.ReferenceType.MANY_TO_MANY && em.getDriver().getPlatform().usesPivotTable()) {
            const map = await em.getDriver().loadFromPivotTable(this.property, [wrap_1.wrap(this.owner, true).__primaryKeys], options.where, options.orderBy);
            this.hydrate(map[wrap_1.wrap(this.owner, true).__serializedPrimaryKey].map(item => em.merge(this.property.type, item)));
            return this;
        }
        // do not make db call if we know we will get no results
        if (this.property.reference === enums_1.ReferenceType.MANY_TO_MANY && (this.property.owner || em.getDriver().getPlatform().usesPivotTable()) && this.length === 0) {
            this.initialized = true;
            this.dirty = false;
            this.populated();
            return this;
        }
        where = this.createCondition(options.where);
        const order = [...this.items]; // copy order of references
        const customOrder = !!options.orderBy;
        orderBy = this.createOrderBy(options.orderBy);
        const items = await em.find(this.property.type, where, options.populate, orderBy);
        if (!customOrder) {
            this.reorderItems(items, order);
        }
        this.items.length = 0;
        this.items.push(...items);
        Object.assign(this, items);
        this.initialized = true;
        this.dirty = false;
        this.populated();
        return this;
    }
    /**
     * @internal
     */
    takeSnapshot() {
        this.snapshot = [...this.items];
        this.setDirty(false);
    }
    /**
     * @internal
     */
    getSnapshot() {
        return this.snapshot;
    }
    createCondition(cond = {}) {
        if (this.property.reference === enums_1.ReferenceType.ONE_TO_MANY) {
            cond[this.property.mappedBy] = wrap_1.wrap(this.owner, true).__primaryKey;
        }
        else { // MANY_TO_MANY
            this.createManyToManyCondition(cond);
        }
        return cond;
    }
    createOrderBy(orderBy = {}) {
        if (utils_1.Utils.isEmpty(orderBy) && this.property.reference === enums_1.ReferenceType.ONE_TO_MANY) {
            const defaultOrder = this.property.referencedColumnNames.reduce((o, name) => {
                o[name] = enums_2.QueryOrder.ASC;
                return o;
            }, {});
            orderBy = this.property.orderBy || defaultOrder;
        }
        return orderBy;
    }
    createManyToManyCondition(cond) {
        if (this.property.owner || wrap_1.wrap(this.owner, true).__internal.platform.usesPivotTable()) {
            const pk = wrap_1.wrap(this.items[0], true).__meta.primaryKeys[0]; // we know there is at least one item as it was checked in load method
            cond[pk] = { $in: this.items.map(item => wrap_1.wrap(item, true).__primaryKey) };
        }
        else {
            cond[this.property.mappedBy] = wrap_1.wrap(this.owner, true).__primaryKey;
        }
    }
    modify(method, items) {
        if (method === 'remove') {
            this.checkInitialized();
        }
        this.validateModification(items);
        super[method](...items);
        this.setDirty();
    }
    checkInitialized() {
        if (!this.isInitialized()) {
            throw new Error(`Collection<${this.property.type}> of entity ${this.owner.constructor.name}[${wrap_1.wrap(this.owner, true).__primaryKey}] not initialized`);
        }
    }
    /**
     * re-orders items after searching with `$in` operator
     */
    reorderItems(items, order) {
        if (this.property.reference === enums_1.ReferenceType.MANY_TO_MANY && this.property.owner) {
            items.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        }
    }
    cancelOrphanRemoval(items) {
        const em = wrap_1.wrap(this.owner, true).__em;
        if (!em) {
            return;
        }
        for (const item of items) {
            em.getUnitOfWork().cancelOrphanRemoval(item);
        }
    }
    validateItemType(item) {
        if (!utils_1.Utils.isEntity(item)) {
            throw utils_1.ValidationError.notEntity(this.owner, this.property, item);
        }
    }
    validateModification(items) {
        // throw if we are modifying inverse side of M:N collection when owning side is initialized (would be ignored when persisting)
        const manyToManyInverse = this.property.reference === enums_1.ReferenceType.MANY_TO_MANY && this.property.mappedBy;
        if (manyToManyInverse && items.find(item => !wrap_1.wrap(item, true).isInitialized() || !item[this.property.mappedBy])) {
            throw utils_1.ValidationError.cannotModifyInverseCollection(this.owner, this.property);
        }
    }
}
exports.Collection = Collection;
