import { Response } from 'express';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

/**
 * Controller for managing Promotional Materials Master catalog and Outlet Promotional Materials.
 */
export const promotionalMaterialsController = {
  /**
   * Retrieves a paginated list of promotional materials with search and status filtering.
   *
   * @param req - Express request with query parameters (page, limit, search, status)
   * @param res - Express response
   */
  async getPromotionalMaterials(req: any, res: Response) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || 'all';

      const filters: any = {};

      if (status === 'active' || status === 'Y') {
        filters.is_active = 'Y';
      } else if (status === 'inactive' || status === 'N') {
        filters.is_active = 'N';
      }

      if (search.trim()) {
        filters.OR = [
          { name: { contains: search.trim() } },
          { code: { contains: search.trim() } },
          { description: { contains: search.trim() } },
        ];
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalCount, activeCount, inactiveCount, newThisMonthCount] =
        await Promise.all([
          (prisma as any).promotional_materials.count(),
          (prisma as any).promotional_materials.count({
            where: { is_active: 'Y' },
          }),
          (prisma as any).promotional_materials.count({
            where: { is_active: 'N' },
          }),
          (prisma as any).promotional_materials.count({
            where: { createdate: { gte: firstDayOfMonth } },
          }),
        ]);

      const result = await paginate({
        model: (prisma as any).promotional_materials,
        filters,
        page,
        limit,
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        stats: {
          total_materials: totalCount,
          active_materials: activeCount,
          inactive_materials: inactiveCount,
          new_materials_this_month: newThisMonthCount,
        },
      });
    } catch (error: any) {
      console.error('getPromotionalMaterials Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Retrieves a single promotional material by ID.
   *
   * @param req - Express request with param id
   * @param res - Express response
   */
  async getPromotionalMaterialById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const material = await (prisma as any).promotional_materials.findUnique({
        where: { id: Number(id) },
      });

      if (!material) {
        return res
          .status(404)
          .json({ success: false, message: 'Promotional material not found' });
      }

      res.json({ success: true, data: material });
    } catch (error: any) {
      console.error('getPromotionalMaterialById Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Creates a new promotional material in the master catalog.
   *
   * @param req - Express request with payload (code, name, uom, default_unit_value, description)
   * @param res - Express response
   */
  async createPromotionalMaterial(req: any, res: Response) {
    try {
      const userId = req.user?.id || 1;
      const {
        code,
        name,
        uom = 'Pcs',
        default_unit_value,
        description,
        is_active = 'Y',
      } = req.body;

      let itemCode = code && typeof code === 'string' ? code.trim() : '';
      if (!itemCode) {
        itemCode = await generatePromotionalMaterialCode();
      } else {
        const existing = await (prisma as any).promotional_materials.findUnique(
          {
            where: { code: itemCode },
          }
        );

        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Item code "${itemCode}" already exists.`,
          });
        }
      }

      const material = await (prisma as any).promotional_materials.create({
        data: {
          code: itemCode,
          name: name.trim(),
          uom: uom ? uom.trim() : 'Pcs',
          default_unit_value: default_unit_value
            ? Number(default_unit_value)
            : null,
          description: description ? description.trim() : null,
          is_active: is_active || 'Y',
          createdby: userId,
          createdate: new Date(),
        },
      });

      res.status(201).json({
        success: true,
        message: 'Promotional material created successfully',
        data: material,
      });
    } catch (error: any) {
      console.error('createPromotionalMaterial Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Updates an existing promotional material record.
   *
   * @param req - Express request with param id and update payload
   * @param res - Express response
   */
  async updatePromotionalMaterial(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;
      const { code, name, uom, default_unit_value, description, is_active } =
        req.body;

      const existing = await (prisma as any).promotional_materials.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: 'Promotional material not found' });
      }

      if (code && code.trim() !== existing.code) {
        const duplicate = await (
          prisma as any
        ).promotional_materials.findUnique({
          where: { code: code.trim() },
        });
        if (duplicate && duplicate.id !== Number(id)) {
          return res.status(400).json({
            success: false,
            message: `Item code "${code}" is already taken by another material.`,
          });
        }
      }

      const updated = await (prisma as any).promotional_materials.update({
        where: { id: Number(id) },
        data: {
          code: code !== undefined ? code.trim() : existing.code,
          name: name !== undefined ? name.trim() : existing.name,
          uom: uom !== undefined ? uom.trim() : existing.uom,
          default_unit_value:
            default_unit_value !== undefined
              ? default_unit_value
                ? Number(default_unit_value)
                : null
              : existing.default_unit_value,
          description:
            description !== undefined
              ? description?.trim() || null
              : existing.description,
          is_active: is_active !== undefined ? is_active : existing.is_active,
          updatedby: userId,
          updatedate: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Promotional material updated successfully',
        data: updated,
      });
    } catch (error: any) {
      console.error('updatePromotionalMaterial Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Deactivates (soft deletes) a promotional material.
   *
   * @param req - Express request with param id
   * @param res - Express response
   */
  async deletePromotionalMaterial(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;

      const existing = await (prisma as any).promotional_materials.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: 'Promotional material not found' });
      }

      await (prisma as any).promotional_materials.update({
        where: { id: Number(id) },
        data: {
          is_active: 'N',
          updatedby: userId,
          updatedate: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Promotional material deactivated successfully',
      });
    } catch (error: any) {
      console.error('deletePromotionalMaterial Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Returns promotional materials analytics, aggregated issued items, and history for a specific outlet.
   * Used on the Outlet Detail page Promotional Materials tab.
   *
   * @param req - Express request with outletId param
   * @param res - Express response
   */
  async getOutletPromotionalMaterials(req: any, res: Response) {
    try {
      const outletId = Number(req.params.outletId || req.params.id);

      if (!outletId) {
        return res
          .status(400)
          .json({ success: false, message: 'Valid outlet ID is required' });
      }

      const issues = await prisma.promotion_materials_issue.findMany({
        where: {
          outlet_id: outletId,
          is_active: 'Y',
        },
        include: {
          depot: true,
          items: {
            where: { is_active: 'Y' },
            include: {
              material: true,
            },
          },
        },
        orderBy: { createdate: 'desc' },
      });

      let approvedIssuesCount = 0;
      let pendingApprovalCount = 0;
      let totalPiecesIssued = 0;
      let totalValueIssued = 0;

      const aggregatedMap = new Map<
        string,
        {
          material_id: number;
          name: string;
          code: string;
          total_qty: number;
          total_value: number;
          last_issued: Date | null;
        }
      >();

      const issueHistoryList = issues.map((issue: any) => {
        const isApproved = issue.approval_status === 'A';
        const isPending = issue.approval_status === 'P';

        if (isApproved) {
          approvedIssuesCount += 1;
        } else if (isPending) {
          pendingApprovalCount += 1;
        }

        let issueQty = 0;
        let issueValue = 0;
        const itemsSummaryParts: string[] = [];

        const issueItems = (issue.items || []).map((item: any) => {
          const qty = Number(item.quantity) || 0;
          const unitVal = Number(item.unit_value) || 0;
          const lineVal = Number(item.total_value) || qty * unitVal;
          const itemName = item.material?.name || 'Promotional Item';
          const itemCode = item.material?.code || `PM-${item.id}`;
          const matId = item.material_id || item.id;
          const uom = item.material?.uom || 'Pcs';

          issueQty += qty;
          issueValue += lineVal;
          itemsSummaryParts.push(`${itemName} ×${qty}`);

          if (isApproved) {
            totalPiecesIssued += qty;
            totalValueIssued += lineVal;

            const mapKey = itemCode;
            const existingAgg = aggregatedMap.get(mapKey);
            if (existingAgg) {
              existingAgg.total_qty += qty;
              existingAgg.total_value += lineVal;
              if (
                issue.issue_date &&
                (!existingAgg.last_issued ||
                  new Date(issue.issue_date) >
                    new Date(existingAgg.last_issued))
              ) {
                existingAgg.last_issued = issue.issue_date;
              }
            } else {
              aggregatedMap.set(mapKey, {
                material_id: matId,
                name: itemName,
                code: itemCode,
                total_qty: qty,
                total_value: lineVal,
                last_issued: issue.issue_date || null,
              });
            }
          }

          return {
            id: item.id,
            material_id: matId,
            material_name: itemName,
            name: itemName,
            material_code: itemCode,
            code: itemCode,
            uom,
            quantity: qty,
            unit_value: unitVal,
            total_value: lineVal,
          };
        });

        return {
          id: issue.id,
          gin_number: issue.gin_number,
          campaign_reference: issue.campaign_reference || 'Standard Issue',
          issue_date: issue.issue_date,
          depot_name: issue.depot?.name || 'Main Depot',
          approval_status: issue.approval_status,
          total_qty: issueQty,
          total_quantity: issueQty,
          total_value: issueValue || Number(issue.total_value) || 0,
          items_summary: itemsSummaryParts.join(', ') || 'No items',
          items: issueItems,
        };
      });

      const aggregatedItems = Array.from(aggregatedMap.values()).map(it => ({
        material_id: it.material_id,
        material_name: it.name,
        name: it.name,
        material_code: it.code,
        code: it.code,
        uom: 'Pcs',
        total_quantity: it.total_qty,
        total_qty: it.total_qty,
        total_value: it.total_value,
        last_issued_date: it.last_issued,
        last_issued: it.last_issued,
      }));

      res.json({
        success: true,
        data: {
          stats: {
            approved_issues_count: approvedIssuesCount,
            approved_issues: approvedIssuesCount,
            total_pieces_issued: totalPiecesIssued,
            pieces_issued: totalPiecesIssued,
            total_value_issued: totalValueIssued,
            value_issued: totalValueIssued,
            pending_approval_count: pendingApprovalCount,
            pending_approval: pendingApprovalCount,
          },
          issued_items: aggregatedItems,
          items_issued: aggregatedItems,
          issue_history: issueHistoryList,
          issues: issueHistoryList,
        },
      });
    } catch (error: any) {
      console.error('getOutletPromotionalMaterials Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

/**
 * Helper to auto-generate a promotional material code (e.g. PM-0001)
 *
 * @returns Unique promotional material code
 */
async function generatePromotionalMaterialCode(): Promise<string> {
  const prefix = 'PM';
  const lastItem = await (prisma as any).promotional_materials.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { id: 'desc' },
    select: { code: true, id: true },
  });

  let nextNum = (lastItem?.id || 0) + 1;
  if (lastItem?.code) {
    const match = lastItem.code.match(/(\d+)$/);
    if (match) {
      nextNum = Math.max(nextNum, parseInt(match[1], 10) + 1);
    }
  }

  let codeCandidate = `${prefix}-${nextNum.toString().padStart(4, '0')}`;
  let existing = await (prisma as any).promotional_materials.findUnique({
    where: { code: codeCandidate },
  });

  while (existing) {
    nextNum++;
    codeCandidate = `${prefix}-${nextNum.toString().padStart(4, '0')}`;
    existing = await (prisma as any).promotional_materials.findUnique({
      where: { code: codeCandidate },
    });
  }

  return codeCandidate;
}
