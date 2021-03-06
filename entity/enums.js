"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadStrategy = exports.Cascade = exports.ReferenceType = void 0;
var ReferenceType;
(function (ReferenceType) {
    ReferenceType["SCALAR"] = "scalar";
    ReferenceType["ONE_TO_ONE"] = "1:1";
    ReferenceType["ONE_TO_MANY"] = "1:m";
    ReferenceType["MANY_TO_ONE"] = "m:1";
    ReferenceType["MANY_TO_MANY"] = "m:n";
    ReferenceType["EMBEDDED"] = "embedded";
})(ReferenceType = exports.ReferenceType || (exports.ReferenceType = {}));
var Cascade;
(function (Cascade) {
    Cascade["PERSIST"] = "persist";
    Cascade["MERGE"] = "merge";
    Cascade["REMOVE"] = "remove";
    Cascade["ALL"] = "all";
})(Cascade = exports.Cascade || (exports.Cascade = {}));
var LoadStrategy;
(function (LoadStrategy) {
    LoadStrategy["SELECT_IN"] = "select-in";
    LoadStrategy["JOINED"] = "joined";
})(LoadStrategy = exports.LoadStrategy || (exports.LoadStrategy = {}));
