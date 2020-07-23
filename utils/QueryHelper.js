"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryHelper = void 0;
const entity_1 = require("../entity");
const Utils_1 = require("./Utils");
const enums_1 = require("../enums");
class QueryHelper {
    static processParams(params, root) {
        if (entity_1.Reference.isReference(params)) {
            params = params.unwrap();
        }
        if (Utils_1.Utils.isEntity(params)) {
            return QueryHelper.processEntity(params, root);
        }
        if (params === undefined) {
            return null;
        }
        if (Array.isArray(params)) {
            return params.map(item => QueryHelper.processParams(item, true));
        }
        if (Utils_1.Utils.isPlainObject(params)) {
            Object.keys(params).forEach(k => {
                params[k] = QueryHelper.processParams(params[k], !!k);
            });
        }
        return params;
    }
    static inlinePrimaryKeyObjects(where, meta, metadata, key) {
        if (Array.isArray(where)) {
            where.forEach((item, i) => {
                if (this.inlinePrimaryKeyObjects(item, meta, metadata, key)) {
                    where[i] = Utils_1.Utils.getPrimaryKeyValues(item, meta.primaryKeys, false);
                }
            });
        }
        if (!Utils_1.Utils.isPlainObject(where)) {
            return false;
        }
        if (meta.primaryKeys.every(pk => pk in where) && Object.keys(where).length === meta.primaryKeys.length) {
            return !enums_1.GroupOperator[key] && Object.keys(where).every(k => !Utils_1.Utils.isPlainObject(where[k]) || Object.keys(where[k]).every(v => !Utils_1.Utils.isOperator(v, false)));
        }
        Object.keys(where).forEach(k => {
            var _a;
            const meta2 = metadata.find((_a = meta.properties[k]) === null || _a === void 0 ? void 0 : _a.type) || meta;
            if (this.inlinePrimaryKeyObjects(where[k], meta2, metadata, k)) {
                where[k] = Utils_1.Utils.getPrimaryKeyValues(where[k], meta2.primaryKeys, true);
            }
        });
        return false;
    }
    static processWhere(where, entityName, metadata) {
        const meta = metadata.find(entityName);
        // inline PK-only objects in M:N queries so we don't join the target entity when not needed
        if (meta) {
            QueryHelper.inlinePrimaryKeyObjects(where, meta, metadata);
        }
        where = QueryHelper.processParams(where, true) || {};
        if (Array.isArray(where)) {
            const rootPrimaryKey = meta ? Utils_1.Utils.getPrimaryKeyHash(meta.primaryKeys) : entityName;
            return { [rootPrimaryKey]: { $in: where.map(sub => QueryHelper.processWhere(sub, entityName, metadata)) } };
        }
        if (!Utils_1.Utils.isPlainObject(where) || Utils_1.Utils.isPrimaryKey(where)) {
            return where;
        }
        return Object.keys(where).reduce((o, key) => {
            var _a, _b, _c;
            const value = where[key];
            const keys = (_c = (_b = (_a = meta === null || meta === void 0 ? void 0 : meta.properties[key]) === null || _a === void 0 ? void 0 : _a.joinColumns) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
            const composite = keys > 1;
            if (key in enums_1.GroupOperator) {
                o[key] = value.map((sub) => QueryHelper.processWhere(sub, entityName, metadata));
                return o;
            }
            if (Array.isArray(value) && !QueryHelper.isSupported(key) && !key.includes('?')) {
                // comparing single composite key - use $eq instead of $in
                const op = !value.every(v => Array.isArray(v)) && composite ? '$eq' : '$in';
                o[key] = { [op]: value };
                return o;
            }
            if (!QueryHelper.isSupported(key)) {
                o[key] = where[key];
            }
            else if (key.includes(':')) {
                const [k, expr] = key.split(':');
                o[k] = QueryHelper.processExpression(expr, value);
            }
            else {
                const m = key.match(/([\w-]+) ?([<>=!]+)$/);
                o[m[1]] = QueryHelper.processExpression(m[2], value);
            }
            return o;
        }, {});
    }
    static getActiveFilters(entityName, options, filters) {
        if (options === false) {
            return [];
        }
        const opts = {};
        if (Array.isArray(options)) {
            options.forEach(filter => opts[filter] = true);
        }
        else if (Utils_1.Utils.isPlainObject(options)) {
            Object.keys(options).forEach(filter => opts[filter] = options[filter]);
        }
        return Object.keys(filters)
            .filter(f => QueryHelper.isFilterActive(entityName, f, filters[f], opts))
            .map(f => {
            filters[f].name = f;
            return filters[f];
        });
    }
    static isFilterActive(entityName, filterName, filter, options) {
        if (filter.entity && !filter.entity.includes(entityName)) {
            return false;
        }
        if (options[filterName] === false) {
            return false;
        }
        return filter.default || filterName in options;
    }
    static processEntity(entity, root) {
        const wrapped = entity_1.wrap(entity, true);
        if (root || wrapped.__meta.compositePK) {
            return wrapped.__primaryKey;
        }
        return Utils_1.Utils.getPrimaryKeyCond(entity, wrapped.__meta.primaryKeys);
    }
    static processExpression(expr, value) {
        switch (expr) {
            case '>': return { $gt: value };
            case '<': return { $lt: value };
            case '>=': return { $gte: value };
            case '<=': return { $lte: value };
            case '!=': return { $ne: value };
            case '!': return { $not: value };
            default: return { ['$' + expr]: value };
        }
    }
    static isSupported(key) {
        return !!QueryHelper.SUPPORTED_OPERATORS.find(op => key.includes(op));
    }
}
exports.QueryHelper = QueryHelper;
QueryHelper.SUPPORTED_OPERATORS = ['>', '<', '<=', '>=', '!', '!=', ':in', ':nin', ':gt', ':gte', ':lt', ':lte', ':ne', ':not'];
