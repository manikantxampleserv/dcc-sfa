import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import type { Role } from '../../../../hooks/useRoles';

interface ManageRolePermissionsProps {
  role?: Role | null;
  onClose: () => void;
}

const ManageRolePermissions: React.FC<ManageRolePermissionsProps> = ({
  role,
  onClose,
}) => {
  const isEdit = !!role;

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: '!rounded-lg',
      }}
    >
      <DialogTitle className="!pb-2">
        <Box className="!flex !justify-between !items-center">
          <Typography variant="h6" className="!font-semibold">
            {isEdit ? `Edit Role: ${role.name}` : 'Create New Role'}
          </Typography>
          <Button
            onClick={onClose}
            size="small"
            className="!min-w-0 !p-1"
            color="inherit"
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent className="!pt-4">
        <Box className="!space-y-4">
          <Typography variant="body1" className="!text-gray-600">
            {isEdit
              ? 'Modify role details and permissions'
              : 'Create a new role and assign permissions'}
          </Typography>

          {/* Role Form will be implemented here */}
          <Box className="!p-4 !bg-gray-50 !rounded">
            <Typography variant="body2" className="!text-gray-500">
              Role management form coming soon...
            </Typography>
            {isEdit && (
              <Box className="!mt-2">
                <Typography variant="caption" className="!text-gray-400">
                  Role ID: {role.id}
                </Typography>
                <br />
                <Typography variant="caption" className="!text-gray-400">
                  Status: {role.is_active === 'Y' ? 'Active' : 'Inactive'}
                </Typography>
                <br />
                <Typography variant="caption" className="!text-gray-400">
                  Users: {role._count?.user_role || 0}
                </Typography>
                <br />
                <Typography variant="caption" className="!text-gray-400">
                  Permissions: {role.permissions?.filter(p => p.is_active === 'Y').length || 0}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="!p-4 !pt-2">
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="primary">
          {isEdit ? 'Update Role' : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageRolePermissions;
