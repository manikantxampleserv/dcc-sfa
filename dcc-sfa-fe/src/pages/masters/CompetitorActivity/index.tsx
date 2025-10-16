import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useCompetitorActivities,
  useDeleteCompetitorActivity,
  type CompetitorActivity,
} from 'hooks/useCompetitorActivity';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  Building2,
  Calendar,
  DollarSign,
  Eye,
  Image,
  Target,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportCompetitorActivity from './ImportCompetitorActivity';
import ManageCompetitorActivity from './ManageCompetitorActivity';

const CompetitorActivityManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] =
    useState<CompetitorActivity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: competitorActivityResponse,
    isLoading,
    error,
  } = useCompetitorActivities({
    search,
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const competitorActivities = competitorActivityResponse?.data || [];
  const totalCount = competitorActivityResponse?.meta?.total_count || 0;
  const currentPage = (competitorActivityResponse?.meta?.current_page || 1) - 1;

  const deleteCompetitorActivityMutation = useDeleteCompetitorActivity();
  const exportToExcelMutation = useExportToExcel();

  const totalActivities = competitorActivityResponse?.stats?.total_records ?? 0;
  const activeActivities =
    competitorActivityResponse?.stats?.active_records ?? 0;
  const inactiveActivities =
    competitorActivityResponse?.stats?.inactive_records ?? 0;
  const activitiesThisMonth =
    competitorActivityResponse?.stats?.this_month_records ?? 0;

  const handleCreateActivity = useCallback(() => {
    setSelectedActivity(null);
    setDrawerOpen(true);
  }, []);

  const handleEditActivity = useCallback((activity: CompetitorActivity) => {
    setSelectedActivity(activity);
    setDrawerOpen(true);
  }, []);

  const handleDeleteActivity = useCallback(
    async (id: number) => {
      try {
        await deleteCompetitorActivityMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting competitor activity:', error);
      }
    },
    [deleteCompetitorActivityMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'competitor_activity',
        filters,
      });
    } catch (error) {
      console.error('Error exporting competitor activities:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getVisibilityScoreColor = (
    score: number | null
  ): 'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default' => {
    if (score === null || score === undefined) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const competitorActivityColumns: TableColumn<CompetitorActivity>[] = [
    {
      id: 'customer_info',
      label: 'Customer Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.competitor_activity_customers?.name || 'Customer'}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Building2 className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.competitor_activity_customers?.name || 'Unknown Customer'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.competitor_activity_customers?.code ||
                `Customer #${row.customer_id}`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'brand_product',
      label: 'Brand & Product',
      render: (_value, row) => (
        <Box>
          <Typography
            variant="body1"
            className="!text-gray-900 !leading-tight !font-medium"
          >
            {row.brand_name}
          </Typography>
          {row.product_name && (
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.product_name}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'price',
      label: 'Price',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-medium">
            {row.observed_price
              ? `${Number(row.observed_price).toFixed(2)}`
              : 'N/A'}
          </span>
        </Box>
      ),
    },
    {
      id: 'visibility_score',
      label: 'Visibility',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Eye className="w-3 h-3 text-gray-400" />
          <Chip
            label={row.visibility_score ? `${row.visibility_score}%` : 'N/A'}
            color={getVisibilityScoreColor(row.visibility_score ?? null)}
            size="small"
          />
        </Box>
      ),
    },
    {
      id: 'promotion',
      label: 'Promotion',
      render: (_value, row) => (
        <Tooltip
          title={row.promotion_details || 'No promotion details'}
          placement="top"
          arrow
        >
          <Box className="flex items-center gap-1">
            <Target className="w-3 h-3 text-gray-400" />
            <span className="text-xs truncate max-w-24">
              {row.promotion_details || 'None'}
            </span>
          </Box>
        </Tooltip>
      ),
    },
    {
      id: 'visit_info',
      label: 'Visit Info',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.visits ? formatDate(row.visits.visit_date) : 'No visit'}
          </span>
        </Box>
      ),
    },
    {
      id: 'image',
      label: 'Image',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Image className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.image_url ? 'Available' : 'None'}
          </span>
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Active Status',
      render: (_value, row) => (
        <Chip
          icon={row.is_active === 'Y' ? <CheckCircle /> : <Block />}
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          color={row.is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleEditActivity(row)}
            tooltip={`Edit Activity #${row.id}`}
          />
          <DeleteButton
            onClick={() => handleDeleteActivity(row.id)}
            tooltip={`Delete Activity #${row.id}`}
            itemName={`Activity #${row.id}`}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Competitor Activities
          </p>
          <p className="!text-gray-500 text-sm">
            Track competitor activities, pricing, and market intelligence
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Activities
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalActivities}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Activities
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeActivities}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-500">
                Inactive Activities
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-500">
                  {inactiveActivities}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Block className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">This Month</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {activitiesThisMonth}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load competitor activities. Please try again.
        </Alert>
      )}

      <Table
        data={competitorActivities}
        columns={competitorActivityColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Activities..."
                value={search}
                onChange={handleSearchChange}
                debounceMs={400}
                showClear={true}
                className="!w-80"
              />
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="!w-32"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <PopConfirm
                title="Export Competitor Activities"
                description="Are you sure you want to export the current competitor activity data to Excel? This will include all filtered results."
                onConfirm={handleExportToExcel}
                confirmText="Export"
                cancelText="Cancel"
                placement="top"
              >
                <Button
                  variant="outlined"
                  className="!capitalize"
                  startIcon={<Download />}
                  disabled={exportToExcelMutation.isPending}
                >
                  {exportToExcelMutation.isPending ? 'Exporting...' : 'Export'}
                </Button>
              </PopConfirm>
              <Button
                variant="outlined"
                className="!capitalize"
                startIcon={<Upload />}
                onClick={() => setImportModalOpen(true)}
              >
                Import
              </Button>
              <Button
                variant="contained"
                className="!capitalize"
                disableElevation
                startIcon={<Add />}
                onClick={handleCreateActivity}
              >
                Create
              </Button>
            </div>
          </div>
        }
        getRowId={activity => activity.id}
        initialOrderBy="createdate"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No competitor activities found matching "${search}"`
            : 'No competitor activities found in the system'
        }
      />

      <ManageCompetitorActivity
        selectedActivity={selectedActivity}
        setSelectedActivity={setSelectedActivity}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCompetitorActivity
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default CompetitorActivityManagement;
