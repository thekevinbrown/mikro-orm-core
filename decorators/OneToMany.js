"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToMany = exports.createOneToDecorator = void 0;
const metadata_1 = require("../metadata");
const utils_1 = require("../utils");
const entity_1 = require("../entity");
function createOneToDecorator(entity, mappedBy, options, reference) {
    return function (target, propertyName) {
        options = utils_1.Utils.isObject(entity) ? entity : Object.assign(Object.assign({}, options), { entity, mappedBy });
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        metadata_1.MetadataValidator.validateSingleDecorator(meta, propertyName);
        const prop = { name: propertyName, reference };
        Object.assign(prop, options);
        meta.properties[propertyName] = prop;
    };
}
exports.createOneToDecorator = createOneToDecorator;
function OneToMany(entity, mappedBy, options = {}) {
    return createOneToDecorator(entity, mappedBy, options, entity_1.ReferenceType.ONE_TO_MANY);
}
exports.OneToMany = OneToMany;
