import React, { useState } from 'react';
import { Copy, Check, Printer, Download, Barcode as BarcodeIcon } from 'lucide-react';
import { Tooltip, IconButton, CircularProgress } from '@mui/material';

export interface BarcodeProps {
  value: string;
  type?: 'code128' | 'qrcode' | 'ean13' | 'code39';
  label?: string;
  className?: string;
  showText?: boolean;
}

const Barcode: React.FC<BarcodeProps> = ({
  value,
  type = 'code128',
  label = 'Barcode',
  className = '',
  showText = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const barcodeUrl = `${backendUrl}/api/v1/barcode?text=${encodeURIComponent(
    value
  )}&type=${type}&format=svg`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy barcode value:', err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(barcodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${value}_barcode.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download barcode:', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${value}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: 'Poppins', sans-serif;
            }
            .container {
              text-align: center;
              border: 1px solid #e5e7eb;
              padding: 24px;
              border-radius: 8px;
            }
            img {
              max-width: 320px;
              height: auto;
            }
            .label {
              margin-top: 12px;
              font-size: 14px;
              color: #4b5563;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${barcodeUrl}" alt="Barcode" />
            <div class="label">${label}: ${value}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      className={`!bg-white !rounded-xl !border !border-gray-100 !shadow-sm !p-4 !flex !flex-col !items-center !justify-center !transition-all !duration-300 hover:!shadow-md hover:!border-gray-200 group ${className}`}
    >
      {/* Header Info */}
      <div className="!flex !items-center !justify-between !w-full !mb-3">
        <div className="!flex !items-center !gap-1.5">
          <BarcodeIcon className="w-4 h-4 !text-primary-500" />
          <span className="!text-xs !font-bold !text-gray-400 !uppercase !tracking-wider">
            {label}
          </span>
        </div>

        {/* Quick actions panel */}
        <div className="!flex !items-center !gap-1 !opacity-60 group-hover:!opacity-100 !transition-opacity !duration-200">
          <Tooltip title={copied ? 'Copied!' : `Copy ${label}`}>
            <IconButton onClick={handleCopy} size="small" className="!text-gray-500 hover:!text-primary-600 hover:!bg-primary-50 !transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Print">
            <IconButton onClick={handlePrint} size="small" className="!text-gray-500 hover:!text-primary-600 hover:!bg-primary-50 !transition-colors">
              <Printer className="w-3.5 h-3.5" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download SVG">
            <IconButton onClick={handleDownload} size="small" className="!text-gray-500 hover:!text-primary-600 hover:!bg-primary-50 !transition-colors">
              <Download className="w-3.5 h-3.5" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Barcode Image Container */}
      <div className="!relative !w-full !flex !items-center !justify-center !bg-gray-50/50 !rounded-lg !py-4 !px-6 !border !border-gray-50 !min-h-[100px] overflow-hidden">
        {loading && (
          <div className="!absolute !inset-0 !flex !items-center !justify-center !bg-white/80 !z-10">
            <CircularProgress size={24} className="!text-primary-500" />
          </div>
        )}
        <img
          src={barcodeUrl}
          alt={`${label} ${value}`}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          className={`!w-full !max-w-[280px] !height-auto !object-contain !transition-all !duration-500 ${loading ? '!scale-95 !blur-[2px]' : '!scale-100 !blur-0'
            }`}
        />
      </div>

      {/* Human Readable text below */}
      {showText && (
        <div className="!mt-2.5 !w-full !text-center">
          <span className="!font-mono !text-xs !font-bold !text-gray-700 !bg-gray-100 !px-2.5 !py-1 !rounded-md !shadow-sm">
            {value}
          </span>
        </div>
      )}
    </div>
  );
};

export default Barcode;
