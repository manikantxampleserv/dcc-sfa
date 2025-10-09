import {
  AccessTime,
  ArrowLeft,
  Business,
  Cancel,
  CheckCircle,
  Email,
  LocationOn,
  Person,
  Phone,
  Security,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import { useUser } from 'hooks/useUsers';
import { Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id || isNaN(parseInt(id, 10))) {
    throw new Error('Invalid user ID');
  }

  const userId = parseInt(id, 10);
  const { data: userResponse, isLoading, error } = useUser(userId);

  const user = userResponse?.data;

  const handleBack = () => {
    navigate('/masters/users');
  };

  const handleEdit = () => {
    navigate(`/masters/users/edit/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={32} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Skeleton
              variant="circular"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <Skeleton
              variant="text"
              width="80%"
              height={24}
              className="mx-auto mb-2"
            />
            <Skeleton
              variant="text"
              width="60%"
              height={20}
              className="mx-auto mb-4"
            />
            <Skeleton variant="rectangular" width="100%" height={32} />
          </div>
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Skeleton variant="text" width={200} height={32} className="mb-4" />
            <Skeleton
              variant="text"
              width="100%"
              height={20}
              className="mb-2"
            />
            <Skeleton variant="text" width="80%" height={20} className="mb-2" />
            <Skeleton variant="text" width="90%" height={20} className="mb-2" />
            <Skeleton variant="text" width="70%" height={20} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if ((error as any)?.response?.status === 404) {
      throw new Error('User not found');
    }

    return (
      <div className="w-full">
        <div className="mb-6 flex items-center gap-4">
          <IconButton onClick={handleBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </IconButton>
          <Typography variant="h4" className="font-bold text-gray-900">
            Error Loading User
          </Typography>
        </div>
        <Alert severity="error">
          Failed to load user details. Please try again.
        </Alert>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-5 h-5 text-gray-600" />}
        <Typography variant="h6" className="font-semibold text-gray-900">
          {title}
        </Typography>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: string | React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />}
      <div className="flex-1">
        <Typography variant="body2" className="text-gray-600 text-sm">
          {label}
        </Typography>
        <Typography variant="body1" className="text-gray-900 font-medium">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </Typography>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <IconButton onClick={handleBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </IconButton>
          <div>
            <Typography variant="h4" className="font-bold text-gray-900">
              User Details
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              View and manage user information
            </Typography>
          </div>
        </div>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={handleEdit}
          className="capitalize"
        >
          Edit User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Avatar
            src={user.profile_image || undefined}
            className={classNames('w-24 h-24 mx-auto mb-4 text-2xl font-bold', {
              'bg-green-100 text-green-600': user.is_active === 'Y',
              'bg-gray-200 text-gray-600': user.is_active !== 'Y',
            })}
          >
            {getInitials(user.name)}
          </Avatar>

          <Typography variant="h5" className="font-bold text-gray-900 mb-2">
            {user.name}
          </Typography>

          <Typography variant="body2" className="text-gray-600 mb-4">
            {user.role?.name || 'No Role Assigned'}
          </Typography>

          <Chip
            icon={user.is_active === 'Y' ? <CheckCircle /> : <Cancel />}
            label={user.is_active === 'Y' ? 'Active' : 'Inactive'}
            color={user.is_active === 'Y' ? 'success' : 'error'}
            size="small"
            className="mb-4"
          />

          <Divider className="my-4" />

          <div className="text-left space-y-2">
            <InfoRow
              label="Employee ID"
              value={user.employee_id}
              icon={Person}
            />
            <InfoRow label="Email" value={user.email} icon={Email} />
            <InfoRow label="Phone" value={user.phone_number} icon={Phone} />
            <InfoRow
              label="Join Date"
              value={formatDate(user.joining_date)}
              icon={AccessTime}
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <InfoCard title="Personal Information" icon={Person}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Full Name" value={user.name} />
              <InfoRow label="Email Address" value={user.email} icon={Email} />
              <InfoRow
                label="Phone Number"
                value={user.phone_number}
                icon={Phone}
              />
              <InfoRow label="Employee ID" value={user.employee_id} />
              <div className="sm:col-span-2">
                <InfoRow
                  label="Address"
                  value={user.address}
                  icon={LocationOn}
                />
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Role & Organization" icon={Security}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Role" value={user.role?.name} icon={Security} />
              <InfoRow
                label="Company"
                value={user.company?.name}
                icon={Business}
              />
              <InfoRow label="Depot" value={user.depot?.name} icon={Business} />
              <InfoRow label="Zone" value={user.zone?.name} icon={LocationOn} />
              <div className="sm:col-span-2">
                <InfoRow
                  label="Reports To"
                  value={user.reporting_manager?.name}
                  icon={Person}
                />
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Activity & Status" icon={AccessTime}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                label="Status"
                value={
                  <Chip
                    icon={user.is_active === 'Y' ? <CheckCircle /> : <Cancel />}
                    label={user.is_active === 'Y' ? 'Active' : 'Inactive'}
                    color={user.is_active === 'Y' ? 'success' : 'error'}
                    size="small"
                  />
                }
              />
              <InfoRow
                label="Join Date"
                value={formatDate(user.joining_date)}
                icon={AccessTime}
              />
              <InfoRow
                label="Last Login"
                value={formatDate(user.last_login)}
                icon={AccessTime}
              />
              <InfoRow
                label="Created At"
                value={formatDate(user.created_at)}
                icon={AccessTime}
              />
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
