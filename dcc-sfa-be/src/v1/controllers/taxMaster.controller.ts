import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

interface TaxMasterSerialized {
  id: number;
  name: string;
  code: string;
  tax_rate: number;
  description?: string | null;
  is_active: string;
  created_by: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
}

const serializeTaxMaster = (taxMaster: any): TaxMasterSerialized => ({
  id: taxMaster.id,
  name: taxMaster.name,
  code: taxMaster.code,
  tax_rate: Number(taxMaster.tax_rate),
  description: taxMaster.description,
  is_active: taxMaster.is_active,
  created_by: taxMaster.createdby,
  createdate: taxMaster.createdate,
  updatedate: taxMaster.updatedate,
  updatedby: taxMaster.updatedby,
});

export const taxMasterController = {
  async createTaxMaster(req: any, res: any) {
    try {
      const data = req.body;
      const userId = (req as any).user?.id || 1;

      if (!data.name) {
        return res.status(400).json({ message: 'Tax name is required' });
      }
      if (!data.code) {
        return res.status(400).json({ message: 'Tax code is required' });
      }
      if (data.tax_rate === undefined || data.tax_rate === null) {
        return res.status(400).json({ message: 'Tax rate is required' });
      }

      const existingCode = await prisma.tax_master.findFirst({
        where: { code: data.code },
      });

      if (existingCode) {
        return res.status(400).json({ message: 'Tax code already exists' });
      }

      const taxMaster = await prisma.tax_master.create({
        data: {
          name: data.name,
          code: data.code,
          tax_rate: Number(data.tax_rate),
          description: data.description || null,
          is_active: data.is_active || 'Y',
          createdby: userId,
          log_inst: 1,
          createdate: new Date(),
        },
      });

      return res.success(
        'Tax master created successfully',
        serializeTaxMaster(taxMaster),
        201
      );
    } catch (error: any) {
      console.error('Create Tax Master Error:', error);
      return res.error(error.message || 'Failed to create tax master', 500);
    }
  },

  async getTaxMasters(req: any, res: any) {
    try {
      const { page = '1', limit = '10', search = '', isActive } = req.query;
      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(isActive && { is_active: isActive as string }),
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
      };

      const totalTaxMasters = await prisma.tax_master.count();
      const activeTaxMasters = await prisma.tax_master.count({
        where: { is_active: 'Y' },
      });
      const inactiveTaxMasters = await prisma.tax_master.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newTaxMastersThisMonth = await prisma.tax_master.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      const stats = {
        total: totalTaxMasters,
        active: activeTaxMasters,
        inactive: inactiveTaxMasters,
        new_this_month: newTaxMastersThisMonth,
      };

      const { data, pagination } = await paginate({
        model: prisma.tax_master,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      res.success(
        'Tax masters retrieved successfully',
        data.map((d: any) => serializeTaxMaster(d)),
        200,
        pagination,
        stats
      );
    } catch (error: any) {
      console.error('Get Tax Masters Error:', error);
      return res.error(error.message || 'Failed to fetch tax masters', 500);
    }
  },

  async getTaxMasterById(req: any, res: any) {
    try {
      const { id } = req.params;
      const taxMaster = await prisma.tax_master.findUnique({
        where: { id: Number(id) },
      });

      if (!taxMaster) {
        return res.error('Tax master not found', 404);
      }

      return res.success(
        'Tax master fetched successfully',
        serializeTaxMaster(taxMaster)
      );
    } catch (error: any) {
      console.error('Get Tax Master Error:', error);
      return res.error(error.message || 'Failed to fetch tax master', 500);
    }
  },

  async updateTaxMaster(req: any, res: any) {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = (req as any).user?.id || 1;

      const existingTaxMaster = await prisma.tax_master.findUnique({
        where: { id: Number(id) },
      });

      if (!existingTaxMaster) {
        return res.error('Tax master not found', 404);
      }

      if (data.code && data.code !== existingTaxMaster.code) {
        const existingCode = await prisma.tax_master.findFirst({
          where: { code: data.code },
        });

        if (existingCode) {
          return res.error('Tax code already exists', 400);
        }
      }

      const updateData: any = {
        updatedate: new Date(),
        updatedby: userId,
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.code !== undefined) updateData.code = data.code;
      if (data.tax_rate !== undefined)
        updateData.tax_rate = Number(data.tax_rate);
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      const taxMaster = await prisma.tax_master.update({
        where: { id: Number(id) },
        data: updateData,
      });

      return res.success(
        'Tax master updated successfully',
        serializeTaxMaster(taxMaster)
      );
    } catch (error: any) {
      console.error('Update Tax Master Error:', error);
      return res.error(error.message || 'Failed to update tax master', 500);
    }
  },

  async deleteTaxMaster(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingTaxMaster = await prisma.tax_master.findUnique({
        where: { id: Number(id) },
      });

      if (!existingTaxMaster) {
        return res.error('Tax master not found', 404);
      }

      const productsUsingTax = await prisma.products.findFirst({
        where: { tax_id: Number(id) },
      });

      if (productsUsingTax) {
        return res.error(
          'Cannot delete tax master. It is being used by one or more products.',
          400
        );
      }

      await prisma.tax_master.delete({ where: { id: Number(id) } });

      return res.success('Tax master deleted successfully');
    } catch (error: any) {
      console.error('Delete Tax Master Error:', error);
      if (
        error?.code === 'P2003' ||
        error?.message?.includes('Foreign key constraint')
      ) {
        return res.error(
          'Cannot delete tax master. It is being used by one or more products.',
          400
        );
      }
      return res.error(error.message || 'Failed to delete tax master', 500);
    }
  },
};
