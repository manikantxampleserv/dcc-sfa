import { Request, Response } from 'express';
import { deleteFile, uploadFile } from '../../utils/blackbaze';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface BrandSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  logo?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

const generateBrandCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();

  const lastBrand = await prisma.brands.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastBrand && lastBrand.code) {
    const match = lastBrand.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
  return code;
};
const serializeBrand = (b: any): BrandSerialized => ({
  id: b.id,
  name: b.name,
  code: b.code,
  description: b.description,
  logo: b.logo,
  is_active: b.is_active,
  createdate: b.createdate,
  createdby: b.createdby,
  updatedate: b.updatedate,
  updatedby: b.updatedby,
  log_inst: b.log_inst,
});

export const brandsController = {
  async createBrand(req: any, res: any) {
    try {
      const data = req.body;

      let logoPath: string | null = null;
      if (req.file) {
        const fileName = `brands/${Date.now()}-${req.file.originalname}`;
        logoPath = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
      }

      const brand = await prisma.brands.create({
        data: {
          name: data.name,
          code: await generateBrandCode(data.name),
          description: data.description || null,
          logo: logoPath,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id,
          log_inst: data.log_inst || 1,
        },
      });

      res.status(201).json({
        message: 'Brand created successfully',
        data: serializeBrand(brand),
      });
    } catch (error: any) {
      console.error('Create Brand Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllBrands(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';
      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            {
              description: { contains: searchLower },
            },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.brands,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
      });

      const totalBrands = await prisma.brands.count();
      const activeBrands = await prisma.brands.count({
        where: { is_active: 'Y' },
      });
      const inactiveBrands = await prisma.brands.count({
        where: { is_active: 'N' },
      });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newBrandsThisMonth = await prisma.brands.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });
      res.success(
        'Brands retrieved successfully',
        data.map((b: any) => serializeBrand(b)),
        200,
        pagination,
        {
          total_brands: totalBrands,
          active_brands: activeBrands,
          inactive_brands: inactiveBrands,
          new_brands_this_month: newBrandsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Brands Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getBrandById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const brand = await prisma.brands.findUnique({
        where: { id: Number(id) },
      });

      if (!brand) return res.status(404).json({ message: 'Brand not found' });

      res.json({
        message: 'Brand fetched successfully',
        data: serializeBrand(brand),
      });
    } catch (error: any) {
      console.error('Get Brand Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateBrand(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingBrand = await prisma.brands.findUnique({
        where: { id: Number(id) },
      });

      if (!existingBrand)
        return res.status(404).json({ message: 'Brand not found' });

      let logoPath: string | null = existingBrand.logo;
      if (req.file) {
        const fileName = `brands/${Date.now()}-${req.file.originalname}`;
        logoPath = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
        if (existingBrand.logo) await deleteFile(existingBrand.logo);
      }

      const data = {
        ...req.body,
        logo: logoPath,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const updatedBrand = await prisma.brands.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        message: 'Brand updated successfully',
        data: serializeBrand(updatedBrand),
      });
    } catch (error: any) {
      console.error('Update Brand Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteBrand(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const brand = await prisma.brands.findUnique({
        where: { id: Number(id) },
      });

      if (!brand) return res.status(404).json({ message: 'Brand not found' });

      if (brand.logo) await deleteFile(brand.logo);

      await prisma.brands.delete({ where: { id: Number(id) } });

      res.json({ message: 'Brand deleted successfully' });
    } catch (error: any) {
      console.error('Delete Brand Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
