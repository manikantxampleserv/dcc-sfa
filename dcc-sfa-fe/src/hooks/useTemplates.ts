/**
 * @fileoverview Templates Management Hooks with React Query and Toast Integration
 * @description Provides hooks for templates CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  fetchTemplates,
  fetchTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type Template,
  type GetTemplatesParams,
  type ManageTemplatePayload,
  type UpdateTemplatePayload,
} from 'services/templates';

export type { Template as TemplateType };

export interface TemplateResponse {
  data: Template[];
  meta: {
    total_count: number;
    current_page: number;
    total_pages: number;
  };
  stats?: {
    total_templates: number;
    new_templates_this_month: number;
    total_channels: number;
    total_types: number;
    channels: string[];
    types: string[];
  };
}

export const useTemplates = (
  params: GetTemplatesParams = {},
  options: { enabled?: boolean } = {}
) => {
  return useQuery<TemplateResponse>({
    queryKey: ['templates', params],
    queryFn: async () => {
      const response = await fetchTemplates(params);

      // Calculate stats from the data if backend doesn't provide them
      const templates = response.data || [];
      const channels = [
        ...new Set(templates.filter(t => t.channel).map(t => t.channel!)),
      ];
      const types = [
        ...new Set(templates.filter(t => t.type).map(t => t.type!)),
      ];

      // Calculate new templates this month on client side
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const newTemplatesThisMonth = templates.filter(template => {
        if (!template.createdate) return false;
        const createdDate = new Date(template.createdate);
        return createdDate >= startOfMonth && createdDate < endOfMonth;
      }).length;

      // Use backend stats if available and has correct structure, otherwise calculate
      const backendStats = response.stats;
      const hasCorrectStatsStructure =
        backendStats &&
        'total_templates' in backendStats &&
        'new_templates_this_month' in backendStats;

      const transformedData: TemplateResponse = {
        data: templates,
        meta: {
          total_count: response.meta?.total || templates.length,
          current_page: response.meta?.page || 1,
          total_pages: response.meta?.totalPages || 1,
        },
        stats: hasCorrectStatsStructure
          ? (backendStats as any)
          : {
              total_templates: templates.length,
              new_templates_this_month: newTemplatesThisMonth,
              total_channels: channels.length,
              total_types: types.length,
              channels: channels,
              types: types,
            },
      };
      return transformedData;
    },
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ManageTemplatePayload) => createTemplate(data),
    onSuccess: () => {
      toast.success('Template created successfully');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create template');
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTemplatePayload }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update template');
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete template');
    },
  });
};

export const useTemplate = (
  id: number,
  options: { enabled?: boolean } = {}
) => {
  return useQuery<Template | null>({
    queryKey: ['template', id],
    queryFn: async () => {
      const response = await fetchTemplateById(id);
      return response.data || null;
    },
    enabled: options.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
