export interface IWebResponse {
    error: string;
    statusCode: number;
    body: string;
    isValid(): boolean;
}