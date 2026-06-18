import { CheckCircle, Settings } from '@mui/icons-material';
import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useSurvey } from 'hooks/useSurveys';
import { AlertTriangle, BarChart3, FileText } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { formatDate, formatDateTime } from 'utils/dateUtils';

const SurveyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: survey, isLoading, error, isFetching } = useSurvey(Number(id));
  const getCategoryColor = (
    category: string
  ): 'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default' => {
    const colors: Record<
      string,
      'primary' | 'success' | 'secondary' | 'error' | 'warning' | 'default'
    > = {
      cooler_inspection: 'primary',
      customer_feedback: 'success',
      outlet_audit: 'default',
      competitor_analysis: 'error',
      brand_visibility: 'warning',
      general: 'secondary',
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

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Text',
      textarea: 'Textarea',
      number: 'Number',
      select: 'Select',
      checkbox: survey?.is_matrix === 'Y' ? 'Multiple Select' : 'Checkbox',
      radio: survey?.is_matrix === 'Y' ? 'Single Select' : 'Radio',
      date: 'Date',
      product: 'Product Select',
    };
    return labels[type] || type;
  };

  const buildTree = (flatFields: any[]) => {
    const sortedFields = [...flatFields].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );

    const tree: any[] = [];
    const map = new Map();
    sortedFields.forEach(f => map.set(f.id, { ...f, child_fields: [] }));

    sortedFields.forEach(f => {
      if (f.parent_field_id) {
        const parent = map.get(f.parent_field_id);
        if (parent) {
          parent.child_fields.push(map.get(f.id));
        }
      } else {
        tree.push(map.get(f.id));
      }
    });
    return tree;
  };

  const surveyFieldsTree = React.useMemo(() => {
    if (!survey?.fields) return [];
    return buildTree(survey.fields);
  }, [survey?.fields]);

  const renderFieldNode = (field: any) => {
    const hasChildren = field.child_fields && field.child_fields.length > 0;
    const groups: { optVal: string; fields: any[] }[] = [];
    if (hasChildren) {
      field.child_fields.forEach((cf: any) => {
        const optVal = cf.parent_option_value || 'default';
        let group = groups.find(g => g.optVal === optVal);
        if (!group) {
          group = { optVal, fields: [] };
          groups.push(group);
        }
        group.fields.push(cf);
      });
    }

    return (
      <div
        key={field.id}
        className="!p-2 !bg-gray-50 !rounded-md !border !border-gray-200"
      >
        <div className="!flex !items-center !justify-between">
          <div className="!flex !items-center !gap-2">
            <Typography
              variant="body2"
              className="!font-semibold !text-gray-900"
            >
              {field.label}
            </Typography>
            {field.is_required && (
              <Chip
                label="Required"
                size="small"
                color="error"
                className="!text-xs"
              />
            )}
          </div>
          <Chip
            label={getFieldTypeLabel(field.field_type || 'text')}
            size="small"
            color="primary"
          />
        </div>
        {field.options && (
          <Typography variant="caption" className="!text-gray-500 !block !mt-1">
            Options:{' '}
            {field.options
              .split(',')
              .map((o: any) => o.trim())
              .join(', ')}
          </Typography>
        )}
        {/* {field.sort_order && (
          <Typography variant="caption" className="!text-gray-400 !block !mt-1">
            Order: {field.sort_order}
          </Typography>
        )} */}

        {hasChildren && (
          <div className="!mt-3 !space-y-3 !border-l-2 !border-blue-200 !pl-4">
            {groups.map(({ optVal, fields: childFields }) => (
              <div key={optVal} className="!space-y-2">
                {optVal !== 'default' && (
                  <Typography
                    variant="caption"
                    className="!text-primary-600 !font-semibold !block !mb-1"
                  >
                    {field.field_type === 'product'
                      ? 'For Product: '
                      : 'For Option: '}
                    {optVal}
                  </Typography>
                )}
                {childFields.map((cf: any) => renderFieldNode(cf))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading || isFetching) {
    return (
      <div className="!flex !items-start !gap-4">
        <div className="!flex-2 !flex !flex-col !gap-4">
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
          <div className="!flex-4 !space-y-4">
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
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load survey details
            </Typography>
          </div>
          <Typography variant="body2" className="!text-gray-200">
            Please try again or contact your system administrator if this
            problem persists.
          </Typography>
        </div>
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
    <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
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
        <div className="!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  survey.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                      survey.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      survey.is_active !== 'Y',
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
              {survey.title}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {getCategoryLabel(survey.category)}
            </Typography>

            <div className="!flex !justify-center !gap-2 !mb-4">
              <Chip
                icon={
                  survey.is_active === 'Y' ? (
                    <CheckCircle fontSize="small" />
                  ) : (
                    <Settings fontSize="small" />
                  )
                }
                label={survey.is_active === 'Y' ? 'Active' : 'Inactive'}
                size="small"
                color={survey.is_active === 'Y' ? 'success' : 'error'}
              />
            </div>
          </div>

          <InfoCard title="Statistics" icon={BarChart3}>
            <div className="!space-y-3">
              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Total Responses
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      Number of completed surveys
                    </Typography>
                  </div>
                  <Typography
                    variant="h6"
                    className="!font-bold !text-primary-600"
                  >
                    {survey.response_count || 0}
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
                      Total Fields
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      Number of survey fields
                    </Typography>
                  </div>
                  <Typography
                    variant="h6"
                    className="!font-bold !text-blue-600"
                  >
                    {survey.fields?.length || 0}
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
                      Current survey status
                    </Typography>
                  </div>
                  <Chip
                    label={survey.is_active === 'Y' ? 'Active' : 'Inactive'}
                    color={survey.is_active === 'Y' ? 'success' : 'error'}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="!flex-4 !space-y-4">
          <InfoCard title="Survey Information" icon={FileText}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5 flex flex-col items-start">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Category
                </Typography>
                <Chip
                  label={getCategoryLabel(survey.category)}
                  color={getCategoryColor(survey.category)}
                  size="small"
                />
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Type
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {survey.is_matrix === 'Y'
                    ? 'Matrix Survey'
                    : 'Standard Survey'}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Target Roles
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {survey.roles?.name || 'All Roles'}
                </Typography>
              </div>

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
                  {survey.createdate
                    ? formatDateTime(
                        typeof survey.createdate === 'string'
                          ? survey.createdate
                          : survey.createdate?.toString() || ''
                      )
                    : 'Not available'}
                </Typography>
              </div>

              {survey.published_at && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Published Date
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {formatDate(
                      typeof survey.published_at === 'string'
                        ? survey.published_at
                        : survey.published_at?.toString() || ''
                    )}
                  </Typography>
                </div>
              )}

              {survey.description && (
                <div className="!space-y-0.5 md:!col-span-2">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Description
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {survey.description}
                  </Typography>
                </div>
              )}

              {survey.is_matrix === 'Y' &&
                survey.target_products &&
                survey.target_products.length > 0 && (
                  <div className="!space-y-1.5 md:!col-span-2">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Target Products (Matrix Rows)
                    </Typography>
                    <div className="!flex !flex-wrap !gap-2">
                      <Chip
                        label={`${survey.target_products.length} Products Assigned`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </div>
                  </div>
                )}
            </div>
          </InfoCard>
          <InfoCard title="Survey Fields" icon={Settings}>
            {surveyFieldsTree && surveyFieldsTree.length > 0 ? (
              <div className="!space-y-3">
                {surveyFieldsTree.map(field => renderFieldNode(field))}
              </div>
            ) : (
              <div className="!text-center !py-8 !text-gray-500">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No fields added to this survey yet.
                </Typography>
              </div>
            )}
          </InfoCard>
        </div>
      </div>
    </>
  );
};

export default SurveyDetail;
