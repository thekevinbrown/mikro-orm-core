"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enum = void 0;
const metadata_1 = require("../metadata");
const entity_1 = require("../entity");
function Enum(options = {}) {
    return function (target, propertyName) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        options = options instanceof Function ? { items: options } : options;
        meta.properties[propertyName] = Object.assign({ name: propertyName, reference: entity_1.ReferenceType.SCALAR, enum: true }, options);
    };
}
exports.Enum = Enum;
