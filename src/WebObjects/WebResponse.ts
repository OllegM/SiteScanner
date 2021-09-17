import { IWebResponse } from "./IWebResponse";

export class WebResponse implements IWebResponse {
    error: string;
    statusCode: number;
    body: string;
    isValid(): boolean {
        let result = false;
        if (this.statusCode === 200) {
            result = true;
        }
        return result;
    }
}