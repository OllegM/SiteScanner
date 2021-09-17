import { IWorkItem } from "../WorkItem/IWorkItem";
import { SearchWorkItem } from "../WorkItem/WorkItems";
import * as constants from "../constants";
import * as fs from "fs";
import * as readline from "readline";

export class QueueManager {
    private processedItemsLimit = constants.processedItemsLimit; // null - no limit
    private maxQueueSize = constants.maxQueueSize;
    private queueSize = 0;
    private mainQueue: IWorkItem[];

    constructor(initialQueue: IWorkItem[]) {
        if (initialQueue === null) {
            throw "Initial queue can't be empty";
        }
        this.mainQueue = initialQueue;
    }

    public Run() {
        this.BuildQueue();
    }

    public BuildQueue(processedItems: number = 0) {
        if (this.queueSize >= this.maxQueueSize) {
            constants.logger.warn("Queue is too long (" + this.queueSize + "), Waiting...");
            setTimeout(this.BuildQueue(processedItems), 1000);
        } else {
            if (this.mainQueue.length > 0 && false === (this.processedItemsLimit !== null && processedItems > this.processedItemsLimit)) {
                constants.logger.debug("Building queue. Queue length: " + this.mainQueue.length + ", processed items: " + processedItems);

                let workingItemsForOneRun = this.PrepareRunningQueue();

                processedItems += workingItemsForOneRun.length;
                this.queueSize += workingItemsForOneRun.length;

                this.ProcessItems(processedItems, workingItemsForOneRun).then(
                    result => {
                        this.queueSize -= result.length;
                        this.mainQueue = this.AddMoreItemsToQueue(result);
                        this.BuildQueue(processedItems);
                    }
                ).catch(reason => constants.logger.error("Queue building error: " + reason));
            }
        }
    }

    public AddMoreItemsToQueue(arrayOfArrays: IWorkItem[][]) {
        return this.SortQueue(this.mainQueue.concat(arrayOfArrays.reduce(this.ConcatenateQueues)));
    }

    public ConcatenateQueues(resultQueue: IWorkItem[], addToQueue: IWorkItem[]) {
        return resultQueue.concat(addToQueue);
    }

    public ProcessItems(cycle: number, workingItems: IWorkItem[]) {
        return Promise.all(
            workingItems.map(item => item.DoWork())
        );
    }

    public PrepareRunningQueue(): IWorkItem[] {
        let result: IWorkItem[];
        if (this.mainQueue.length >= this.maxQueueSize) {
            result = this.mainQueue.splice(0, this.maxQueueSize);
        } else {
            result = this.mainQueue.splice(0, this.mainQueue.length);
        }

        result = this.SanitizeQueue(result);
       
        return result;
    }

    public SanitizeQueue(queue: IWorkItem[]) {
        let result = new Array();
        queue.forEach(item => {
            try {
                constants.logger.debug("New queue item priority: " + item.options.priority);
                constants.logger.debug("New queue item workload: " + JSON.stringify(item.workload));
                result.push(item);
            } catch (error) {
                constants.logger.error("New queue item is broken: " + JSON.stringify(item));
            }
        });
        return result;
    }

    public SortQueue(queue: IWorkItem[]): IWorkItem[] {
        return queue.sort((itemA: IWorkItem, itemB: IWorkItem) => {
            try {
                return itemB.options.priority - itemA.options.priority;
            } catch (error) {
                return 0;
            }
        });
    }
}

export class QueueInitializer {
    public static initialize(): Promise<IWorkItem[]> {
        return new Promise((resolve, reject) => {
            constants.logger.info("Reading seach strings");

            let workItems: IWorkItem[] = new Array();

            const rl = readline.createInterface({
                input: fs.createReadStream(constants.searchStringsFile)
            });

            rl.on('line', (line) => {
                let searchString = (line as string).trim();
                let item: SearchWorkItem = new SearchWorkItem();
                item.workload = searchString;
                item.options.priority = constants.WorkItemPriority.LOW;
                workItems.push(item);
            });
            rl.on('close', () => {
                constants.logger.info("Search strings found: " + workItems.length);
                resolve(workItems);
            });
        });
    }
}