import { Print, Receipt } from '@mui/icons-material';
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { getPromotionMaterialsIssueNoteHtml } from 'services/transactions/PromotionMaterialsIssue';
import Button from 'shared/Button';

export interface GoodsIssueNoteModalProps {
  open: boolean;
  onClose: () => void;
  issueId: number | null;
  ginNumber?: string;
}

/**
 * Modal dialog for previewing and printing a Promotion Materials Goods Issue Note.
 *
 * @param props - Component properties
 * @returns React modal component
 */
export const GoodsIssueNoteModal: React.FC<GoodsIssueNoteModalProps> = ({
  open,
  onClose,
  issueId,
  ginNumber,
}) => {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open || !issueId) {
      setHtml('');
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getPromotionMaterialsIssueNoteHtml(issueId)
      .then(content => {
        if (!isMounted) return;
        /**
         * Hide the standalone action bar in the HTML when rendered inside the modal preview.
         */
        const modifiedContent = content.replace(
          'class="action-bar no-print"',
          'class="action-bar no-print" style="display:none !important;"'
        );
        setHtml(modifiedContent);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load Goods Issue Note');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, issueId]);

  /**
   * Triggers printing directly from the embedded iframe without opening a new browser tab.
   */
  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            maxHeight: '94vh',
          },
        },
      }}
    >
      <DialogTitle className="!flex !items-center !justify-between !p-3 !border-b !border-gray-200 !bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-purple-100 flex items-center justify-center text-purple-600">
            <Receipt fontSize="small" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 leading-tight">
              Goods Issue Note
            </span>
            <span className="text-xs text-gray-500 leading-tight">
              {ginNumber}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            color="primary"
            variant="contained"
            startIcon={<Print fontSize="small" />}
            onClick={handlePrint}
            disabled={isLoading || Boolean(error)}
          >
            Print
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogTitle>

      <DialogContent className="!p-0 !bg-gray-100 !overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <CircularProgress size={36} />
            <p className="text-sm text-gray-500">
              Generating Goods Issue Note...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            srcDoc={html}
            title={
              ginNumber ? `Goods Issue Note - ${ginNumber}` : 'Goods Issue Note'
            }
            className="w-full border-0 block"
            style={{
              height: 'calc(90vh - 75px)',
              backgroundColor: '#f3f4f6',
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoodsIssueNoteModal;
