"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityLoader = void 0;
const enums_1 = require("./enums");
const utils_1 = require("../utils");
const Collection_1 = require("./Collection");
const enums_2 = require("../enums");
const Reference_1 = require("./Reference");
const wrap_1 = require("./wrap");
class EntityLoader {
    constructor(em) {
        this.em = em;
        this.metadata = this.em.getMetadata();
        this.driver = this.em.getDriver();
    }
    async populate(entityName, entities, populate, options) {
        var _a, _b, _c, _d, _e, _f;
        if (entities.length === 0 || populate === false) {
            return;
        }
        options.where = (_a = options.where) !== null && _a !== void 0 ? _a : {};
        options.orderBy = (_b = options.orderBy) !== null && _b !== void 0 ? _b : {};
        options.filters = (_c = options.filters) !== null && _c !== void 0 ? _c : {};
        options.lookup = (_d = options.lookup) !== null && _d !== void 0 ? _d : true;
        options.validate = (_e = options.validate) !== null && _e !== void 0 ? _e : true;
        options.refresh = (_f = options.refresh) !== null && _f !== void 0 ? _f : false;
        populate = this.normalizePopulate(entityName, populate, options.lookup);
        const invalid = populate.find(({ field }) => !this.em.canPopulate(entityName, field));
        if (options.validate && invalid) {
            throw utils_1.ValidationError.invalidPropertyName(entityName, invalid.field);
        }
        for (const pop of populate) {
            await this.populateField(entityName, entities, pop, options);
        }
    }
    normalizePopulate(entityName, populate, lookup = true) {
        if (populate === true || populate.some(p => p.all)) {
            populate = this.lookupAllRelationships(entityName);
        }
        else {
            populate = utils_1.Utils.asArray(populate);
        }
        if (lookup) {
            populate = this.lookupEagerLoadedRelationships(entityName, populate);
        }
        populate.forEach(p => {
            if (!p.field.includes('.')) {
                return;
            }
            const [f, ...parts] = p.field.split('.');
            p.field = f;
            p.children = p.children || [];
            const prop = this.metadata.get(entityName).properties[f];
            p.children.push(this.expandNestedPopulate(prop.type, parts));
        });
        return populate;
    }
    /**
     * Expands `books.perex` like populate to use `children` array instead of the dot syntax
     */
    expandNestedPopulate(entityName, parts) {
        const meta = this.metadata.get(entityName);
        const field = parts.shift();
        const prop = meta.properties[field];
        const ret = { field };
        if (parts.length > 0) {
            ret.children = [this.expandNestedPopulate(prop.type, parts)];
        }
        return ret;
    }
    /**
     * preload everything in one call (this will update already existing references in IM)
     */
    async populateMany(entityName, entities, populate, options) {
        const field = populate.field;
        const meta = this.metadata.get(entityName);
        const prop = meta.properties[field];
        if (prop.reference === enums_1.ReferenceType.SCALAR && prop.lazy) {
            return [];
        }
        // set populate flag
        entities.forEach(entity => {
            if (utils_1.Utils.isEntity(entity[field], true) || entity[field] instanceof Collection_1.Collection) {
                wrap_1.wrap(entity[field], true).populated();
            }
        });
        const filtered = this.filterCollections(entities, field, options.refresh);
        const innerOrderBy = utils_1.Utils.isObject(options.orderBy[prop.name]) ? options.orderBy[prop.name] : undefined;
        if (prop.reference === enums_1.ReferenceType.MANY_TO_MANY && this.driver.getPlatform().usesPivotTable()) {
            return this.findChildrenFromPivotTable(filtered, prop, field, options.refresh, options.where[prop.name], innerOrderBy);
        }
        let subCond = utils_1.Utils.isPlainObject(options.where[prop.name]) ? options.where[prop.name] : {};
        const op = Object.keys(subCond).find(key => utils_1.Utils.isOperator(key, false));
        const meta2 = this.metadata.get(prop.type);
        if (op) {
            subCond = { [utils_1.Utils.getPrimaryKeyHash(meta2.primaryKeys)]: subCond };
        }
        const data = await this.findChildren(entities, prop, populate, Object.assign(Object.assign({}, options), { where: subCond, orderBy: innerOrderBy }));
        this.initializeCollections(filtered, prop, field, data);
        return data;
    }
    initializeCollections(filtered, prop, field, children) {
        if (prop.reference === enums_1.ReferenceType.ONE_TO_MANY) {
            this.initializeOneToMany(filtered, children, prop, field);
        }
        if (prop.reference === enums_1.ReferenceType.MANY_TO_MANY && !prop.owner && !this.driver.getPlatform().usesPivotTable()) {
            this.initializeManyToMany(filtered, children, prop, field);
        }
    }
    initializeOneToMany(filtered, children, prop, field) {
        for (const entity of filtered) {
            const items = children.filter(child => Reference_1.Reference.unwrapReference(child[prop.mappedBy]) === entity);
            entity[field].hydrate(items);
        }
    }
    initializeManyToMany(filtered, children, prop, field) {
        for (const entity of filtered) {
            const items = children.filter(child => child[prop.mappedBy].contains(entity));
            entity[field].hydrate(items);
        }
    }
    async findChildren(entities, prop, populate, options) {
        const children = this.getChildReferences(entities, prop, options.refresh);
        const meta = this.metadata.get(prop.type);
        let fk = utils_1.Utils.getPrimaryKeyHash(meta.primaryKeys);
        if (prop.reference === enums_1.ReferenceType.ONE_TO_MANY || (prop.reference === enums_1.ReferenceType.MANY_TO_MANY && !prop.owner)) {
            fk = meta.properties[prop.mappedBy].name;
        }
        if (prop.reference === enums_1.ReferenceType.ONE_TO_ONE && !prop.owner && populate.strategy !== enums_1.LoadStrategy.JOINED && !this.em.config.get('autoJoinOneToOneOwner')) {
            children.length = 0;
            children.push(...entities);
            fk = meta.properties[prop.mappedBy].name;
        }
        if (children.length === 0) {
            return [];
        }
        const ids = utils_1.Utils.unique(children.map(e => utils_1.Utils.getPrimaryKeyValues(e, wrap_1.wrap(e, true).__meta.primaryKeys, true)));
        const where = Object.assign({ [fk]: { $in: ids } }, options.where);
        return this.em.find(prop.type, where, {
            orderBy: options.orderBy || prop.orderBy || { [fk]: enums_2.QueryOrder.ASC },
            refresh: options.refresh,
            filters: options.filters,
            populate: populate.children,
        });
    }
    async populateField(entityName, entities, populate, options) {
        if (!populate.children) {
            return void await this.populateMany(entityName, entities, populate, options);
        }
        await this.populateMany(entityName, entities, populate, options);
        const children = [];
        for (const entity of entities) {
            if (utils_1.Utils.isEntity(entity[populate.field])) {
                children.push(entity[populate.field]);
            }
            else if (Reference_1.Reference.isReference(entity[populate.field])) {
                children.push(entity[populate.field].unwrap());
            }
            else if (entity[populate.field] instanceof Collection_1.Collection) {
                children.push(...entity[populate.field].getItems());
            }
        }
        const filtered = utils_1.Utils.unique(children);
        const prop = this.metadata.get(entityName).properties[populate.field];
        await this.populate(prop.type, filtered, populate.children, {
            where: options.where[prop.name],
            orderBy: options.orderBy[prop.name],
            refresh: options.refresh,
            filters: options.filters,
            validate: false,
            lookup: false,
        });
    }
    async findChildrenFromPivotTable(filtered, prop, field, refresh, where, orderBy) {
        const map = await this.driver.loadFromPivotTable(prop, filtered.map(e => wrap_1.wrap(e, true).__primaryKeys), where, orderBy, this.em.getTransactionContext());
        const children = [];
        for (const entity of filtered) {
            const items = map[wrap_1.wrap(entity, true).__serializedPrimaryKey].map(item => this.em.merge(prop.type, item, refresh));
            entity[field].hydrate(items);
            children.push(...items);
        }
        return children;
    }
    getChildReferences(entities, prop, refresh) {
        const filtered = this.filterCollections(entities, prop.name, refresh);
        const children = [];
        if (prop.reference === enums_1.ReferenceType.ONE_TO_MANY) {
            children.push(...filtered.map(e => e[prop.name].owner));
        }
        else if (prop.reference === enums_1.ReferenceType.MANY_TO_MANY && prop.owner) {
            children.push(...filtered.reduce((a, b) => [...a, ...b[prop.name].getItems()], []));
        }
        else if (prop.reference === enums_1.ReferenceType.MANY_TO_MANY) { // inversed side
            children.push(...filtered);
        }
        else { // MANY_TO_ONE or ONE_TO_ONE
            children.push(...this.filterReferences(entities, prop.name, refresh));
        }
        return children;
    }
    filterCollections(entities, field, refresh) {
        if (refresh) {
            return entities.filter(e => e[field]);
        }
        return entities.filter(e => utils_1.Utils.isCollection(e[field]) && !e[field].isInitialized(true));
    }
    filterReferences(entities, field, refresh) {
        const children = entities.filter(e => utils_1.Utils.isEntity(e[field], true));
        if (refresh) {
            return children.map(e => Reference_1.Reference.unwrapReference(e[field]));
        }
        return children.filter(e => !wrap_1.wrap(e[field], true).isInitialized()).map(e => Reference_1.Reference.unwrapReference(e[field]));
    }
    lookupAllRelationships(entityName, prefix = '', visited = []) {
        if (visited.includes(entityName)) {
            return [];
        }
        visited.push(entityName);
        const ret = [];
        const meta = this.metadata.get(entityName);
        Object.values(meta.properties)
            .filter(prop => prop.reference !== enums_1.ReferenceType.SCALAR)
            .forEach(prop => {
            const prefixed = prefix ? `${prefix}.${prop.name}` : prop.name;
            const nested = this.lookupAllRelationships(prop.type, prefixed, visited);
            if (nested.length > 0) {
                ret.push(...nested);
            }
            else {
                ret.push({
                    field: prefixed,
                    strategy: enums_1.LoadStrategy.SELECT_IN,
                });
            }
        });
        return ret;
    }
    lookupEagerLoadedRelationships(entityName, populate, prefix = '', visited = []) {
        if (visited.includes(entityName)) {
            return [];
        }
        visited.push(entityName);
        const meta = this.metadata.get(entityName);
        Object.values(meta.properties)
            .filter(prop => prop.eager)
            .forEach(prop => {
            const prefixed = prefix ? `${prefix}.${prop.name}` : prop.name;
            const nested = this.lookupEagerLoadedRelationships(prop.type, [], prefixed, visited);
            if (nested.length > 0) {
                populate.push(...nested);
            }
            else {
                populate.push({
                    field: prefixed,
                    strategy: enums_1.LoadStrategy.SELECT_IN,
                });
            }
        });
        return populate;
    }
}
exports.EntityLoader = EntityLoader;
