"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
const module_1 = require("module");
const clone_1 = __importDefault(require("clone"));
const globby_1 = __importDefault(require("globby"));
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const crypto_1 = require("crypto");
// @ts-ignore
const acorn_loose_1 = require("acorn-loose");
// @ts-ignore
const acorn_walk_1 = require("acorn-walk");
const entity_1 = require("../entity");
const enums_1 = require("../enums");
class Utils {
    /**
     * Checks if the argument is not undefined
     */
    static isDefined(data, considerNullUndefined = false) {
        return typeof data !== 'undefined' && !(considerNullUndefined && data === null);
    }
    /**
     * Checks if the argument is instance of `Object`. Returns false for arrays.
     * `not` argument allows to blacklist classes that should be considered as not object.
     */
    static isObject(o, not = []) {
        return !!o && typeof o === 'object' && !Array.isArray(o) && !not.some(cls => o instanceof cls);
    }
    /**
     * Checks if the argument is string
     */
    static isString(s) {
        return typeof s === 'string';
    }
    /**
     * Checks if the argument is number
     */
    static isNumber(s) {
        return typeof s === 'number';
    }
    /**
     * Checks if arguments are deeply (but not strictly) equal.
     */
    static equals(a, b) {
        return fast_deep_equal_1.default(a, b);
    }
    /**
     * Gets array without duplicates.
     */
    static unique(items) {
        return [...new Set(items)];
    }
    /**
     * Merges all sources into the target recursively.
     */
    static merge(target, ...sources) {
        if (!sources.length) {
            return target;
        }
        const source = sources.shift();
        if (Utils.isObject(target) && Utils.isPlainObject(source)) {
            Object.entries(source).forEach(([key, value]) => {
                if (Utils.isPlainObject(value)) {
                    if (!(key in target)) {
                        Object.assign(target, { [key]: {} });
                    }
                    Utils.merge(target[key], value);
                }
                else {
                    Object.assign(target, { [key]: value });
                }
            });
        }
        return Utils.merge(target, ...sources);
    }
    static getRootEntity(metadata, meta) {
        const base = meta.extends && metadata.find(meta.extends);
        if (!base || base === meta) { // make sure we do not fall into infinite loop
            return meta;
        }
        const root = Utils.getRootEntity(metadata, base);
        if (root.discriminatorColumn) {
            return root;
        }
        return meta;
    }
    /**
     * Computes difference between two objects, ignoring items missing in `b`.
     */
    static diff(a, b) {
        const ret = {};
        Object.keys(b).forEach(k => {
            if (Utils.equals(a[k], b[k])) {
                return;
            }
            ret[k] = b[k];
        });
        return ret;
    }
    /**
     * Computes difference between two entities. First calls `prepareEntity` on both, then uses the `diff` method.
     */
    static diffEntities(a, b, metadata, platform) {
        return Utils.diff(Utils.prepareEntity(a, metadata, platform), Utils.prepareEntity(b, metadata, platform));
    }
    /**
     * Removes ORM specific code from entities and prepares it for serializing. Used before change set computation.
     * References will be mapped to primary keys, collections to arrays of primary keys.
     */
    static prepareEntity(entity, metadata, platform) {
        if (entity.__prepared) {
            return entity;
        }
        const meta = metadata.get(entity.constructor.name);
        const root = Utils.getRootEntity(metadata, meta);
        const ret = {};
        if (meta.discriminatorValue) {
            ret[root.discriminatorColumn] = meta.discriminatorValue;
        }
        // copy all props, ignore collections and references, process custom types
        Object.values(meta.properties).forEach(prop => {
            if (Utils.shouldIgnoreProperty(entity, prop, root)) {
                return;
            }
            if (prop.reference === entity_1.ReferenceType.EMBEDDED) {
                return Object.values(meta.properties).filter(p => { var _a; return ((_a = p.embedded) === null || _a === void 0 ? void 0 : _a[0]) === prop.name; }).forEach(childProp => {
                    ret[childProp.name] = entity[prop.name][childProp.embedded[1]];
                });
            }
            if (Utils.isEntity(entity[prop.name], true)) {
                return ret[prop.name] = Utils.getPrimaryKeyValues(entity[prop.name], metadata.get(prop.type).primaryKeys, true);
            }
            if (prop.customType) {
                return ret[prop.name] = prop.customType.convertToDatabaseValue(entity[prop.name], platform);
            }
            if (Array.isArray(entity[prop.name]) || Utils.isObject(entity[prop.name])) {
                return ret[prop.name] = Utils.copy(entity[prop.name]);
            }
            ret[prop.name] = entity[prop.name];
        });
        Object.defineProperty(ret, '__prepared', { value: true });
        return ret;
    }
    static shouldIgnoreProperty(entity, prop, root) {
        if (!(prop.name in entity) || prop.persist === false) {
            return true;
        }
        const collection = entity[prop.name] instanceof entity_1.ArrayCollection;
        const noPkRef = Utils.isEntity(entity[prop.name]) && !entity_1.wrap(entity[prop.name], true).__primaryKeys.every(pk => pk);
        const noPkProp = prop.primary && !Utils.isDefined(entity[prop.name], true);
        const inverse = prop.reference === entity_1.ReferenceType.ONE_TO_ONE && !prop.owner;
        const discriminator = prop.name === root.discriminatorColumn;
        // bidirectional 1:1 and m:1 fields are defined as setters, we need to check for `undefined` explicitly
        const isSetter = [entity_1.ReferenceType.ONE_TO_ONE, entity_1.ReferenceType.MANY_TO_ONE].includes(prop.reference) && (prop.inversedBy || prop.mappedBy);
        const emptyRef = isSetter && entity[prop.name] === undefined;
        return collection || noPkProp || noPkRef || inverse || discriminator || emptyRef;
    }
    /**
     * Creates deep copy of given entity.
     */
    static copy(entity) {
        return clone_1.default(entity);
    }
    /**
     * Normalize the argument to always be an array.
     */
    static asArray(data, strict = false) {
        if (typeof data === 'undefined' && !strict) {
            return [];
        }
        return Array.isArray(data) ? data : [data];
    }
    /**
     * Renames object key, keeps order of properties.
     */
    static renameKey(payload, from, to) {
        if (Utils.isObject(payload) && from in payload && !(to in payload)) {
            Object.keys(payload).forEach(key => {
                const value = payload[key];
                delete payload[key];
                payload[from === key ? to : key] = value;
            }, payload);
        }
    }
    /**
     * Returns array of functions argument names. Uses `acorn` for source code analysis.
     */
    static getParamNames(func, methodName) {
        const ret = [];
        const parsed = acorn_loose_1.parse(func.toString());
        const checkNode = (node, methodName) => {
            if (methodName && !(node.key && node.key.name === methodName)) {
                return;
            }
            const params = node.value ? node.value.params : node.params;
            ret.push(...params.map((p) => {
                switch (p.type) {
                    case 'AssignmentPattern':
                        return p.left.name;
                    case 'RestElement':
                        return '...' + p.argument.name;
                    default:
                        return p.name;
                }
            }));
        };
        acorn_walk_1.simple(parsed, {
            MethodDefinition: (node) => checkNode(node, methodName),
            FunctionDeclaration: (node) => checkNode(node, methodName),
        });
        return ret;
    }
    /**
     * Checks whether the argument looks like primary key (string, number or ObjectId).
     */
    static isPrimaryKey(key, allowComposite = false) {
        if (allowComposite && Array.isArray(key) && key.every(v => Utils.isPrimaryKey(v))) {
            return true;
        }
        return Utils.isString(key) || typeof key === 'number' || Utils.isObjectID(key) || key instanceof Date;
    }
    /**
     * Extracts primary key from `data`. Accepts objects or primary keys directly.
     */
    static extractPK(data, meta, strict = false) {
        if (Utils.isPrimaryKey(data)) {
            return data;
        }
        if (Utils.isEntity(data, true)) {
            return entity_1.wrap(data, true).__primaryKey;
        }
        if (strict && meta && Object.keys(data).length !== meta.primaryKeys.length) {
            return null;
        }
        if (Utils.isObject(data) && meta) {
            if (meta.compositePK) {
                return Utils.getCompositeKeyHash(data, meta);
            }
            return data[meta.primaryKeys[0]] || data[meta.serializedPrimaryKey] || null;
        }
        return null;
    }
    static getCompositeKeyHash(entity, meta) {
        const pks = meta.primaryKeys.map(pk => {
            if (Utils.isEntity(entity[pk], true)) {
                return entity_1.wrap(entity[pk], true).__serializedPrimaryKey;
            }
            return entity[pk];
        });
        return Utils.getPrimaryKeyHash(pks);
    }
    static getPrimaryKeyHash(pks) {
        return pks.join('~~~');
    }
    static splitPrimaryKeys(key) {
        return key.split('~~~');
    }
    static getPrimaryKeyValue(entity, primaryKeys) {
        if (primaryKeys.length > 1) {
            return Utils.getPrimaryKeyCond(entity, primaryKeys);
        }
        if (Utils.isEntity(entity[primaryKeys[0]])) {
            return entity_1.wrap(entity[primaryKeys[0]], true).__primaryKey;
        }
        return entity[primaryKeys[0]];
    }
    static getPrimaryKeyValues(entity, primaryKeys, allowScalar = false) {
        if (allowScalar && primaryKeys.length === 1) {
            if (Utils.isEntity(entity[primaryKeys[0]])) {
                return entity_1.wrap(entity[primaryKeys[0]], true).__primaryKey;
            }
            return entity[primaryKeys[0]];
        }
        return primaryKeys.map(pk => {
            if (Utils.isEntity(entity[pk])) {
                return entity_1.wrap(entity[pk], true).__primaryKey;
            }
            return entity[pk];
        });
    }
    static getPrimaryKeyCond(entity, primaryKeys) {
        const cond = primaryKeys.reduce((o, pk) => {
            o[pk] = Utils.extractPK(entity[pk]);
            return o;
        }, {});
        if (Object.values(cond).some(v => v === null)) {
            return null;
        }
        return cond;
    }
    static getPrimaryKeyCondFromArray(pks, primaryKeys) {
        return primaryKeys.reduce((o, pk, idx) => {
            o[pk] = Utils.extractPK(pks[idx]);
            return o;
        }, {});
    }
    static getOrderedPrimaryKeys(id, meta) {
        const data = (Utils.isPrimaryKey(id) ? { [meta.primaryKeys[0]]: id } : id);
        return meta.primaryKeys.map(pk => data[pk]);
    }
    /**
     * Checks whether given object is an entity instance.
     */
    static isEntity(data, allowReference = false) {
        if (!Utils.isObject(data)) {
            return false;
        }
        if (allowReference && !!data.__reference) {
            return true;
        }
        return !!data.__entity;
    }
    /**
     * Checks whether the argument is ObjectId instance
     */
    static isObjectID(key) {
        return Utils.isObject(key) && key.constructor.name.toLowerCase() === 'objectid';
    }
    /**
     * Checks whether the argument is empty (array without items, object without keys or falsy value).
     */
    static isEmpty(data) {
        if (Array.isArray(data)) {
            return data.length === 0;
        }
        if (Utils.isObject(data)) {
            return Object.keys(data).length === 0;
        }
        return !data;
    }
    /**
     * Gets string name of given class.
     */
    static className(classOrName) {
        if (Utils.isString(classOrName)) {
            return classOrName;
        }
        return classOrName.name;
    }
    /**
     * Tries to detect `ts-node` runtime.
     */
    static detectTsNode() {
        return process.argv[0].endsWith('ts-node') // running via ts-node directly
            || process.argv.slice(1).some(arg => arg.includes('ts-node')) // registering ts-node runner
            || (require.extensions && !!require.extensions['.ts']) // check if the extension is registered
            || !!new Error().stack.split('\n').find(line => line.match(/\w\.ts:\d/)); // as a last resort, try to find a TS file in the stack trace
    }
    /**
     * Uses some dark magic to get source path to caller where decorator is used.
     * Analyses stack trace of error created inside the function call.
     */
    static lookupPathFromDecorator(stack) {
        // use some dark magic to get source path to caller
        stack = stack || new Error().stack.split('\n');
        let line = stack.findIndex(line => line.includes('__decorate'));
        if (line === -1) {
            throw new Error('Cannot find path to entity');
        }
        if (Utils.normalizePath(stack[line]).includes('node_modules/tslib/tslib')) {
            line++;
        }
        const re = stack[line].match(/\(.+\)/i) ? /\((.*):\d+:\d+\)/ : /at\s*(.*):\d+:\d+$/;
        return Utils.normalizePath(stack[line].match(re)[1]);
    }
    /**
     * Gets the type of the argument.
     */
    static getObjectType(value) {
        const objectType = Object.prototype.toString.call(value);
        return objectType.match(/\[object (\w+)]/)[1].toLowerCase();
    }
    /**
     * Checks whether the value is POJO (e.g. `{ foo: 'bar' }`, and not instance of `Foo`)
     */
    static isPlainObject(value) {
        if (!Utils.isObject(value)) {
            return false;
        }
        if (typeof value.constructor !== 'function') {
            return false;
        }
        // eslint-disable-next-line no-prototype-builtins
        if (!value.constructor.prototype.hasOwnProperty('isPrototypeOf')) {
            return false;
        }
        // most likely plain object
        return true;
    }
    /**
     * Executes the `cb` promise serially on every element of the `items` array and returns array of resolved values.
     */
    static async runSerial(items, cb) {
        const ret = [];
        for (const item of items) {
            ret.push(await cb(item));
        }
        return ret;
    }
    static isCollection(item, prop, type) {
        if (!(item instanceof entity_1.Collection)) {
            return false;
        }
        return !(prop && type) || prop.reference === type;
    }
    static normalizePath(...parts) {
        let path = parts.join('/').replace(/\\/g, '/').replace(/\/$/, '');
        path = path_1.normalize(path).replace(/\\/g, '/');
        return (path.match(/^[/.]|[a-zA-Z]:/) || path.startsWith('!')) ? path : './' + path;
    }
    static relativePath(path, relativeTo) {
        if (!path) {
            return path;
        }
        path = Utils.normalizePath(path);
        if (path.startsWith('.')) {
            return path;
        }
        path = path_1.relative(relativeTo, path);
        return Utils.normalizePath(path);
    }
    static absolutePath(path, baseDir = process.cwd()) {
        if (!path) {
            return Utils.normalizePath(baseDir);
        }
        if (!path_1.isAbsolute(path)) {
            path = baseDir + '/' + path;
        }
        return Utils.normalizePath(path);
    }
    static hash(data) {
        return crypto_1.createHash('md5').update(data).digest('hex');
    }
    static runIfNotEmpty(clause, data) {
        if (!Utils.isEmpty(data)) {
            clause();
        }
    }
    static defaultValue(prop, option, defaultValue) {
        prop[option] = option in prop ? prop[option] : defaultValue;
    }
    static findDuplicates(items) {
        return items.reduce((acc, v, i, arr) => {
            return arr.indexOf(v) !== i && acc.indexOf(v) === -1 ? acc.concat(v) : acc;
        }, []);
    }
    static randomInt(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    }
    static async pathExists(path, options = {}) {
        if (globby_1.default.hasMagic(path)) {
            const found = await globby_1.default(path, options);
            return found.length > 0;
        }
        return fs_extra_1.pathExists(path);
    }
    /**
     * Extracts all possible values of a TS enum. Works with both string and numeric enums.
     */
    static extractEnumValues(target) {
        const keys = Object.keys(target);
        const values = Object.values(target);
        const numeric = !!values.find(v => typeof v === 'number');
        if (numeric) {
            return values.filter(val => !keys.includes(val));
        }
        return values;
    }
    static flatten(arrays) {
        return [].concat.apply([], arrays);
    }
    static isOperator(key, includeGroupOperators = true) {
        if (!includeGroupOperators) {
            return !!enums_1.QueryOperator[key];
        }
        return !!enums_1.GroupOperator[key] || !!enums_1.QueryOperator[key];
    }
    static getGlobalStorage(namespace) {
        const key = `mikro-orm-${namespace}`;
        global[key] = global[key] || {};
        return global[key];
    }
    /**
     * Require a module from a specific location
     * @param id The module to require
     * @param from Location to start the node resolution
     */
    static requireFrom(id, from) {
        if (!path_1.extname(from)) {
            from = path_1.join(from, '__fake.js');
        }
        /* istanbul ignore next */
        return (module_1.createRequire || module_1.createRequireFromPath)(path_1.resolve(from))(id);
    }
}
exports.Utils = Utils;
