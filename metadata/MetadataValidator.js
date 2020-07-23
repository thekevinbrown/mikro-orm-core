"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataValidator = void 0;
const utils_1 = require("../utils");
const entity_1 = require("../entity");
class MetadataValidator {
    static validateSingleDecorator(meta, propertyName) {
        var _a;
        if ((_a = meta.properties[propertyName]) === null || _a === void 0 ? void 0 : _a.reference) {
            throw utils_1.MetadataError.multipleDecorators(meta.className, propertyName);
        }
    }
    validateEntityDefinition(metadata, name) {
        const meta = metadata.get(name);
        // entities have PK
        if (!meta.embeddable && (!meta.primaryKeys || meta.primaryKeys.length === 0)) {
            throw utils_1.MetadataError.fromMissingPrimaryKey(meta);
        }
        this.validateVersionField(meta);
        const references = Object.values(meta.properties).filter(prop => prop.reference !== entity_1.ReferenceType.SCALAR);
        for (const prop of references) {
            this.validateReference(meta, prop, metadata);
            this.validateBidirectional(meta, prop, metadata);
        }
    }
    validateDiscovered(discovered, warnWhenNoEntities) {
        if (discovered.length === 0 && warnWhenNoEntities) {
            throw utils_1.MetadataError.noEntityDiscovered();
        }
        const duplicates = utils_1.Utils.findDuplicates(discovered.map(meta => meta.className));
        if (duplicates.length > 0) {
            throw utils_1.MetadataError.duplicateEntityDiscovered(duplicates);
        }
        // validate base entities
        discovered
            .filter(meta => meta.extends && !discovered.find(m => m.className === meta.extends))
            .forEach(meta => { throw utils_1.MetadataError.fromUnknownBaseEntity(meta); });
        // validate we found at least one entity (not just abstract/base entities)
        if (discovered.filter(meta => meta.name).length === 0 && warnWhenNoEntities) {
            throw utils_1.MetadataError.onlyAbstractEntitiesDiscovered();
        }
        // check for not discovered entities
        discovered.forEach(meta => Object.values(meta.properties).forEach(prop => {
            if (prop.reference !== entity_1.ReferenceType.SCALAR && !discovered.find(m => m.className === prop.type)) {
                throw utils_1.MetadataError.fromUnknownEntity(prop.type, `${meta.className}.${prop.name}`);
            }
        }));
    }
    validateReference(meta, prop, metadata) {
        // references do have types
        if (!prop.type) {
            throw utils_1.MetadataError.fromWrongTypeDefinition(meta, prop);
        }
        // references do have type of known entity
        if (!metadata.find(prop.type)) {
            throw utils_1.MetadataError.fromWrongTypeDefinition(meta, prop);
        }
    }
    validateBidirectional(meta, prop, metadata) {
        if (prop.inversedBy) {
            const inverse = metadata.get(prop.type).properties[prop.inversedBy];
            this.validateOwningSide(meta, prop, inverse);
        }
        else if (prop.mappedBy) {
            const inverse = metadata.get(prop.type).properties[prop.mappedBy];
            this.validateInverseSide(meta, prop, inverse);
        }
    }
    validateOwningSide(meta, prop, inverse) {
        // has correct `inversedBy` on owning side
        if (!inverse) {
            throw utils_1.MetadataError.fromWrongReference(meta, prop, 'inversedBy');
        }
        // has correct `inversedBy` reference type
        if (inverse.type !== meta.className) {
            throw utils_1.MetadataError.fromWrongReference(meta, prop, 'inversedBy', inverse);
        }
        // inversed side is not defined as owner
        if (inverse.inversedBy) {
            throw utils_1.MetadataError.fromWrongOwnership(meta, prop, 'inversedBy');
        }
    }
    validateInverseSide(meta, prop, owner) {
        // has correct `mappedBy` on inverse side
        if (prop.mappedBy && !owner) {
            throw utils_1.MetadataError.fromWrongReference(meta, prop, 'mappedBy');
        }
        // has correct `mappedBy` reference type
        if (owner.type !== meta.className) {
            throw utils_1.MetadataError.fromWrongReference(meta, prop, 'mappedBy', owner);
        }
        // owning side is not defined as inverse
        if (owner.mappedBy) {
            throw utils_1.MetadataError.fromWrongOwnership(meta, prop, 'mappedBy');
        }
    }
    validateVersionField(meta) {
        if (!meta.versionProperty) {
            return;
        }
        const props = Object.values(meta.properties).filter(p => p.version);
        if (props.length > 1) {
            throw utils_1.MetadataError.multipleVersionFields(meta, props.map(p => p.name));
        }
        const prop = meta.properties[meta.versionProperty];
        const type = prop.type.toLowerCase();
        if (type !== 'number' && type !== 'date' && !type.startsWith('timestamp') && !type.startsWith('datetime')) {
            throw utils_1.MetadataError.invalidVersionFieldType(meta);
        }
    }
}
exports.MetadataValidator = MetadataValidator;
