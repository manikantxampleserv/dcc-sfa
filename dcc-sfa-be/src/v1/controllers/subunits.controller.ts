import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface SubunitSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  unit_of_measurement_id: number;
  product_id: number;
  is_active: string;
  createdby: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  subunits_unit_of_measurement?: {
    id: number;
    name: string;
    code: string;
  };
  subunits_products?: {
    id: number;
    name: string;
    code: string;
  };
}

const generateSubunitCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();

  const lastSubunit = await prisma.subunits.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastSubunit && lastSubunit.code) {
    const match = lastSubunit.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
  return code;
};

const serializeSubunit = (subunit: any): SubunitSerialized => ({
  id: subunit.id,
  name: subunit.name,
  code: subunit.code,
  description: subunit.description,
  unit_of_measurement_id: subunit.unit_of_measurement_id,
  product_id: subunit.product_id,
  is_active: subunit.is_active,
  createdby: subunit.createdby,
  createdate: subunit.createdate,
  updatedate: subunit.updatedate,
  updatedby: subunit.updatedby,
  log_inst: subunit.log_inst,
  subunits_unit_of_measurement: subunit.subunits_unit_of_measurement,
  subunits_products: subunit.subunits_products,
});

export const subunitsController = {
  async createSubunit(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Subunit name is required' });
      }

      if (!data.unit_of_measurement_id) {
        return res
          .status(400)
          .json({ message: 'Unit of measurement is required' });
      }

      if (!data.product_id) {
        return res.status(400).json({ message: 'Product is required' });
      }

      const existingSubunit = await prisma.subunits.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
          },
        },
      });

      if (existingSubunit) {
        return res
          .status(400)
          .json({ message: 'Subunit with this name already exists' });
      }

      const existingCode = await prisma.subunits.findUnique({
        where: { code: data.code },
      });

      if (existingCode) {
        return res
          .status(400)
          .json({ message: 'Subunit with this code already exists' });
      }

      const newCode = data.code || (await generateSubunitCode(data.name));
      const subunit = await prisma.subunits.create({
        data: {
          ...data,
          code: newCode,
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          subunits_unit_of_measurement: true,
          subunits_products: true,
        },
      });

      res.status(201).json({
        message: 'Subunit created successfully',
        data: serializeSubunit(subunit),
      });
    } catch (error: any) {
      console.error('Create Subunit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSubunits(req: any, res: any) {
    try {
      const {
        page,
        limit,
        search,
        name,
        isActive,
        productId,
        unitOfMeasurementId,
      } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
        ...(name && {
          name: { contains: (name as string).toLowerCase() },
        }),
        ...(isActive && { is_active: isActive as string }),
        ...(productId && { product_id: parseInt(productId as string, 10) }),
        ...(unitOfMeasurementId && {
          unit_of_measurement_id: parseInt(unitOfMeasurementId as string, 10),
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.subunits,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          subunits_unit_of_measurement: true,
          subunits_products: true,
        },
      });

      const totalSubunits = await prisma.subunits.count();
      const activeSubunits = await prisma.subunits.count({
        where: { is_active: 'Y' },
      });
      const inactiveSubunits = await prisma.subunits.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const newSubunitsThisMonth = await prisma.subunits.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.success(
        'Subunits retrieved successfully',
        data.map((subunit: any) => serializeSubunit(subunit)),
        200,
        pagination,
        {
          totalSubunits,
          active_subunits: activeSubunits,
          inactive_subunits: inactiveSubunits,
          new_subunits: newSubunitsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Subunits Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSubunitById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subunit = await prisma.subunits.findUnique({
        where: { id: Number(id) },
        include: {
          subunits_unit_of_measurement: true,
          subunits_products: true,
        },
      });

      if (!subunit) {
        return res.status(404).json({ message: 'Subunit not found' });
      }

      res.json({
        message: 'Subunit fetched successfully',
        data: serializeSubunit(subunit),
      });
    } catch (error: any) {
      console.error('Get Subunit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateSubunit(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingSubunit = await prisma.subunits.findUnique({
        where: { id: Number(id) },
      });

      if (!existingSubunit) {
        return res.status(404).json({ message: 'Subunit not found' });
      }

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      if (req.body.code && req.body.code !== existingSubunit.code) {
        const existingCode = await prisma.subunits.findUnique({
          where: { code: req.body.code },
        });

        if (existingCode) {
          return res
            .status(400)
            .json({ message: 'Subunit with this code already exists' });
        }
      }

      const subunit = await prisma.subunits.update({
        where: { id: Number(id) },
        data,
        include: {
          subunits_unit_of_measurement: true,
          subunits_products: true,
        },
      });

      res.json({
        message: 'Subunit updated successfully',
        data: serializeSubunit(subunit),
      });
    } catch (error: any) {
      console.error('Update Subunit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSubunit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subunitId = Number(id);

      const existingSubunit = await prisma.subunits.findUnique({
        where: { id: subunitId },
      });

      if (!existingSubunit) {
        return res.status(404).json({ message: 'Subunit not found' });
      }

      await prisma.subunits.delete({ where: { id: subunitId } });

      res.json({ message: 'Subunit deleted successfully' });
    } catch (error: any) {
      console.error('Delete Subunit Error:', error);

      if (error.code === 'P2003') {
        return res.status(400).json({
          message: 'Cannot delete subunit. It is referenced by other records.',
          suggestion:
            'Please update or delete the dependent records first, or consider setting the subunit as inactive instead.',
        });
      }

      res.status(500).json({ message: error.message });
    }
  },

  async getUnitsOfMeasurement(req: Request, res: Response) {
    try {
      const { search = '' } = req.query;
      const searchLower = (search as string).toLowerCase().trim();

      const units = await prisma.unit_of_measurement.findMany({
        where: {
          is_active: 'Y',
          ...(searchLower && {
            OR: [
              {
                name: {
                  contains: searchLower,
                },
              },
              {
                symbol: {
                  contains: searchLower,
                },
              },
            ],
          }),
        },
        select: {
          id: true,
          name: true,
          symbol: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 50,
      });

      res.json({
        message: 'Units of measurement retrieved successfully',
        data: units,
      });
    } catch (error: any) {
      console.error('Get Units of Measurement Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getProducts(req: Request, res: Response) {
    try {
      const { search = '' } = req.query;
      const searchLower = (search as string).toLowerCase().trim();

      const products = await prisma.products.findMany({
        where: {
          is_active: 'Y',
          ...(searchLower && {
            OR: [
              {
                name: {
                  contains: searchLower,
                },
              },
              {
                code: {
                  contains: searchLower,
                },
              },
            ],
          }),
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 50,
      });

      res.json({
        message: 'Products retrieved successfully',
        data: products,
      });
    } catch (error: any) {
      console.error('Get Products Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
