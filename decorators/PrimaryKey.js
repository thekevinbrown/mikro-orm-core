"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializedPrimaryKey = exports.PrimaryKey = void 0;
const metadata_1 = require("../metadata");
const entity_1 = require("../entity");
function createDecorator(options, serialized) {
    return function (target, propertyName) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        const k = serialized ? 'serializedPrimaryKey' : 'primary';
        options[k] = true;
        meta.properties[propertyName] = Object.assign({ name: propertyName, reference: entity_1.ReferenceType.SCALAR }, options);
    };
}
function PrimaryKey(options = {}) {
    return createDecorator(options, false);
}
exports.PrimaryKey = PrimaryKey;
function SerializedPrimaryKey(options = {}) {
    return createDecorator(options, true);
}
exports.SerializedPrimaryKey = SerializedPrimaryKey;
