import React, { useState, useRef, useEffect, type ReactNode } from 'react';

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
}

interface Position {
  top: number;
  left: number;
  arrowLeft: number;
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
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    arrowLeft: 0,
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const handleClickOutside = (event: MouseEvent): void => {
    const target = event.target as Node;

    if (
      popoverRef.current &&
      !popoverRef.current.contains(target) &&
      triggerRef.current &&
      !triggerRef.current.contains(target)
    ) {
      handleClose();
    }
  };

  const calculatePosition = (): void => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverHeight = 160;
      const popoverWidth = 320;

      let top: number, left: number;

      // Calculate button center position
      const buttonCenterX = rect.left + rect.width / 2;

      if (placement === 'top') {
        top = rect.top - popoverHeight - 12;
        // Try to center popover on button first
        left = buttonCenterX - popoverWidth / 2;
      } else {
        top = rect.bottom + 12;
        left = buttonCenterX - popoverWidth / 2;
      }

      // Ensure popover stays within viewport with more padding
      const viewportPadding = 20; // Increased padding from edge
      const adjustedLeft = Math.max(
        viewportPadding,
        Math.min(left, window.innerWidth - popoverWidth - viewportPadding)
      );

      // Calculate arrow position relative to the button center
      const arrowLeft = buttonCenterX - adjustedLeft;

      // Ensure arrow stays within popover bounds (with some padding)
      const clampedArrowLeft = Math.max(
        30,
        Math.min(arrowLeft, popoverWidth - 30)
      );

      setPosition({
        top,
        left: adjustedLeft,
        arrowLeft: clampedArrowLeft,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      calculatePosition();
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, placement]);

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      if (isOpen) {
        calculatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleClick}
        className={`inline-block ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        {children}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200"
          style={{
            top: position.top,
            left: position.left,
            minWidth: '320px',
            maxWidth: '360px',
            boxShadow:
              '0 10px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-l-[8px] border-r-[8px] border-transparent ${
              placement === 'top'
                ? 'border-t-[8px] border-t-white -bottom-[7px]'
                : 'border-b-[8px] border-b-white -top-[7px]'
            }`}
            style={{
              left: `${position.arrowLeft}px`,
              transform: 'translateX(-50%)',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
            }}
          />

          {/* Arrow border/shadow */}
          <div
            className={`absolute w-0 h-0 border-l-[9px] border-r-[9px] border-transparent ${
              placement === 'top'
                ? 'border-t-[9px] border-t-gray-200 -bottom-[8px]'
                : 'border-b-[9px] border-b-gray-200 -top-[8px]'
            }`}
            style={{
              left: `${position.arrowLeft}px`,
              transform: 'translateX(-50%)',
              zIndex: -1,
            }}
          />

          <div className="p-5">
            <div className="flex items-start gap-3 mb-5">
              {/* Warning Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { PopConfirm };
export type { PopConfirmProps, DeleteConfirmationProps };

interface DeleteConfirmationProps {
  children: ReactNode;
  itemName?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  children,
  itemName = 'this item',
  onConfirm,
  onCancel,
}) => {
  return (
    <PopConfirm
      title="Delete Confirmation"
      description={`Are you sure you want to delete ${itemName}?`}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText="Delete"
      cancelText="Cancel"
      placement="top"
    >
      {children}
    </PopConfirm>
  );
};

export default DeleteConfirmation;
