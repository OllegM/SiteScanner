import * as constants from "../constants";
import * as moment from "moment";

export class Formatter {
    static FormatStrings(data: any[]): any[] {
        let formattedData = new Array();
        let outputDateFormat = constants.outputDateFormat;
        let reDateField = /Date$/;
        let reCompanyNameField = /FullName$/;
        formattedData = data.map(row => {
            for (let property in row) {
                if (row.hasOwnProperty(property)) {
                    if (reDateField.test(property)) {
                        row[property] = moment(row[property]).format(outputDateFormat);
                    } else if (reCompanyNameField.test(property)) {
                        row[property] = this.SwapText(row[property]);
                    }
                }
            }
            return row;
        });
        return formattedData;
    }

    static SwapText(text: string): string {
        let re = /^([^"'`]*?)\s+"+([^"'`].*?)"+(.*)/;
        let reResult = re.exec(text);
        if (reResult && reResult.length > 1) {
            return reResult[2].trim() + " " + (reResult[3] ? reResult[3].trim() + " " : "") + reResult[1].trim();
        } else {
            return text;
        }
    }
}