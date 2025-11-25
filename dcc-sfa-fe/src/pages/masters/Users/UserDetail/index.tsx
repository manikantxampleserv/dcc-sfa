import {
  AccessTime,
  Cancel,
  CheckCircle,
  History,
  Person,
  Security,
  Add,
  Edit,
  Delete,
  Computer,
  Language,
} from '@mui/icons-material';
import { Alert, Avatar, Chip, Skeleton, Typography, Box } from '@mui/material';
import classNames from 'classnames';
import { useUser } from 'hooks/useUsers';
import { useParams } from 'react-router-dom';
import { formatDate, formatDateTime } from 'utils/dateUtils';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id || isNaN(parseInt(id, 10))) {
    throw new Error('Invalid user ID');
  }

  const userId = parseInt(id, 10);
  const { data: userResponse, isLoading, error } = useUser(userId);

  const user = userResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-start gap-5">
        <div className="flex-2">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-5 !text-center !relative">
            <div className="!absolute !top-4 !right-4">
              <Skeleton
                variant="circular"
                width={12}
                height={12}
                className="!bg-green-200"
              />
            </div>

            <Skeleton
              variant="circular"
              width={96}
              height={96}
              className="!mx-auto !mb-4 !border-3 !border-white"
            />

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

            <div className="!space-y-3 !text-left">
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="50%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="70%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="80%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="35%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="60%" height={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-4 !space-y-4">
          {[1, 2, 3].map(card => (
            <div
              key={card}
              className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-5 !relative !overflow-hidden"
            >
              <div className="!absolute !top-0 !right-0 !w-20 !h-20 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-10 !translate-x-10"></div>
              <div className="!relative !z-10">
                <div className="!flex !items-center !gap-2 !mb-4">
                  <div className="!p-1 !bg-blue-100 !rounded-md">
                    <Skeleton
                      variant="circular"
                      width={16}
                      height={16}
                      className="!bg-blue-200"
                    />
                  </div>
                  <Skeleton variant="text" width={140} height={20} />
                </div>
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
                  {[1, 2, 3, 4].map(field => (
                    <div key={field} className="!space-y-1">
                      <Skeleton
                        variant="text"
                        width={`${50 + field * 8}%`}
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
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    if ((error as any)?.response?.status === 404) {
      throw new Error('User not found');
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <Alert severity="error" className="!mb-3">
            Failed to load user details. Please try again.
          </Alert>
          <Typography variant="body2" className="!text-gray-600">
            If this problem persists, please contact your system administrator.
          </Typography>
        </div>
      </div>
    );
  }

  if (!user) {
    throw new Error('User not found');
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      ?.slice(0, 2);
  };

  const formatTableName = (tableName: string): string => {
    return tableName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getActionVerb = (action: string): string => {
    const actionMap: Record<string, string> = {
      CREATE: 'created',
      UPDATE: 'updated',
      DELETE: 'deleted',
    };
    return actionMap[action] || action.toLowerCase();
  };

  const formatDeviceInfo = (deviceInfo: string | null | undefined): string => {
    if (!deviceInfo) return 'Unknown device';

    const info = deviceInfo.toLowerCase();

    if (info.includes('macintosh') || info.includes('mac os x')) {
      const osMatch = deviceInfo.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
      const osVersion = osMatch ? osMatch[1].replace(/_/g, '.') : '';

      if (info.includes('chrome')) {
        const chromeMatch = deviceInfo.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
        const chromeVersion = chromeMatch ? chromeMatch[1] : '';
        return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Chrome${chromeVersion ? ` ${chromeVersion}` : ''}`;
      }
      if (info.includes('safari') && !info.includes('chrome')) {
        return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Safari`;
      }
      if (info.includes('firefox')) {
        return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Firefox`;
      }
    }

    if (info.includes('windows')) {
      if (info.includes('chrome')) return 'Windows - Chrome';
      if (info.includes('firefox')) return 'Windows - Firefox';
      if (info.includes('edge')) return 'Windows - Edge';
    }

    if (info.includes('android')) {
      if (info.includes('chrome')) return 'Android - Chrome';
    }

    if (info.includes('iphone') || info.includes('ipad')) {
      if (info.includes('safari')) return 'iOS - Safari';
    }

    if (info.includes('dart')) {
      return 'Mobile App (Dart)';
    }

    return deviceInfo;
  };

  const InfoCard = ({
    title,
    children,
    icon: Icon,
    className = '',
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ElementType;
    className?: string;
  }) => (
    <div
      className={`!bg-white !rounded-lg !shadow !border !border-gray-200 !p-5 !relative !overflow-hidden ${className}`}
    >
      <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
      <div className="!relative !z-10">
        <div className="!flex !items-center !gap-3 !mb-3">
          {Icon && (
            <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
              <Icon className="!text-primary-500" />
            </div>
          )}
          <Typography variant="h6" className="!font-bold !text-gray-900">
            {title}
          </Typography>
        </div>
        <div className="!mt-1">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-5 !items-start">
      <div className="lg:!col-span-4 flex flex-col gap-5">
        <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-5 !text-center !relative">
          <div className="absolute top-3 right-3">
            <div
              className={`!w-2.5 !h-2.5 !rounded-full ${user.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'}`}
            ></div>
          </div>

          <div className="!relative !mb-4">
            <Avatar
              src={user.profile_image || undefined}
              className={classNames(
                '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                {
                  '!bg-gradient-to-br !from-green-400 !to-green-600 !text-white':
                    user.is_active === 'Y',
                  '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                    user.is_active === 'N',
                }
              )}
            >
              {getInitials(user.name)}
            </Avatar>
          </div>

          <Typography variant="h6" className="!font-bold !text-gray-900 !mb-1">
            {user.name}
          </Typography>

          <Typography variant="body2" className="!text-gray-600 !mb-3">
            {user.role?.name || 'No Role Assigned'}
          </Typography>

          <Chip
            icon={user.is_active === 'Y' ? <CheckCircle /> : <Cancel />}
            label={user.is_active === 'Y' ? 'Active' : 'Inactive'}
            color={user.is_active === 'Y' ? 'success' : 'error'}
            size="small"
          />

          <div className="!space-y-1 !text-left">
            <div className="!p-1 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Employee ID
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.employee_id || 'N/A'}
              </Typography>
            </div>

            <div className="!p-1 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Contact
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.email}
              </Typography>
            </div>

            <div className="!p-1 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Phone
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.phone_number || 'N/A'}
              </Typography>
            </div>
          </div>
        </div>
        <InfoCard title="Role & Organization" icon={Security}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Role
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.role?.name || 'Not assigned'}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Company
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.company?.name || 'Not assigned'}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Depot
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.depot?.name || 'Not assigned'}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Zone
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.zone?.name || 'Not assigned'}
              </Typography>
            </div>

            <div className="!space-y-0.5 md:!col-span-2">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Reports To
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.reporting_manager?.name || 'Not assigned'}
              </Typography>
            </div>
          </div>
        </InfoCard>
      </div>

      <div className="lg:!col-span-8 flex flex-col gap-5">
        <InfoCard title="Personal Information" icon={Person}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5 !mt-2">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Full Name
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.name}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Email Address
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.email}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Phone Number
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.phone_number || 'Not provided'}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Employee ID
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.employee_id || 'Not provided'}
              </Typography>
            </div>

            <div className="!space-y-0.5 md:!col-span-2">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Address
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {user.address || 'Not provided'}
              </Typography>
            </div>
          </div>
        </InfoCard>
        <InfoCard title="Activity & Status" icon={AccessTime}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Current Status
              </Typography>
              <div className="!mt-1">
                <Chip
                  icon={user.is_active === 'Y' ? <CheckCircle /> : <Cancel />}
                  label={user.is_active === 'Y' ? 'Active' : 'Inactive'}
                  color={user.is_active === 'Y' ? 'success' : 'error'}
                  size="small"
                />
              </div>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Join Date
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {formatDate(user.joining_date) || 'N/A'}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Last Login
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {formatDate(user.last_login) || 'Never'}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Member Since
              </Typography>
              <Typography variant="body2" className="!font-bold !text-gray-900">
                {formatDate(user.created_at) || 'N/A'}
              </Typography>
            </div>
          </div>
        </InfoCard>

        {user.recent_activities && (
          <InfoCard title="Recent Audit Logs" icon={History}>
            {user.recent_activities.audit_logs.length > 0 ? (
              <div className="!space-y-3">
                {user.recent_activities.audit_logs.map(log => {
                  const getActionIcon = () => {
                    switch (log.action) {
                      case 'CREATE':
                        return <Add className="!text-sm" />;
                      case 'UPDATE':
                        return <Edit className="!text-sm" />;
                      case 'DELETE':
                        return <Delete className="!text-sm" />;
                      default:
                        return <History className="!text-sm" />;
                    }
                  };

                  return (
                    <Box
                      key={log.id}
                      className="!border !border-gray-200 !shadow-sm !rounded-lg !p-4 !bg-gradient-to-br !from-white !to-gray-50 hover:!shadow-md !transition-shadow !duration-200"
                    >
                      <div className="!flex !items-start !gap-3">
                        <div
                          className={`!flex-shrink-0 !w-10 !h-10 !rounded-lg !flex !items-center !justify-center ${
                            log.action === 'CREATE'
                              ? '!bg-green-100'
                              : log.action === 'UPDATE'
                                ? '!bg-blue-100'
                                : '!bg-red-100'
                          }`}
                        >
                          {getActionIcon()}
                        </div>
                        <div className="!flex-1 !min-w-0">
                          <div className="!flex !items-center !gap-2 !mb-2 !flex-wrap">
                            <Typography
                              variant="body2"
                              className="!font-bold !text-gray-900"
                            >
                              {formatTableName(log.table_name)}
                            </Typography>
                          </div>
                          <Typography
                            variant="body2"
                            className="!text-gray-700 !mb-2"
                          >
                            <span className="!font-semibold !text-gray-900">
                              {user.name}
                            </span>{' '}
                            has {getActionVerb(log.action)} the{' '}
                            <span className="!font-bold !text-gray-900">
                              {formatTableName(log.table_name)}
                            </span>
                          </Typography>
                          <div className="!flex !flex-wrap !items-center !gap-3 !text-xs !text-gray-500">
                            {log.changed_at && (
                              <div className="!flex !items-center !gap-1">
                                <AccessTime className="!text-xs" />
                                <span className="!font-medium">
                                  {formatDateTime(log.changed_at)}
                                </span>
                              </div>
                            )}
                            {log.ip_address && (
                              <div className="!flex !items-center !gap-1">
                                <Language className="!text-xs" />
                                <span className="!font-medium">
                                  {log.ip_address}
                                </span>
                              </div>
                            )}
                            {log.device_info && (
                              <div className="!flex !items-center !gap-1">
                                <Computer className="!text-xs" />
                                <span className="!font-medium">
                                  {formatDeviceInfo(log.device_info)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Box>
                  );
                })}
              </div>
            ) : (
              <Box className="!text-center !py-8">
                <History className="!text-gray-300 !text-6xl !mb-3 !mx-auto" />
                <Typography variant="body2" className="!text-gray-500">
                  No audit logs found
                </Typography>
              </Box>
            )}
          </InfoCard>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
