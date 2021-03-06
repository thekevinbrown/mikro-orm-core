"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToOne = void 0;
const entity_1 = require("../entity");
const OneToMany_1 = require("./OneToMany");
function OneToOne(entity, mappedBy, options = {}) {
    return OneToMany_1.createOneToDecorator(entity, mappedBy, options, entity_1.ReferenceType.ONE_TO_ONE);
}
exports.OneToOne = OneToOne;
