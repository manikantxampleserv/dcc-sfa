/**
 * @fileoverview Outlet Promotional Materials Tab Component
 * @description Renders promotional materials summary, issued items, and issue history for a specific outlet
 * @version 1.0.0
 */

import {
  Add,
  Campaign,
  CheckCircle,
  ExpandLess,
  ExpandMore,
  HourglassEmpty,
  Inventory2Outlined,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useOutletPromotionalMaterials } from 'hooks/usePromotionalMaterials';
import { GoodsIssueNoteModal } from 'pages/transactions/PromotionMaterialsIssue/GoodsIssueNote';
import ManagePromotionalIssue from 'pages/transactions/PromotionMaterialsIssue/ManagePromotionalIssue';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrintButton, ViewButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import StatsCard from 'shared/StatsCard';

interface PromotionalMaterialsProps {
  outletId: number;
  depotId?: number;
}

/**
 * Promotional Materials tab content for Outlet Detail page matching client specification.
 */
export const PromotionalMaterials: React.FC<PromotionalMaterialsProps> = ({
  outletId,
  depotId,
}) => {
  const navigate = useNavigate();
  const [expandedIssueId, setExpandedIssueId] = useState<number | null>(null);
  const [selectedGinId, setSelectedGinId] = useState<number | null>(null);
  const [selectedGinNumber, setSelectedGinNumber] = useState<string>('');
  const [ginModalOpen, setGinModalOpen] = useState<boolean>(false);
  const [issueDrawerOpen, setIssueDrawerOpen] = useState<boolean>(false);

  const { data, isLoading, error } = useOutletPromotionalMaterials(outletId);

  const stats = {
    approved_issues:
      (data as any)?.stats?.approved_issues_count ??
      (data as any)?.stats?.approved_issues ??
      0,
    pieces_issued:
      (data as any)?.stats?.total_pieces_issued ??
      (data as any)?.stats?.pieces_issued ??
      0,
    value_issued:
      (data as any)?.stats?.total_value_issued ??
      (data as any)?.stats?.value_issued ??
      0,
    pending_approval:
      (data as any)?.stats?.pending_approval_count ??
      (data as any)?.stats?.pending_approval ??
      0,
  };

  const issuedItems = data?.issued_items || (data as any)?.items_issued || [];
  const issueHistory = data?.issue_history || (data as any)?.issues || [];

  const handleToggleExpand = (issueId: number) => {
    setExpandedIssueId(prev => (prev === issueId ? null : issueId));
  };

  const handleOpenGinModal = (issueId: number, ginNumber: string) => {
    setSelectedGinId(issueId);
    setSelectedGinNumber(ginNumber);
    setGinModalOpen(true);
  };

  if (isLoading) {
    return (
      <Box className="!p-2 !space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(idx => (
            <Skeleton
              key={idx}
              variant="rectangular"
              height={88}
              className="!rounded-lg"
            />
          ))}
        </div>
        <Skeleton variant="rectangular" height={200} className="!rounded-lg" />
        <Skeleton variant="rectangular" height={250} className="!rounded-lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="!p-6">
        <Typography color="error">
          Failed to load promotional materials for this outlet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="!p-2 !space-y-2">
      {/**
       * Top 4 Stats Cards
       */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <StatsCard
          title="Approved Issues"
          value={Number(stats.approved_issues || 0)}
          icon={<CheckCircle className="!w-6 !h-6" />}
          color="green"
        />
        <StatsCard
          title="Pieces Issued"
          value={Number(stats.pieces_issued || 0).toLocaleString()}
          icon={<Inventory2Outlined className="!w-6 !h-6" />}
          color="blue"
        />
        <StatsCard
          title="Value Issued"
          value={`TZS ${Number(stats.value_issued || 0).toLocaleString()}`}
          icon={<TrendingUp className="!w-6 !h-6" />}
          color="purple"
        />
        <StatsCard
          title="Pending Approval"
          value={Number(stats.pending_approval || 0)}
          icon={<HourglassEmpty className="!w-6 !h-6" />}
          color="orange"
        />
      </div>

      {/**
       * Section 1: Items issued to this outlet
       */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-2 border-b border-gray-100 flex items-center justify-between">
          <Typography variant="subtitle1" className="!font-bold !text-gray-900">
            Items issued to this outlet
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            Approved issues only
          </Typography>
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead className="bg-blue-50">
              <TableRow>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Item
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Total Qty
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Total Value
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Last Issued
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issuedItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="!text-center !py-8 text-gray-400"
                  >
                    No promotional materials issued to this outlet yet.
                  </TableCell>
                </TableRow>
              ) : (
                issuedItems.map(
                  (item: {
                    material_id: React.Key | null | undefined;
                    material_name:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    material_code:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    total_quantity:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    uom: any;
                    total_value: any;
                    last_issued_date:
                      | string
                      | number
                      | Date
                      | dayjs.Dayjs
                      | null
                      | undefined;
                  }) => (
                    <TableRow key={item.material_id} hover>
                      <TableCell className="!p-2">
                        <Box className="!flex !items-center !gap-2">
                          <Avatar className="!rounded !bg-blue-50 !text-blue-600 !bg-blue-100 !h-10 !w-10">
                            <Campaign className="!w-5 !h-5 !text-blue-600" />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              className="!font-bold !text-gray-900 !leading-tight"
                            >
                              {item.material_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="!text-gray-500 font-mono !text-xs !block !mt-0.5"
                            >
                              {item.material_code}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell className="!p-2 !font-medium !text-gray-800">
                        {item.total_quantity} {item.uom || 'Pcs'}
                      </TableCell>
                      <TableCell className="!p-2 !font-medium !text-gray-900">
                        TZS {Number(item.total_value).toLocaleString()}
                      </TableCell>
                      <TableCell className="!p-2 !text-gray-600">
                        {item.last_issued_date
                          ? dayjs(item.last_issued_date).format('MMM DD, YYYY')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/**
       * Section 2: Issue history
       */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-2 border-b border-gray-100 flex items-center justify-between">
          <Typography variant="subtitle1" className="!font-bold !text-gray-900">
            Issue history
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            Expand a row to see item values
          </Typography>
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead className="bg-blue-50">
              <TableRow>
                <TableCell className="!w-12 !py-3" />
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  GIN No.
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Date
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Depot
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Items
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Qty
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Value
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3">
                  Status
                </TableCell>
                <TableCell className="!font-semibold !text-gray-600 !py-3 !text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issueHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="!text-center !py-8 text-gray-400"
                  >
                    No issue history records found.
                  </TableCell>
                </TableRow>
              ) : (
                issueHistory.map(
                  (issue: {
                    id: React.Key | null | undefined;
                    approval_status: string;
                    items: any;
                    gin_number:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    campaign_reference:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    issue_date:
                      | string
                      | number
                      | Date
                      | dayjs.Dayjs
                      | null
                      | undefined;
                    depot_name: any;
                    total_quantity: any;
                    total_value: any;
                  }) => {
                    const isExpanded = expandedIssueId === issue.id;
                    const isApproved = issue.approval_status === 'A';
                    const itemsSummary = (issue.items || [])
                      .map(
                        (it: { material_name: any; quantity: any }) =>
                          `${it.material_name || (it as any).name || 'Item'} ×${it.quantity || 0}`
                      )
                      .join(', ');

                    return (
                      <React.Fragment key={issue.id}>
                        <TableRow
                          hover
                          className={isExpanded ? 'bg-blue-50/30' : ''}
                        >
                          <TableCell className="!p-2">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleToggleExpand(issue.id as number)
                              }
                              className="!text-gray-500"
                            >
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </TableCell>
                          <TableCell className="!p-2">
                            <Box className="!flex !items-center !gap-2">
                              <Avatar className="!rounded !bg-blue-50 !text-blue-600 !bg-blue-100 !h-10 !w-10">
                                <Campaign className="!w-5 !h-5 !text-blue-600" />
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body2"
                                  className="!font-bold !text-gray-900 !leading-tight font-mono"
                                >
                                  {issue.gin_number}
                                </Typography>
                                {issue.campaign_reference && (
                                  <Typography
                                    variant="caption"
                                    className="!text-gray-500 !text-xs !block"
                                  >
                                    {issue.campaign_reference}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell className="!p-2 !text-gray-600">
                            {issue.issue_date
                              ? dayjs(issue.issue_date).format('MMM DD, YYYY')
                              : '-'}
                          </TableCell>
                          <TableCell className="!p-2 !text-gray-800">
                            {issue.depot_name ||
                              (issue as any).depot?.name ||
                              '-'}
                          </TableCell>
                          <TableCell
                            className="!p-2 !text-gray-700 !max-w-xs"
                            title={itemsSummary}
                          >
                            {itemsSummary
                              .split(',')
                              ?.map((item: string, index: number) => (
                                <Typography
                                  key={index}
                                  variant="caption"
                                  className="!text-gray-500 !text-xs !block !mt-0.5"
                                >
                                  {item}
                                </Typography>
                              ))}
                          </TableCell>
                          <TableCell className="!p-2 !font-medium !text-gray-900">
                            {Number(
                              issue.total_quantity ??
                                (issue as any).total_qty ??
                                0
                            )}
                          </TableCell>
                          <TableCell className="!p-2 !font-bold !text-gray-900">
                            TZS{' '}
                            {Number(issue.total_value || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="!p-2">
                            {isApproved ? (
                              <Chip
                                icon={<CheckCircle className="!w-4 !h-4" />}
                                label="Approved"
                                size="small"
                                color="success"
                              />
                            ) : issue.approval_status === 'R' ? (
                              <Chip
                                label="Rejected"
                                size="small"
                                color="error"
                              />
                            ) : (
                              <Chip
                                icon={<Schedule className="!w-4 !h-4" />}
                                label="Pending Approval"
                                size="small"
                                color="warning"
                              />
                            )}
                          </TableCell>
                          <TableCell className="!p-2 !text-center">
                            <Box className="!flex !items-center !justify-center !gap-2">
                              <ViewButton
                                size="medium"
                                tooltip="View Issue Details"
                                onClick={() =>
                                  navigate(
                                    `/transactions/promotion-materials-issue/${issue.id}`
                                  )
                                }
                              />
                              <PrintButton
                                size="medium"
                                tooltip="Print / View Goods Issue Note (GIN)"
                                onClick={() =>
                                  handleOpenGinModal(
                                    issue.id as number,
                                    issue.gin_number as string
                                  )
                                }
                              />
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/**
                         * Expanded breakdown of items in this GIN
                         */}
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="!p-0 !border-b !border-gray-200"
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Table
                                size="small"
                                className="bg-white rounded-lg border border-gray-200"
                              >
                                <TableHead className="bg-blue-50">
                                  <TableRow>
                                    <TableCell className="!font-semibold !py-3 !text-xs !text-gray-600">
                                      Material Item
                                    </TableCell>
                                    <TableCell className="!font-semibold !py-3 !text-xs !text-gray-600">
                                      Code
                                    </TableCell>
                                    <TableCell className="!font-semibold !py-3 !text-xs !text-gray-600">
                                      UOM
                                    </TableCell>
                                    <TableCell className="!font-semibold !py-3 !text-xs !text-gray-600">
                                      Quantity
                                    </TableCell>
                                    <TableCell className="!font-semibold !py-3 !text-xs !text-gray-600">
                                      Unit Value
                                    </TableCell>
                                    <TableCell className="!font-semibold !py-3 !text-xs !text-gray-600">
                                      Total Value
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {(issue.items || []).map((item: any) => (
                                    <TableRow key={item.id} hover>
                                      <TableCell className="!font-medium !text-gray-900 !py-2">
                                        {item.material_name ||
                                          item.name ||
                                          'Item'}
                                      </TableCell>
                                      <TableCell className="font-mono text-xs text-gray-500 !py-2">
                                        {item.material_code || item.code || '-'}
                                      </TableCell>
                                      <TableCell className="text-xs text-gray-600 !py-2">
                                        {item.uom || 'Pcs'}
                                      </TableCell>
                                      <TableCell className="!font-medium !text-gray-900 !py-2">
                                        {Number(item.quantity || 0)}
                                      </TableCell>
                                      <TableCell className="text-gray-700 !py-2">
                                        TZS{' '}
                                        {Number(
                                          item.unit_value || 0
                                        ).toLocaleString()}
                                      </TableCell>
                                      <TableCell className="!font-bold !text-gray-900 !py-2">
                                        TZS{' '}
                                        {Number(
                                          item.total_value || 0
                                        ).toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  }
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/**
       * Bottom-right Action Button
       */}
      <Box className="!flex !justify-end">
        <Button
          size="small"
          variant="contained"
          startIcon={<Add className="!w-5 !h-5" />}
          onClick={() => setIssueDrawerOpen(true)}
        >
          Issue Promotion Materials
        </Button>
      </Box>

      {/**
       * Modal for Previewing/Printing Goods Issue Note
       */}
      <GoodsIssueNoteModal
        open={ginModalOpen}
        onClose={() => setGinModalOpen(false)}
        issueId={selectedGinId}
        ginNumber={selectedGinNumber}
      />

      {/**
       * Drawer for creating a new issue preselected for this outlet
       */}
      <ManagePromotionalIssue
        open={issueDrawerOpen}
        onClose={() => setIssueDrawerOpen(false)}
        initialOutletId={outletId}
        initialDepotId={depotId}
      />
    </Box>
  );
};

export default PromotionalMaterials;
