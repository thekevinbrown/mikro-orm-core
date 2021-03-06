"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockMode = void 0;
var LockMode;
(function (LockMode) {
    LockMode[LockMode["NONE"] = 0] = "NONE";
    LockMode[LockMode["OPTIMISTIC"] = 1] = "OPTIMISTIC";
    LockMode[LockMode["PESSIMISTIC_READ"] = 2] = "PESSIMISTIC_READ";
    LockMode[LockMode["PESSIMISTIC_WRITE"] = 3] = "PESSIMISTIC_WRITE";
})(LockMode = exports.LockMode || (exports.LockMode = {}));
