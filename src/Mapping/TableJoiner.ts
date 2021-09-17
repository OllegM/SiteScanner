import { IMappingSchema, IMappingItem } from "./IMapping";
import { MappingParser } from "./MappingParser";

export class TableJoiner {
    public static JoinTables(tables: any[], schema: IMappingSchema): any[] {
        let table = tables.pop();
        tables.forEach(nextTable => {
            table = this.Join(table, nextTable, schema);
        });
        return table;
    }

    public static Join(table1, table2, schema: IMappingSchema): any[] {
        let joinedTable = new Array();
        
        if (table1.length < table2.length) {
            [table2, table1] = [table1, table2];
        }

        table1 = this.MultiplyTable(table1, table2.length);

        table1.forEach(table1Item => {
            table2.forEach(table2Item => {
                for (let property in table2Item) {
                    if (table2Item.hasOwnProperty(property)) {
                        table1Item[property] = table2Item[property];
                    }
                }
                joinedTable.push(this.OrganizeProperties(table1Item, schema));
            });
        });
        return joinedTable;
    }

    public static MultiplyTable(table: any[], times: number): any[] {
        if (times === 1) {
            return table;
        }

        let result: any[] = new Array();
        let j = 0;
        for (let i = 0; i < times; i++) {
            for (let k = 0; k < table.length; k++) {
                result[j] = JSON.parse(JSON.stringify(table[k]));
                j++;
            }
        }
        return result;
    }

    public static OrganizeProperties(item: any, schema: IMappingSchema): any {
        let flatSchema: IMappingItem[] = MappingParser.FlattenSchema(schema);
        return this.GetOrderedItem(item, flatSchema);
    }

    private static GetOrderedItem(item, flatSchema: IMappingItem[]): any {
        let result = {};

        flatSchema.forEach(schemaElement => {
            result[schemaElement.targetField] = item[schemaElement.targetField];
        });

        return result;
    }
}