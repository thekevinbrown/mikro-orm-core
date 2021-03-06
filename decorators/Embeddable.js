"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Embeddable = void 0;
const metadata_1 = require("../metadata");
function Embeddable() {
    return function (target) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target);
        meta.class = target;
        meta.name = target.name;
        meta.embeddable = true;
        return target;
    };
}
exports.Embeddable = Embeddable;
