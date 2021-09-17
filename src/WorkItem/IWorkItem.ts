import { WorkItemOptions } from "./WorkItemOptions";

export interface IWorkItem {
    workload: any;
    options: WorkItemOptions;
    DoWork(): Promise<IWorkItem[]>;
}