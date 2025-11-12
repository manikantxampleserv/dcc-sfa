import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface SalesTargetGroupSerialized {
  id: number;
  group_name: string;
  description?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  sales_target_group_members?: any[];
  sales_targets_groups?: any[];
}

const serializeSalesTargetGroup = (stg: any): SalesTargetGroupSerialized => ({
  id: stg.id,
  group_name: stg.group_name,
  description: stg.description,
  is_active: stg.is_active,
  createdate: stg.createdate,
  createdby: stg.createdby,
  updatedate: stg.updatedate,
  updatedby: stg.updatedby,
  log_inst: stg.log_inst,
  sales_target_group_members: stg.sales_target_group_members_id || [],
  sales_targets_groups: stg.sales_targets_groups || [],
});

export const salesTargetGroupsController = {
  // async createSalesTargetGroups(req: any, res: any) {
  //   try {
  //     const { salesTargetMember = [], ...groupData } = req.body;
  //     const userId = req.user?.id || 1;
  //     const isUpdate = groupData.id && groupData.id > 0;

  //     const result = await prisma.$transaction(async tx => {
  //       if (isUpdate) {
  //         const groupId = Number(groupData.id);

  //         const existingGroup = await tx.sales_target_groups.findUnique({
  //           where: { id: groupId },
  //         });

  //         if (!existingGroup) {
  //           throw new Error('Sales target group not found');
  //         }

  //         await tx.sales_target_groups.update({
  //           where: { id: groupId },
  //           data: {
  //             group_name: groupData.group_name ?? existingGroup.group_name,
  //             description: groupData.description ?? existingGroup.description,
  //             is_active: groupData.is_active ?? existingGroup.is_active,
  //             updatedate: new Date(),
  //             updatedby: userId,
  //             log_inst: groupData.log_inst ?? existingGroup.log_inst,
  //           },
  //         });

  //         if (salesTargetMember.length > 0) {
  //           const membersToUpdate = salesTargetMember.filter(
  //             (m: any) => m.id && m.id > 0
  //           );
  //           const membersToCreate = salesTargetMember.filter(
  //             (m: any) => !m.id || m.id <= 0
  //           );

  //           if (membersToUpdate.length > 0) {
  //             await Promise.all(
  //               membersToUpdate.map((member: any) =>
  //                 tx.sales_target_group_members.update({
  //                   where: { id: Number(member.id) },
  //                   data: {
  //                     sales_person_id: member.sales_person_id,
  //                     is_active: member.is_active ?? 'Y',
  //                     updatedate: new Date(),
  //                     updatedby: userId,
  //                     log_inst: member.log_inst ?? 1,
  //                   },
  //                 })
  //               )
  //             );
  //           }

  //           if (membersToCreate.length > 0) {
  //             await tx.sales_target_group_members.createMany({
  //               data: membersToCreate.map((member: any) => ({
  //                 sales_target_group_id: groupId,
  //                 sales_person_id: member.sales_person_id,
  //                 is_active: member.is_active ?? 'Y',
  //                 createdate: new Date(),
  //                 createdby: userId,
  //                 log_inst: member.log_inst ?? 1,
  //               })),
  //             });
  //           }
  //         }

  //         return await tx.sales_target_groups.findUnique({
  //           where: { id: groupId },
  //           include: {
  //             sales_target_group_members_id: true,
  //             sales_targets_groups: true,
  //           },
  //         });
  //       } else {
  //         return await tx.sales_target_groups.create({
  //           data: {
  //             group_name: groupData.group_name,
  //             description: groupData.description || null,
  //             is_active: groupData.is_active || 'Y',
  //             createdate: new Date(),
  //             createdby: userId,
  //             log_inst: groupData.log_inst || 1,
  //             sales_target_group_members_id: {
  //               create: salesTargetMember.map((member: any) => ({
  //                 sales_person_id: member.sales_person_id,
  //                 is_active: member.is_active ?? 'Y',
  //                 createdate: new Date(),
  //                 createdby: userId,
  //                 log_inst: member.log_inst ?? 1,
  //               })),
  //             },
  //           },
  //           include: {
  //             sales_target_group_members_id: true,
  //             sales_targets_groups: true,
  //           },
  //         });
  //       }
  //     });

  //     res.status(isUpdate ? 200 : 201).json({
  //       message: `Sales target group ${isUpdate ? 'updated' : 'created'} successfully`,
  //       data: serializeSalesTargetGroup(result),
  //     });
  //   } catch (error: any) {
  //     console.error('Upsert SalesTargetGroups Error:', error);
  //     res
  //       .status(error.message === 'Sales target group not found' ? 404 : 500)
  //       .json({
  //         message:
  //           error.message || 'An error occurred while processing the request',
  //       });
  //   }
  // },

  async createSalesTargetGroups(req: any, res: any) {
    try {
      const { salesTargetMember = [], ...groupData } = req.body;
      const userId = req.user?.id || 1;
      const isUpdate = groupData.id && groupData.id > 0;

      const result = await prisma.$transaction(async tx => {
        if (isUpdate) {
          const groupId = Number(groupData.id);

          const existingGroup = await tx.sales_target_groups.findUnique({
            where: { id: groupId },
          });

          if (!existingGroup) {
            throw new Error('Sales target group not found');
          }

          await tx.sales_target_groups.update({
            where: { id: groupId },
            data: {
              group_name: groupData.group_name ?? existingGroup.group_name,
              description: groupData.description ?? existingGroup.description,
              is_active: groupData.is_active ?? existingGroup.is_active,
              updatedate: new Date(),
              updatedby: userId,
              log_inst: groupData.log_inst ?? existingGroup.log_inst,
            },
          });

          const existingMembers = await tx.sales_target_group_members.findMany({
            where: { sales_target_group_id: groupId },
            select: { id: true },
          });

          const existingMemberIds = existingMembers.map(m => m.id);

          const incomingMemberIds = salesTargetMember
            .filter((m: any) => m.id && m.id > 0)
            .map((m: any) => Number(m.id));

          const memberIdsToDelete = existingMemberIds.filter(
            id => !incomingMemberIds.includes(id)
          );

          if (memberIdsToDelete.length > 0) {
            await tx.sales_target_group_members.deleteMany({
              where: {
                id: { in: memberIdsToDelete },
                sales_target_group_id: groupId,
              },
            });
          }

          const membersToUpdate = salesTargetMember.filter(
            (m: any) => m.id && m.id > 0
          );
          const membersToCreate = salesTargetMember.filter(
            (m: any) => !m.id || m.id <= 0
          );

          if (membersToUpdate.length > 0) {
            await Promise.all(
              membersToUpdate.map((member: any) =>
                tx.sales_target_group_members.update({
                  where: { id: Number(member.id) },
                  data: {
                    sales_person_id: member.sales_person_id,
                    is_active: member.is_active ?? 'Y',
                    updatedate: new Date(),
                    updatedby: userId,
                    log_inst: member.log_inst ?? 1,
                  },
                })
              )
            );
          }

          if (membersToCreate.length > 0) {
            await tx.sales_target_group_members.createMany({
              data: membersToCreate.map((member: any) => ({
                sales_target_group_id: groupId,
                sales_person_id: member.sales_person_id,
                is_active: member.is_active ?? 'Y',
                createdate: new Date(),
                createdby: userId,
                log_inst: member.log_inst ?? 1,
              })),
            });
          }

          return await tx.sales_target_groups.findUnique({
            where: { id: groupId },
            include: {
              sales_target_group_members_id: true,
              sales_targets_groups: true,
            },
          });
        } else {
          return await tx.sales_target_groups.create({
            data: {
              group_name: groupData.group_name,
              description: groupData.description || null,
              is_active: groupData.is_active || 'Y',
              createdate: new Date(),
              createdby: userId,
              log_inst: groupData.log_inst || 1,
              sales_target_group_members_id: {
                create: salesTargetMember.map((member: any) => ({
                  sales_person_id: member.sales_person_id,
                  is_active: member.is_active ?? 'Y',
                  createdate: new Date(),
                  createdby: userId,
                  log_inst: member.log_inst ?? 1,
                })),
              },
            },
            include: {
              sales_target_group_members_id: true,
              sales_targets_groups: true,
            },
          });
        }
      });

      res.status(isUpdate ? 200 : 201).json({
        message: `Sales target group ${isUpdate ? 'updated' : 'created'} successfully`,
        data: serializeSalesTargetGroup(result),
      });
    } catch (error: any) {
      console.error('Upsert SalesTargetGroups Error:', error);
      res
        .status(error.message === 'Sales target group not found' ? 404 : 500)
        .json({
          message:
            error.message || 'An error occurred while processing the request',
        });
    }
  },
  async getAllSalesTargetGroups(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { group_name: { contains: searchLower } },
            { description: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.sales_target_groups,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          sales_target_group_members_id: true,
          sales_targets_groups: true,
        },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const [
        totalGroups,
        activeGroups,
        inactiveGroups,
        salesTargetGroupsThisMonth,
      ] = await Promise.all([
        prisma.sales_target_groups.count(),
        prisma.sales_target_groups.count({
          where: { is_active: 'Y' },
        }),
        prisma.sales_target_groups.count({
          where: { is_active: 'N' },
        }),
        prisma.sales_target_groups.count({
          where: {
            createdate: {
              gte: startOfMonth,
              lt: endOfMonth,
            },
          },
        }),
      ]);
      res.success(
        'Sales target groups retrieved successfully',
        data.map((g: any) => serializeSalesTargetGroup(g)),
        200,
        pagination,
        {
          total_groups: totalGroups,
          active_groups: activeGroups,
          inactive_groups: inactiveGroups,
          sales_target_groups_this_month: salesTargetGroupsThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get SalesTargetGroups Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSalesTargetGroupsById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const group = await prisma.sales_target_groups.findUnique({
        where: { id: Number(id) },
        include: {
          sales_target_group_members_id: true,
          sales_targets_groups: true,
        },
      });

      if (!group)
        return res
          .status(404)
          .json({ message: 'Sales target group not found' });

      res.json({
        message: 'Sales target group fetched successfully',
        data: serializeSalesTargetGroup(group),
      });
    } catch (error: any) {
      console.error('Get SalesTargetGroup Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateSalesTargetGroups(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.sales_target_groups.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Sales target group not found' });

      const data = req.body;

      const updatedGroup = await prisma.sales_target_groups.update({
        where: { id: Number(id) },
        data: {
          group_name: data.group_name ?? existing.group_name,
          description: data.description ?? existing.description,
          is_active: data.is_active ?? existing.is_active,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
          log_inst: data.log_inst ?? existing.log_inst,
        },
        include: {
          sales_target_group_members_id: true,
          sales_targets_groups: true,
        },
      });

      res.json({
        message: 'Sales target group updated successfully',
        data: serializeSalesTargetGroup(updatedGroup),
      });
    } catch (error: any) {
      console.error('Update SalesTargetGroup Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSalesTargetGroups(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.sales_target_groups.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res
          .status(404)
          .json({ message: 'Sales target group not found' });

      await prisma.sales_target_groups.delete({ where: { id: Number(id) } });

      res.json({ message: 'Sales target group deleted successfully' });
    } catch (error: any) {
      console.error('Delete SalesTargetGroup Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
