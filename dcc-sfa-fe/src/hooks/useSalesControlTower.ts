import { useQuery } from '@tanstack/react-query';
import { getSalesControlTowerData } from '../services/dashboard/salesControlTower';

export const useSalesControlTower = (filters: any) => {
  // Pass filter values (names or IDs) as API params — backend accepts both
  const params: Record<string, any> = {};
  if (filters?.depot) params.depot_id = filters.depot;     // name string — backend accepts name
  if (filters?.route) params.route_id = filters.route;     // name string — backend accepts name
  if (filters?.sal) params.salesman_id = filters.sal;      // name string — backend accepts name
  if (filters?.brand) params.brand_id = filters.brand;     // name string — backend accepts name
  if (filters?.pack) params.pack = filters.pack;           // name string
  if (filters?.ch) params.channel = filters.ch;            // name string
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  if (filters?.cmpMode) params.cmpMode = filters.cmpMode;

  return useQuery({
    queryKey: ['salesControlTower', params],
    queryFn: () => getSalesControlTowerData(params),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};
