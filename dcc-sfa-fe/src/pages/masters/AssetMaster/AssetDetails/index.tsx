import { CheckCircle, Settings } from '@mui/icons-material';
import { Avatar, Chip, Modal, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useAssetMasterById } from 'hooks/useAssetMaster';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  Image as ImageIcon,
  MapPin,
  Package,
  Settings as SettingsIcon,
  Wrench,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const AssetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const {
    data: asset,
    isLoading,
    error,
    isFetching,
  } = useAssetMasterById(Number(id));

  const handleBack = () => {
    navigate('/masters/asset-master');
  };

  const handleOpenImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseImage = () => {
    setSelectedImageIndex(null);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && asset?.asset_master_image) {
      setSelectedImageIndex(
        (selectedImageIndex - 1 + asset.asset_master_image.length) %
          asset.asset_master_image.length
      );
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && asset?.asset_master_image) {
      setSelectedImageIndex(
        (selectedImageIndex + 1) % asset.asset_master_image.length
      );
    }
  };

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'success';
      case 'installed':
        return 'primary';
      case 'under maintenance':
        return 'warning';
      case 'damaged':
      case 'lost':
        return 'error';
      case 'retired':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="!flex-2 flex flex-col gap-4">
            <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
              <div className="!absolute !top-3 !right-3">
                <Skeleton
                  variant="circular"
                  width={10}
                  height={10}
                  className="!bg-green-200"
                />
              </div>
              <div className="!relative !mb-4">
                <Skeleton
                  variant="circular"
                  width={96}
                  height={96}
                  className="!mx-auto !border-3 !border-white"
                />
              </div>
              <Skeleton
                variant="text"
                width="70%"
                height={24}
                className="!mx-auto !mb-1"
              />
              <Skeleton
                variant="text"
                width="50%"
                height={16}
                className="!mx-auto !mb-3"
              />
              <Skeleton
                variant="rectangular"
                width="60%"
                height={24}
                className="!mx-auto !mb-4 !bg-green-50"
              />
              <div className="!space-y-2 !text-left !mt-4">
                <div className="!p-2 !bg-gray-50 !rounded-md">
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={10}
                    className="!mb-1"
                  />
                  <Skeleton variant="text" width="60%" height={14} />
                </div>
                <div className="!p-2 !bg-gray-50 !rounded-md">
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={10}
                    className="!mb-1"
                  />
                  <Skeleton variant="text" width="70%" height={14} />
                </div>
              </div>
            </div>
          </div>
          <div className="!flex-4 !space-y-4 w-full">
            <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
              <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
              <div className="!relative !z-10">
                <div className="!flex !items-center !gap-2 !mb-4">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width={200} height={20} />
                </div>
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                  {[1, 2, 3, 4, 5, 6].map(field => (
                    <div key={field} className="!space-y-1">
                      <Skeleton variant="text" width="40%" height={12} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load asset details
            </Typography>
          </div>
          <Typography variant="body2" className="!text-gray-200">
            Please try again or contact your system administrator if this
            problem persists.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
          className="mt-4"
        >
          Back to Assets
        </Button>
      </div>
    );
  }

  const InfoCard = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
      <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
      <div className="!relative !z-10">
        <div className="!flex !items-center !gap-2 !mb-4">
          {Icon && (
            <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
              <Icon className="!text-primary-500 w-5 h-5" />
            </div>
          )}
          <Typography variant="h6" className="!font-bold !text-gray-900">
            {title}
          </Typography>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        {/* Left Profile Column */}
        <div className="!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  asset.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                      asset.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      asset.is_active !== 'Y',
                  }
                )}
              >
                <Package className="!w-10 !h-10" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              {asset.name}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {asset.serial_number}
            </Typography>

            <div className="!flex !justify-center !gap-2 !mb-4">
              <Chip
                icon={
                  asset.is_active === 'Y' ? (
                    <CheckCircle fontSize="small" />
                  ) : (
                    <Settings fontSize="small" />
                  )
                }
                label={asset.is_active === 'Y' ? 'Active' : 'Inactive'}
                size="small"
                color={asset.is_active === 'Y' ? 'success' : 'error'}
              />
              <Chip
                label={asset.current_status || 'Available'}
                size="small"
                color={getStatusColor(asset.current_status) as any}
                variant="outlined"
              />
            </div>

            <div className="!space-y-1 !text-left !mt-4">
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Asset Type
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {asset.asset_master_asset_types?.name || 'N/A'}
                </Typography>
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Brand
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {asset.asset_brand?.name || 'N/A'}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="!flex-4 !space-y-2 w-full">
          <InfoCard title="Asset Information" icon={SettingsIcon}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Serial Number
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 font-mono"
                >
                  {asset.serial_number}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Asset Code
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 font-mono"
                >
                  {asset.code || 'N/A'}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Barcode
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 font-mono"
                >
                  {asset.barcode || 'N/A'}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  NFC Tag
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 font-mono"
                >
                  {asset.nfc_tag_code || 'N/A'}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Sub Type
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {asset.asset_master_asset_sub_types?.name || 'N/A'}
                </Typography>
              </div>

              {/* <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Assigned To
                </Typography>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {asset.assigned_to || 'Unassigned'}
                  </Typography>
                </div>
              </div> */}

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Current Location
                </Typography>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {asset.current_location || 'Not specified'}
                  </Typography>
                </div>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Purchase Date
                </Typography>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {asset.purchase_date
                      ? formatDate(asset.purchase_date)
                      : 'N/A'}
                  </Typography>
                </div>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Warranty Expiry
                </Typography>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {asset.warranty_expiry
                      ? formatDate(asset.warranty_expiry)
                      : 'N/A'}
                  </Typography>
                </div>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Installation Date
                </Typography>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {asset.installation_date
                      ? formatDate(asset.installation_date)
                      : 'N/A'}
                  </Typography>
                </div>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Last Scanned Date
                </Typography>
                <div className="flex items-center gap-1">
                  <History className="w-3 h-3 text-gray-400" />
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {asset.last_scanned_date
                      ? formatDate(asset.last_scanned_date)
                      : 'N/A'}
                  </Typography>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Images Section */}
      <InfoCard title="Asset Images" icon={ImageIcon}>
        {asset.asset_master_image && asset.asset_master_image.length > 0 ? (
          <div className="!flex !flex-wrap !gap-4">
            {asset.asset_master_image.map((img: any, index: number) => (
              <div
                key={img.id}
                className="group relative cursor-pointer"
                onClick={() => handleOpenImage(index)}
              >
                <div className="!w-40 !h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                  <img
                    src={img.image_url}
                    alt={img.caption || 'Asset'}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <Typography
                  variant="caption"
                  className="!mt-1 !block !text-center !text-gray-500 truncate px-1"
                >
                  {img.caption || 'No caption'}
                </Typography>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <ImageIcon className="text-gray-300 w-12 h-12 mb-2" />
            <Typography variant="body2" className="!text-gray-400 !italic">
              No images uploaded for this asset
            </Typography>
          </div>
        )}
      </InfoCard>

      {/* Image Viewer Modal */}
      <Modal
        open={selectedImageIndex !== null}
        onClose={handleCloseImage}
        className="flex items-center justify-center p-4 bg-black/90"
      >
        <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center outline-none">
          {/* Close Button */}
          <button
            onClick={handleCloseImage}
            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          {asset.asset_master_image && asset.asset_master_image.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Image Container */}
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {selectedImageIndex !== null && asset.asset_master_image && (
              <img
                src={asset.asset_master_image[selectedImageIndex].image_url}
                alt={
                  asset.asset_master_image[selectedImageIndex].caption ||
                  'Asset'
                }
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Caption & Counter */}
          <div className="mt-4 text-center">
            {selectedImageIndex !== null && asset.asset_master_image && (
              <>
                <Typography variant="h6" className="!text-white !font-bold">
                  {asset.asset_master_image[selectedImageIndex].caption ||
                    'No caption'}
                </Typography>
                <Typography variant="body2" className="!text-gray-400">
                  {selectedImageIndex + 1} / {asset.asset_master_image.length}
                </Typography>
              </>
            )}
          </div>

          {/* Next Button */}
          {asset.asset_master_image && asset.asset_master_image.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      </Modal>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Maintenance History" icon={Wrench}>
          {asset.asset_maintenance_master &&
          asset.asset_maintenance_master.length > 0 ? (
            <div className="!space-y-4">
              {asset.asset_maintenance_master.map((item: any) => (
                <div
                  key={item.id}
                  className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-100"
                >
                  <div className="!flex !justify-between !items-start !mb-2">
                    <Typography
                      variant="body2"
                      className="!font-bold !text-gray-900"
                    >
                      {item.issue_reported}
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      {formatDate(item.maintenance_date)}
                    </Typography>
                  </div>
                  <Typography variant="caption" className="!text-gray-600">
                    <span className="!font-semibold">Action:</span>{' '}
                    {item.action_taken}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <History className="w-8 h-8 mb-2 opacity-30" />
              <Typography variant="body2" className="!italic">
                No maintenance records found
              </Typography>
            </div>
          )}
        </InfoCard>

        <InfoCard title="Movement History" icon={History}>
          {asset.asset_movement_assets_asset &&
          asset.asset_movement_assets_asset.length > 0 ? (
            <div className="!space-y-4">
              {asset.asset_movement_assets_asset.map((item: any) => (
                <div
                  key={item.id}
                  className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-100"
                >
                  <div className="!flex !justify-between !items-start !mb-2">
                    <Typography
                      variant="body2"
                      className="!font-bold !text-gray-900 !capitalize"
                    >
                      {item.movement_type}
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      {formatDate(item.movement_date)}
                    </Typography>
                  </div>
                  <div className="!flex !items-center !gap-2 !mb-1">
                    <Typography variant="caption" className="!text-gray-600">
                      {item.from_direction || 'N/A'}
                    </Typography>
                    <span className="!text-gray-400 !text-xs">→</span>
                    <Typography variant="caption" className="!text-gray-600">
                      {item.to_direction || 'N/A'}
                    </Typography>
                  </div>
                  {item.notes && (
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !italic !block"
                    >
                      "{item.notes}"
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <History className="w-8 h-8 mb-2 opacity-30" />
              <Typography variant="body2" className="!italic">
                No movement history available
              </Typography>
            </div>
          )}
        </InfoCard>
      </div>
    </div>
  );
};

export default AssetDetails;
