import { Delete, Edit } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { DeleteConfirmation } from '../DeleteConfirmation';

interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
}

interface EditButtonProps extends ActionButtonProps {}

interface DeleteButtonProps extends ActionButtonProps {
  confirmDelete?: boolean;
  itemName?: string;
}

const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  disabled = false,
  tooltip = 'Edit',
  size = 'small',
}) => {
  const button = (
    <IconButton
      size={size}
      onClick={onClick}
      disabled={disabled}
      className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
    >
      <Edit fontSize={size} />
    </IconButton>
  );

  return tooltip ? (
    <Tooltip placement="top" title={tooltip}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled = false,
  tooltip = 'Delete',
  size = 'small',
  confirmDelete = true,
  itemName = 'this item',
}) => {
  const button = (
    <IconButton
      size={size}
      onClick={confirmDelete ? undefined : onClick}
      disabled={disabled}
      className="!bg-red-100 hover:!bg-red-200 !text-red-600"
    >
      <Delete fontSize={size} />
    </IconButton>
  );

  const tooltipButton = tooltip ? (
    <Tooltip placement="top" title={tooltip}>
      {button}
    </Tooltip>
  ) : (
    button
  );

  return confirmDelete ? (
    <DeleteConfirmation itemName={itemName} onConfirm={onClick}>
      {tooltipButton}
    </DeleteConfirmation>
  ) : (
    tooltipButton
  );
};

export { DeleteButton, EditButton };
export type { ActionButtonProps, DeleteButtonProps, EditButtonProps };
