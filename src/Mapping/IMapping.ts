export interface IMappingSchema {
    mappingSchema: IMappingItem[];
}

export interface IMappingSchemaLevels {
    level: number;
    mappingSchema: IMappingItem[];
}

export interface IMappingItem {
    sourceField: string;
    subTree: IMappingItem[];
    targetField: string;
}