import { Box, Skeleton } from '@mui/material';
import React, { type ReactNode } from 'react';

/**
 * Props for the StatsCard component
 */
interface StatsCardProps {
  /** The title/label displayed above the value */
  title: string;
  /** The main statistic value to display */
  value: string | number;
  /** Icon component to display in the card */
  icon: ReactNode;
  /** Color theme for the card. Defaults to 'blue' */
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
  /** Whether to show a loading skeleton instead of the value */
  isLoading?: boolean;
}

/**
 * A reusable statistics card component that displays a title, value, and icon.
 * Supports multiple color themes and loading states.
 *
 * @param props - The StatsCard component props
 * @returns A styled card component with statistics information
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Users"
 *   value={1234}
 *   icon={<Users />}
 *   color="blue"
 *   isLoading={false}
 * />
 * ```
 */
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  isLoading = false,
}) => {
  return (
    <Box className="rounded-lg shadow-sm border p-6 bg-white border-gray-200">
      <Box className="flex items-center justify-between">
        <Box>
          <p className={`text-sm font-medium text-${color}-500`}>{title}</p>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={64}
              height={35}
              className="mt-1"
              sx={{ bgcolor: 'rgba(229, 231, 235, 1)' }}
            />
          ) : (
            <p className={`text-2xl font-bold mt-1 text-${color}-600`}>
              {value}
            </p>
          )}
        </Box>
        <Box
          className={`w-12 h-12 rounded-full flex items-center justify-center bg-${color}-100`}
        >
          <Box className={`text-${color}-600`}>{icon}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StatsCard;
