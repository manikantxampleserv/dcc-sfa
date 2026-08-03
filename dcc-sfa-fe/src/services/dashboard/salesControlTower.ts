import axiosInstance from '../../configs/axio.config';

export const getSalesControlTowerData = async (params: any) => {
  const response = await axiosInstance.get('/sales-control-tower/dashboard', { params });
  return response.data;
};