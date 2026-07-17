interface EmailVariables {
    [key: string]: any;
}
interface EmailTemplate {
    subject: string;
    body: string;
}
declare const formatRequestType: (type?: string) => string;
declare const renderDetailsHtml: (request_detail?: any) => string;
declare const extractPlaceholders: (str: string) => string[];
declare const autoMapVariables: (template: {
    subject?: string;
    body?: string;
}, vars: EmailVariables) => EmailVariables;
export declare const generateEmailContent: (key: string, variables?: EmailVariables) => Promise<EmailTemplate>;
export { formatRequestType, renderDetailsHtml, extractPlaceholders, autoMapVariables, };
export default generateEmailContent;
//# sourceMappingURL=emailTemplates.d.ts.map