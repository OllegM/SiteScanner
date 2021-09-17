// поисковый запрос
export class CompanySearchRequest {
    entitySearchFilter = {
        regionNumber: "",
        onlyActive: true,
        startRowIndex: 0,
        pageSize: 15,
        name: null,
        code: null
    };
    isCompany = null;
    isFirmBankrupt = null;
    isSro = null;
    isFirmTradeOrg = null;
    isSroTradePlace = null;
    isTradePlace = null;
};

// ответ на поисковый запрос
export class CompanySearchResponse {
    pageData: CompanySearchResponseItem[];
    found: number = 0;
};

export class CompanySearchResponseItem {
    guid = "";
    ogrn = "";
    inn = "";
    name = "";
    address = "";
    status = "";
    statusDate = "";
    tradePlaceName = null;
    tradePlaceSite = null;
};

// Секция объектов по информации о компании
export class CompanyInfoResponse {
    guid: string;
    companyInfo: CompanyInfo;
    companyRoles: CompanyRoles;
    individualExecutives: IndividualExecutive[];
    propertyInfo: PropertyInfo;
    sroMembership: any[];
    sroInfo: any[];
    publicationsStatistic: PublicationsStatistic;
    legalCases: any[];
}

export class CompanyInfo {
    ogrn: string;
    inn: string;
    innByCompany: string;
    kpp: string;
    kppBigCompany: string;
    okopfName: string;
    okopfCode: string;
    okvedName: string;
    okvedCode: string;
    shortName: string;
    fullName: string;
    egrulAddress: string;
    postAddress: string;
    site: string;
    email: string;
    phone: string;
    egrulStatus: string;
    egrulStatusDate: string;
    tradePlace: string;
}

export class CompanyRoles {
    isStateAgency: boolean;
    isSro: boolean;
    isTradeOrganizer: boolean;
    isTradePlace: boolean;
 }

 export class IndividualExecutive {
    type: number;
    name: string;
    title: string;
    inn: string;
}

export class PropertyInfo {
    authCapitalStock: string;
    assestsCost: string;
}

export class PublicationsStatistic {
    sfactMessageTypeStatistic: StatisticGroup[];
    firmBankruptMessageTypeStatistic: any[];
    sroAmMessageTypeStatistic: any[];
    tradeOrgMessageTypeStatistic: any[];
    amReportStatistic: any;
}

export class StatisticGroup {
    group: PublicationsGroup;
    messageTypes: MessageType[];
}

export class PublicationsGroup {
    id: number;
    name: string;
}

export class MessageType {
    name: string;
    type: string;
    count: number;
}

// секция объектов - информация по набору документов
export class PublicationsSearchRequest {
    guid: string = "";
    pageSize: number = 15;
    startRowIndex: number = 0;
    startDate: string = null;
    endDate: string = null;
    bankruptMessageType: string = null;
    bankruptMessageTypeGroupId: string = null;
    legalCaseId: string = null;
    searchAmReport: boolean = false;
    searchFirmBankruptMessage: boolean = false;
    searchFirmBankruptMessageWithoutLegalCase: boolean = false;
    searchSfactsMessage: boolean = true;
    searchSroAmMessage: boolean = false;
    searchTradeOrgMessage: boolean = false;
    sfactMessageType: string = "";
    sfactsMessageTypeGroupId: number = 0;
}

export class PublicationsSearchResponse {
    pageData: PublicationsSearchResponseItem[];
    found: number;
}

export class PublicationsSearchResponseItem {
    guid: string;
    number: string;
    datePublish: string;
    isAnnuled: boolean;
    isLocked: boolean;
    title: string;
    subTitle: string;
    publisherName: string;
    notaryName: string;
    type: number;
    publisherType: number;
    participants: string;
    bankruptName: string;
}

// секция объектов данных по одному документу

// сообщение о результатах обязятельного аудита
export class SFacInfoResponse {
    message: AuditMessage;
    relatedMessages: any[];
    docs: any[];
}

export class Auditee {
    fullName: string;
    inn: string;
    ogrn: string;
    type: number;
}

export class AuditCompany {
    fullName: string;
    inn: string;
    ogrn: string;
    type: number;
}

export class Auditor {
    auditorPerson: string;
    auditCompany: AuditCompany;
}

export class AuditContent {
    auditeeName: string;
    auditee: Auditee;
    auditeeTrustManagement: any;
    auditors: Auditor[];
    financialStateBegin: string;
    financialStateEnd: string;
    financialStateDocuments: string;
    auditResultsDate: string;
    auditorsStatement: string;
    text: string;
}

export class AuditPublisher {
    ogrn: string;
    inn: string;
    address: string;
    type: number;
    name: string;
      }

export class AuditMessage {
    messageType: number;
    additionalInfo: any;
    datePublish: string;
    number: string;
    lockReason: any;
    typeName: string;
    content: AuditContent;
    notaryInfo: any;
    annulmentMessageInfo: any;
    publisher: AuditPublisher;
    contentMessageInfo: any;
}