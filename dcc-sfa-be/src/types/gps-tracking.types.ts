export interface RouteWithSalesperson extends RouteEffectivenessMetrics {
  salesperson_id?: number;
  routes_salesperson?: {
    id: number;
    name: string;
    email: string;
  };
  customer_routes?: Array<{
    id: number;
    name: string;
    code: string;
    type?: string;
    contact_person?: string;
    phone_number?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    latitude?: number;
    longitude?: number;
    is_active: string;
    createdate?: Date;
    createdby?: number;
    updatedate?: Date;
    updatedby?: number;
    log_inst?: number;
    route_type_id: number;
    route_type?: string;
    outlet_group?: string;
    start_location?: string;
    end_location?: string;
    estimated_distance?: number;
    estimated_time?: number;
    salespersons?: Array<{
      id: number;
      role: string;
      is_active: string;
      user: {
        id: number;
        name: string;
        email: string;
      };
    }>;
    routes_depots?: {
      id: number;
      name: string;
      code: string;
    };
    route_zones?: {
      id: number;
      name: string;
      code: string;
    };
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
  customer_routes?: Array<{
    id: number;
    name: string;
    code: string;
    type?: string;
    contact_person?: string;
    phone_number?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    latitude?: number;
    longitude?: number;
    is_active: string;
    createdate?: Date;
    createdby?: number;
    updatedate?: Date;
    updatedby?: number;
    log_inst?: number;
  }>;
  route_depots?: {
    id: number;
    name: string;
    code: string;
  };
  route_zones?: {
    id: number;
    name: string;
    code: string;
  };
  salespersons?: Array<{
    id: number;
    role: string;
    is_active: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}
