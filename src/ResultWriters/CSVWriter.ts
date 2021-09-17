import * as stringify from "csv-stringify";
import { IResultWriter } from "./IResultWriter";
import * as fs from "fs";
import * as constants from "../constants";
import { Formatter } from "./DataFormatter";

export class CSVWriter implements IResultWriter {
    options: stringify.StringifyOpts = {
        header: false,
        delimiter: ";",
        columns: {
            auditeeFullName: "Auditee Full Name",
            auditeeINN: "Auditee INN",
            auditeeOGRN: "Auditee OGRN",

            auditorFullName: "Auditor Full Name",
            auditorINN: "Auditor INN",
            auditorOGRN: "Auditor OGRN",

            financialStateBeginDate: "State Begin Date",
            financialStateEndDate: "State End Date",
            financialStateDocuments: "State Documents",
            auditResultsDate: "Audit Result Date",
            auditorsStatement: "Audit Result Statement",

            publicationUrl: "URL"
        },
        formatters: {
            date: function (value) {
                return value;
            }
        }
    };
    InitResultFile() {
        this.options.header = true;
        stringify([], this.options, function (err, output) {
            fs.writeFile(constants.resultFileName, output, 'utf8', function (fsErr) {
                if (fsErr) {
                    constants.logger.error("File init error: " + fsErr);
                }
            });
        });
    }

    WriteResult(table: any[], ResultSchema: any): Promise<any> {
        table = Formatter.FormatStrings(table);
        return new Promise((resolve, reject) => {
            stringify(table, this.options, function (err, output) {
                fs.appendFile(constants.resultFileName, output, 'utf8', function (fsErr) {
                    if (fsErr) {
                        reject("File save error: " + fsErr);
                    }
                    resolve("The data saved!");
                });
            });
        });
    }
}