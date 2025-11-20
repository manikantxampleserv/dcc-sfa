import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as settingsService from '../services/settings';

export type {
  Settings,
  SettingsMeta,
  UpdateSettingsPayload,
} from '../services/settings';

export const settingsQueryKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsQueryKeys.all, 'detail'] as const,
};

export const useSettings = () => {
  return useQuery({
    queryKey: settingsQueryKeys.detail(),
    queryFn: () => settingsService.fetchSettings(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSettings = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      settingsData,
    }: {
      id: number;
      settingsData: settingsService.UpdateSettingsPayload | FormData;
    }) => settingsService.updateSettings(id, settingsData),
    loadingMessage: 'Updating settings...',
    invalidateQueries: [['settings']],
  });
};
