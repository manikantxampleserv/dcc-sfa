import { api } from 'services/api';
import {
  type EmailTemplate,
  type EmailTemplateResponse,
  type CreateEmailTemplatePayload,
  type UpdateEmailTemplatePayload,
  type EmailTemplateQueryParams,
} from 'hooks/useEmailTemplates';

export const emailTemplateService = {
  getEmailTemplates: async (params: EmailTemplateQueryParams = {}): Promise<EmailTemplateResponse> => {
    const response = await api.get('/email-templates', { params });
    return response.data;
  },

  getEmailTemplate: async (id: number): Promise<EmailTemplate> => {
    const response = await api.get(`/email-templates/${id}`);
    return response.data;
  },

  createEmailTemplate: async (data: CreateEmailTemplatePayload): Promise<EmailTemplate> => {
    const response = await api.post('/email-templates', data);
    return response.data;
  },

  updateEmailTemplate: async (data: UpdateEmailTemplatePayload): Promise<EmailTemplate> => {
    const response = await api.put(`/email-templates/${data.id}`, data);
    return response.data;
  },

  deleteEmailTemplate: async (id: number): Promise<void> => {
    await api.delete(`/email-templates/${id}`);
  },
};
