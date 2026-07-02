import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { deleteFile, uploadFile } from '../../utils/blackbaze';
import { isAdminRole } from '../../configs/permissions.config';

interface AssetMasterSerialized {
  id: number;
  name: string;
  code: string;
  outlet_id?: number | null;
  asset_type_id: number;
  asset_brand_id?: number | null;
  installation_date?: Date | null;
  last_scanned_date?: Date | null;
  last_read_by?: number | null;
  asset_sub_type_id?: number | null;
  brand_id?: number | null;
  barcode?: string | null;
  nfc_tag?: string | null;
  serial_number: string;
  purchase_date?: Date | null;
  warranty_expiry?: Date | null;
  current_location?: string | null;
  current_status?: string | null;
  assigned_to?: string | null;
  depot_id?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  asset_master_image?: any[];
  asset_maintenance_master?: any[];
  asset_movement_assets_asset?: any[];
  asset_master_warranty_claims?: any[];
  asset_master_asset_types?: any;
  asset_master_asset_sub_types?: any;
  asset_master_brand?: any;
  asset_master_last_read?: any;
  asset_brand?: {
    id: number;
    name: string;
    code: string;
  } | null;
  last_read_user: {
    id: number;
    name: string;
    email: string;
  } | null;
  inspections?: Array<{
    inspected_by: { id: number; name: string; email: string } | null;
    inspection_date?: string | null;
  }>;
  asset_master_depot?: {
    id: number;
    name: string;
    code: string;
  } | null;
  asset_master_outlet?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

const generateAssetCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();
  const lastAssetCode = await prisma.asset_master.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastAssetCode && lastAssetCode.code) {
    const match = lastAssetCode.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }
  const code = `${prefix}-${newNumber.toString().padStart(3, '0')}`;
  return code;
};

const serializeAssetMaster = (asset: any): AssetMasterSerialized => ({
  id: asset.id,
  name: asset.name,
  code: asset.code,
  outlet_id: asset.outlet_id,
  asset_type_id: asset.asset_type_id,
  asset_sub_type_id: asset.asset_sub_type_id,
  installation_date: asset.installation_date ?? null,
  last_scanned_date: asset.last_scanned_date ?? null,
  last_read_by: asset.last_read_by ?? null,
  asset_brand_id: asset.asset_brand_id,
  barcode: asset.barcode,
  nfc_tag: asset.nfc_tag,
  serial_number: asset.serial_number,
  purchase_date: asset.purchase_date ? new Date(asset.purchase_date) : null,
  warranty_expiry: asset.warranty_expiry
    ? new Date(asset.warranty_expiry)
    : null,
  current_location: asset.current_location,
  current_status: asset.current_status,
  assigned_to: asset.assigned_to,
  depot_id: asset.depot_id,
  is_active: asset.is_active,
  createdate: asset.createdate,
  createdby: asset.createdby,
  updatedate: asset.updatedate,
  updatedby: asset.updatedby,
  log_inst: asset.log_inst,
  asset_master_image: asset.asset_master_image || [],
  asset_maintenance_master: asset.asset_maintenance_master || [],
  asset_movement_assets_asset:
    asset.asset_movement_assets_asset?.map((m: any) => ({
      id: m.asset_movement_assets_movement?.id,
      movement_type: m.asset_movement_assets_movement?.movement_type,
      movement_date: m.asset_movement_assets_movement?.movement_date,
      from_direction: m.asset_movement_assets_movement?.from_direction,
      to_direction: m.asset_movement_assets_movement?.to_direction,
      notes: m.asset_movement_assets_movement?.notes,
    })) || [],
  asset_master_warranty_claims: asset.asset_master_warranty_claims || [],
  asset_master_asset_types: asset.asset_master_asset_types || null,
  asset_master_asset_sub_types: asset.asset_master_asset_sub_types || null,
  asset_brand: asset.asset_master_brands
    ? {
        id: asset.asset_master_brands.id,
        name: asset.asset_master_brands.name,
        code: asset.asset_master_brands.code,
      }
    : null,
  last_read_user: asset.asset_master_last_read
    ? {
        id: asset.asset_master_last_read.id,
        name: asset.asset_master_last_read.name,
        email: asset.asset_master_last_read.email,
      }
    : null,
  asset_master_depot: asset.asset_master_depot
    ? {
        id: asset.asset_master_depot.id,
        name: asset.asset_master_depot.name,
        code: asset.asset_master_depot.code,
      }
    : null,
  asset_master_outlet: asset.asset_master_outlet
    ? {
        id: asset.asset_master_outlet.id,
        name: asset.asset_master_outlet.name,
        code: asset.asset_master_outlet.code,
      }
    : null,
  inspections:
    asset.inspections?.map((ins: any) => ({
      inspected_by: ins.users
        ? { id: ins.users.id, name: ins.users.name, email: ins.users.email }
        : null,
      inspection_date: ins.inspection_date
        ? ins.inspection_date.toISOString()
        : null,
    })) || [],
});

export const assetMasterController = {
  async createAssetMaster(req: any, res: any) {
    try {
      const {
        name,
        code,
        asset_type_id,
        asset_sub_type_id,
        barcode,
        nfc_tag,
        installation_date,
        last_scanned_date,
        last_read_by,
        serial_number,
        purchase_date,
        warranty_expiry,
        current_location,
        current_status,
        assigned_to,
        asset_brand_id,
        depot_id,
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

      if (!name || !asset_type_id || !serial_number) {
        return res.status(400).json({
          message: 'name, asset_type_id and serial_number are required',
        });
      }

      if (barcode) {
        const existingBarcode = await prisma.asset_master.findFirst({
          where: { barcode: barcode },
        });

        if (existingBarcode) {
          return res.status(409).json({
            message: 'Asset with this barcode already exists',
          });
        }
      }

      if (nfc_tag) {
        const existingNfcTag = await prisma.asset_master.findFirst({
          where: { nfc_tag: nfc_tag },
        });

        if (existingNfcTag) {
          return res.status(409).json({
            message: 'Asset with this NFC tag already exists',
          });
        }
      }

      let assetCode: string;
      if (code && code.trim() !== '') {
        assetCode = code.trim();

        const existingAsset = await prisma.asset_master.findFirst({
          where: { code: assetCode },
        });

        if (existingAsset) {
          return res.status(400).json({ message: 'Asset code already exists' });
        }
      } else {
        assetCode = await generateAssetCode(name);
        let attempts = 0;

        while (attempts < 10) {
          const existing = await prisma.asset_master.findFirst({
            where: { code: assetCode },
          });
          if (!existing) break;
          assetCode = await generateAssetCode(name);
          attempts++;
        }

        if (attempts >= 10) {
          return res
            .status(500)
            .json({ message: 'Unable to generate unique asset code' });
        }
      }

      const existingSerial = await prisma.asset_master.findFirst({
        where: {
          serial_number: serial_number,
        },
      });

      if (existingSerial) {
        return res.status(409).json({
          message: 'Asset with this serial number already exists',
        });
      }

      const assetData = {
        name,
        code: assetCode,
        installation_date: installation_date
          ? new Date(installation_date)
          : null,
        last_scanned_date: last_scanned_date
          ? new Date(last_scanned_date)
          : null,
        barcode: barcode || null,
        nfc_tag: nfc_tag || null,
        serial_number,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : null,
        current_location,
        current_status,
        assigned_to: assigned_to ? String(assigned_to) : null,
        createdate: new Date(),
        createdby: req.user?.id || 1,
        is_active: is_active || 'Y',
        log_inst: 1,
        asset_master_asset_types: {
          connect: { id: Number(asset_type_id) },
        },
        asset_master_asset_sub_types: asset_sub_type_id
          ? { connect: { id: Number(asset_sub_type_id) } }
          : undefined,
        asset_master_brands: asset_brand_id
          ? { connect: { id: Number(asset_brand_id) } }
          : undefined,
        asset_master_depot: depot_id
          ? { connect: { id: Number(depot_id) } }
          : undefined,

        asset_master_last_read: last_read_by
          ? { connect: { id: Number(last_read_by) } }
          : undefined,
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
        include: {
          asset_master_image: true,
          asset_maintenance_master: true,
          asset_master_warranty_claims: true,
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
          asset_master_brand: true,
          asset_master_brands: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          asset_master_last_read: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Asset created successfully with images',
        data: serializeAssetMaster(createdAsset),
      });
    } catch (error: any) {
      console.error('Create Asset Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllAssetMaster(req: any, res: any) {
    try {
      const {
        page,
        limit,
        search,
        status,
        depot_id,
        outlet_id,
        only_available,
      } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const reqUser = (req as any).user;
      let isScopeRestricted = false;
      let depotIds: number[] = [];

      if (reqUser && !isAdminRole(reqUser.role)) {
        isScopeRestricted = true;
        const userDepots = await prisma.user_depots.findMany({
          where: { user_id: reqUser.id },
          select: { depot_id: true },
        });
        depotIds = userDepots
          .map((ud: any) => ud.depot_id)
          .filter((id: any) => id !== null) as number[];
      }

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { serial_number: { contains: searchLower } },
            { barcode: { contains: searchLower } },
            { nfc_tag: { contains: searchLower } },
            { current_location: { contains: searchLower } },
            { current_status: { contains: searchLower } },
            { assigned_to: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
        ...(depot_id && { depot_id: parseInt(depot_id as string, 10) }),
        ...(outlet_id && { outlet_id: parseInt(outlet_id as string, 10) }),
        ...(only_available === 'true' && { outlet_id: null }),
      };

      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          filters.depot_id = { in: depotIds };
        } else {
          filters.id = -1;
        }
      }

      const { data, pagination } = await paginate({
        model: prisma.asset_master,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          asset_master_image: true,
          asset_maintenance_master: true,
          asset_movement_assets_asset: {
            include: {
              asset_movement_assets_movement: {
                select: {
                  id: true,
                  movement_type: true,
                  movement_date: true,
                  from_direction: true,
                  to_direction: true,
                  notes: true,
                },
              },
            },
          },
          asset_master_warranty_claims: true,
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
          asset_master_brand: true,
          asset_master_depot: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          asset_master_outlet: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          asset_master_brands: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          asset_master_last_read: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      const reqUser = (req as any).user;
      let isScopeRestricted = false;
      let depotIds: number[] = [];

      if (reqUser && !isAdminRole(reqUser.role)) {
        isScopeRestricted = true;
        const userDepots = await prisma.user_depots.findMany({
          where: { user_id: reqUser.id },
          select: { depot_id: true },
        });
        depotIds = userDepots
          .map((ud: any) => ud.depot_id)
          .filter((id: any) => id !== null) as number[];
      }

      const whereClause: any = { id: Number(id) };

      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          whereClause.depot_id = { in: depotIds };
        } else {
          whereClause.id = -1;
        }
      }

      const asset = await prisma.asset_master.findFirst({
        where: whereClause,
        include: {
          asset_master_image: true,
          asset_maintenance_master: true,
          asset_movement_assets_asset: {
            include: {
              asset_movement_assets_movement: {
                select: {
                  id: true,
                  movement_type: true,
                  movement_date: true,
                  from_direction: true,
                  to_direction: true,
                  notes: true,
                },
              },
            },
          },
          asset_master_warranty_claims: true,
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
          asset_master_brand: true,
          asset_master_brands: {
            select: {
              id: true,
              name: true,
            },
          },
          asset_master_outlet: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          asset_master_depot: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          asset_master_last_read: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!asset) return res.status(404).json({ message: 'Asset not found' });

      const inspections = await prisma.cooler_inspections.findMany({
        where: { coolers: { asset_master_id: Number(id) } },
        include: {
          users: { select: { id: true, name: true, email: true } },
        },
      });

      (asset as any).inspections = inspections;

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
        include: {
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
          asset_master_brand: true,
        },
      });
      if (!existingAsset)
        return res.status(404).json({ message: 'Asset not found' });

      if (
        req.body.barcode &&
        req.body.barcode !== '' &&
        req.body.barcode !== existingAsset.barcode
      ) {
        const existingBarcode = await prisma.asset_master.findFirst({
          where: { barcode: req.body.barcode },
        });
        if (existingBarcode) {
          return res
            .status(409)
            .json({ message: 'Asset with this barcode already exists' });
        }
      }

      if (
        req.body.nfc_tag &&
        req.body.nfc_tag !== '' &&
        req.body.nfc_tag !== existingAsset.nfc_tag
      ) {
        const existingNfcTag = await prisma.asset_master.findFirst({
          where: { nfc_tag: req.body.nfc_tag },
        });
        if (existingNfcTag) {
          return res
            .status(409)
            .json({ message: 'Asset with this NFC tag already exists' });
        }
      }

      const data: any = {
        name: req.body.name,
        code: req.body.code,
        serial_number: req.body.serial_number,
        barcode:
          req.body.barcode !== undefined && req.body.barcode !== ''
            ? req.body.barcode
            : existingAsset.barcode,
        nfc_tag:
          req.body.nfc_tag !== undefined && req.body.nfc_tag !== ''
            ? req.body.nfc_tag
            : existingAsset.nfc_tag,
        assigned_to: req.body.assigned_to
          ? String(req.body.assigned_to)
          : existingAsset.assigned_to,
        purchase_date: req.body.purchase_date
          ? new Date(req.body.purchase_date)
          : existingAsset.purchase_date,
        warranty_expiry: req.body.warranty_expiry
          ? new Date(req.body.warranty_expiry)
          : existingAsset.warranty_expiry,
        current_location: req.body.current_location,
        current_status: req.body.current_status,
        is_active: req.body.is_active,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      if (req.body.asset_type_id !== undefined) {
        data.asset_master_asset_types = {
          connect: { id: Number(req.body.asset_type_id) },
        };
      }
      if (req.body.asset_sub_type_id !== undefined) {
        data.asset_master_asset_sub_types = req.body.asset_sub_type_id
          ? { connect: { id: Number(req.body.asset_sub_type_id) } }
          : { disconnect: true };
      }
      if (req.body.asset_brand_id !== undefined) {
        data.asset_master_brands = req.body.asset_brand_id
          ? { connect: { id: Number(req.body.asset_brand_id) } }
          : { disconnect: true };
      }
      if (req.body.depot_id !== undefined) {
        data.asset_master_depot = req.body.depot_id
          ? { connect: { id: Number(req.body.depot_id) } }
          : { disconnect: true };
        if (req.body.depot_id) {
          data.asset_master_outlet = { disconnect: true };
        }
      }

      if (req.body.asset_brand_id) {
        const assetBrandExists = await prisma.asset_brands.findUnique({
          where: { id: Number(req.body.asset_brand_id) },
        });
        if (!assetBrandExists) {
          return res.status(400).json({ message: 'Asset brand not found' });
        }
      }
      const asset = await prisma.asset_master.update({
        where: { id: Number(id) },
        data,
        include: {
          asset_master_image: true,
          asset_maintenance_master: true,
          asset_master_warranty_claims: true,
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
          asset_master_brand: true,
          asset_master_brands: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          asset_master_last_read: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const files = req.files as Express.Multer.File[];

        let assetImages: any[] = [];
        if (req.body.assetImages) {
          try {
            assetImages = JSON.parse(req.body.assetImages);
          } catch {
            assetImages = [];
          }
        }

        const existingImages = await prisma.asset_images.findMany({
          where: { asset_id: asset.id },
        });

        for (const img of existingImages) {
          if (img.image_url) {
            await deleteFile(img.image_url);
          }
        }

        await prisma.asset_images.deleteMany({
          where: { asset_id: asset.id },
        });

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const caption = assetImages[i]?.caption || null;
          const fileName = `asset-images/${Date.now()}-${file.originalname}`;
          const imageUrl = await uploadFile(
            file.buffer,
            fileName,
            file.mimetype
          );

          await prisma.asset_images.create({
            data: {
              asset_id: asset.id,
              image_url: imageUrl,
              caption,
              uploaded_by: (req as any).user?.name || 'Admin',
              uploaded_at: new Date(),
              is_active: 'Y',
              createdate: new Date(),
              createdby: (req as any).user?.id || 1,
              log_inst: 1,
            },
          });
        }
      }
      const updatedAsset = await prisma.asset_master.findUnique({
        where: { id: Number(id) },
        include: {
          asset_master_image: true,
          asset_maintenance_master: true,
          asset_master_warranty_claims: true,
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
          asset_master_brand: true,
          asset_master_brands: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.json({
        message: 'Asset updated successfully',
        data: serializeAssetMaster(updatedAsset),
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
