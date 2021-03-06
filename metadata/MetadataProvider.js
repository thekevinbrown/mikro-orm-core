"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataProvider = void 0;
const utils_1 = require("../utils");
class MetadataProvider {
    constructor(config) {
        this.config = config;
    }
    loadFromCache(meta, cache) {
        utils_1.Utils.merge(meta, cache);
    }
    useCache() {
        var _a;
        return (_a = this.config.get('cache').enabled) !== null && _a !== void 0 ? _a : false;
    }
    async initProperties(meta, fallback) {
        // load types and column names
        for (const prop of Object.values(meta.properties)) {
            if (utils_1.Utils.isString(prop.entity)) {
                prop.type = prop.entity;
            }
            else if (prop.entity) {
                prop.type = utils_1.Utils.className(prop.entity());
            }
            else if (!prop.type) {
                await fallback(prop);
            }
        }
    }
}
exports.MetadataProvider = MetadataProvider;
