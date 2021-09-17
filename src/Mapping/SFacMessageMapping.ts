import { IMappingSchema, IMappingItem } from "./IMapping";

export class SFacMessageMapping implements IMappingSchema {
    mappingSchema: IMappingItem[] = [
        {
            sourceField: "data.message.content.auditee.fullName", targetField: "auditeeFullName", subTree: null
        },
        {
            sourceField: "data.message.content.auditee.inn", targetField: "auditeeINN", subTree: null
        },
        {
            sourceField: "data.message.content.auditee.ogrn", targetField: "auditeeOGRN", subTree: null
        },
        {
            sourceField: "data.message.content.auditors",
            subTree: [{
                sourceField: "auditCompany.fullName",
                targetField: "auditorFullName",
                subTree: null
            }, {
                sourceField: "auditCompany.inn",
                targetField: "auditorINN",
                subTree: null
            }, {
                sourceField: "auditCompany.ogrn",
                targetField: "auditorOGRN",
                subTree: null
            }],
            targetField: null
        },
        {
            sourceField: "data.message.content.financialStateBegin", targetField: "financialStateBeginDate", subTree: null
        },
        {
            sourceField: "data.message.content.financialStateEnd", targetField: "financialStateEndDate", subTree: null
        },
        {
            sourceField: "data.message.content.financialStateDocuments", targetField: "financialStateDocuments", subTree: null
        },
        {
            sourceField: "data.message.content.auditResultsDate", targetField: "auditResultsDate", subTree: null
        },
        {
            sourceField: "data.message.content.auditorsStatement", targetField: "auditorsStatement", subTree: null
        },
        {
            sourceField: "url", targetField: "publicationUrl", subTree: null
        },
    ];
}