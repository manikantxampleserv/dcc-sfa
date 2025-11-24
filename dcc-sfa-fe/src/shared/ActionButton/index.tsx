import { Delete, Edit } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { DeleteConfirmation } from '../DeleteConfirmation';

interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
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
  size = 'medium',
}) => {
  const button = (
    <IconButton
      size={size}
      onClick={e => {
        e.stopPropagation();
        onClick?.();
      }}
      disabled={disabled}
      className="!bg-blue-100 !rounded hover:!bg-blue-200 !text-blue-600"
    >
      <Edit fontSize="small" />
    </IconButton>
  );

  return tooltip ? (
    <Tooltip placement="top" title={tooltip} arrow>
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
  size = 'medium',
  confirmDelete = true,
  itemName = 'this item',
}) => {
  const button = (
    <IconButton
      size={size}
      disabled={disabled}
      className="!bg-red-100 !rounded hover:!bg-red-200 !text-red-600"
    >
      <Delete fontSize="small" />
    </IconButton>
  );

  const tooltipButton = tooltip ? (
    <Tooltip placement="top" title={tooltip} arrow>
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
    <div onClick={e => e.stopPropagation()}>{tooltipButton}</div>
  );
};

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  tooltip = 'Action',
  size = 'medium',
  icon,
  color = 'primary',
}) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'error':
        return '!bg-red-100 hover:!bg-red-200 !text-red-600';
      case 'warning':
        return '!bg-orange-100 hover:!bg-orange-200 !text-orange-600';
      case 'success':
        return '!bg-green-100 hover:!bg-green-200 !text-green-600';
      case 'info':
        return '!bg-blue-100 hover:!bg-blue-200 !text-blue-600';
      default:
        return '!bg-gray-100 hover:!bg-gray-200 !text-gray-600';
    }
  };

  const button = (
    <IconButton
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`!rounded ${getColorClass(color)}`}
    >
      {icon}
    </IconButton>
  );

  return tooltip ? (
    <Tooltip placement="top" title={tooltip} arrow>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

export { DeleteButton, EditButton, ActionButton };
export type { ActionButtonProps, DeleteButtonProps, EditButtonProps };
