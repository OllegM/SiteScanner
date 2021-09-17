import * as log4js from "log4js";

// Initialize logger
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/fedresurs.log'), 'log');
export let logger = log4js.getLogger('log');
logger.setLevel(log4js.levels.ALL);

export const searchStringsFile = "searchStrings.txt"; // файл со строками поиска

export const webUrl = 'http://www.site.ru'; // без слэша в конце
export const host = 'site.ru';
export const companySearchUrl = "/api/company/search";
export const companyInfoUrl = "/api/company/";
export const publicationsSearchUrl = "/api/company/publications";
export const sfactInfoUrl = "/api/sfactmessage/";

export const publications = { 
    GroupId: 6, // "Активы и аудит"
    MessageType: "StatutoryAuditResults" // "Сообщение о результатах обязательного аудита"
};

export const contentTypeText = 'text/html; charset=utf-8';
export const contentTypeJSON = 'application/json; charset=utf-8';
export const inputDateFormat = ""; // не используется
export const outputDateFormat = "YYYY-MM-DD";
export const maxQueueSize = 3; // кол-во одновременно обрабатываемых элементов. оно же - кол-во одновременных запросов к сайту
export const processedItemsLimit = null; // null - no limit
export enum Methods { GET, POST }
export enum WorkItemPriority { LOW, MEDIUM, HIGH }

export const resultFileName = "result.csv";