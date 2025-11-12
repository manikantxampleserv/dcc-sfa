import { Request, Response } from 'express';
import { uploadFile, deleteFile } from '../../utils/blackbaze';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface AssetImageSerialized {
  id: number;
  asset_id: number;
  image_url: string;
  caption?: string | null;
  uploaded_by?: string | null;
  uploaded_at?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

const serializeAssetImage = (img: any): AssetImageSerialized => ({
  id: img.id,
  asset_id: img.asset_id,
  image_url: img.image_url,
  caption: img.caption,
  uploaded_by: img.uploaded_by,
  uploaded_at: img.uploaded_at,
  is_active: img.is_active,
  createdate: img.createdate,
  createdby: img.createdby,
  updatedate: img.updatedate,
  updatedby: img.updatedby,
  log_inst: img.log_inst,
});

export const assetImagesController = {
  async createAssetImages(req: any, res: any) {
    try {
      const data = req.body;

      if (!data.asset_id)
        return res.status(400).json({ message: 'asset_id is required' });
      if (!req.file)
        return res.status(400).json({ message: 'Image file is required' });

      const fileName = `asset-images/${Date.now()}-${req.file.originalname}`;
      const imageUrl = await uploadFile(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );

      const image = await prisma.asset_images.create({
        data: {
          asset_id: Number(data.asset_id),
          image_url: imageUrl,
          caption: data.caption,
          uploaded_by: req.user?.name || 'System',
          uploaded_at: new Date(),
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
      });

      res.status(201).json({
        message: 'Asset image uploaded successfully',
        data: serializeAssetImage(image),
      });
    } catch (error: any) {
      console.error('Create Asset Image Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllAssetImages(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [{ caption: { contains: searchLower } }],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_images,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
      });

      const totalAssets = await prisma.asset_images.count({ where: filters });
      const activeAssetImages = await prisma.asset_images.count({
        where: { is_active: 'Y' },
      });
      const inactiveAssetImages = await prisma.asset_images.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const totalAssetImages = await prisma.asset_images.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      res.success(
        'Asset images retrieved successfully',
        data.map((img: any) => serializeAssetImage(img)),
        200,
        pagination,
        {
          total_asset_images: totalAssets,
          active_asset_images: activeAssetImages,
          total_asset_images_this_month: totalAssetImages,
          inactive_asset_images: inactiveAssetImages,
        }
      );
    } catch (error: any) {
      console.error('Get Asset Images Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetImagesById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const image = await prisma.asset_images.findUnique({
        where: { id: Number(id) },
      });

      if (!image)
        return res.status(404).json({ message: 'Asset image not found' });

      res.json({
        message: 'Asset image fetched successfully',
        data: serializeAssetImage(image),
      });
    } catch (error: any) {
      console.error('Get Asset Image Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetImages(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingImage = await prisma.asset_images.findUnique({
        where: { id: Number(id) },
      });

      if (!existingImage)
        return res.status(404).json({ message: 'Asset image not found' });

      let imageUrl = existingImage.image_url;

      if (req.file) {
        const fileName = `asset-images/${Date.now()}-${req.file.originalname}`;
        imageUrl = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
        if (existingImage.image_url) await deleteFile(existingImage.image_url);
      }

      const updated = await prisma.asset_images.update({
        where: { id: Number(id) },
        data: {
          caption: req.body.caption ?? existingImage.caption,
          image_url: imageUrl,
          is_active: req.body.is_active ?? existingImage.is_active,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
      });

      res.json({
        message: 'Asset image updated successfully',
        data: serializeAssetImage(updated),
      });
    } catch (error: any) {
      console.error('Update Asset Image Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAssetImages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const image = await prisma.asset_images.findUnique({
        where: { id: Number(id) },
      });

      if (!image)
        return res.status(404).json({ message: 'Asset image not found' });

      if (image.image_url) await deleteFile(image.image_url);

      await prisma.asset_images.delete({ where: { id: Number(id) } });

      res.json({ message: 'Asset image deleted successfully' });
    } catch (error: any) {
      console.error('Delete Asset Image Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
