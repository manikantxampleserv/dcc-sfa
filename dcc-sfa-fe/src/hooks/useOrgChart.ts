import { useQuery } from '@tanstack/react-query';
import { fetchOrgChart, type TreeNode } from 'services/masters/OrganizationChart';

export const useOrgChart = () => {
  return useQuery<TreeNode[], Error>({
    queryKey: ['org-chart'],
    queryFn: fetchOrgChart,
    retry: false,
  });
};

export type { TreeNode };
