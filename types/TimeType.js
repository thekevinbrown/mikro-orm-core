"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeType = void 0;
const Type_1 = require("./Type");
const utils_1 = require("../utils");
class TimeType extends Type_1.Type {
    convertToDatabaseValue(value, platform) {
        if (value && !value.toString().match(/^\d{2,}:(?:[0-5]\d):(?:[0-5]\d)$/)) {
            throw utils_1.ValidationError.invalidType(TimeType, value, 'JS');
        }
        return super.convertToDatabaseValue(value, platform);
    }
    getColumnType(prop, platform) {
        return platform.getTimeTypeDeclarationSQL(prop.length);
    }
}
exports.TimeType = TimeType;
