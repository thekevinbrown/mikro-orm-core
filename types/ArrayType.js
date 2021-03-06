"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayType = void 0;
const Type_1 = require("./Type");
const utils_1 = require("../utils");
class ArrayType extends Type_1.Type {
    constructor(hydrate = i => i) {
        super();
        this.hydrate = hydrate;
    }
    convertToDatabaseValue(value, platform) {
        if (!value) {
            return value;
        }
        if (Array.isArray(value)) {
            return platform.marshallArray(value);
        }
        throw utils_1.ValidationError.invalidType(ArrayType, value, 'JS');
    }
    convertToJSValue(value, platform) {
        if (!value) {
            return value;
        }
        if (utils_1.Utils.isString(value)) {
            value = platform.unmarshallArray(value);
        }
        return value.map(i => this.hydrate(i));
    }
    toJSON(value) {
        return value;
    }
    getColumnType(prop, platform) {
        return platform.getArrayDeclarationSQL();
    }
}
exports.ArrayType = ArrayType;
