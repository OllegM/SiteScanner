import * as Request from 'request';
import { IWebRequest } from "./IWebRequest";
import { IWebResponse } from "./IWebResponse";
import * as constants from "../constants";
import { WebResponse } from "./WebResponse";

export class RequestOptions {
    static BaseOptions(url: string, contentType: string): any {
        let options = {
            "url": "",
            "method": "",
            "body": null,
            "headers": {
                "Content-Type": constants.contentTypeJSON,
                "Accept": "application/json",
                "Referer": constants.webUrl + "/",
                "Accept-Language": "ru-RU",
                "Accept-Encoding": "gzip, deflate",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
                "Host": constants.host,
                "Pragma": "no-cache"
            }
        };
        if (contentType !== null) {
            options.headers["Content-Type"] = contentType;
        }
        options.url = url;

        return options;
    }

    static Get(url: string, contentType: string) {
        let options = this.BaseOptions(url, contentType);
        options.method = constants.Methods[constants.Methods.GET];
        return options;
    }

    static Post(url: string, contentType: string) {
        let options = this.BaseOptions(url, contentType);
        options.method = constants.Methods[constants.Methods.POST];
        return options;
    }
}

export class WebRequest implements IWebRequest {
    public MakeGetRequest(requestUrl: string, callback: (value: IWebResponse) => void): void {
        let options = RequestOptions.Get(requestUrl, null);
        Request.get(options, function (error, response, body) {
            let returnValue: IWebResponse = new WebResponse();
            returnValue.error = error;
            returnValue.statusCode = response && response.statusCode;
            returnValue.body = body;
            callback(returnValue);
        });
    }

    public MakePostRequest<SearchRequest>(requestUrl: string, postData: SearchRequest, callbackFunction: (returnValue: IWebResponse) => void): void {

        let options = RequestOptions.Post(requestUrl, constants.contentTypeJSON);
        options.body = JSON.stringify(postData);

        constants.logger.debug(JSON.stringify(options.body));

        Request.post(options, function (error, response, body) {
            let returnValue: IWebResponse = new WebResponse();
            returnValue.error = error;
            returnValue.statusCode = response && response.statusCode;
            returnValue.body = body;
            callbackFunction(returnValue);
        });
    }
}
