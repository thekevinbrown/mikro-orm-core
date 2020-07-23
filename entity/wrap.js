"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = void 0;
const ArrayCollection_1 = require("./ArrayCollection");
const BaseEntity_1 = require("./BaseEntity");
/**
 * wraps entity type with WrappedEntity internal properties and helpers like init/isInitialized/populated/toJSON
 * use `preferHelper = true` to have access to the internal `__` properties like `__meta` or `__em`
 */
function wrap(entity, preferHelper = false) {
    if (entity instanceof BaseEntity_1.BaseEntity && !preferHelper) {
        return entity;
    }
    if (entity instanceof ArrayCollection_1.ArrayCollection) {
        return entity;
    }
    return entity.__helper;
}
exports.wrap = wrap;
