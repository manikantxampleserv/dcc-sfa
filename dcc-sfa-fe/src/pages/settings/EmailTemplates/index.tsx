import { Add, CheckCircle } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTemplates, useDeleteTemplate } from 'hooks/useTemplates';
import type { Template } from 'services/templates';
import { usePermission } from 'hooks/usePermission';
import { Mail } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageEmailTemplates from './ManageEmailTemplates';

const EmailTemplates: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'asset-type' as any
  );

  const {
    data: templatesResponse,
    isFetching,
    error,
  } = useTemplates(
    {
      search,
      page,
      limit,
      ...(statusFilter !== 'all' && { channel: statusFilter }),
    },
    {
      enabled: isRead,
    }
  );

  const templates = templatesResponse?.data || [];
  const totalCount = templatesResponse?.meta?.total_count || 0;
  const currentPage = (templatesResponse?.meta?.current_page || 1) - 1;

  const deleteTemplateMutation = useDeleteTemplate();

  const totalTemplates =
    templatesResponse?.stats?.total_templates ?? templates.length;
  const newTemplatesThisMonth =
    templatesResponse?.stats?.new_templates_this_month ?? 0;
  const totalChannels = templatesResponse?.stats?.total_channels ?? 0;
  const totalTypes = templatesResponse?.stats?.total_types ?? 0;

  const handleCreateTemplate = useCallback(() => {
    setSelectedTemplate(null);
    setDrawerOpen(true);
  }, []);

  const handleEditTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setDrawerOpen(true);
  }, []);

  const handleDeleteTemplate = useCallback(
    async (id: number) => {
      try {
        await deleteTemplateMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    },
    [deleteTemplateMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const templateColumns: TableColumn<Template>[] = [
    {
      id: 'name',
      label: 'Template Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Mail className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name}
            </Typography>
            {row.subject && (
              <Tooltip title={row.subject} placement="top" arrow>
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !block !mt-0.5"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    maxWidth: '300px',
                    cursor: 'help',
                  }}
                >
                  Subject: {row.subject}
                </Typography>
              </Tooltip>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'channel',
      label: 'Channel',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.channel || (
            <span className="italic text-gray-400">No Channel</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.type || <span className="italic text-gray-400">No Type</span>}
        </Typography>
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(row.createdate?.toString()) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Template) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditTemplate(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteTemplate(row.id)}
                    tooltip={`Delete ${row.name}`}
                    itemName={row.name}
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
          <p className="!font-bold text-xl !text-gray-900">Email Templates</p>
          <p className="!text-gray-500 text-sm">
            Manage Email Templates, categories, and brands for your organization
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Templates"
          value={totalTemplates}
          icon={<Mail className="w-6 h-6" />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="New This Month"
          value={newTemplatesThisMonth}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Channels"
          value={totalChannels}
          icon={<CheckCircle className="w-6 h-6" />}
          color="purple"
          isLoading={isFetching}
        />
        <StatsCard
          title="Types"
          value={totalTypes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="orange"
          isLoading={isFetching}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load Email Templates. Please try again.
        </Alert>
      )}

      <Table
        data={templates}
        columns={templateColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Email Templates..."
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="!w-32"
                      disableClearable
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateTemplate}
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
        getRowId={template => template.id}
        initialOrderBy="name"
        loading={isFetching}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No Templates found matching "${search}"`
            : 'No Templates found in the system'
        }
      />

      <ManageEmailTemplates
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default EmailTemplates;
