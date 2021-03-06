"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataStorage = void 0;
const utils_1 = require("../utils");
const entity_1 = require("../entity");
class MetadataStorage {
    constructor(metadata = {}) {
        this.metadata = utils_1.Utils.copy(metadata);
    }
    static getMetadata(entity, path) {
        const key = entity && path ? entity + '-' + utils_1.Utils.hash(path) : null;
        if (key && !MetadataStorage.metadata[key]) {
            MetadataStorage.metadata[key] = { className: entity, path, properties: {}, hooks: {}, filters: {}, indexes: [], uniques: [] };
        }
        if (key) {
            return MetadataStorage.metadata[key];
        }
        return MetadataStorage.metadata;
    }
    static getMetadataFromDecorator(target) {
        const path = utils_1.Utils.lookupPathFromDecorator();
        const meta = MetadataStorage.getMetadata(target.name, path);
        Object.defineProperty(target, '__path', { value: path, writable: true });
        return meta;
    }
    static getSubscriberMetadata() {
        return MetadataStorage.subscribers;
    }
    static init() {
        return new MetadataStorage(MetadataStorage.metadata);
    }
    getAll() {
        return this.metadata;
    }
    get(entity, init = false, validate = true) {
        if (entity && !this.metadata[entity] && validate && !init) {
            throw utils_1.MetadataError.missingMetadata(entity);
        }
        if (!this.metadata[entity] && init) {
            this.metadata[entity] = { properties: {}, hooks: {}, indexes: [], uniques: [] };
        }
        return this.metadata[entity];
    }
    find(entity) {
        return this.get(entity, false, false);
    }
    has(entity) {
        return entity in this.metadata;
    }
    set(entity, meta) {
        return this.metadata[entity] = meta;
    }
    reset(entity) {
        delete this.metadata[entity];
    }
    decorate(em) {
        Object.values(this.metadata)
            .filter(meta => meta.prototype && !utils_1.Utils.isEntity(meta.prototype))
            .forEach(meta => entity_1.EntityHelper.decorate(meta, em));
    }
}
exports.MetadataStorage = MetadataStorage;
MetadataStorage.metadata = utils_1.Utils.getGlobalStorage('metadata');
MetadataStorage.subscribers = utils_1.Utils.getGlobalStorage('subscribers');
