/**
 * TypeScript program to load and parse data from a site
 */

import { QueueManager, QueueInitializer } from "./Queue/QueueManager";
import { CSVWriter } from "./ResultWriters/CSVWriter";
import * as constants from "./constants";
import { SearchPublicationsWorkItem } from "./WorkItem/WorkItems";

export class SiteScanner {
    public static Main(): number {
        let writer = new CSVWriter();
        writer.InitResultFile();

        QueueInitializer.initialize().then((queue) => {
            let queueManager = new QueueManager(queue);
            constants.logger.info("Queue length : " + queue.length);
            queueManager.Run();
        }).catch(reason => constants.logger.error("Queue init error: " + reason));

        return 0;
    }
}

let app = SiteScanner.Main();
