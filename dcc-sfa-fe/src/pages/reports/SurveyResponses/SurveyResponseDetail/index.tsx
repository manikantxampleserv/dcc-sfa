import { Download } from '@mui/icons-material';
import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useCurrency } from 'hooks/useCurrency';
import {
  useExportSurveyResponses,
  useSurveyResponse,
} from 'hooks/useSurveyResponses';
import { useSurvey } from 'hooks/useSurveys';
import {
  AlertTriangle,
  BarChart3,
  FileText,
  Package,
  User,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Table, { type TableColumn } from 'shared/Table';
import { formatDateTime } from 'utils/dateUtils';

interface FlatAnswerItem {
  id: number | string;
  productName: string;
  productCode?: string;
  fieldLabel: string;
  fieldType: string;
  answerValue: string;
  isRequired: boolean;
}

const SurveyResponseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useCurrency();
  const exportSurveyResponsesMutation = useExportSurveyResponses();

  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useSurveyResponse(Number(id));

  const { data: survey, isLoading: isSurveyLoading } = useSurvey(
    response?.parent_id ? Number(response.parent_id) : 0
  );

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

  const productsInResponse = React.useMemo(() => {
    if (!response?.answers) return [];
    const map = new Map();
    response.answers.forEach((ans: any) => {
      if (ans.product) {
        map.set(ans.product.id, ans.product.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [response?.answers]);

  const formatAnswer = (answer: string | null) => {
    if (!answer) return null;

    try {
      const parsed = JSON.parse(answer);

      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }

      if (typeof parsed === 'object' && parsed !== null) {
        return JSON.stringify(parsed, null, 2);
      }

      return answer;
    } catch {
      return answer;
    }
  };

  const flatAnswers: FlatAnswerItem[] = useMemo(() => {
    if (!response?.answers || response.answers.length === 0) return [];

    const fieldMap = new Map<number, any>();
    if (survey?.fields) {
      survey.fields.forEach((f: any) => fieldMap.set(f.id, f));
    }

    return response.answers.map((ans: any, idx: number) => {
      let prodName = ans.product?.name || '';
      let prodCode = ans.product?.code || '';
      const matchedField = fieldMap.get(ans.field_id);

      if (
        !prodName &&
        ans.field?.parent_option_value &&
        ans.field.parent_option_value !== 'default'
      ) {
        prodName = ans.field.parent_option_value;
      }
      if (
        !prodName &&
        matchedField?.parent_option_value &&
        matchedField.parent_option_value !== 'default'
      ) {
        prodName = matchedField.parent_option_value;
      }

      const fieldLabel =
        matchedField?.label ||
        ans.field?.name ||
        ans.field?.label ||
        'Question';

      const fieldType =
        matchedField?.field_type ||
        ans.field?.type ||
        ans.field?.field_type ||
        'text';

      const isReq =
        matchedField?.is_required === true ||
        matchedField?.is_required === 'Y' ||
        ans.field?.is_required === true ||
        ans.field?.is_required === 'Y';

      let displayVal =
        ans.answer !== null && ans.answer !== undefined
          ? formatAnswer(ans.answer)
          : '';
      if (!displayVal && matchedField?.field_type === 'product') {
        displayVal = prodName || '—';
      }

      return {
        id: ans.id || idx + 1,
        productName: prodName,
        productCode: prodCode,
        fieldLabel,
        fieldType,
        answerValue: displayVal || '—',
        isRequired: isReq,
      };
    });
  }, [response?.answers, survey?.fields]);

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
      product: 'Product',
      signature: 'Signature',
    };
    return labels[type] || type;
  };

  /**
   * Check if a given string looks like an image URL
   *
   * @param {string} url
   * @returns {boolean}
   */
  const isImageUrl = (url: string): boolean => {
    return (
      !!url &&
      (url.startsWith('http') ||
        url.startsWith('/') ||
        url.startsWith('data:image') ||
        !!url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i))
    );
  };

  /**
   * Column definitions for the flat answers table.
   */
  const answerColumns: TableColumn<FlatAnswerItem>[] = useMemo(
    () => [
      {
        id: 'productName',
        label: 'Product / Context',
        sortable: true,
        render: (_value: unknown, row: FlatAnswerItem) =>
          row.productName ? (
            <div className="!flex !items-center !gap-2">
              <Avatar
                variant="rounded"
                className="!w-10 !h-10 !rounded !bg-sky-100 !text-blue-600 !flex-shrink-0"
              >
                <Package className="!w-5 !h-5 !text-blue-600" />
              </Avatar>
              <div className="!min-w-0">
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 !leading-snug"
                >
                  {row.productName}
                </Typography>
                {row.productCode && (
                  <Typography
                    variant="caption"
                    className="!text-xs !text-gray-400 !font-normal !block !mt-0.5"
                  >
                    {row.productCode}
                  </Typography>
                )}
              </div>
            </div>
          ) : (
            <span className="!text-xs !text-gray-400 italic">General</span>
          ),
      },
      {
        id: 'fieldLabel',
        label: 'Question / Field',
        sortable: true,
        render: (_value: unknown, row: FlatAnswerItem) => (
          <div className="!flex !items-center !gap-1.5">
            <span className="!font-medium !text-gray-900">
              {row.fieldLabel}
            </span>
            {row.isRequired && (
              <span className="!text-red-500 !font-bold" title="Required">
                *
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'fieldType',
        label: 'Type',
        width: '120px',
        sortable: true,
        render: (_value: unknown, row: FlatAnswerItem) => (
          <Chip
            label={getFieldTypeLabel(row.fieldType)}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
      },
      {
        id: 'isRequired',
        label: 'Mandatory',
        width: '120px',
        sortable: true,
        render: (_value: unknown, row: FlatAnswerItem) =>
          row.isRequired ? (
            <Chip
              label="Mandatory"
              size="small"
              color="error"
              variant="outlined"
              className="!text-xs !font-medium"
            />
          ) : (
            <Chip
              label="Optional"
              size="small"
              variant="outlined"
              className="!text-xs !text-gray-500 !border-gray-200"
            />
          ),
      },
      {
        id: 'answerValue',
        label: 'Answer Value',
        sortable: true,
        render: (_value: unknown, row: FlatAnswerItem) => {
          if (row.answerValue && isImageUrl(row.answerValue)) {
            return (
              <div className="!py-1">
                <a
                  href={row.answerValue}
                  target="_blank"
                  rel="noreferrer"
                  className="!inline-block"
                >
                  <img
                    src={row.answerValue}
                    alt={row.fieldLabel}
                    className="!w-16 !h-16 !object-cover !rounded-md !border !border-gray-200 hover:!opacity-80 !transition-opacity"
                  />
                </a>
              </div>
            );
          }
          if (row.answerValue.toLowerCase() === 'yes') {
            return (
              <span className="!inline-flex !items-center !px-2 !py-0.5 !rounded-full !text-xs !font-semibold !bg-green-100 !text-green-800">
                Yes
              </span>
            );
          }
          if (row.answerValue.toLowerCase() === 'no') {
            return (
              <span className="!inline-flex !items-center !px-2 !py-0.5 !rounded-full !text-xs !font-semibold !bg-red-100 !text-red-800">
                No
              </span>
            );
          }
          return (
            <span
              className={classNames('!text-sm', {
                '!font-bold !text-gray-900':
                  !isNaN(Number(row.answerValue)) && row.answerValue !== '',
                '!font-medium !text-gray-700': isNaN(Number(row.answerValue)),
                '!text-gray-300 italic': row.answerValue === '—',
              })}
            >
              {row.answerValue}
            </span>
          );
        },
      },
    ],
    []
  );

  /**
   * Export the current survey response to Excel
   */
  const handleExportExcel = async (): Promise<void> => {
    if (!id) return;
    try {
      await exportSurveyResponsesMutation.mutateAsync({
        response_id: Number(id),
      });
    } catch (err: unknown) {
      console.error('Failed to export survey response to Excel:', err);
    }
  };

  if (isLoading || isFetching || isSurveyLoading) {
    return (
      <div className="!space-y-4">
        <div className="!flex !items-start !gap-4">
          <div className="!flex-2 flex flex-col">
            <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
              <div className="absolute top-3 right-3">
                <Skeleton
                  variant="circular"
                  width={10}
                  height={10}
                  className="!bg-gray-200"
                />
              </div>

              <div className="!relative !mb-4">
                <Skeleton
                  variant="circular"
                  width={96}
                  height={96}
                  className="!mx-auto"
                />
              </div>

              <Skeleton
                variant="text"
                width="65%"
                height={26}
                className="!mx-auto !mb-1"
              />
              <Skeleton
                variant="text"
                width="45%"
                height={18}
                className="!mx-auto !mb-3"
              />

              <Skeleton
                variant="rectangular"
                width={70}
                height={24}
                className="!mx-auto !mb-4 !rounded-full"
              />

              <div className="!space-y-1 !text-left !mt-4">
                <div className="!p-1 !bg-gray-50 !rounded-md">
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={12}
                    className="!mb-0.5"
                  />
                  <Skeleton variant="text" width="70%" height={16} />
                </div>
                <div className="!p-1 !bg-gray-50 !rounded-md">
                  <Skeleton
                    variant="text"
                    width="35%"
                    height={12}
                    className="!mb-0.5"
                  />
                  <Skeleton variant="text" width="60%" height={16} />
                </div>
              </div>
            </div>

            <div className="!bg-white !mt-4 !rounded-lg !shadow-sm !border !border-gray-200 !p-6 !relative !overflow-hidden">
              <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8" />
              <div className="!relative !z-10">
                <div className="!flex !items-center !gap-2 !mb-4">
                  <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                    <Skeleton
                      variant="circular"
                      width={18}
                      height={18}
                      className="!bg-primary-200"
                    />
                  </div>
                  <Skeleton variant="text" width={170} height={24} />
                </div>

                <div className="!space-y-3">
                  <div className="!p-3.5 !bg-gray-50 !rounded-md !border !border-gray-200">
                    <div className="!flex !items-center !justify-between">
                      <div className="!flex-1">
                        <Skeleton
                          variant="text"
                          width="50%"
                          height={18}
                          className="!mb-1"
                        />
                        <Skeleton variant="text" width="70%" height={13} />
                      </div>
                      <Skeleton variant="text" width={32} height={28} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="!flex-4 !space-y-4">
            <div className="!bg-white !rounded-lg !shadow-sm !border !border-gray-200 !p-6 !relative !overflow-hidden">
              <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8" />
              <div className="!relative !z-10">
                <div className="!flex !items-center !gap-2 !mb-4">
                  <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                    <Skeleton
                      variant="circular"
                      width={18}
                      height={18}
                      className="!bg-primary-200"
                    />
                  </div>
                  <Skeleton variant="text" width={190} height={24} />
                </div>

                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                  {[1, 2, 3, 4, 5].map(field => (
                    <div key={field} className="!space-y-1">
                      <Skeleton variant="text" width="35%" height={12} />
                      <Skeleton
                        variant="text"
                        width={`${55 + (field % 3) * 15}%`}
                        height={18}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="!bg-white !rounded-lg !shadow-sm !border !border-gray-200 !p-6 !relative !overflow-hidden">
              <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8" />
              <div className="!relative !z-10">
                <div className="!flex !items-center !gap-2 !mb-4">
                  <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                    <Skeleton
                      variant="circular"
                      width={18}
                      height={18}
                      className="!bg-primary-200"
                    />
                  </div>
                  <Skeleton variant="text" width={180} height={24} />
                </div>

                <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(field => (
                    <div
                      key={field}
                      className={classNames('!space-y-1', {
                        'md:!col-span-2 lg:!col-span-2': field === 8,
                      })}
                    >
                      <Skeleton variant="text" width="40%" height={12} />
                      <Skeleton
                        variant="text"
                        width={`${50 + (field % 4) * 12}%`}
                        height={18}
                      />
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
      </div>
    );
  }

  const getAnswerForField = (fieldId: number, productContextName?: string) => {
    // If it's a matrix survey, we must match the product context
    if (survey?.is_matrix === 'Y') {
      return response.answers?.find(
        (ans: any) =>
          ans.field_id === fieldId &&
          (!productContextName || ans.product?.name === productContextName)
      );
    }

    // For standard surveys, the field itself is unique, so we just match fieldId.
    return response.answers?.find((ans: any) => ans.field_id === fieldId);
  };

  const hasAnyAnswer = (
    fieldsList: any[],
    contextProduct?: string
  ): boolean => {
    return fieldsList.some(field => {
      const answer = getAnswerForField(field.id, contextProduct);
      if (
        answer &&
        answer.answer !== null &&
        answer.answer !== undefined &&
        answer.answer !== ''
      ) {
        return true;
      }
      if (field.child_fields && field.child_fields.length > 0) {
        return hasAnyAnswer(field.child_fields, contextProduct);
      }
      return false;
    });
  };

  const isGroupActive = (
    parentField: any,
    optVal: string,
    productContextName?: string,
    childFieldsOfGroup: any[] = []
  ) => {
    if (optVal === 'default') return true;

    if (
      hasAnyAnswer(
        childFieldsOfGroup,
        parentField.field_type === 'product' ? optVal : productContextName
      )
    ) {
      return true;
    }

    const parentAns = getAnswerForField(parentField.id, productContextName);
    if (!parentAns || !parentAns.answer) return false;

    const parentAnswerVal = parentAns.answer;

    if (parentField.field_type === 'product') {
      try {
        const parsed = JSON.parse(parentAnswerVal);
        if (Array.isArray(parsed)) {
          return parsed.includes(optVal);
        }
        return parentAnswerVal === optVal;
      } catch {
        return parentAnswerVal === optVal;
      }
    }

    return parentAnswerVal.toLowerCase() === optVal.toLowerCase();
  };

  const renderFieldNode = (
    field: any,
    productContextName?: string
  ): React.ReactNode => {
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

    const answer = getAnswerForField(field.id, productContextName);
    let answerVal = answer ? formatAnswer(answer.answer || '') : null;

    if (field.field_type === 'product' && !answerVal && hasChildren) {
      const answeredProducts = groups
        .filter(g => hasAnyAnswer(g.fields, g.optVal))
        .map(g => g.optVal)
        .filter(val => val !== 'default');
      if (answeredProducts.length > 0) {
        answerVal = answeredProducts.join(', ');
      }
    }

    const activeGroups = groups.filter(g =>
      isGroupActive(field, g.optVal, productContextName, g.fields)
    );

    return (
      <div
        key={`${field.id}-${productContextName || ''}`}
        className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
      >
        <div className="!flex !items-center !justify-between !mb-2">
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

        {/* Answer section */}
        {field.field_type !== 'product' && (
          <div className="!mt-2 !p-2 !bg-white !rounded !border !border-gray-100 !flex !items-center !justify-between">
            <Typography
              variant="caption"
              className="!text-gray-500 !font-semibold"
            >
              Answer:
            </Typography>
            {answerVal && isImageUrl(answerVal) ? (
              <div className="!mt-1">
                <img
                  src={answerVal}
                  alt={field.label}
                  className="!max-w-xs !max-h-48 !object-contain !rounded-md !border !border-gray-200"
                />
              </div>
            ) : (
              <Typography
                variant="body2"
                className={classNames('!font-bold !text-sm !break-words', {
                  '!text-green-600': answerVal?.toLowerCase() === 'yes',
                  '!text-red-500': answerVal?.toLowerCase() === 'no',
                  '!text-gray-900':
                    answerVal?.toLowerCase() !== 'yes' &&
                    answerVal?.toLowerCase() !== 'no',
                })}
              >
                {answerVal || (
                  <span className="!text-gray-300 italic !text-xs">—</span>
                )}
              </Typography>
            )}
          </div>
        )}

        {field.options && (
          <Typography variant="caption" className="!text-gray-500 !block !mt-2">
            Options:{' '}
            {field.options
              .split(',')
              .map((o: any) => o.trim())
              .join(', ')}
          </Typography>
        )}

        {activeGroups.length > 0 && (
          <div className="!mt-3 !space-y-3 !border-l-2 !border-blue-200 !pl-4">
            {activeGroups.map(({ optVal, fields: childFields }) => (
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
                {childFields.map((cf: any) =>
                  renderFieldNode(
                    cf,
                    field.field_type === 'product' ? optVal : productContextName
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const InfoCard = ({
    title,
    children,
    icon: Icon,
    padding = 6,
  }: {
    title?: string;
    children: React.ReactNode;
    icon?: React.ElementType;
    padding?: number;
  }) => (
    <div
      className={`!bg-white !mt-4 !rounded-lg !shadow-sm !border !border-gray-200 !p-${padding} !relative !overflow-hidden`}
    >
      <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8" />
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
      <div className="!space-y-4">
        <div className="!flex !items-start !gap-4">
          <div className="!flex-2 flex flex-col">
            <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
              <div className="absolute top-3 right-3">
                <div
                  className={`!w-2.5 !h-2.5 !rounded-full ${
                    response.is_active === 'Y'
                      ? '!bg-green-400'
                      : '!bg-gray-400'
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
                {response.survey?.title || `Survey #${response.parent_id}`}
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
                      ? formatDateTime(
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
                <div className="!p-3.5 !bg-gray-50 !rounded-md !border !border-gray-200">
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
                    {response.survey?.title || `Survey #${response.parent_id}`}
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
                      ? formatDateTime(
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
                      ? formatDateTime(
                          typeof response.createdate === 'string'
                            ? response.createdate
                            : response.createdate?.toString() || ''
                        )
                      : 'Not available'}
                  </Typography>
                </div>
              </div>
            </InfoCard>
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
                          {customer.code || 'N/A'}
                        </Typography>
                      </div>

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
                          {customer.type || 'N/A'}
                        </Typography>
                      </div>

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
                          {customer.contact_person || 'N/A'}
                        </Typography>
                      </div>

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
                          {customer.phone_number || 'N/A'}
                        </Typography>
                      </div>

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
                          {customer.email || 'N/A'}
                        </Typography>
                      </div>

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

                      <div className="!space-y-0.5 md:!col-span-2 lg:!col-span-2">
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
                          {customer.address || 'N/A'}
                        </Typography>
                      </div>

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
                          {formatCurrency(Number(customer.credit_limit))}
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
                          {formatCurrency(Number(customer.outstanding_amount))}
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
                          label={
                            customer.is_active === 'Y' ? 'Active' : 'Inactive'
                          }
                          size="small"
                          color={
                            customer.is_active === 'Y' ? 'success' : 'error'
                          }
                          variant="outlined"
                        />
                      </div>
                    </div>
                  );
                })()}
              </InfoCard>
            )}
          </div>
        </div>

        {response.answers && response.answers.length > 0 ? (
          <Table<FlatAnswerItem>
            data={flatAnswers}
            actions={
              <div className="flex justify-between items-center w-full">
                <div className="text-md">
                  Total Answers: {response.answers.length}
                </div>
                <PopConfirm
                  title="Export Survey Response"
                  description="Are you sure you want to export this survey response to Excel?"
                  onConfirm={handleExportExcel}
                  confirmText="Export"
                  cancelText="Cancel"
                  placement="top"
                >
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Download />}
                    disabled={exportSurveyResponsesMutation.isPending}
                  >
                    {exportSurveyResponsesMutation.isPending
                      ? 'Exporting...'
                      : 'Export'}
                  </Button>
                </PopConfirm>
              </div>
            }
            columns={answerColumns}
            pagination={false}
            sortable
            filterColunm={false}
            getRowId={row => row.id}
            emptyMessage="No answers match the filter."
          />
        ) : survey?.is_matrix === 'Y' ? (
          <div className="!space-y-4">
            {productsInResponse.map(product => (
              <div
                key={product.id}
                className="!bg-white !p-4 !rounded-lg !border !border-gray-200 !shadow-sm"
              >
                <Typography
                  variant="subtitle1"
                  className="!font-bold !text-primary-600 !mb-3"
                >
                  Product: {product.name}
                </Typography>
                <div className="!space-y-3">
                  {surveyFieldsTree.map(field =>
                    renderFieldNode(field, product.name)
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="!space-y-3">
            {surveyFieldsTree.map(field => renderFieldNode(field))}
          </div>
        )}
      </div>
    </>
  );
};

export default SurveyResponseDetail;
