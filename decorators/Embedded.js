"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Embedded = void 0;
const metadata_1 = require("../metadata");
const enums_1 = require("../entity/enums");
const utils_1 = require("../utils");
function Embedded(options = {}) {
    return function (target, propertyName) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        options = options instanceof Function ? { entity: options } : options;
        utils_1.Utils.defaultValue(options, 'prefix', true);
        const property = { name: propertyName, reference: enums_1.ReferenceType.EMBEDDED };
        meta.properties[propertyName] = Object.assign(property, options);
    };
}
exports.Embedded = Embedded;
