"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
const wrap_1 = require("./wrap");
const Reference_1 = require("./Reference");
const EntityAssigner_1 = require("./EntityAssigner");
class BaseEntity {
    isInitialized() {
        return wrap_1.wrap(this, true).isInitialized();
    }
    populated(populated = true) {
        wrap_1.wrap(this, true).populated(populated);
    }
    toReference() {
        return Reference_1.Reference.create(this);
    }
    toObject(ignoreFields = []) {
        return wrap_1.wrap(this, true).toObject(ignoreFields);
    }
    toJSON(...args) {
        return this.toObject(...args);
    }
    assign(data, options) {
        return EntityAssigner_1.EntityAssigner.assign(this, data, options);
    }
    init(populated = true) {
        return wrap_1.wrap(this, true).init(populated);
    }
}
exports.BaseEntity = BaseEntity;
