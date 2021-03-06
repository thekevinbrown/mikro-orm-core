"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryFlag = exports.QueryOrderNumeric = exports.QueryOrder = exports.QueryOperator = exports.GroupOperator = void 0;
var GroupOperator;
(function (GroupOperator) {
    GroupOperator["$and"] = "and";
    GroupOperator["$or"] = "or";
})(GroupOperator = exports.GroupOperator || (exports.GroupOperator = {}));
var QueryOperator;
(function (QueryOperator) {
    QueryOperator["$eq"] = "=";
    QueryOperator["$in"] = "in";
    QueryOperator["$nin"] = "not in";
    QueryOperator["$gt"] = ">";
    QueryOperator["$gte"] = ">=";
    QueryOperator["$lt"] = "<";
    QueryOperator["$lte"] = "<=";
    QueryOperator["$ne"] = "!=";
    QueryOperator["$not"] = "not";
    QueryOperator["$like"] = "like";
    QueryOperator["$re"] = "regexp";
})(QueryOperator = exports.QueryOperator || (exports.QueryOperator = {}));
var QueryOrder;
(function (QueryOrder) {
    QueryOrder["ASC"] = "ASC";
    QueryOrder["ASC_NULLS_LAST"] = "ASC NULLS LAST";
    QueryOrder["ASC_NULLS_FIRST"] = "ASC NULLS FIRST";
    QueryOrder["DESC"] = "DESC";
    QueryOrder["DESC_NULLS_LAST"] = "DESC NULLS LAST";
    QueryOrder["DESC_NULLS_FIRST"] = "DESC NULLS FIRST";
    QueryOrder["asc"] = "asc";
    QueryOrder["asc_nulls_last"] = "asc nulls last";
    QueryOrder["asc_nulls_first"] = "asc nulls first";
    QueryOrder["desc"] = "desc";
    QueryOrder["desc_nulls_last"] = "desc nulls last";
    QueryOrder["desc_nulls_first"] = "desc nulls first";
})(QueryOrder = exports.QueryOrder || (exports.QueryOrder = {}));
var QueryOrderNumeric;
(function (QueryOrderNumeric) {
    QueryOrderNumeric[QueryOrderNumeric["ASC"] = 1] = "ASC";
    QueryOrderNumeric[QueryOrderNumeric["DESC"] = -1] = "DESC";
})(QueryOrderNumeric = exports.QueryOrderNumeric || (exports.QueryOrderNumeric = {}));
var QueryFlag;
(function (QueryFlag) {
    QueryFlag["DISTINCT"] = "DISTINCT";
    QueryFlag["PAGINATE"] = "PAGINATE";
    QueryFlag["UPDATE_SUB_QUERY"] = "UPDATE_SUB_QUERY";
    QueryFlag["DELETE_SUB_QUERY"] = "DELETE_SUB_QUERY";
})(QueryFlag = exports.QueryFlag || (exports.QueryFlag = {}));
