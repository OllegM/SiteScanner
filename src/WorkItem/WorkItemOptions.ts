import * as constants from "../constants";

export class WorkItemOptions {
    startRowIndex: number = 0;
    totalItems: number = 0;
    processedItems: number = 0;
    priority: constants.WorkItemPriority = constants.WorkItemPriority.MEDIUM;
}