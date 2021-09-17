import { IMappingSchema, IMappingItem, IMappingSchemaLevels } from "./IMapping";

export class MappingParser {
    public static BuildMappingLevels(mapping: IMappingSchema): IMappingSchemaLevels[] {
        let result: IMappingSchemaLevels[] = new Array();
        let rootSchema: IMappingItem[] = new Array();
        mapping.mappingSchema.forEach(element => {
            if (element.subTree !== null) {
                result.push({level: 1, mappingSchema: [element]});
            } else {
                rootSchema.push(element);
            }
        });
        result.push({level: 0, mappingSchema: rootSchema});
        return result;
    }

    public static FlattenSchema(schema: IMappingSchema): IMappingItem[] {
        let result = new Array();

        schema.mappingSchema.forEach(element => {
            if (element.subTree !== null) {
                result = result.concat(element.subTree);
            } else {
                result.push(element);
            }
        });

        return result;
    }
}
