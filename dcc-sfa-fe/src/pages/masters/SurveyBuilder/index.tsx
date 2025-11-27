import {
  Add,
  Block,
  CheckCircle,
  Download,
  Pause,
  PlayArrow,
  Settings,
  Upload,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { useDeleteSurvey, useSurveys, type Survey } from 'hooks/useSurveys';
import { BarChart3, FileText, Users } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportSurvey from './ImportSurvey';
import ManageSurvey from './ManageSurvey';

const SurveyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isCreate, isUpdate, isDelete, isRead } = usePermission('survey');

  const {
    data: surveysResponse,
    isLoading,
    error,
  } = useSurveys(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
    },
    {
      enabled: isRead,
    }
  );

  const surveys = surveysResponse?.data || [];
  const totalCount = surveysResponse?.meta?.total_count || 0;
  const currentPage = (surveysResponse?.meta?.current_page || 1) - 1;

  const deleteSurveyMutation = useDeleteSurvey();
  const exportToExcelMutation = useExportToExcel();

  const totalSurveys = surveysResponse?.stats?.total_surveys ?? surveys.length;
  const publishedSurveys = surveysResponse?.stats?.published_surveys ?? 0;
  const activeSurveys = surveysResponse?.stats?.active_surveys ?? 0;
  const totalResponses = surveysResponse?.stats?.total_responses ?? 0;

  const handleCreateSurvey = useCallback(() => {
    setSelectedSurvey(null);
    setDrawerOpen(true);
  }, []);

  const handleEditSurvey = useCallback((survey: Survey) => {
    setSelectedSurvey(survey);
    setDrawerOpen(true);
  }, []);

  const handleViewSurvey = useCallback(
    (survey: Survey) => {
      navigate(`/masters/surveys/${survey.id}`);
    },
    [navigate]
  );

  const handleDeleteSurvey = useCallback(
    async (id: number) => {
      try {
        await deleteSurveyMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting survey:', error);
      }
    },
    [deleteSurveyMutation]
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
        category: categoryFilter === 'all' ? undefined : categoryFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'surveys',
        filters,
      });
    } catch (error) {
      console.error('Error exporting surveys:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, categoryFilter]);

  const getCategoryColor = (
    category: string
  ): 'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default' => {
    const colors: Record<
      string,
      'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default'
    > = {
      cooler_inspection: 'primary',
      customer_feedback: 'success',
      outlet_audit: 'secondary',
      competitor_analysis: 'error',
      brand_visibility: 'warning',
      general: 'default',
    };
    return colors[category] || 'default';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      cooler_inspection: 'Cooler Inspection',
      customer_feedback: 'Customer Feedback',
      outlet_audit: 'Outlet Audit',
      competitor_analysis: 'Competitor Analysis',
      brand_visibility: 'Brand Visibility',
      general: 'General',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const surveyColumns: TableColumn<Survey>[] = [
    {
      id: 'title',
      label: 'Survey Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.title}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <FileText className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.title}
            </Typography>
            {row.description && (
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
                title={row.description}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'help',
                  width: '250px',
                }}
              >
                {row.description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      render: (_value, row) => (
        <Chip
          label={getCategoryLabel(row.category)}
          color={getCategoryColor(row.category)}
          size="small"
        />
      ),
    },
    {
      id: 'target_roles',
      label: 'Target Roles',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Users className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.target_roles || 'No roles specified'}
          </span>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Box className="flex gap-2 items-center">
          <Chip
            icon={
              Boolean(row.is_published) ? (
                <PlayArrow fontSize="small" />
              ) : (
                <Pause fontSize="small" />
              )
            }
            label={Boolean(row.is_published) ? 'Published' : 'Draft'}
            size="small"
            variant="outlined"
            color={Boolean(row.is_published) ? 'success' : 'warning'}
          />
          <Chip
            icon={
              row.is_active === 'Y' ? (
                <CheckCircle fontSize="small" />
              ) : (
                <Block fontSize="small" />
              )
            }
            label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
            size="small"
            variant="outlined"
            color={row.is_active === 'Y' ? 'success' : 'error'}
          />
        </Box>
      ),
    },
    {
      id: 'response_count',
      label: 'Responses',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <BarChart3 className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-medium">{row.response_count || 0}</span>
        </Box>
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(
          typeof row.createdate === 'string'
            ? row.createdate
            : row.createdate?.toString() || ''
        ) || <span className="italic text-gray-400">No Date</span>,
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Survey) => (
              <div className="!flex !gap-2 !items-center">
                {isRead && (
                  <ActionButton
                    onClick={() => handleViewSurvey(row)}
                    tooltip={`View ${row.title}`}
                    icon={<Visibility fontSize="small" />}
                    color="info"
                  />
                )}
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditSurvey(row)}
                    tooltip={`Edit ${row.title}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteSurvey(row.id)}
                    tooltip={`Delete ${row.title}`}
                    itemName={row.title}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Survey Builder</p>
          <p className="!text-gray-500 text-sm">
            Create and manage dynamic surveys for field operations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Surveys"
          value={totalSurveys}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Published"
          value={publishedSurveys}
          icon={<PlayArrow className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active"
          value={activeSurveys}
          icon={<Settings className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Responses"
          value={totalResponses}
          icon={<BarChart3 className="w-6 h-6" />}
          color="teal"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load surveys. Please try again.
        </Alert>
      )}

      <Table
        data={surveys}
        columns={surveyColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              {isRead && (
                <div className="flex flex-wrap items-center gap-2">
                  <SearchInput
                    placeholder="Search Surveys..."
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
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                  <Select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="!w-68"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="cooler_inspection">
                      Cooler Inspection
                    </MenuItem>
                    <MenuItem value="customer_feedback">
                      Customer Feedback
                    </MenuItem>
                    <MenuItem value="outlet_audit">Outlet Audit</MenuItem>
                    <MenuItem value="competitor_analysis">
                      Competitor Analysis
                    </MenuItem>
                    <MenuItem value="brand_visibility">
                      Brand Visibility
                    </MenuItem>
                    <MenuItem value="general">General</MenuItem>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Surveys"
                    description="Are you sure you want to export the current survey data to Excel? This will include all filtered results."
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
                      {exportToExcelMutation.isPending
                        ? 'Exporting...'
                        : 'Export'}
                    </Button>
                  </PopConfirm>
                )}
                {isCreate && (
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateSurvey}
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={survey => survey.id}
        initialOrderBy="title"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        isPermission={isRead}
        emptyMessage={
          search
            ? `No surveys found matching "${search}"`
            : 'No surveys found in the system'
        }
      />

      <ManageSurvey
        selectedSurvey={selectedSurvey}
        setSelectedSurvey={setSelectedSurvey}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportSurvey
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default SurveyBuilder;
