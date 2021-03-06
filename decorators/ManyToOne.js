"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToOne = void 0;
const metadata_1 = require("../metadata");
const utils_1 = require("../utils");
const entity_1 = require("../entity");
function ManyToOne(entity = {}, options = {}) {
    return function (target, propertyName) {
        options = utils_1.Utils.isObject(entity) ? entity : Object.assign(Object.assign({}, options), { entity });
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        metadata_1.MetadataValidator.validateSingleDecorator(meta, propertyName);
        const property = { name: propertyName, reference: entity_1.ReferenceType.MANY_TO_ONE };
        meta.properties[propertyName] = Object.assign(property, options);
    };
}
exports.ManyToOne = ManyToOne;
