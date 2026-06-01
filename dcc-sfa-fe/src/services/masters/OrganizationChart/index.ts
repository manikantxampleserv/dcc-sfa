import api from 'configs/axio.config';

export interface TreeNode {
  id: string;
  label: string;
  type: string;
  children: TreeNode[];
}

export const fetchOrgChart = async (): Promise<TreeNode[]> => {
  try {
    const response = await api.get('/org-chart');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching org chart:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch org chart'
    );
  }
};
