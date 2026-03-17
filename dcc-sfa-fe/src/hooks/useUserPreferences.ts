import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllUserPreferences,
  saveUserColumnPreferences,
} from '../services/columnPreferences';

export const preferenceKeys = {
  all: ['user-preferences'] as const,
};

export const useUserPreferences = () => {
  return useQuery({
    queryKey: preferenceKeys.all,
    queryFn: fetchAllUserPreferences,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSaveUserPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveUserColumnPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferenceKeys.all });
    },
  });
};
