import { IMapper } from "./IMapper";
import { IMappingSchema, IMappingItem, IMappingSchemaLevels } from "./IMapping";
import * as constants from "../constants";
import { MappingParser } from "./MappingParser";
import { TableJoiner } from "./TableJoiner";

export class Mapper<IN, OUT> implements IMapper {
    public DoMapping(inputObject: IN, schema: IMappingSchema): OUT[] {
        let tables: any[] = new Array();
        let schemaLevels = MappingParser.BuildMappingLevels(schema);
        constants.logger.debug("Mapping object: " + JSON.stringify(inputObject));
        schemaLevels.forEach(schemaLevel => {
            let processor = new MappingProcessor(inputObject, schemaLevel);
            if (processor.Go()) {
                tables.push(processor.GetResult());
            }
        });
        let result = TableJoiner.JoinTables(tables, schema);
        constants.logger.debug("Result: " + JSON.stringify(result));
        return result;
    }
}

export class MappingProcessor<T> {
    result: any[] = new Array();
    object: any;
    schema: IMappingSchemaLevels;
    parsingSchema: IMappingItem[];

    constructor(inputObject, schema: IMappingSchemaLevels) {
        this.object = inputObject;
        this.schema = schema;
    }

    public GetResult() {
        return this.result;
    }

    public Go(): boolean {
        let mappingResult = true;

        if (this.schema.level > 0) {
            let pathToTreeRoot = this.schema.mappingSchema[0].sourceField;
            this.object = this.GetFieldValueRecurse(this.object, pathToTreeRoot);
            this.parsingSchema = this.schema.mappingSchema[0].subTree;
        } else {
            this.parsingSchema = this.schema.mappingSchema;
        }

        this.parsingSchema.forEach(schemaItem => {
            this.AddValue(schemaItem.sourceField, schemaItem.targetField);
        });

        return mappingResult;
    }

    public AddValue(sourceField: string, targetField: string) {
        let values = this.GetFieldValue(this.object, sourceField);
        let i = 0;
        values.forEach(value => {
            if (this.result[i] === undefined) {
                this.result[i] = {};
            }
            this.result[i][targetField] = value;
            i++;
        });
    }

    public GetFieldValue(objects: any, path: string): any[] {
        let result = new Array();
        if (Array.isArray(objects) === false) {
            objects = [objects];
        }
        objects.forEach(object => {
            result = result.concat(this.GetFieldValueRecurse(object, path));
        });
        return result;
    }

    public GetFieldValueRecurse(object, path: string): any[] {
        let result = new Array();

        let re = /^([^.]*)\.(.*)$/;
        let fields = re.exec(path);
        let currentField = (fields && fields.length > 0) ? fields[1] : path;
        let nextFields = (fields && fields.length > 1) ? fields[2] : null;

        result = this.GetPropertyValue(object, currentField);
        if (nextFields !== null) {
            if (result.length > 1) {
                constants.logger.error("CurrentField must point to a single item, not array. Mapping if wrong for " + path);
            }
            result = this.GetFieldValueRecurse(result[0], nextFields);
        }
        return result;
    }

    public GetPropertyValue(object, property: string): any[] {
        let result = new Array();
        if (this.notEmpty(object, property)) {
            if (this.isArray(object[property])) {
                result = result.concat(object[property]);
            } else {
                result.push(object[property]);
            }
        }
        return result;
    }

    public notNull(object: any): boolean {
        return object !== null && object !== undefined;
    }

    public isArray(object: any): boolean {
        return Array.isArray(object);
    }

    public notEmpty(object: any, property: string): boolean {
        let result = false;
        if (this.notNull(object) && object.hasOwnProperty(property)) {
            result = true;
        }
        return result;
    }
}