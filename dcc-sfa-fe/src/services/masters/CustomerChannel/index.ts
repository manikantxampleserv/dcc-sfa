import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface CustomerChannel {
  id: number;
  channel_name: string;
  channel_code: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface ManageCustomerChannelPayload {
  channel_name: string;
  is_active?: string;
}

export interface UpdateCustomerChannelPayload {
  channel_name?: string;
  is_active?: string;
}

export interface GetCustomerChannelsParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
}

export const fetchCustomerChannels = async (
  params?: GetCustomerChannelsParams
): Promise<ApiResponse<CustomerChannel[]>> => {
  try {
    const response = await api.get('/customer-channels', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer channels:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch customer channels'
    );
  }
};

export const fetchCustomerChannelById = async (
  id: number
): Promise<CustomerChannel> => {
  try {
    const response = await api.get(`/customer-channels/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching customer channel:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch customer channel'
    );
  }
};

export const createCustomerChannel = async (
  data: ManageCustomerChannelPayload
): Promise<ApiResponse<CustomerChannel>> => {
  try {
    const response = await api.post('/customer-channels', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating customer channel:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create customer channel'
    );
  }
};

export const updateCustomerChannel = async (
  id: number,
  data: UpdateCustomerChannelPayload
): Promise<ApiResponse<CustomerChannel>> => {
  try {
    const response = await api.put(`/customer-channels/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating customer channel:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update customer channel'
    );
  }
};

export const deleteCustomerChannel = async (id: number): Promise<void> => {
  try {
    await api.delete(`/customer-channels/${id}`);
  } catch (error: any) {
    console.error('Error deleting customer channel:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete customer channel'
    );
  }
};
