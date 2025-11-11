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
  const [actualPlacement, setActualPlacement] = useState<'top' | 'bottom'>(
    placement
  );
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
      const popoverHeight = 180;
      const popoverWidth = 360; // Use maxWidth from style
      const viewportPadding = 16; // Padding from viewport edges

      let top: number, left: number;
      let actualPlacementValue: 'top' | 'bottom' = placement;

      // Calculate button center position (more accurate)
      const buttonCenterX = rect.left + rect.width / 2;

      // Dynamic spacing based on placement - reduced for better alignment
      const spacing = 8;

      // For fixed positioning, use viewport coordinates (no scroll offset needed)
      if (placement === 'top') {
        top = rect.top - popoverHeight - spacing;
        // If popover would go above viewport, place it below instead
        if (top < viewportPadding) {
          top = rect.bottom + spacing;
          actualPlacementValue = 'bottom';
        }
        left = buttonCenterX - popoverWidth / 2;
      } else {
        top = rect.bottom + spacing;
        // If popover would go below viewport, place it above instead
        if (top + popoverHeight > window.innerHeight - viewportPadding) {
          top = rect.top - popoverHeight - spacing;
          actualPlacementValue = 'top';
        }
        left = buttonCenterX - popoverWidth / 2;
      }

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const maxLeft = viewportWidth - popoverWidth - viewportPadding;
      const minLeft = viewportPadding;

      // Adjust left position to stay within viewport
      const adjustedLeft = Math.max(minLeft, Math.min(left, maxLeft));

      // Calculate arrow position relative to the button center
      // Use the actual button center, not the adjusted popover position
      const arrowLeft = buttonCenterX - adjustedLeft;

      // Ensure arrow stays within popover bounds (with padding from edges)
      // Reduced padding to allow arrow to get closer to button center
      const arrowPadding = 16;
      let clampedArrowLeft = Math.max(
        arrowPadding,
        Math.min(arrowLeft, popoverWidth - arrowPadding)
      );

      // If popover was adjusted horizontally, try to keep arrow aligned with button
      // Only clamp if absolutely necessary to stay within bounds
      if (Math.abs(arrowLeft - clampedArrowLeft) > 5) {
        // Arrow was significantly clamped, try to keep it closer to center
        clampedArrowLeft = Math.max(12, Math.min(arrowLeft, popoverWidth - 12));
      }

      setActualPlacement(actualPlacementValue);
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
      // Use setTimeout to ensure DOM is updated before calculating position
      setTimeout(() => {
        calculatePosition();
      }, 0);
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

    if (isOpen) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
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
              actualPlacement === 'top'
                ? 'border-t-[8px] border-t-white -bottom-[8px]'
                : 'border-b-[8px] border-b-white -top-[8px]'
            }`}
            style={{
              left: `${position.arrowLeft}px`,
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          />

          {/* Arrow border/shadow */}
          <div
            className={`absolute w-0 h-0 border-l-[9px] border-r-[9px] border-transparent ${
              actualPlacement === 'top'
                ? 'border-t-[9px] border-t-gray-200 -bottom-[9px]'
                : 'border-b-[9px] border-b-gray-200 -top-[9px]'
            }`}
            style={{
              left: `${position.arrowLeft}px`,
              transform: 'translateX(-50%)',
              zIndex: 9,
            }}
          />

          <div className="pb-2 pt-5 px-4">
            <div className="flex items-start gap-3 mb-5">
              {/* Warning Icon */}

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 text-wrap leading-relaxed">
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
    >
      {children}
    </PopConfirm>
  );
};

export default DeleteConfirmation;
