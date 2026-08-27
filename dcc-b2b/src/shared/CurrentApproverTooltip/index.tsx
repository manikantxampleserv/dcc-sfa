import React from 'react';
import { Tooltip, Box, Avatar, Typography } from '@mui/material';

interface CurrentApproverTooltipProps {
  currentApprover?: string | null;
  children: React.ReactElement;
}

export const CurrentApproverTooltip: React.FC<CurrentApproverTooltipProps> = ({
  currentApprover,
  children,
}) => {
  if (!currentApprover) return children;

  let approverObj: {
    name: string;
    email?: string;
    profile_image?: string;
    employee_id?: string;
  } = { name: currentApprover, email: 'admin@dcc.com', profile_image: '' };

  if (currentApprover.startsWith('{')) {
    try {
      approverObj = JSON.parse(currentApprover);
    } catch (e) {
      // fallback to raw value
    }
  }

  return (
    <Tooltip
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'white',
            color: '#1e293b',
            padding: 0,
            border: '1px solid #e6e6e6ff',
            boxShadow: '0px 0px 12px 0px rgba(0, 0, 0, 0.15)',
            '& .MuiTooltip-arrow': {
              color: 'white',
              '&::before': {
                border: '1px solid #e6e6e6ff',
                backgroundColor: 'white',
              },
            },
          },
        },
      }}
      title={
        <Box className="flex flex-col min-w-[240px]">
          <div className="flex p-1 border-b border-[#e6e6e6ff]">
            <p className="text-black font-semibold">Current Approver</p>
          </div>
          <div className="flex items-center p-1 gap-2">
            <Avatar
              src={approverObj.profile_image || undefined}
              className="!w-10 !h-10 !rounded-md !bg-blue-200 !text-blue-600"
            >
              {approverObj.name.charAt(0) || 'A'}
            </Avatar>
            <Box className="flex flex-col">
              <Typography className="text-black !text-sm">
                {approverObj.name}
              </Typography>
              {(approverObj.email || approverObj.employee_id) && (
                <Typography className="!text-gray-500 !text-xs !leading-normal !mt-0.5">
                  {approverObj.email || approverObj.employee_id}
                </Typography>
              )}
            </Box>
          </div>
        </Box>
      }
      placement="top"
      arrow
    >
      {children}
    </Tooltip>
  );
};
