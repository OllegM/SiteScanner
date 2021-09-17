import { SearchWorkItem, SearchPublicationsWorkItem, PublicationWorkItem } from "../src/WorkItem/WorkItems";
import { IWebResponse } from "../src/WebObjects/IWebResponse";
import { Parser } from "../src/Parsers/Parsers";
import { CompanySearchResponse, SFacInfoResponse, PublicationsSearchResponse } from "../src/models/searchModels";
import * as constants from "../src/constants";

let searchWorkItem: SearchWorkItem = null;
let searchPubWorkItem: SearchPublicationsWorkItem = null;
let pubWorkItem: PublicationWorkItem = null;

let searchWorkLoad: IWebResponse = null;
let searchPubWorkLoad: IWebResponse = null;
let pubWorkLoad: IWebResponse = null;

let searchJsonData = '';
let searchPubJsonData = '';
let pubJsonData = '';

beforeAll(() => {
    searchWorkLoad = {
        body: searchJsonData,
        error: "",
        statusCode: 200,
        isValid: () => { return true; }
    };

    searchPubWorkLoad = {
        body: searchPubJsonData,
        error: "",
        statusCode: 200,
        isValid: () => { return true; }
    };

    pubWorkLoad = {
        body: pubJsonData,
        error: "",
        statusCode: 200,
        isValid: () => { return true; }
    };

    searchWorkItem = new SearchWorkItem();
    searchWorkItem.thisTask = jest.fn().mockReturnValue(Promise.resolve(searchWorkLoad));

    searchPubWorkItem = new SearchPublicationsWorkItem();
    searchPubWorkItem.thisTask = jest.fn().mockReturnValue(Promise.resolve(searchPubWorkLoad));

    pubWorkItem = new PublicationWorkItem();
    pubWorkItem.thisTask = jest.fn().mockReturnValue(Promise.resolve(pubWorkLoad));
});

// COMPANY
it("GetCompanyWorkItems return correct array of items", () => {
    let result = searchWorkItem.GetCompanyWorkItems(JSON.parse(searchJsonData));
    expect(result).toHaveLength(1);
});

it("SearchWorkItem returns GUID and SearchTask with paging", () => {
    expect.assertions(4);
    return searchWorkItem.nextTask(searchWorkLoad).then(result => {
        expect(result).toHaveLength(2);
        expect(result[0].workload).toBe("");
        expect(result[1].options.startRowIndex).toBe(1);
        expect(result[1].options.totalItems).toBe(2);
    });
});

// MANY PUBLICATIONS
it("GetPublicationWorkItems return correct array of items", () => {
    let result = searchPubWorkItem.GetPublicationWorkItems(JSON.parse(searchPubJsonData));
    expect(result).toHaveLength(1);
});

it.only("Search Publications WorkItem returns GUID and SearchTask with paging", () => {
    expect.assertions(4);   
    return searchPubWorkItem.nextTask(searchPubWorkLoad).then(result => {
        expect(result).toHaveLength(2);
        expect(result[0].workload).toBe("");
        expect(result[1].options.startRowIndex).toBe(1);
        expect(result[1].options.totalItems).toBe(2);
    });
});

it("PubInfoWorkItem has correct parameters", () => {
    return pubWorkItem.nextTask(pubWorkLoad).then(result => {
        expect(result).toHaveLength(1);

        let workload = result[0].workload;
        let pub = workload.data as SFacInfoResponse;       
        expect(workload).toHaveProperty("url");
        expect(pub).toHaveProperty("message");
        expect(pub.message).toHaveProperty("content");
        expect(pub.message.content.auditors).toHaveLength(1);
        expect(pub.message.content.auditeeName).toBe("");
    });
});

it("Parser returns a valid search result object", () => {
    let object = Parser.Parse<PublicationsSearchResponse>(searchPubJsonData);
    expect(object.pageData).toBeDefined();
    expect(object.found).toBe(2);
});
