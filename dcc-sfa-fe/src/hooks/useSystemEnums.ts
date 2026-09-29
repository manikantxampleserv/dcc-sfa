import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'configs/axio.config';

interface SystemEnumResponse {
  success: boolean;
  data: {
    key: string;
    name: string;
    values: string[];
  };
}

const getSystemEnum = async (key: string): Promise<SystemEnumResponse> => {
  const { data } = await axiosInstance.get(`/system-enums/${key}`);
  return data;
};

export const useSystemEnum = (key: string) => {
  return useQuery({
    queryKey: ['systemEnum', key],
    queryFn: () => getSystemEnum(key),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
