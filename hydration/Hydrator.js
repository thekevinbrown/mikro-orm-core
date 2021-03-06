"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hydrator = void 0;
const __1 = require("..");
class Hydrator {
    constructor(factory, em) {
        this.factory = factory;
        this.em = em;
    }
    hydrate(entity, meta, data, newEntity) {
        const metadata = this.em.getMetadata();
        const root = __1.Utils.getRootEntity(metadata, meta);
        if (root.discriminatorColumn) {
            meta = metadata.get(entity.constructor.name);
        }
        const props = Object.values(meta.properties).filter(prop => {
            return !prop.inherited && root.discriminatorColumn !== prop.name && !prop.embedded;
        });
        for (const prop of props) {
            this.hydrateProperty(entity, prop, data, newEntity);
        }
    }
}
exports.Hydrator = Hydrator;
