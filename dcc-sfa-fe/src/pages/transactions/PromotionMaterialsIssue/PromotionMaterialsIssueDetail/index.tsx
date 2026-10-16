import {
  Cancel,
  CheckCircle,
  HourglassEmpty,
  Receipt,
} from '@mui/icons-material';
import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { usePromotionMaterialsIssue } from 'hooks/usePromotionMaterialsIssue';
import { AlertTriangle, ArrowLeft, FileText, Package } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';
import GoodsIssueNoteModal from '../GoodsIssueNote';

/**
 * Detail view for a Promotion Materials Issue record.
 * Follows the standard DCC-SFA 2-column detail layout (summary card on left, info cards on right).
 */
const PromotionMaterialsIssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const issueId = Number(id) || 0;
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);

  const {
    data: issueResponse,
    isLoading,
    isFetching,
    error,
  } = usePromotionMaterialsIssue(issueId);

  const issue = issueResponse?.data;

  /**
   * Navigates back to the promotion materials issue list.
   */
  const handleBack = () => {
    navigate('/transactions/promotion-materials-issue');
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col lg:flex-row items-start gap-4">
        <div className="w-full lg:!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="!absolute !top-3 !right-3">
              <Skeleton
                variant="circular"
                width={10}
                height={10}
                className="!bg-amber-200"
              />
            </div>

            <div className="!relative !mb-4">
              <Skeleton
                variant="circular"
                width={96}
                height={96}
                className="!mx-auto !border-3 !border-white"
              />
            </div>

            <Skeleton
              variant="text"
              width="70%"
              height={24}
              className="!mx-auto !mb-1"
            />
            <Skeleton
              variant="text"
              width="50%"
              height={16}
              className="!mx-auto !mb-3"
            />

            <Skeleton
              variant="rectangular"
              width="60%"
              height={24}
              className="!mx-auto !mb-4 !bg-amber-50"
            />

            <div className="!space-y-2 !text-left !mt-4">
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={12}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="70%" height={16} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={12}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="60%" height={16} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={12}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="80%" height={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:!flex-4 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!flex !items-center !gap-2 !mb-4">
              <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                <Skeleton variant="circular" width={18} height={18} />
              </div>
              <Skeleton variant="text" width={180} height={24} />
            </div>
            <div className="!flex !flex-col md:!flex-row !justify-between !gap-6">
              {[1, 2, 3].map(col => (
                <div key={col} className="!flex-1 !space-y-4">
                  <div className="!space-y-1">
                    <Skeleton variant="text" width="40%" height={12} />
                    <Skeleton variant="text" width="80%" height={18} />
                  </div>
                  <div className="!space-y-1">
                    <Skeleton variant="text" width="40%" height={12} />
                    <Skeleton variant="text" width="70%" height={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <Skeleton
              variant="text"
              width={120}
              height={24}
              className="!mb-4"
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={140}
              className="!rounded"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load promotion materials issue details
            </Typography>
          </div>
          <Typography variant="body2" className="!text-gray-200">
            Please try again or contact your system administrator if this
            problem persists.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
          className="mt-4"
        >
          Back to Promotion Materials Issue
        </Button>
      </div>
    );
  }

  const items = issue.items || [];
  const lineCount = items.length;
  const totalQty = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );
  const totalValue =
    issue.total_value !== null && issue.total_value !== undefined
      ? Number(issue.total_value)
      : items.reduce(
          (sum, item) =>
            sum +
            (Number(item.total_value) ||
              Number(item.quantity) * (Number(item.unit_value) || 0)),
          0
        );

  const outletSubtext = [
    issue.outlet?.code,
    issue.outlet?.route?.name ||
      issue.outlet?.address ||
      issue.outlet?.city?.name,
  ]
    .filter(Boolean)
    .join(' · ');

  const issuedByName = issue.issued_by?.name || 'Admin';
  const issuedTimestamp = issue.createdate || issue.issue_date;

  /**
   * Reusable card container used across detail pages.
   */
  const InfoCard = ({
    title,
    children,
    icon: Icon,
    extra,
    padding = 6,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ElementType;
    extra?: React.ReactNode;
    padding?: number;
  }) => (
    <div
      className={`!bg-white !rounded-lg !shadow !border !border-gray-200 !p-${padding} !relative !overflow-hidden`}
    >
      <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
      <div className="!relative !z-10">
        <div className="!flex !items-center !justify-between !mb-4">
          <div className="!flex !items-center !gap-2">
            {Icon && (
              <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                <Icon className="!text-primary-500 w-5 h-5" />
              </div>
            )}
            <Typography variant="h6" className="!font-bold !text-gray-900">
              {title}
            </Typography>
          </div>
          {extra}
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row items-start gap-4">
        <div className="w-full lg:!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  issue.approval_status === 'A'
                    ? '!bg-green-400'
                    : issue.approval_status === 'R'
                      ? '!bg-red-400'
                      : '!bg-amber-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-green-400 !to-green-600 !text-white':
                      issue.approval_status === 'A',
                    '!bg-gradient-to-br !from-red-400 !to-red-600 !text-white':
                      issue.approval_status === 'R',
                    '!bg-gradient-to-br !from-amber-400 !to-amber-600 !text-white':
                      issue.approval_status === 'P',
                  }
                )}
              >
                <FileText className="!w-10 !h-10" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              {issue.gin_number}
            </Typography>

            <Typography
              variant="body2"
              className="!text-gray-600 !mb-3 hover:!text-blue-600 cursor-pointer transition-colors"
              onClick={() => {
                if (issue.outlet_id) {
                  navigate(`/masters/outlets/${issue.outlet_id}`);
                }
              }}
            >
              {issue.outlet?.name || 'Unknown Outlet'}
            </Typography>

            <div className="!flex !justify-center !gap-2 !mb-4">
              {issue.approval_status === 'A' ? (
                <Chip
                  icon={<CheckCircle fontSize="small" />}
                  label="Approved"
                  size="small"
                  color="success"
                  variant="outlined"
                  className="!font-semibold !bg-green-50 !text-green-700 !border-green-200"
                />
              ) : issue.approval_status === 'R' ? (
                <Chip
                  icon={<Cancel fontSize="small" />}
                  label="Rejected"
                  size="small"
                  color="error"
                  variant="outlined"
                  className="!font-semibold !bg-red-50 !text-red-700 !border-red-200"
                />
              ) : (
                <Chip
                  icon={<HourglassEmpty fontSize="small" />}
                  label="Pending Approval"
                  size="small"
                  color="warning"
                  variant="outlined"
                  className="!font-semibold !bg-amber-50 !text-amber-700 !border-amber-200"
                />
              )}
            </div>

            <div className="!space-y-1 !text-left !mt-4">
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5 !block"
                >
                  Total Value
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  TZS {Number(totalValue).toLocaleString()}
                </Typography>
              </div>

              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5 !block"
                >
                  Total Quantity
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {totalQty} pcs ({lineCount}{' '}
                  {lineCount === 1 ? 'item' : 'items'})
                </Typography>
              </div>

              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5 !block"
                >
                  Issue Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(issue.issue_date)}
                </Typography>
              </div>
            </div>

            <div className="!mt-2 pt-2 !border-t !border-gray-100 !space-y-2">
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Receipt className="w-4 h-4" />}
                onClick={() => setIsPrintModalOpen(true)}
                className="!w-full"
              >
                Print Goods Issue Note
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full lg:!flex-4 flex flex-col gap-4">
          <InfoCard title="Issue Information" icon={FileText}>
            <div className="!flex !flex-col md:!flex-row !justify-between !gap-6">
              <div className="!flex-1 !space-y-4">
                <div>
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !block !mb-1"
                  >
                    Issue Depot
                  </Typography>
                  <Typography
                    variant="body1"
                    className="!font-semibold !text-gray-900 !text-base"
                  >
                    {issue.depot?.name || 'N/A'}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !block !mb-1"
                  >
                    Reference / Campaign
                  </Typography>
                  <Typography
                    variant="body1"
                    className="!font-semibold !text-gray-900 !text-base"
                  >
                    {issue.campaign_reference || 'N/A'}
                  </Typography>
                </div>
              </div>

              <div className="!flex-1 !space-y-4">
                <div>
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !block !mb-1"
                  >
                    Outlet
                  </Typography>
                  <Typography
                    variant="body1"
                    className="!font-semibold !text-blue-600 !text-base hover:!underline cursor-pointer"
                    onClick={() => {
                      if (issue.outlet_id) {
                        navigate(`/masters/outlets/${issue.outlet_id}`);
                      }
                    }}
                  >
                    {issue.outlet?.name || 'N/A'}
                  </Typography>
                  {outletSubtext && (
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !block !mt-0.5"
                    >
                      {outletSubtext}
                    </Typography>
                  )}
                </div>

                <div>
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !block !mb-1"
                  >
                    Issued By
                  </Typography>
                  <Typography
                    variant="body1"
                    className="!font-semibold !text-gray-900 !text-base"
                  >
                    {issuedByName}
                  </Typography>
                  {issuedTimestamp && (
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !block !mt-0.5"
                    >
                      {dayjs(issuedTimestamp).format('MMM DD, YYYY, h:mm A')}
                    </Typography>
                  )}
                </div>
              </div>

              <div className="!flex-1 !space-y-4">
                <div>
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !block !mb-1"
                  >
                    Issue Date
                  </Typography>
                  <Typography
                    variant="body1"
                    className="!font-semibold !text-gray-900 !text-base"
                  >
                    {issue.issue_date
                      ? dayjs(issue.issue_date).format('MMM DD, YYYY')
                      : '-'}
                  </Typography>
                </div>

                <div>
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !block !mb-1"
                  >
                    Approved By
                  </Typography>
                  {issue.approval_status === 'A' ? (
                    <div>
                      <Chip
                        icon={<CheckCircle fontSize="small" />}
                        label="Approved"
                        size="small"
                        color="success"
                        variant="outlined"
                        className="!font-semibold !bg-green-50 !text-green-700 !border-green-200"
                      />
                      {issue.approved_by?.name && (
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-900 !mt-1"
                        >
                          {issue.approved_by.name}
                        </Typography>
                      )}
                      {issue.approved_at && (
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !block !mt-0.5"
                        >
                          {dayjs(issue.approved_at).format(
                            'MMM DD, YYYY, h:mm A'
                          )}
                        </Typography>
                      )}
                    </div>
                  ) : issue.approval_status === 'R' ? (
                    <Chip
                      icon={<Cancel fontSize="small" />}
                      label="Rejected"
                      size="small"
                      color="error"
                      variant="outlined"
                      className="!font-semibold !bg-red-50 !text-red-700 !border-red-200"
                    />
                  ) : (
                    <Chip
                      icon={<HourglassEmpty fontSize="small" />}
                      label="Awaiting Approval"
                      size="small"
                      color="warning"
                      variant="outlined"
                      className="!font-semibold !bg-amber-50 !text-amber-700 !border-amber-200"
                    />
                  )}
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="Items"
            icon={Package}
            extra={
              <Typography variant="body2" className="!text-gray-500 !text-sm">
                {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {totalQty}{' '}
                pcs
              </Typography>
            }
          >
            <div className="!overflow-x-auto !-mx-6 !-mb-6">
              <table className="!w-full !text-left !border-collapse">
                <thead>
                  <tr className="!border-t !border-b !border-gray-200 !bg-blue-50/40">
                    <th className="!py-3 !px-4 !text-xs !font-bold !text-gray-700 !uppercase !tracking-wider !w-12 !text-center">
                      #
                    </th>
                    <th className="!py-3 !px-4 !text-xs !font-bold !text-gray-700 !uppercase !tracking-wider">
                      Item
                    </th>
                    <th className="!py-3 !px-4 !text-xs !font-bold !text-gray-700 !uppercase !tracking-wider">
                      Code
                    </th>
                    <th className="!py-3 !px-4 !text-xs !font-bold !text-gray-700 !uppercase !tracking-wider">
                      UOM
                    </th>
                    <th className="!py-3 !px-4 !text-xs !font-bold !text-gray-700 !uppercase !tracking-wider !text-center">
                      Qty
                    </th>
                    <th className="!py-3 !px-4 !text-xs !font-bold !text-gray-700 !uppercase !tracking-wider !text-right">
                      Unit Value
                    </th>
                    <th className="!py-3 !px-4 !text-xs !font-bold !text-gray-700 !uppercase !tracking-wider !text-right">
                      Line Total
                    </th>
                  </tr>
                </thead>
                <tbody className="!divide-y !divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="!py-6 !text-center !text-gray-500 !text-sm"
                      >
                        No items found in this issue.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      const lineTotal =
                        Number(item.total_value) ||
                        Number(item.quantity) * (Number(item.unit_value) || 0);

                      return (
                        <tr
                          key={item.id || index}
                          className="hover:!bg-gray-50/60 !transition-colors"
                        >
                          <td className="!py-3.5 !px-4 !text-gray-500 !text-sm !text-center">
                            {index + 1}
                          </td>
                          <td className="!py-3.5 !px-4 !font-medium !text-gray-900 !text-sm">
                            {item.material?.name || '-'}
                          </td>
                          <td className="!py-3.5 !px-4 !text-gray-600 !font-mono !text-xs">
                            {item.material?.code || '-'}
                          </td>
                          <td className="!py-3.5 !px-4 !text-gray-600 !text-sm">
                            {item.material?.uom || 'Pcs'}
                          </td>
                          <td className="!py-3.5 !px-4 !text-gray-900 !font-semibold !text-sm !text-center">
                            {item.quantity}
                          </td>
                          <td className="!py-3.5 !px-4 !text-gray-900 !text-sm !text-right">
                            {Number(item.unit_value || 0).toLocaleString()}
                          </td>
                          <td className="!py-3.5 !px-4 !text-gray-900 !font-semibold !text-sm !text-right">
                            {Number(lineTotal).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {items.length > 0 && (
                  <tfoot>
                    <tr className="!border-t-2 !border-gray-200 !bg-gray-50/40">
                      <td className="!py-3.5 !px-4"></td>
                      <td className="!py-3.5 !px-4 !font-bold !text-gray-900 !text-sm">
                        Total
                      </td>
                      <td className="!py-3.5 !px-4"></td>
                      <td className="!py-3.5 !px-4"></td>
                      <td className="!py-3.5 !px-4 !font-bold !text-gray-900 !text-sm !text-center">
                        {totalQty}
                      </td>
                      <td className="!py-3.5 !px-4"></td>
                      <td className="!py-3.5 !px-4 !font-bold !text-gray-900 !text-sm !text-right">
                        TZS {Number(totalValue).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </InfoCard>

          {issue.notes && (
            <InfoCard title="Notes" icon={FileText}>
              <Typography
                variant="body2"
                className="!text-gray-700 !text-sm !leading-relaxed"
              >
                {issue.notes}
              </Typography>
            </InfoCard>
          )}
        </div>
      </div>

      {issue && (
        <GoodsIssueNoteModal
          open={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          issueId={issue.id}
          ginNumber={issue.gin_number}
        />
      )}
    </div>
  );
};

export default PromotionMaterialsIssueDetail;
