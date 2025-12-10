/**
 * ## Drawer
 *
 * Custom drawer component with configurable size and positioning.
 * Built on top of MUI Drawer with consistent styling and behavior.
 *
 * @param {DrawerProps} props - Props for the Drawer component.
 *
 * #### Example
 *
 * ```tsx
 * import React, { useState } from 'react';
 * import { Button } from '@mui/material';
 * import Drawer from 'shared/Drawer';
 *
 * const MyComponent: React.FC = () => {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <div>
 *       <Button onClick={() => setOpen(true)}>
 *         Open Drawer
 *       </Button>
 *
 *       <Drawer
 *         open={open}
 *         setOpen={setOpen}
 *         title="My Drawer"
 *         size="large"
 *         anchor="right"
 *       >
 *         <div className="p-4">
 *           <p>Drawer content goes here...</p>
 *         </div>
 *       </Drawer>
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 */

import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  IconButton,
  Drawer as MuiDrawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';

interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Function to control drawer open/close state */
  setOpen: (open: boolean) => void;
  /** Title displayed in the drawer header */
  title: string;
  /** Content to be rendered inside the drawer */
  children: React.ReactNode;
  /** Custom width in percentage (overrides size prop) */
  width?: number;
  /** Predefined size options (default: 'medium') */
  size?: 'small' | 'medium' | 'large' | 'larger' | 'extra-large';
  /** Position where the drawer slides from (default: 'right') */
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  /** Whether the drawer is full width (default: false) */
  fullWidth?: boolean;
}

/**
 * Calculates the drawer width based on size or custom width
 * @param size - Predefined size option
 * @param customWidth - Custom width in percentage (takes priority over size)
 * @returns Width in percentage
 */
const getDrawerWidth = (
  size?: 'small' | 'medium' | 'large' | 'larger' | 'extra-large',
  customWidth?: number
): number => {
  if (customWidth) return customWidth;
  switch (size) {
    case 'small':
      return 30;
    case 'medium':
      return 45;
    case 'large':
      return 60;
    case 'larger':
      return 75;
    case 'extra-large':
      return 85;
    default:
      return 40;
  }
};

const Drawer: React.FC<DrawerProps> = ({
  open,
  setOpen,
  title,
  children,
  width,
  size = 'medium',
  anchor = 'right',
  fullWidth = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidthPercent = getDrawerWidth(size, width);

  const handleClose = () => {
    setOpen(false);
  };

  const getWidth = () => {
    if (fullWidth) return '100%';
    if (isMobile) return '100%';
    return `${drawerWidthPercent}%`;
  };

  return (
    <MuiDrawer
      anchor={anchor}
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          style: { width: getWidth() },
        },
      }}
    >
      {/* Drawer Content */}
      <Box className="!h-full !flex !flex-col">
        {/* Drawer Header */}
        <Box className="!flex !items-center !justify-between !py-2 !px-4 !border-b !border-gray-200 !min-h-16">
          <p className="!font-semibold text-lg !text-gray-900">{title}</p>
          <IconButton
            onClick={handleClose}
            className="!text-gray-500 hover:!bg-gray-100 hover:!text-gray-700"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Drawer Body */}
        <Box className="!flex-1 !overflow-auto">{children}</Box>
      </Box>
    </MuiDrawer>
  );
};

export default Drawer;
