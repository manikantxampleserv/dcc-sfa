import React, { useState } from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { ColDef } from 'ag-grid-community';
import { DeleteButton, EditButton } from '../../../shared/ActionButton';
import SearchInput from '../../../shared/SearchInput';
import DataGrid from '../../../shared/DataGrid';
// TypeScript interface matching Prisma schema
interface Company {
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
  is_active: string;
  created_date?: Date;
  created_by: number;
  updated_date?: Date;
  updated_by?: number;
  log_inst?: number;
}

const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString)
    return <span className="italic text-gray-400"> No Date </span>;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

const Companies: React.FC = () => {
  const [search, setSearch] = useState('');
  const [limit] = useState(10);

  // Mock data matching Prisma schema
  const [companies] = useState<Company[]>([
    {
      id: 1,
      name: 'Hindustan Unilever Limited',
      code: 'HUL001',
      address: 'Unilever House, B.D. Sawant Marg, Chakala',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipcode: '400099',
      phone_number: '+91-22-3983-0000',
      email: 'contact@hul.co.in',
      website: 'https://www.hul.co.in',
      logo: 'https://www.hul.co.in/logo.png',
      is_active: 'Y',
      created_date: new Date('2023-01-15'),
      created_by: 1,
      updated_date: new Date('2024-03-20'),
      updated_by: 1,
      log_inst: 1,
    },
    {
      id: 2,
      name: 'ITC Limited',
      code: 'ITC002',
      address: 'Virginia House, 37 J.L. Nehru Road',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      zipcode: '700071',
      phone_number: '+91-33-2288-9371',
      email: 'corporate@itc.in',
      website: 'https://www.itcportal.com',
      logo: 'https://www.itcportal.com/logo.png',
      is_active: 'Y',
      created_date: new Date('2023-02-10'),
      created_by: 1,
      updated_date: new Date('2024-02-15'),
      updated_by: 2,
      log_inst: 1,
    },
    {
      id: 3,
      name: 'Nestle India Limited',
      code: 'NES003',
      address: 'Nestle House, Jacaranda Marg, M Block',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      zipcode: '122002',
      phone_number: '+91-124-399-5000',
      email: 'info@nestle.in',
      website: 'https://www.nestle.in',
      logo: 'https://www.nestle.in/logo.png',
      is_active: 'Y',
      created_date: new Date('2023-03-05'),
      created_by: 1,
      updated_date: new Date('2024-01-10'),
      updated_by: 1,
      log_inst: 1,
    },
    {
      id: 4,
      name: 'Britannia Industries Ltd',
      code: 'BRI004',
      address: 'Britannia House, 1-A Hungerford Street',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      zipcode: '700017',
      phone_number: '+91-33-2229-8747',
      email: 'contact@britannia.co.in',
      website: 'https://www.britannia.co.in',
      logo: 'https://www.britannia.co.in/logo.png',
      is_active: 'Y',
      created_date: new Date('2023-04-12'),
      created_by: 2,
      updated_date: new Date('2024-04-01'),
      updated_by: 2,
      log_inst: 1,
    },
    {
      id: 5,
      name: 'Godrej Consumer Products',
      code: 'GCP005',
      address: 'Godrej One, Pirojshanagar',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipcode: '400079',
      phone_number: '+91-22-2518-8010',
      email: 'info@godrejcp.com',
      website: 'https://www.godrejcp.com',
      logo: 'https://www.godrejcp.com/logo.png',
      is_active: 'Y',
      created_date: new Date('2023-05-20'),
      created_by: 1,
      updated_date: new Date('2024-05-15'),
      updated_by: 1,
      log_inst: 1,
    },
    {
      id: 6,
      name: 'Dabur India Limited',
      code: 'DAB006',
      address: '8/3 Asaf Ali Road',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      zipcode: '110002',
      phone_number: '+91-11-2324-6017',
      email: 'contact@dabur.com',
      website: 'https://www.dabur.com',
      logo: 'https://www.dabur.com/logo.png',
      is_active: 'N',
      created_date: new Date('2023-06-08'),
      created_by: 2,
      updated_date: new Date('2024-06-01'),
      log_inst: 1,
    },
  ]);

  // Filter companies based on search
  const filteredCompanies = companies.filter(
    company =>
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.code.toLowerCase().includes(search.toLowerCase()) ||
      company.city?.toLowerCase().includes(search.toLowerCase()) ||
      company.state?.toLowerCase().includes(search.toLowerCase())
  );

  // Action handlers
  const handleAddCompany = () => {
    console.log('Add new company');
  };
  const handleEdit = (company: Company) => {
    console.log('Edit company:', company);
  };

  const handleDelete = (company: Company) => {
    console.log('Delete company:', company);
  };

  // Column definitions matching AG Grid inventory demo exactly
  const companyColumns: ColDef<Company>[] = [
    {
      headerName: 'Company Name',
      field: 'name',
      width: 200,
      pinned: 'left',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellRenderer: (params: any) => (
        <Box className="flex items-center gap-3 py-2">
          {/* Company Logo */}
          <Box className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {params.data.name.substring(0, 2).toUpperCase()}
          </Box>
          {/* Company Info */}
          <Box>
            <Typography
              variant="body2"
              className="font-semibold text-gray-900 leading-tight"
            >
              {params.value}
            </Typography>
            <Typography variant="caption" className="text-gray-500 text-xs">
              {params.data.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      headerName: 'Industry',
      field: 'address',
      width: 150,
      cellRenderer: (params: any) => (
        <Box className="flex items-center gap-2">
          <Box className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <Box className="w-2 h-2 bg-white rounded-full" />
          </Box>
          <Typography variant="body2" className="text-gray-700">
            {params.data.city || 'Consumer Goods'}
          </Typography>
        </Box>
      ),
    },
    {
      headerName: 'Year',
      field: 'created_date',
      width: 80,
      cellRenderer: (params: any) => (
        <Typography variant="body2" className="text-gray-700">
          {params.value
            ? new Date(params.value).getFullYear().toString().slice(-2)
            : '23'}
        </Typography>
      ),
    },
    {
      headerName: 'Status',
      field: 'is_active',
      width: 100,
      cellRenderer: (params: any) => (
        <Box className="flex items-center gap-2">
          <Box
            className={`w-2 h-2 rounded-full ${
              params.value === 'Y' ? 'bg-green-500' : 'bg-orange-500'
            }`}
          />
          <Typography
            variant="body2"
            className={`font-medium ${
              params.value === 'Y' ? 'text-green-700' : 'text-orange-700'
            }`}
          >
            {params.value === 'Y' ? 'Active' : 'On Hold'}
          </Typography>
        </Box>
      ),
    },
    {
      headerName: 'Inventory',
      field: 'phone_number',
      width: 120,
      cellRenderer: (params: any) => (
        <Box>
          <Typography variant="body2" className="text-gray-900 font-medium">
            {Math.floor(Math.random() * 20) + 1} Stock / 2 Variants
          </Typography>
        </Box>
      ),
    },
    {
      headerName: 'Incoming',
      field: 'email',
      width: 100,
      cellRenderer: () => (
        <Typography variant="body2" className="text-gray-700 text-center">
          {Math.floor(Math.random() * 50) + 10}
        </Typography>
      ),
    },
    {
      headerName: 'Price',
      field: 'website',
      width: 120,
      cellRenderer: () => (
        <Box>
          <Typography variant="body2" className="text-gray-900 font-semibold">
            £{Math.floor(Math.random() * 100) + 20}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {Math.floor(Math.random() * 20) + 5}% Increase
          </Typography>
        </Box>
      ),
    },
    {
      headerName: 'Sold',
      field: 'zipcode',
      width: 80,
      cellRenderer: () => (
        <Typography variant="body2" className="text-gray-700 text-center">
          {Math.floor(Math.random() * 30) + 5}
        </Typography>
      ),
    },
    {
      headerName: 'Est. Profit',
      field: 'country',
      width: 100,
      cellRenderer: () => (
        <Typography variant="body2" className="text-gray-900 font-semibold">
          £{Math.floor(Math.random() * 1000) + 100}
        </Typography>
      ),
    },
    {
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      cellRenderer: (params: any) => (
        <Box className="!flex !gap-1">
          <Button
            size="small"
            variant="outlined"
            className="!text-blue-600 !border-blue-600 !px-3 !py-1 !text-xs !font-medium"
          >
            Hold Selling
          </Button>
          <DeleteButton
            onClick={() => handleDelete(params.data)}
            tooltip={`Delete ${params.data.name}`}
            itemName={params.data.name}
          />
        </Box>
      ),
      sortable: false,
      filter: false,
    },
  ];

  return (
    <Box className="h-screen flex flex-col bg-gray-50">
      {/* Header Bar - Similar to AG Grid Demo */}
      <Box className="bg-white border-b border-gray-200 px-6 py-4">
        <Box className="flex justify-between items-center">
          <Box>
            <Typography
              variant="h4"
              className="font-semibold text-gray-900 mb-1"
            >
              Companies
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Manage your company database and track business relationships
            </Typography>
          </Box>
          <Box className="flex items-center gap-3">
            <Box className="flex gap-2">
              <Chip
                label={`${companies.length} Total`}
                variant="filled"
                size="small"
                className="!bg-blue-100 !text-blue-800"
              />
              <Chip
                label={`${companies.filter((c: Company) => c.is_active === 'Y').length} Active`}
                variant="filled"
                size="small"
                className="!bg-green-100 !text-green-800"
              />
              <Chip
                label={`${companies.filter((c: Company) => c.is_active === 'N').length} Inactive`}
                variant="filled"
                size="small"
                className="!bg-red-100 !text-red-800"
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCompany}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-medium !px-4 !py-2"
            >
              Add Company
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Toolbar - Search and Filters */}
      <Box className="bg-white border-b border-gray-200 px-6 py-3">
        <Box className="flex items-center justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search companies by name, code, city, or state..."
            className="!w-96"
          />
          <Box className="flex items-center gap-2">
            <Typography variant="body2" className="text-gray-600">
              {filteredCompanies.length} of {companies.length} companies
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Grid Container */}
      <Box className="flex-1 p-6">
        <Box className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DataGrid
            rowData={filteredCompanies}
            columnDefs={companyColumns}
            height="100%"
            loading={false}
            gridOptions={{
              rowSelection: 'multiple',
              suppressRowClickSelection: true,
              pagination: true,
              paginationPageSize: limit,
              domLayout: 'normal',
              headerHeight: 40,
              rowHeight: 48,
              animateRows: true,
              enableCellTextSelection: true,
              suppressMenuHide: false,
              suppressRowHoverHighlight: false,
              suppressColumnVirtualisation: true,
              defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
                minWidth: 80,
                cellStyle: {
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  padding: '4px 8px',
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Companies;
