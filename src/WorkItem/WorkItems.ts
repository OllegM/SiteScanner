import * as constants from "../constants";
import { IWorkItem } from "./IWorkItem";
import { SearchFactory } from "../SearchFactory/SearchFactory";
import { WebRequest } from "../WebObjects/WebRequest";
import { IWebRequest } from "../WebObjects/IWebRequest";
import { IWebResponse } from "../WebObjects/IWebResponse";
import { CompanySearchRequest, CompanySearchResponse, CompanyInfoResponse, PublicationsSearchRequest, PublicationsSearchResponse, SFacInfoResponse } from "../models/searchModels";
import { Parser } from "../Parsers/Parsers";
import { WorkItem } from "./WorkItem";
import { IMapper } from "../Mapping/IMapper";
import { IMappingSchema } from "../Mapping/IMapping";
import { Mapper } from "../Mapping/Mapper";
import { PublicationResultModel } from "../models/resultModels";
import { SFacMessageMapping } from "../Mapping/SFacMessageMapping";
import { CSVWriter } from "../ResultWriters/CSVWriter";
import { IResultWriter } from "../ResultWriters/IResultWriter";

export abstract class QueueWorkItem extends WorkItem {
    BuildNextRequest(totalCount, processedCount, workItemBuilder): void {
        this.options.processedItems = processedCount;

        if (totalCount > 0) {
            this.options.totalItems = totalCount;
        }

        let nextRowIndexPosition = this.options.startRowIndex + this.options.processedItems;

        // а надо еще искать?
        if (this.options.processedItems < this.options.totalItems) {
            // да, надо!
            let nextWorkItem: IWorkItem = workItemBuilder();
            // передать позицию Pagination и поисковую строку(workload)
            nextWorkItem.options.startRowIndex = nextRowIndexPosition;
            nextWorkItem.options.totalItems = this.options.totalItems;
            nextWorkItem.workload = this.workload;

            constants.logger.info("Next paging position: " + nextRowIndexPosition + " out of total: " + this.options.totalItems);

            this.outTasks.push(nextWorkItem);
        }
    }
}

export class SearchWorkItem extends QueueWorkItem {
    // request
    thisTask(workload: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let searchData: CompanySearchRequest = SearchFactory.GetSearchRequest(workload);
            searchData.entitySearchFilter.startRowIndex = this.options.startRowIndex;
            let requestUrl = constants.webUrl + constants.companySearchUrl;
            let webRequest: IWebRequest = new WebRequest();
            constants.logger.info("WebRequest with search string '" + workload + "' to: " + requestUrl);
            webRequest.MakePostRequest<CompanySearchRequest, IWebResponse>(requestUrl, searchData, resolve);
        });
    }

    // process result
    nextTask(workload: IWebResponse): Promise<IWorkItem[]> {
        if (workload.isValid()) {
            let data = Parser.Parse<CompanySearchResponse>(workload.body);
            let companyWorkItems = this.GetCompanyWorkItems(data);
            this.outTasks = this.outTasks.concat(companyWorkItems);
            this.BuildNextRequest(data.found, data.pageData.length, (): IWorkItem => { 
                let workItem = new SearchWorkItem(); 
                workItem.options.priority = constants.WorkItemPriority.LOW;
                return workItem;
            });
        }
        return Promise.resolve(this.outTasks);
    }

    GetCompanyWorkItems(data: CompanySearchResponse): IWorkItem[] {
        let result: IWorkItem[] = new Array();
        data.pageData.map(item => {
            if (this.IsItemUnique(item.guid)) {
                let newWorkItem = new CompanyWorkItem();
                newWorkItem.workload = item.guid;
                result.push(newWorkItem);
            }
        });
        return result;
    }

    IsItemUnique(guid: string) {
        return true;
    }
}

export class CompanyWorkItem extends WorkItem {
    thisTask(workload: string) {
        return new Promise((resolve, reject) => {
            // собрать запрос на получение информации о компании WebGetRequest
            constants.logger.debug(workload);
            let requestUrl = constants.webUrl + constants.companyInfoUrl + this.workload;
            constants.logger.info("WebRequest to: " + requestUrl);
            let webRequest: IWebRequest = new WebRequest();
            webRequest.MakeGetRequest<IWebResponse>(requestUrl, resolve);
        });
    };
    nextTask(workload: IWebResponse) {
        let data = Parser.Parse<CompanyInfoResponse>(workload.body);
        // проверить тэг с нужными документами и из него сформировать новые задачи на выгрузку документов
        if (data.publicationsStatistic !== null && data.publicationsStatistic.sfactMessageTypeStatistic !== null && data.publicationsStatistic.sfactMessageTypeStatistic.length > 0) {
            let docs = data.publicationsStatistic.sfactMessageTypeStatistic;
            // разрбрать документы. найти группу "StatutoryAuditResults"          
            docs.forEach(group => {
                if (group.group !== null && group.group.id !== null && group.group.id === constants.publications.GroupId) {
                    group.messageTypes.forEach(item => {
                        if (item.type !== null && item.type === constants.publications.MessageType) {
                            constants.logger.info("Found " + constants.publications.MessageType + ". Count: " + item.count);
                            let workItem = new SearchPublicationsWorkItem();
                            workItem.workload = { guid: data.guid, type: item.type, group: group.group.id };
                            workItem.options.priority = constants.WorkItemPriority.HIGH;
                            this.outTasks.push(workItem);
                        }
                    });
                }
            });

        }
        return Promise.resolve(this.outTasks);
    };
}

export class SearchPublicationsWorkItem extends QueueWorkItem {
    // request
    thisTask(workload: any): Promise<any> {
        constants.logger.info("SearchPublicationsWorkItem thisTask workload: " + JSON.stringify(workload));
        return new Promise((resolve, reject) => {
            let searchData: PublicationsSearchRequest = SearchFactory.GetPublicationsSearchRequest(workload.guid, workload.type, workload.group);
            searchData.startRowIndex = this.options.startRowIndex;
            let requestUrl = constants.webUrl + constants.publicationsSearchUrl;
            let webRequest: IWebRequest = new WebRequest(); // DI Required!
            constants.logger.info("WebRequest with search type '" + workload.type + "' to: " + requestUrl);
            webRequest.MakePostRequest<PublicationsSearchRequest, IWebResponse>(requestUrl, searchData, resolve);
        });
    }

    // process result
    nextTask(workload: IWebResponse): Promise<IWorkItem[]> {
        constants.logger.info("SearchPublicationsWorkItem nextTask workload: " + JSON.stringify(workload));
        if (workload.isValid()) {
            let data = Parser.Parse<PublicationsSearchResponse>(workload.body); // DI Required!
            let companyWorkItems = this.GetPublicationWorkItems(data);
            this.outTasks = this.outTasks.concat(companyWorkItems);
            this.BuildNextRequest(data.found, data.pageData.length, function(): IWorkItem { 
                let workItem = new SearchPublicationsWorkItem(); // DI Required!
                workItem.workload = { guid: this.workload.guid, type: this.workload.type, group: this.workload.group };
                workItem.options.priority = constants.WorkItemPriority.HIGH;
                return workItem;
            });
        }
        constants.logger.debug("Returning items: " + this.outTasks.length);
        return Promise.resolve(this.outTasks);
    }

    GetPublicationWorkItems(data: PublicationsSearchResponse): IWorkItem[] {
        let result: IWorkItem[] = new Array();
        data.pageData.map(item => {
            let newWorkItem = new PublicationWorkItem(); // DI Required!
            newWorkItem.workload = item.guid;
            newWorkItem.options.priority = constants.WorkItemPriority.HIGH;
            result.push(newWorkItem);
        });
        return result;
    }
}

export class PublicationWorkItem extends WorkItem {
    private requestUrl: string = "";
    thisTask(workload: string) {
        return new Promise((resolve, reject) => {
            constants.logger.debug(workload);
            this.requestUrl = constants.webUrl + constants.sfactInfoUrl + this.workload;
            constants.logger.info("WebRequest to: " + this.requestUrl);
            let webRequest: IWebRequest = new WebRequest(); // DI Required!
            webRequest.MakeGetRequest<IWebResponse>(this.requestUrl, resolve);
        });
    };
    nextTask(workload: IWebResponse) {
        let data = Parser.Parse<SFacInfoResponse>(workload.body);
        let workItem = new PublicationParsingWorkItem(); // DI Required!
        workItem.workload = { data: data, url: this.requestUrl.replace("api", "#") }; // "Found Auditee: " + data.message.content.auditee.fullName + " Auditor: " + data.message.content.auditors[0].auditCompany.fullName;
        workItem.options.priority = constants.WorkItemPriority.HIGH;
        this.outTasks.push(workItem);
        return Promise.resolve(this.outTasks);
    };
}

export class PublicationParsingWorkItem extends WorkItem {
    thisTask(workload: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let mapper: IMapper = new Mapper(); // DI Required!
            let schema: IMappingSchema = new SFacMessageMapping();
            let result = mapper.DoMapping<SFacInfoResponse, PublicationResultModel>(workload, schema);
            resolve(result);
        });
    }
    nextTask(workload: any): Promise<IWorkItem[]> {
        let writer: IResultWriter = new CSVWriter(); // DI Required!
        writer.WriteResult(workload, null).
            then(result => {
                constants.logger.info("Data saved: " + result);
            }).
            catch(reason => constants.logger.error("WriteResult error: " + reason));
        return Promise.resolve(this.outTasks);
    }
}

export class MessageWorkItem extends WorkItem {
    thisTask(workload: string) {
        return new Promise((resolve, reject) => {
            constants.logger.info(workload);
            resolve();
        });
    };
    nextTask(workload: string) {
        return Promise.resolve(this.outTasks);
    };
}

export class NullWorkItem extends WorkItem {
    thisTask(workload: string) {
        return Promise.resolve();
    };
    nextTask(workload: string) {
        return Promise.resolve(this.outTasks);
    };
}
