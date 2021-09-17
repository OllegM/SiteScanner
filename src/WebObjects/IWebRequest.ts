export interface IWebRequest {
    MakePostRequest<SearchType, ResponseType>(requestUrl: string, postData: SearchType, callback: (value: ResponseType) => void): void;
    MakeGetRequest<ResponseType>(requestUrl: string, callback: (value: ResponseType) => void): void;
}
