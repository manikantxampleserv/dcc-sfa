import axiosInstance from '../../configs/axio.config';

export interface RouteEffectivenessFilters {
  start_date?: string;
  end_date?: string;
  salesperson_id?: number;
  route_id?: number;
  depot_id?: number;
}

export interface RouteEffectivenessData {
  summary: {
    total_routes: number;
    total_customers: number;
    total_planned_visits: number;
    total_actual_visits: number;
    total_completed_visits: number;
    missed_visits: number;
    avg_completion_rate: string;
    avg_efficiency_score: string;
    date_range: {
      start: string;
      end: string;
    };
  };
  routes: Array<{
    route_id: number;
    route_name: string;
    route_code: string;
    depot_name: string;
    salesperson_name: string;
    total_customers: number;
    planned_visits: number;
    actual_visits: number;
    completed_visits: number;
    in_progress_visits: number;
    missed_visits: number;
    completion_rate: string;
    avg_visit_duration: string;
    planned_distance_km: number;
    actual_distance_km: string;
    distance_efficiency: string;
    planned_time_minutes: number;
    actual_time_minutes: number;
    efficiency_score: string;
    visit_details: Array<{
      id: number;
      customer_name: string;
      visit_date: string | null;
      status: string | null;
      check_in_time: string | null;
      check_out_time: string | null;
    }>;
  }>;
}

/**
 * Fetch Route Effectiveness Data
 */
export const fetchRouteEffectiveness = async (
  filters?: RouteEffectivenessFilters
): Promise<RouteEffectivenessData> => {
  const params: any = {};
  if (filters?.start_date) params.start_date = filters.start_date;
  if (filters?.end_date) params.end_date = filters.end_date;
  if (filters?.salesperson_id) params.salesperson_id = filters.salesperson_id;
  if (filters?.route_id) params.route_id = filters.route_id;
  if (filters?.depot_id) params.depot_id = filters.depot_id;

  const response = await axiosInstance.get('/tracking/route-effectiveness', {
    params,
  });

  return response.data.data;
};
