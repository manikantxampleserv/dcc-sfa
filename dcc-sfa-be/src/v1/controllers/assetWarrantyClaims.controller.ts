import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface AssetWarrantyClaimSerialized {
  id: number;
  asset_id: number;
  claim_date: Date;
  issue_description?: string | null;
  claim_status?: string | null;
  resolved_date?: Date | null;
  notes?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  asset_master_warranty_claims?: {
    id: number;
    name: string;
    serial_number: string;
  } | null;
}

const serializeAssetWarrantyClaim = (
  claim: any
): AssetWarrantyClaimSerialized => ({
  id: claim.id,
  asset_id: claim.asset_id,
  claim_date: claim.claim_date,
  issue_description: claim.issue_description,
  claim_status: claim.claim_status,
  resolved_date: claim.resolved_date,
  notes: claim.notes,
  is_active: claim.is_active,
  createdate: claim.createdate,
  createdby: claim.createdby,
  updatedate: claim.updatedate,
  updatedby: claim.updatedby,
  log_inst: claim.log_inst,
  asset_master_warranty_claims: claim.asset_master_warranty_claims
    ? {
        id: claim.asset_master_warranty_claims.id,
        name: claim.asset_master_warranty_claims.name,
        serial_number: claim.asset_master_warranty_claims.serial_number,
      }
    : null,
});

export const assetWarrantyClaimsController = {
  async createAssetWarrantyClaims(req: any, res: any) {
    try {
      const data = req.body;

      if (!data.asset_id || !data.claim_date) {
        return res
          .status(400)
          .json({ message: 'asset_id and claim_date are required' });
      }

      const newClaim = await prisma.asset_warranty_claims.create({
        data: {
          ...data,
          claim_date: new Date(data.claim_date),
          resolved_date: data.resolved_date
            ? new Date(data.resolved_date)
            : null,
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
        },
        include: {
          asset_master_warranty_claims: true,
        },
      });

      res.status(201).json({
        message: 'Asset warranty claim created successfully',
        data: serializeAssetWarrantyClaim(newClaim),
      });
    } catch (error: any) {
      console.error('Create Warranty Claim Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllAssetWarrantyClaims(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      const filters: any = {
        ...(search && {
          OR: [
            {
              issue_description: {
                contains: search as string,
                mode: 'insensitive',
              },
            },
            {
              claim_status: { contains: search as string, mode: 'insensitive' },
            },
            { notes: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
        ...(status === 'active' && { is_active: 'Y' }),
        ...(status === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.asset_warranty_claims,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          asset_master_warranty_claims: true,
        },
      });

      const total = await prisma.asset_warranty_claims.count();
      const active = await prisma.asset_warranty_claims.count({
        where: { is_active: 'Y' },
      });
      const inactive = await prisma.asset_warranty_claims.count({
        where: { is_active: 'N' },
      });

      res.success(
        'Asset warranty claims fetched successfully',
        data.map((c: any) => serializeAssetWarrantyClaim(c)),
        200,
        pagination,
        {
          total_records: total,
          active_records: active,
          inactive_records: inactive,
        }
      );
    } catch (error: any) {
      console.error('Get All Warranty Claims Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAssetWarrantyClaimsById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const claim = await prisma.asset_warranty_claims.findUnique({
        where: { id: Number(id) },
        include: {
          asset_master_warranty_claims: true,
        },
      });

      if (!claim)
        return res.status(404).json({ message: 'Warranty claim not found' });

      res.json({
        message: 'Asset warranty claim fetched successfully',
        data: serializeAssetWarrantyClaim(claim),
      });
    } catch (error: any) {
      console.error('Get Warranty Claim Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateAssetWarrantyClaims(req: any, res: any) {
    try {
      const { id } = req.params;

      const existing = await prisma.asset_warranty_claims.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Warranty claim not found' });

      const updated = await prisma.asset_warranty_claims.update({
        where: { id: Number(id) },
        data: {
          ...req.body,
          claim_date: req.body.claim_date
            ? new Date(req.body.claim_date)
            : existing.claim_date,
          resolved_date: req.body.resolved_date
            ? new Date(req.body.resolved_date)
            : existing.resolved_date,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          asset_master_warranty_claims: true,
        },
      });

      res.json({
        message: 'Asset warranty claim updated successfully',
        data: serializeAssetWarrantyClaim(updated),
      });
    } catch (error: any) {
      console.error('Update Warranty Claim Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteAssetWarrantyClaims(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.asset_warranty_claims.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Warranty claim not found' });

      await prisma.asset_warranty_claims.delete({
        where: { id: Number(id) },
      });

      res.json({ message: 'Asset warranty claim deleted successfully' });
    } catch (error: any) {
      console.error('Delete Warranty Claim Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
