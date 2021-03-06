"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityRepository = void 0;
class EntityRepository {
    constructor(em, entityName) {
        this.em = em;
        this.entityName = entityName;
    }
    persist(entity) {
        return this.em.persist(entity);
    }
    async persistAndFlush(entity) {
        await this.em.persistAndFlush(entity);
    }
    /**
     * @deprecated use `persist()`
     */
    persistLater(entity) {
        this.em.persistLater(entity);
    }
    async findOne(where, populate = [], orderBy) {
        return this.em.findOne(this.entityName, where, populate, orderBy);
    }
    async findOneOrFail(where, populate = [], orderBy) {
        return this.em.findOneOrFail(this.entityName, where, populate, orderBy);
    }
    async find(where, populate = [], orderBy = {}, limit, offset) {
        return this.em.find(this.entityName, where, populate, orderBy, limit, offset);
    }
    async findAndCount(where, populate = [], orderBy = {}, limit, offset) {
        return this.em.findAndCount(this.entityName, where, populate, orderBy, limit, offset);
    }
    async findAll(populate = [], orderBy, limit, offset) {
        return this.em.find(this.entityName, {}, populate, orderBy, limit, offset);
    }
    remove(entity) {
        return this.em.remove(entity);
    }
    async removeAndFlush(entity) {
        await this.em.removeAndFlush(entity);
    }
    /**
     * @deprecated use `remove()`
     */
    removeLater(entity) {
        this.em.removeLater(entity);
    }
    async flush() {
        return this.em.flush();
    }
    async nativeInsert(data) {
        return this.em.nativeInsert(this.entityName, data);
    }
    async nativeUpdate(where, data) {
        return this.em.nativeUpdate(this.entityName, where, data);
    }
    async nativeDelete(where) {
        return this.em.nativeDelete(this.entityName, where);
    }
    map(result) {
        return this.em.map(this.entityName, result);
    }
    getReference(id, wrapped = false) {
        return this.em.getReference(this.entityName, id, wrapped);
    }
    canPopulate(property) {
        return this.em.canPopulate(this.entityName, property);
    }
    async populate(entities, populate, where = {}, orderBy = {}, refresh = false, validate = true) {
        return this.em.populate(entities, populate, where, orderBy, refresh, validate);
    }
    /**
     * Creates new instance of given entity and populates it with given data
     */
    create(data) {
        return this.em.create(this.entityName, data);
    }
    async count(where = {}) {
        return this.em.count(this.entityName, where);
    }
}
exports.EntityRepository = EntityRepository;
