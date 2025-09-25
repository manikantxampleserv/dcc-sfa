import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import * as React from 'react';

interface CustomDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  width?: number;
  size?: 'small' | 'medium' | 'large';
  anchor?: 'left' | 'right' | 'top' | 'bottom';
}

const getDrawerWidth = (
  size?: 'small' | 'medium' | 'large',
  customWidth?: number
): number => {
  if (customWidth) return customWidth;

  switch (size) {
    case 'small':
      return 320;
    case 'medium':
      return 480;
    case 'large':
      return 640;
    default:
      return 400;
  }
};

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  open,
  setOpen,
  title,
  children,
  width,
  size = 'medium',
  anchor = 'right',
}) => {
  const drawerWidth = getDrawerWidth(size, width);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          style: { width: drawerWidth },
        },
      }}
    >
      {/* Drawer Content */}
      <Box className="!h-full !flex !flex-col">
        {/* Drawer Header */}
        <Box className="!flex !items-center !justify-between !px-4 !py-2 !border-b !border-gray-200 !min-h-16">
          <Typography
            variant="h6"
            component="h2"
            className="!font-semibold !text-gray-900"
          >
            {title}
          </Typography>
          <IconButton
            onClick={handleClose}
            className="!text-gray-500 hover:!bg-gray-100 hover:!text-gray-700"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Drawer Body */}
        <Box className="!flex-1 !px-6 !py-4 !overflow-auto">{children}</Box>
      </Box>
    </Drawer>
  );
};

export default CustomDrawer;
