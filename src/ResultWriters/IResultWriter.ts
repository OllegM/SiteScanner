export interface IResultWriter {
    WriteResult(table: any[], ResultSchema: any): Promise<any>;
}