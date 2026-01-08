export interface RouteWithSalesperson {
  id: number;
  parent_id: number;
  depot_id: number;
  name: string;
  code: string;
  description?: string;
  salesperson_id?: number;
  start_location?: string;
  end_location?: string;
  estimated_distance?: number;
  estimated_time?: number;
  is_active: string;
  createdate?: Date;
  createdby: number;
  updatedate?: Date;
  updatedby?: number;
  log_inst?: number;
  route_type_id: number;
  route_type?: string;
  outlet_group?: string;
  routes_salesperson?: {
    id: number;
    name: string;
    email: string;
  };
  routes_depots?: {
    id: number;
    name: string;
    code: string;
  };
  customer_routes?: Array<{
    id: number;
    name: string;
    code: string;
    latitude?: number;
    longitude?: number;
  }>;
}

export interface RouteEffectivenessMetrics {
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
  time_adherence: string;
  planned_distance: string;
  actual_distance: string;
  distance_efficiency: string;
  total_orders: number;
  route_efficiency_score: string;
}
