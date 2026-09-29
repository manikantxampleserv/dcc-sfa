import { CalendarToday } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import {
  useDeletePromotionMaterialsIssue,
  usePromotionMaterialsIssues,
} from 'hooks/usePromotionMaterialsIssue';
import {
  CheckCircle2,
  FileText,
  Hourglass,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PromotionMaterialsIssue } from 'services/transactions/PromotionMaterialsIssue';
import { DeleteButton, EditButton, ViewButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import DepotSelect from 'shared/DepotSelect';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ManagePromotionalIssue from './ManagePromotionalIssue';

const PromotionMaterialsIssueList = () => {
  const [page] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState<string>('all');

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] =
    useState<PromotionMaterialsIssue | null>(null);

  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isFetching,
  } = usePromotionMaterialsIssues(
    page,
    limit,
    search,
    statusFilter === 'all' ? '' : statusFilter,
    depotFilter === 'all' || !depotFilter ? undefined : Number(depotFilter)
  );

  const deleteMutation = useDeletePromotionMaterialsIssue();

  const issues = response?.data || [];
  const totalItems = response?.meta?.total_count || 0;

  const columns: TableColumn<PromotionMaterialsIssue>[] = [
    {
      id: 'issue_info',
      label: 'Issue Info',
      render: (_value, row) => (
        <Box className="!flex !items-start !gap-1">
          <Avatar className="!bg-blue-100 !rounded !w-8 !h-8 !text-blue-600">
            <FileText className="!text-blue-500 !w-4 !h-4" />
          </Avatar>
          <Box className="!flex !flex-col">
            <span className="!text-gray-900 text-sm !font-semibold">
              {row.gin_number}
            </span>
            <span className="!text-gray-500 !text-xs">
              {row.items?.length || 0} items •{' '}
              {row.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}{' '}
              pcs • {row.campaign_reference || 'No campaign'}
            </span>
          </Box>
        </Box>
      ),
    },
    {
      id: 'depot_outlet',
      label: 'Depot → Outlet',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-2">
          <Box className="flex !items-center gap-1">
            <Avatar
              src="mkx"
              alt={row.depot?.name}
              className="!bg-blue-100 !text-blue-600 !w-8 !h-8 !rounded !text-sm"
            >
              {row.depot?.name?.charAt(0)}
            </Avatar>
            <Box className="flex flex-col">
              <span className="text-sm !font-semibold">{row.depot?.name}</span>
              <span className="text-xs !text-gray-500">{row.depot?.code}</span>
            </Box>
          </Box>
          →
          <Box
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
            onClick={() => navigate(`/masters/outlets/${row.outlet_id}`)}
          >
            <Avatar
              src="mkx"
              alt={row.outlet?.name}
              className="!bg-purple-100 !text-purple-600 !w-8 !h-8 !rounded !text-sm"
            >
              {row.outlet?.name?.charAt(0)}
            </Avatar>
            <Box className="flex flex-col">
              <span className="text-sm !font-semibold hover:text-blue-600 transition-colors">
                {row.outlet?.name}
              </span>
              <span className="text-xs !text-gray-500">{row.outlet?.code}</span>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      id: 'issue_date',
      label: 'Issue Date',
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!text-gray-700 !flex !items-center !gap-1"
        >
          <CalendarToday className="!text-gray-400 !text-[16px]" />{' '}
          {dayjs(row.issue_date).format('MMM DD, YYYY')}
        </Typography>
      ),
    },
    {
      id: 'issued_by',
      label: 'Issued By',
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-1">
          <Avatar
            src="mkx"
            alt={row.issued_by?.name}
            className="!bg-blue-100 !rounded !text-blue-600 !w-8 !h-8 !text-sm"
          >
            {row.issued_by?.name?.trim().charAt(0) || ''}
          </Avatar>
          <Box className="flex flex-col">
            <span className="text-sm !font-semibold">
              {row.issued_by?.name || 'Admin'}
            </span>
            <span className="text-xs !text-gray-500">
              {row.issued_by?.sap_code || 'No SAP Code'}
            </span>
          </Box>
        </Box>
      ),
    },
    {
      id: 'total_value',
      label: 'Total Value',
      render: (_value, row) => (
        <Typography variant="subtitle2" className="!font-bold !text-gray-900">
          TZS {Number(row.total_value || 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'approval_status',
      label: 'Approval Status',
      render: (_value, row) => {
        let color: 'success' | 'warning' | 'error' = 'warning';
        let label = 'Pending';
        let icon = <Hourglass size={14} className="!mr-1" />;

        if (row.approval_status === 'A') {
          color = 'success';
          label = 'Approved';
          icon = <CheckCircle2 size={14} className="!mr-1" />;
        } else if (row.approval_status === 'R') {
          color = 'error';
          label = 'Rejected';
        }

        return (
          <Chip
            label={
              <Box className="!flex !items-center">
                {icon}
                {label}
              </Box>
            }
            color={color}
            size="small"
            variant="outlined"
            className={`!font-medium ${
              color === 'success'
                ? '!bg-green-50 !text-green-700 !border-green-200'
                : ''
            }`}
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <Box className="!flex !items-center !gap-1">
          <ViewButton
            onClick={() => {
              setSelectedIssue(row);
              setIsManageOpen(true);
            }}
            tooltip="View Issue"
            size="small"
          />

          <EditButton
            onClick={() => {
              setSelectedIssue(row);
              setIsManageOpen(true);
            }}
            tooltip="Edit Issue"
            size="small"
          />
          <DeleteButton
            size="small"
            onClick={() => deleteMutation.mutateAsync(row.id)}
            tooltip={`Delete Issue ${row.gin_number}`}
            itemName={row.gin_number}
            confirmDelete={true}
          />
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Promotion Materials Issue
          </p>
          <p className="!text-gray-500 text-sm">
            Issue advertising and promotion materials to outlets and print Goods
            Issue Notes
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Issues"
          value={totalItems.toString()}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading || isFetching}
        />
        <StatsCard
          title="Approved"
          value={issues
            .filter(i => i.approval_status === 'A')
            .length.toString()}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
          isLoading={isLoading || isFetching}
        />
        <StatsCard
          title="Pending Approval"
          value={issues
            .filter(i => i.approval_status === 'P')
            .length.toString()}
          icon={<Hourglass className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading || isFetching}
        />
        <StatsCard
          title="Value Issued This Month"
          value={`TZS ${issues
            .reduce((sum, i) => sum + (Number(i.total_value) || 0), 0)
            .toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading || isFetching}
        />
      </div>

      <Box className="!bg-white !rounded-lg !shadow-sm !border !border-gray-200 !overflow-hidden">
        <Table
          data={issues}
          columns={columns}
          actions={
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <SearchInput
                  placeholder="Search Materials..."
                  value={search}
                  onChange={val => setSearch(val)}
                  debounceMs={400}
                />
                <Select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="!w-40"
                  disableClearable
                  label=""
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="P">Pending</MenuItem>
                  <MenuItem value="A">Approved</MenuItem>
                  <MenuItem value="R">Rejected</MenuItem>
                </Select>
                <div className="w-64">
                  <DepotSelect
                    name="depotFilter"
                    label="Select Depot"
                    value={
                      depotFilter === 'all' || !depotFilter
                        ? undefined
                        : depotFilter
                    }
                    onChange={(_event: any, depot: any) => {
                      if (!depot) {
                        setDepotFilter('all');
                      } else {
                        setDepotFilter(String(depot.id));
                      }
                    }}
                    fullWidth={true}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Plus />}
                  onClick={() => {
                    setSelectedIssue(null);
                    setIsManageOpen(true);
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          }
          getRowId={row => row.id}
          loading={isLoading || isFetching}
          totalCount={totalItems}
          page={page - 1}
          rowsPerPage={limit}
        />
      </Box>

      <ManagePromotionalIssue
        open={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        issue={selectedIssue}
      />
    </>
  );
};

export default PromotionMaterialsIssueList;
