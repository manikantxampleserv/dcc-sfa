import {
  CheckCircle,
  Description,
  Download,
  Visibility,
} from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import {
  useDeleteSurveyResponse,
  useSurveyResponses,
  type SurveyResponse,
} from 'hooks/useSurveyResponses';
import { useSurveys } from 'hooks/useSurveys';
import { BarChart3, Calendar, FileText, MapPin } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const SurveyResponses: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [surveyFilter, setSurveyFilter] = useState<number | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isRead } = usePermission('report');

  const {
    data: responsesResponse,
    isLoading,
    error,
  } = useSurveyResponses(
    {
      search,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      survey_id: surveyFilter,
    },
    {
      enabled: isRead,
    }
  );

  const { data: surveysResponse } = useSurveys({ limit: 1000 });
  const surveys = surveysResponse?.data || [];

  const responses = responsesResponse?.data || [];
  const totalCount = responsesResponse?.meta?.total || 0;
  const currentPage = (responsesResponse?.meta?.page || 1) - 1;

  const deleteResponseMutation = useDeleteSurveyResponse();
  const exportToExcelMutation = useExportToExcel();

  const totalResponses =
    responsesResponse?.stats?.total_records ?? responses.length;
  const activeResponses = responsesResponse?.stats?.active_records ?? 0;
  const inactiveResponses = responsesResponse?.stats?.inactive_records ?? 0;
  const responsesThisMonth = responsesResponse?.stats?.records_this_month ?? 0;

  const handleViewDetail = useCallback(
    (response: SurveyResponse) => {
      navigate(`/reports/survey-responses/${response.id}`);
    },
    [navigate]
  );

  const handleDeleteResponse = useCallback(
    async (id: number) => {
      try {
        await deleteResponseMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting survey response:', error);
      }
    },
    [deleteResponseMutation]
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
        survey_id: surveyFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'survey_responses',
        filters,
      });
    } catch (error) {
      console.error('Error exporting survey responses:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, surveyFilter]);

  const responseColumns: TableColumn<SurveyResponse>[] = [
    {
      id: 'survey',
      label: 'Survey Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.survey?.name || 'Survey'}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <FileText className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              className="!text-gray-900 !leading-tight !font-semibold"
            >
              {row.survey?.name || `Survey #${row.parent_id}`}
            </Typography>
            {row.survey?.description && (
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
                title={row.survey.description}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'help',
                  width: '250px',
                }}
              >
                {row.survey.description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (_value, row) => {
        const customer = row.customer || row.survey_response_customer;
        if (!customer) {
          return (
            <span className="text-xs text-gray-400 italic">No customer</span>
          );
        }
        return (
          <Box className="!flex !gap-2 !items-center">
            <Avatar
              alt={customer.name || 'Survey'}
              src="mkx"
              className="!rounded !bg-primary-100 !text-primary-500"
            />
            <Box>
              <Typography
                variant="body2"
                className="!leading-tight !font-semibold"
              >
                {customer.name}
              </Typography>
              {customer.code && (
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !block !mt-0.5"
                >
                  {customer.code}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'submitted_user',
      label: 'Submitted By',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.submitted_user?.name || 'Survey'}
            src="mkx"
            className="!rounded !bg-primary-100 !text-primary-500"
          />
          <Box>
            <Typography
              variant="body2"
              className="!text-gray-900 !leading-tight !font-semibold"
            >
              {row.submitted_user?.name}
            </Typography>
            {row?.submitted_user?.email && (
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
              >
                {row.submitted_user.email}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'submitted_at',
      label: 'Submitted At',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs">
            {row.submitted_at
              ? formatDate(
                  typeof row.submitted_at === 'string'
                    ? row.submitted_at
                    : row.submitted_at?.toString() || ''
                )
              : 'Not submitted'}
          </span>
        </Box>
      ),
    },
    {
      id: 'answers_count',
      label: 'Answers',
      render: (_value, row) => (
        <Box className="flex items-center gap-1">
          <BarChart3 className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-medium">
            {row.answers?.length || 0}
          </span>
        </Box>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      render: (_value, row) =>
        row.location ? (
          <Box className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs">{row.location}</span>
          </Box>
        ) : (
          <span className="text-xs text-gray-400 italic">No location</span>
        ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          icon={
            row.is_active === 'Y' ? (
              <CheckCircle fontSize="small" />
            ) : (
              <Description fontSize="small" />
            )
          }
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          color={row.is_active === 'Y' ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <ActionButton
            onClick={() => handleViewDetail(row)}
            tooltip={`View ${row.survey?.name || 'Response'}`}
            icon={<Visibility fontSize="small" />}
            color="info"
          />
          <DeleteButton
            onClick={() => handleDeleteResponse(row.id)}
            tooltip={`Delete response`}
            itemName="survey response"
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
          <p className="!font-bold text-xl !text-gray-900">Survey Responses</p>
          <p className="!text-gray-500 text-sm">
            View and manage survey responses submitted by users
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Responses"
          value={totalResponses}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />

        <StatsCard
          title="Active"
          value={activeResponses}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />

        <StatsCard
          title="Inactive"
          value={inactiveResponses}
          icon={<FileText className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />

        <StatsCard
          title="This Month"
          value={responsesThisMonth}
          icon={<Calendar className="w-6 h-6" />}
          color="teal"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load survey responses. Please try again.
        </Alert>
      )}

      <Table
        data={responses}
        columns={responseColumns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search Responses..."
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
                disableClearable
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
              <Select
                value={surveyFilter || 'all'}
                onChange={e =>
                  setSurveyFilter(
                    e.target.value === 'all'
                      ? undefined
                      : Number(e.target.value)
                  )
                }
                className="!w-68"
                disableClearable
              >
                <MenuItem value="all">All Surveys</MenuItem>
                {surveys.map(survey => (
                  <MenuItem key={survey.id} value={survey.id}>
                    {survey.title}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <PopConfirm
                title="Export Survey Responses"
                description="Are you sure you want to export the current survey response data to Excel? This will include all filtered results."
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
            </div>
          </div>
        }
        getRowId={response => response.id}
        initialOrderBy="submitted_at"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No responses found matching "${search}"`
            : 'No survey responses found in the system'
        }
      />
    </>
  );
};

export default SurveyResponses;
