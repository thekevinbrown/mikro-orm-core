"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToMany = void 0;
const metadata_1 = require("../metadata");
const utils_1 = require("../utils");
const entity_1 = require("../entity");
function ManyToMany(entity, mappedBy, options = {}) {
    return function (target, propertyName) {
        options = utils_1.Utils.isObject(entity) ? entity : Object.assign(Object.assign({}, options), { entity, mappedBy });
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        metadata_1.MetadataValidator.validateSingleDecorator(meta, propertyName);
        const property = { name: propertyName, reference: entity_1.ReferenceType.MANY_TO_MANY };
        meta.properties[propertyName] = Object.assign(property, options);
    };
}
exports.ManyToMany = ManyToMany;
