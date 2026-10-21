import { Close } from '@mui/icons-material';
import { ClickAwayListener, Tooltip } from '@mui/material';
import React, { useRef, useState, type ReactNode } from 'react';
import Button from 'shared/Button';

interface PopConfirmProps {
  children: ReactNode;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  placement?: 'top' | 'bottom';
  disabled?: boolean;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const PopConfirm: React.FC<PopConfirmProps> = ({
  children,
  title = 'Delete Confirmation',
  description = 'Are you sure you want to delete Admin?',
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  placement = 'top',
  disabled = false,
  confirmColor,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleClick = (): void => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleClose = (): void => {
    setIsOpen(false);
    onCancel?.();
  };

  const handleConfirm = (): void => {
    setIsOpen(false);
    onConfirm?.();
  };

  const handleClickAway = (): void => {
    handleClose();
  };

  const tooltipPlacement = placement === 'bottom' ? 'bottom' : 'top';
  const effectiveConfirmColor =
    confirmColor ||
    (confirmText.toLowerCase().includes('delete') ? 'error' : 'primary');

  return (
    <>
      <Tooltip
        open={isOpen}
        onClose={handleClose}
        onOpen={() => {}}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        placement={tooltipPlacement}
        slotProps={{
          tooltip: {
            sx: {
              minWidth: '320px',
              maxWidth: '360px',
              padding: 0,
            },
            className:
              '!relative !w-auto !min-w-0 !max-w-auto !rounded-lg !my-[2px] !bg-white !shadow-xl !border !border-gray-200',
          },
          arrow: {
            className: 'color-white',
            style: {
              color: 'white',
            },
          },
        }}
        title={
          <ClickAwayListener onClickAway={handleClickAway}>
            <div onClick={e => e.stopPropagation()}>
              <div className="pt-4 pb-2 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 leading-tight">
                        {title}
                      </h3>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded cursor-pointer border-0 bg-transparent"
                      >
                        <Close fontSize="small" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 text-wrap leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pb-4 px-4">
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  onClick={handleClose}
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  size="small"
                  color={effectiveConfirmColor}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </ClickAwayListener>
        }
        arrow
      >
        <div
          ref={triggerRef}
          onClick={handleClick}
          className={`inline-block ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          {children}
        </div>
      </Tooltip>
    </>
  );
};

export { PopConfirm };
export type { DeleteConfirmationProps, PopConfirmProps };

interface DeleteConfirmationProps {
  children: ReactNode;
  itemName?: string;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  children,
  itemName = 'this item',
  title,
  description,
  onConfirm,
  onCancel,
}) => {
  return (
    <PopConfirm
      title={title || 'Delete Confirmation'}
      description={description || `Are you sure you want to delete ${itemName}?`}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText="Delete"
      cancelText="Cancel"
    >
      {children}
    </PopConfirm>
  );
};

export default DeleteConfirmation;
