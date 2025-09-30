export interface Depot {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone_number: string;
  email: string;
  manager_id: number | null;
  supervisor_id: number | null;
  coordinator_id: number | null;
  latitude: number | null;
  longitude: number | null;
  is_active: 'Y' | 'N';
  createdate: string;
  createdby: number;
  updatedate: string | null;
  updatedby: number | null;
  log_inst: number | null;
  company_name?: string;
  manager_name?: string;
  supervisor_name?: string;
  coordinator_name?: string;
}

export interface Company {
  id: number;
  name: string;
  code: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
}
