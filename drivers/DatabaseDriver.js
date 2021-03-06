"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseDriver = void 0;
const IDatabaseDriver_1 = require("./IDatabaseDriver");
const utils_1 = require("../utils");
const enums_1 = require("../enums");
const entity_1 = require("../entity");
const index_1 = require("../index");
class DatabaseDriver {
    constructor(config, dependencies) {
        this.config = config;
        this.dependencies = dependencies;
        this.replicas = [];
        this.logger = this.config.getLogger();
    }
    createEntityManager(useContext) {
        return new index_1.EntityManager(this.config, this, this.metadata, useContext);
    }
    async aggregate(entityName, pipeline) {
        throw new Error(`Aggregations are not supported by ${this.constructor.name} driver`);
    }
    async loadFromPivotTable(prop, owners, where, orderBy, ctx) {
        throw new Error(`${this.constructor.name} does not use pivot tables`);
    }
    async syncCollection(coll, ctx) {
        const pk = this.metadata.get(coll.property.type).primaryKeys[0];
        const data = { [coll.property.name]: coll.getIdentifiers(pk) };
        await this.nativeUpdate(coll.owner.constructor.name, entity_1.wrap(coll.owner, true).__primaryKey, data, ctx);
    }
    mapResult(result, meta, populate = []) {
        if (!result || !meta) {
            return null;
        }
        const ret = Object.assign({}, result);
        Object.values(meta.properties).forEach(prop => {
            if (prop.fieldNames && prop.fieldNames.length > 1 && prop.fieldNames.every(joinColumn => utils_1.Utils.isDefined(ret[joinColumn], true))) {
                const temp = [];
                prop.fieldNames.forEach(joinColumn => {
                    temp.push(ret[joinColumn]);
                    delete ret[joinColumn];
                });
                ret[prop.name] = temp;
            }
            else if (prop.fieldNames && prop.fieldNames[0] in ret) {
                utils_1.Utils.renameKey(ret, prop.fieldNames[0], prop.name);
            }
            if (prop.type === 'boolean' && ![null, undefined].includes(ret[prop.name])) {
                ret[prop.name] = !!ret[prop.name];
            }
        });
        return ret;
    }
    async connect() {
        await this.connection.connect();
        await Promise.all(this.replicas.map(replica => replica.connect()));
        return this.connection;
    }
    async reconnect() {
        await this.close(true);
        return this.connect();
    }
    getConnection(type = 'write') {
        if (type === 'write' || this.replicas.length === 0) {
            return this.connection;
        }
        const rand = utils_1.Utils.randomInt(0, this.replicas.length - 1);
        return this.replicas[rand];
    }
    async close(force) {
        await Promise.all(this.replicas.map(replica => replica.close(force)));
        await this.connection.close(force);
    }
    getPlatform() {
        return this.platform;
    }
    setMetadata(metadata) {
        this.metadata = metadata;
        this.connection.setMetadata(metadata);
    }
    getDependencies() {
        return this.dependencies;
    }
    async ensureIndexes() {
        throw new Error(`${this.constructor.name} does not use ensureIndexes`);
    }
    getPivotOrderBy(prop, orderBy) {
        if (orderBy) {
            return orderBy;
        }
        if (prop.orderBy) {
            return prop.orderBy;
        }
        if (prop.fixedOrder) {
            return { [`${prop.pivotTable}.${prop.fixedOrderColumn}`]: enums_1.QueryOrder.ASC };
        }
        return {};
    }
    getPrimaryKeyFields(entityName) {
        const meta = this.metadata.find(entityName);
        return meta ? meta.primaryKeys : [this.config.getNamingStrategy().referenceColumnName()];
    }
    getPivotInverseProperty(prop) {
        const pivotMeta = this.metadata.get(prop.pivotTable);
        let inverse;
        if (prop.owner) {
            const pivotProp1 = pivotMeta.properties[prop.type + '_inverse'];
            inverse = pivotProp1.mappedBy;
        }
        else {
            const pivotProp1 = pivotMeta.properties[prop.type + '_owner'];
            inverse = pivotProp1.inversedBy;
        }
        return pivotMeta.properties[inverse];
    }
    createReplicas(cb) {
        const replicas = this.config.get('replicas', []);
        const ret = [];
        const props = ['dbName', 'clientUrl', 'host', 'port', 'user', 'password', 'multipleStatements', 'pool', 'name'];
        replicas.forEach((conf) => {
            props.forEach(prop => conf[prop] = prop in conf ? conf[prop] : this.config.get(prop));
            ret.push(cb(conf));
        });
        return ret;
    }
    async lockPessimistic(entity, mode, ctx) {
        throw new Error(`Pessimistic locks are not supported by ${this.constructor.name} driver`);
    }
    shouldHaveColumn(prop, populate, includeFormulas = true) {
        if (prop.formula) {
            return includeFormulas;
        }
        if (prop.persist === false) {
            return false;
        }
        if (prop.lazy && !populate.some(p => p.field === prop.name)) {
            return false;
        }
        return [entity_1.ReferenceType.SCALAR, entity_1.ReferenceType.MANY_TO_ONE].includes(prop.reference) || (prop.reference === entity_1.ReferenceType.ONE_TO_ONE && prop.owner);
    }
    /**
     * @inheritDoc
     */
    convertException(exception) {
        return this.platform.getExceptionConverter().convertException(exception);
    }
    rethrow(promise) {
        return promise.catch(e => {
            throw this.convertException(e);
        });
    }
}
exports.DatabaseDriver = DatabaseDriver;
