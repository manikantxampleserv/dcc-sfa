import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useSurveyResponse } from 'hooks/useSurveyResponses';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  FileText,
  User,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const SurveyResponseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useSurveyResponse(Number(id));

  const handleBack = () => {
    navigate('/reports/survey-responses');
  };

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Text',
      textarea: 'Textarea',
      number: 'Number',
      select: 'Select',
      checkbox: 'Checkbox',
      radio: 'Radio',
      date: 'Date',
      time: 'Time',
      photo: 'Photo',
      signature: 'Signature',
    };
    return labels[type] || type;
  };

  if (isLoading || isFetching) {
    return (
      <div className="!flex !items-start !gap-4">
        <div className="!flex-2 !flex !flex-col !gap-4">
          {/* Main Response Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="!absolute !top-3 !right-3">
              <Skeleton
                variant="circular"
                width={10}
                height={10}
                className="!bg-green-200"
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
              className="!mx-auto !mb-4 !bg-green-50"
            />

            <div className="!space-y-2 !text-left !mt-4">
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="30%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="60%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="70%" height={14} />
              </div>
            </div>
          </div>

          {/* Response Information Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={140} height={20} />
              </div>
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                {[1, 2, 3, 4].map(field => (
                  <div key={field} className="!space-y-1">
                    <Skeleton
                      variant="text"
                      width={`${40 + field * 8}%`}
                      height={12}
                    />
                    <Skeleton
                      variant="text"
                      width={`${60 + field * 6}%`}
                      height={16}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="!flex-4 !space-y-4">
          {/* Survey Answers Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={200} height={20} />
              </div>

              <div className="!space-y-3">
                {[1, 2, 3].map(item => (
                  <div
                    key={item}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between">
                      <div className="!flex-1">
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={16}
                          className="!mb-1"
                        />
                        <Skeleton variant="text" width="40%" height={12} />
                      </div>
                      <Skeleton
                        variant="text"
                        width={80}
                        height={16}
                        className="!text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={200} height={20} />
              </div>

              <div className="!space-y-3">
                {[1, 2, 3].map(item => (
                  <div
                    key={item}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between">
                      <div className="!flex-1">
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={16}
                          className="!mb-1"
                        />
                        <Skeleton variant="text" width="40%" height={12} />
                      </div>
                      <Skeleton
                        variant="text"
                        width={80}
                        height={16}
                        className="!text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load survey response details
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
          Back to Survey Responses
        </Button>
      </div>
    );
  }

  const InfoCard = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className="!bg-white mt-4 !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
      <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
      <div className="!relative !z-10">
        <div className="!flex !items-center !gap-2 !mb-4">
          {Icon && (
            <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
              <Icon className="!text-primary-500" />
            </div>
          )}
          <Typography variant="h6" className="!font-bold !text-gray-900">
            {title}
          </Typography>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="!flex-2 flex flex-col">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  response.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                      response.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      response.is_active !== 'Y',
                  }
                )}
              >
                <FileText className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              Response #{response.id}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {response.survey?.name || `Survey #${response.parent_id}`}
            </Typography>

            <Chip
              label={response.is_active === 'Y' ? 'Active' : 'Inactive'}
              className={`${
                response.is_active === 'Y'
                  ? '!bg-green-100 !text-green-800'
                  : '!bg-gray-100 !text-gray-800'
              } font-semibold`}
              size="small"
            />

            <div className="!space-y-1 !text-left !mt-4">
              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Submitted At
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {response.submitted_at
                    ? formatDate(
                        typeof response.submitted_at === 'string'
                          ? response.submitted_at
                          : response.submitted_at?.toString() || ''
                      )
                    : 'Not submitted'}
                </Typography>
              </div>

              {response.location && (
                <div className="!p-1 !bg-gray-50 !rounded-md">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                  >
                    Location
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {response.location}
                  </Typography>
                </div>
              )}

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Total Answers
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {response.answers?.length || 0} answers
                </Typography>
              </div>
            </div>
          </div>
          {/* Statistics */}
          <InfoCard title="Response Statistics" icon={BarChart3}>
            <div className="!space-y-3">
              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Total Answers
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      Number of fields answered
                    </Typography>
                  </div>
                  <Typography
                    variant="h6"
                    className="!font-bold !text-primary-600"
                  >
                    {response.answers?.length || 0}
                  </Typography>
                </div>
              </div>

              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Status
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      Current response status
                    </Typography>
                  </div>
                  <Chip
                    variant="outlined"
                    label={response.is_active === 'Y' ? 'Active' : 'Inactive'}
                    color={response.is_active === 'Y' ? 'success' : 'error'}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="!flex-4 !space-y-4">
          <InfoCard title="Response Information" icon={FileText}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Survey
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {response.survey?.name || `Survey #${response.parent_id}`}
                </Typography>
                {response.survey?.description && (
                  <Typography variant="caption" className="!text-gray-500">
                    {response.survey.description}
                  </Typography>
                )}
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Submitted By
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {response.submitted_user?.name ||
                    `User #${response.submitted_by}`}
                </Typography>
                {response.submitted_user?.email && (
                  <Typography variant="caption" className="!text-gray-500">
                    {response.submitted_user.email}
                  </Typography>
                )}
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Submitted Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {response.submitted_at
                    ? formatDate(
                        typeof response.submitted_at === 'string'
                          ? response.submitted_at
                          : response.submitted_at?.toString() || ''
                      )
                    : 'Not available'}
                </Typography>
              </div>

              {response.location && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Location
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {response.location}
                  </Typography>
                </div>
              )}

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Created Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {response.createdate
                    ? formatDate(
                        typeof response.createdate === 'string'
                          ? response.createdate
                          : response.createdate?.toString() || ''
                      )
                    : 'Not available'}
                </Typography>
              </div>
            </div>
          </InfoCard>
          {/* Survey Answers */}
          <InfoCard title="Survey Answers" icon={BarChart3}>
            {response.answers && response.answers.length > 0 ? (
              <div className="!space-y-3">
                {response.answers.map((answer, index) => (
                  <div
                    key={answer.id || index}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between !mb-2">
                      <div className="!flex !items-center !gap-2">
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {answer.field?.name || `Field #${answer.field_id}`}
                        </Typography>
                        {answer.field?.type && (
                          <Chip
                            label={getFieldTypeLabel(answer.field.type)}
                            size="small"
                            color="primary"
                            className="!text-xs"
                          />
                        )}
                      </div>
                    </div>
                    <Typography
                      variant="body1"
                      className="!text-gray-700 !mt-2 !p-2 !bg-white !rounded !border !border-gray-200"
                    >
                      {answer.answer || (
                        <span className="!text-gray-400 italic">
                          No answer provided
                        </span>
                      )}
                    </Typography>
                  </div>
                ))}
              </div>
            ) : (
              <div className="!text-center !py-8 !text-gray-500">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No answers provided for this response.
                </Typography>
              </div>
            )}
          </InfoCard>
        </div>
      </div>

      {(response.customer || response.survey_response_customer) && (
        <InfoCard title="Customer Information" icon={User}>
          {(() => {
            const customer =
              response.customer || response.survey_response_customer;
            if (!customer) return null;

            return (
              <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-4">
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Customer Name
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {customer.name}
                  </Typography>
                </div>

                {customer.code && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Customer Code
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {customer.code}
                    </Typography>
                  </div>
                )}

                {customer.type && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Customer Type
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {customer.type}
                    </Typography>
                  </div>
                )}

                {customer.contact_person && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Contact Person
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {customer.contact_person}
                    </Typography>
                  </div>
                )}

                {customer.phone_number && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Phone Number
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {customer.phone_number}
                    </Typography>
                  </div>
                )}

                {customer.email && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Email
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900 !break-all"
                    >
                      {customer.email}
                    </Typography>
                  </div>
                )}

                {(customer.city || customer.state || customer.zipcode) && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Location
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {[customer.city, customer.state, customer.zipcode]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </Typography>
                  </div>
                )}

                {customer.address && (
                  <div className="!space-y-0.5 md:!col-span-2 lg:!col-span-3">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Address
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {customer.address}
                    </Typography>
                  </div>
                )}

                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Credit Limit
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    ₹{Number(customer.credit_limit).toLocaleString()}
                  </Typography>
                </div>

                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Outstanding Amount
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-red-600"
                  >
                    ₹{Number(customer.outstanding_amount).toLocaleString()}
                  </Typography>
                </div>

                <div className="!space-y-0.5 flex flex-col items-start">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Status
                  </Typography>
                  <Chip
                    label={customer.is_active === 'Y' ? 'Active' : 'Inactive'}
                    size="small"
                    color={customer.is_active === 'Y' ? 'success' : 'error'}
                    variant="outlined"
                  />
                </div>
              </div>
            );
          })()}
        </InfoCard>
      )}

      <div className="!mt-4">
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
        >
          Back to Survey Responses
        </Button>
      </div>
    </>
  );
};

export default SurveyResponseDetail;
