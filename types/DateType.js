"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateType = void 0;
const Type_1 = require("./Type");
const utils_1 = require("../utils");
class DateType extends Type_1.Type {
    convertToDatabaseValue(value, platform) {
        if (value instanceof Date) {
            return value.toISOString().substr(0, 10);
        }
        if (!value || value.toString().match(/^\d{4}-\d{2}-\d{2}$/)) {
            return value;
        }
        throw utils_1.ValidationError.invalidType(DateType, value, 'JS');
    }
    convertToJSValue(value, platform) {
        if (!value || value instanceof Date) {
            return value;
        }
        const date = new Date(value);
        if (date.toString() === 'Invalid Date') {
            throw utils_1.ValidationError.invalidType(DateType, value, 'database');
        }
        return date;
    }
    getColumnType(prop, platform) {
        return platform.getDateTypeDeclarationSQL(prop.length);
    }
    toJSON(value, platform) {
        return this.convertToDatabaseValue(value, platform);
    }
}
exports.DateType = DateType;
