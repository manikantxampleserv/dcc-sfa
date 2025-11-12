import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import { uploadFile } from '../../utils/blackbaze';
import prisma from '../../configs/prisma.client';

interface AssetMasterSerialized {
  id: number;
  asset_type_id: number;
  serial_number: string;
  purchase_date?: Date | null;
  warranty_expiry?: Date | null;
  current_location?: string | null;
  current_status?: string | null;
  assigned_to?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  asset_master_image?: any[];
  asset_maintenance_master?: any[];
  asset_movements_master?: any[];
  asset_master_warranty_claims?: any[];
  asset_master_asset_types?: any;
}

const serializeAssetMaster = (asset: any): AssetMasterSerialized => ({
  id: asset.id,
  asset_type_id: asset.asset_type_id,
  serial_number: asset.serial_number,
  purchase_date: asset.purchase_date ? new Date(asset.purchase_date) : null,
  warranty_expiry: asset.warranty_expiry
    ? new Date(asset.warranty_expiry)
    : null,
  current_location: asset.current_location,
  current_status: asset.current_status,
  assigned_to: asset.assigned_to,
  is_active: asset.is_active,
  createdate: asset.createdate,
  createdby: asset.createdby,
  updatedate: asset.updatedate,
  updatedby: asset.updatedby,
  log_inst: asset.log_inst,
  asset_master_image: asset.asset_master_image || [],
  asset_maintenance_master: asset.asset_maintenance_master || [],
  asset_movements_master: asset.asset_movements_master || [],
  asset_master_warranty_claims: asset.asset_master_warranty_claims || [],
  asset_master_asset_types: asset.asset_master_asset_types || null,
});

export const assetMasterController = {
  async createAssetMaster(req: any, res: any) {
    try {
      const {
        asset_type_id,
        serial_number,
        purchase_date,
        warranty_expiry,
        current_location,
        current_status,
        assigned_to,
        is_active,
      } = req.body;

      let assetImages: any[] = [];
      if (req.body.assetImages) {
        try {
          assetImages = JSON.parse(req.body.assetImages);
        } catch {
          assetImages = [];
        }
      }

      if (!asset_type_id || !serial_number) {
        return res
          .status(400)
          .json({ message: 'asset_type_id and serial_number are required' });
      }

      const assetData = {
        asset_type_id: Number(asset_type_id),
        serial_number,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : null,
        current_location,
        current_status,
        assigned_to,
        createdate: new Date(),
        createdby: req.user?.id || 1,
        is_active: is_active || 'Y',
        log_inst: 1,
      };

      const newAsset = await prisma.asset_master.create({
        data: assetData,
      });

      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const caption = assetImages[i]?.caption || null;

          const fileName = `asset-images/${Date.now()}-${file.originalname}`;
          const imageUrl = await uploadFile(
            file.buffer,
            fileName,
            file.mimetype
          );

          await prisma.asset_images.create({
            data: {
              asset_id: newAsset.id,
              image_url: imageUrl,
              caption,
              uploaded_by: req.user?.name || 'System',
              uploaded_at: new Date(),
              is_active: 'Y',
              createdate: new Date(),
              createdby: req.user?.id || 1,
              log_inst: 1,
            },
          });
        }
      }

      const createdAsset = await prisma.asset_master.findUnique({
        where: { id: newAsset.id },
        include: { asset_master_image: true },
      });

      res.status(201).json({
        message: 'Asset created successfully with images',
        data: createdAsset,
      });
    } catch (error: any) {
      console.error('Create Asset Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllAssetMaster(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { serial_number: { contains: searchLower } },
            { current_location: { contains: searchLower } },
            { current_status: { contains: searchLower } },
            { assigned_to: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_master,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          asset_master_image: true,
          asset_maintenance_master: true,
          asset_movements_master: true,
          asset_master_warranty_claims: true,
          asset_master_asset_types: true,
        },
      });

      const totalAssets = await prisma.asset_master.count();
      const activeAssets = await prisma.asset_master.count({
        where: { is_active: 'Y' },
      });
      const inactiveAssets = await prisma.asset_master.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const assetsThisMonth = await prisma.asset_master.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Assets retrieved successfully',
        data.map((asset: any) => serializeAssetMaster(asset)),
        200,
        pagination,
        {
          total_assets: totalAssets,
          active_assets: activeAssets,
          inactive_assets: inactiveAssets,
          assets_this_month: assetsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Assets Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetMasterById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const asset = await prisma.asset_master.findUnique({
        where: { id: Number(id) },
        include: {
          asset_master_image: true,
          asset_maintenance_master: true,
          asset_movements_master: true,
          asset_master_warranty_claims: true,
          asset_master_asset_types: true,
        },
      });

      if (!asset) return res.status(404).json({ message: 'Asset not found' });

      res.json({
        message: 'Asset fetched successfully',
        data: serializeAssetMaster(asset),
      });
    } catch (error: any) {
      console.error('Get Asset Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetMaster(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingAsset = await prisma.asset_master.findUnique({
        where: { id: Number(id) },
      });
      if (!existingAsset)
        return res.status(404).json({ message: 'Asset not found' });

      const data = {
        ...req.body,
        purchase_date: req.body.purchase_date
          ? new Date(req.body.purchase_date)
          : existingAsset.purchase_date,
        warranty_expiry: req.body.warranty_expiry
          ? new Date(req.body.warranty_expiry)
          : existingAsset.warranty_expiry,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const asset = await prisma.asset_master.update({
        where: { id: Number(id) },
        data,
        include: {
          asset_master_image: true,
          asset_maintenance_master: true,
          asset_movements_master: true,
          asset_master_warranty_claims: true,
          asset_master_asset_types: true,
        },
      });

      res.json({
        message: 'Asset updated successfully',
        data: serializeAssetMaster(asset),
      });
    } catch (error: any) {
      console.error('Update Asset Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAssetMaster(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingAsset = await prisma.asset_master.findUnique({
        where: { id: Number(id) },
      });
      if (!existingAsset)
        return res.status(404).json({ message: 'Asset not found' });

      await prisma.asset_master.delete({ where: { id: Number(id) } });

      res.json({ message: 'Asset deleted successfully' });
    } catch (error: any) {
      console.error('Delete Asset Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
