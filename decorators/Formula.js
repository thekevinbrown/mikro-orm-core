"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formula = void 0;
const metadata_1 = require("../metadata");
const entity_1 = require("../entity");
function Formula(formula) {
    return function (target, propertyName) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        meta.properties[propertyName] = { name: propertyName, reference: entity_1.ReferenceType.SCALAR, persist: false, formula };
    };
}
exports.Formula = Formula;
