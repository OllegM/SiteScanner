import { IWorkItem } from "./IWorkItem";
import { WorkItemOptions } from "./WorkItemOptions";
import * as constants from "../constants";

export abstract class WorkItem implements IWorkItem {
    outTasks: IWorkItem[] = new Array();
    workload: any = null;
    options: WorkItemOptions = new WorkItemOptions();
    // do work and pass result to nextTask
    abstract thisTask(workload: any): Promise<any>;
    // process result from thisTask
    abstract nextTask(workload: any): Promise<IWorkItem[]>;

    DoWork(): Promise<IWorkItem[]> {
        return this.thisTask(this.workload)
            .then(function(workload) { return this.nextTask(workload); } )
            .catch(reason => constants.logger.error("WorkItem processing error: " + reason));
    }
}