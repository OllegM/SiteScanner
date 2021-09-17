import { CompanySearchRequest, PublicationsSearchRequest } from "../models/searchModels";

export class SearchFactory {

    static GetSearchRequest(searchString: string): CompanySearchRequest {
        let searchRequest: CompanySearchRequest = null;
        let innRegEx = /^(\d{10}|\d{12}|\d{13})$/; // ИНН или ОГРН
        searchString = searchString.trim();
        if (innRegEx.test(searchString)) {
            searchRequest = this.GetSearchRequestByINN(searchString);
        } else {
            searchRequest = this.GetSearchRequestByName(searchString);            
        }

        return searchRequest;
    }

    static GetSearchRequestByName(searchString: string): CompanySearchRequest {
        let searchRequest = new CompanySearchRequest();
        searchRequest.entitySearchFilter.name = searchString;
        delete searchRequest.entitySearchFilter.code;
        return searchRequest;
    }

    static GetSearchRequestByINN(searchString: string): CompanySearchRequest {
        let searchRequest = new CompanySearchRequest();
        searchRequest.entitySearchFilter.code = searchString;
        delete searchRequest.entitySearchFilter.name;
        return searchRequest;
    }

    static GetPublicationsSearchRequest(companyGuid: string, publicationType: string, publicationGroupId: number) {
        let request = new PublicationsSearchRequest();
        request.guid = companyGuid;
        request.searchSfactsMessage = true;
        request.sfactsMessageTypeGroupId = publicationGroupId;
        request.sfactMessageType = publicationType;
        return request;
    }
}