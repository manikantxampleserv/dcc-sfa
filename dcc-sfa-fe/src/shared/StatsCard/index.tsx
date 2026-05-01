import { Box, Skeleton } from '@mui/material';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?:
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'orange'
  | 'yellow'
  | 'indigo'
  | 'pink'
  | 'teal'
  | 'cyan'
  | 'amber'
  | 'lime'
  | 'emerald'
  | 'violet'
  | 'fuchsia'
  | 'rose'
  | 'slate'
  | 'gray';
  isLoading?: boolean;
}

type StatsCardColor = NonNullable<StatsCardProps['color']>;

const COLOR_CLASSES: Record<
  StatsCardColor,
  { iconBg: string; iconText: string }
> = {
  blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  green: { iconBg: 'bg-green-100', iconText: 'text-green-600' },
  red: { iconBg: 'bg-red-100', iconText: 'text-red-600' },
  purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  orange: { iconBg: 'bg-orange-100', iconText: 'text-orange-600' },
  yellow: { iconBg: 'bg-yellow-100', iconText: 'text-yellow-600' },
  indigo: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
  pink: { iconBg: 'bg-pink-100', iconText: 'text-pink-600' },
  teal: { iconBg: 'bg-teal-100', iconText: 'text-teal-600' },
  cyan: { iconBg: 'bg-cyan-100', iconText: 'text-cyan-600' },
  amber: { iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  lime: { iconBg: 'bg-lime-100', iconText: 'text-lime-600' },
  emerald: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  violet: { iconBg: 'bg-violet-100', iconText: 'text-violet-600' },
  fuchsia: { iconBg: 'bg-fuchsia-100', iconText: 'text-fuchsia-600' },
  rose: { iconBg: 'bg-rose-100', iconText: 'text-rose-600' },
  slate: { iconBg: 'bg-slate-100', iconText: 'text-slate-600' },
  gray: { iconBg: 'bg-gray-100', iconText: 'text-gray-600' },
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  isLoading = false,
}) => {
  const colors = COLOR_CLASSES[color];

  return (
    <Box className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <Box className="flex items-center justify-between">
        <Box>
          <p className={classNames('text-sm', colors.iconText)}>{title}</p>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={64}
              height={32}
              sx={{ bgcolor: 'rgba(229, 231, 235, 1)' }}
            />
          ) : (
            <p className={classNames('text-xl font-bold', colors.iconText)}>
              {value}
            </p>
          )}
        </Box>
        <Box
          className={`h-10 w-10 rounded-full flex items-center justify-center ${colors.iconBg}`}
        >
          <Box className={colors.iconText}>{icon}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StatsCard;
