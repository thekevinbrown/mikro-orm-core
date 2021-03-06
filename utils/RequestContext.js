"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContext = void 0;
const domain_1 = __importDefault(require("domain"));
const uuid_1 = require("uuid");
class RequestContext {
    constructor(em) {
        this.em = em;
        this.id = uuid_1.v4();
    }
    /**
     * Creates new RequestContext instance and runs the code inside its domain.
     */
    static create(em, next) {
        const context = new RequestContext(em.fork(true, true));
        const d = domain_1.default.create();
        d.__mikro_orm_context = context;
        d.run(next);
    }
    /**
     * Returns current RequestContext (if available).
     */
    static currentRequestContext() {
        const active = domain_1.default.active;
        return active ? active.__mikro_orm_context : undefined;
    }
    /**
     * Returns current EntityManager (if available).
     */
    static getEntityManager() {
        const context = RequestContext.currentRequestContext();
        return context ? context.em : undefined;
    }
}
exports.RequestContext = RequestContext;
