export interface Company {
  id: number;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  logo?: string;
  is_active: 'Y' | 'N';
  createdate: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
}
