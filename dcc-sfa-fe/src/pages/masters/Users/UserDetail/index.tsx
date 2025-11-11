import {
  AccessTime,
  Cancel,
  CheckCircle,
  Person,
  Security,
} from '@mui/icons-material';
import { Alert, Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useUser } from 'hooks/useUsers';
import { useParams } from 'react-router-dom';
import { formatDate } from 'utils/dateUtils';

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
      <div className="flex items-start gap-4">
        <div className="flex-2">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
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
              className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden"
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
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
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
    <div className="flex items-start gap-4">
      <div className="!flex-2 flex flex-col gap-4">
        <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {user.phone_number || 'N/A'}
              </Typography>
            </div>
          </div>
        </div>
        <InfoCard title="Personal Information" icon={Person}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Full Name
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {user.address || 'Not provided'}
              </Typography>
            </div>
          </div>
        </InfoCard>
      </div>

      <div className="!flex-4 !space-y-4">
        <InfoCard title="Role & Organization" icon={Security}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Role
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {user.reporting_manager?.name || 'Not assigned'}
              </Typography>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Activity & Status" icon={AccessTime}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
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
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatDate(user.joining_date)}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Last Login
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatDate(user.last_login)}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Member Since
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatDate(user.created_at)}
              </Typography>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default UserDetail;
