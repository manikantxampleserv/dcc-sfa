// import { Request, Response } from 'express';
// import { paginate } from '../../utils/paginate';
// import prisma from '../../configs/prisma.client';

// interface CustomerGroupSerialized {
//   id: number;
//   name: string;
//   code: string;
//   description?: string | null;
//   discount_percentage?: number | null;
//   credit_terms?: number | null;
//   payment_terms?: string | null;
//   price_group?: string | null;
//   is_active: string;
//   createdate?: Date | null;
//   createdby: number;
//   updatedate?: Date | null;
//   updatedby?: number | null;
//   log_inst?: number | null;
//   members_count?: number;
//   members?: { id: number; customer_id: number; group_id: number }[];
//   routes?: { id: number; name: string; code: string }[];
//   depots?: { id: number; name: string; code: string }[];
//   zones?: { id: number; name: string; code: string }[];
//   customer_categories?: {
//     id: number;
//     category_name: string;
//     category_code: string;
//   }[];
// }

// interface CustomerGroupCreateInput {
//   name: string;
//   code?: string;
//   description?: string;
//   discount_percentage?: number;
//   credit_terms?: number;
//   payment_terms?: string;
//   price_group?: string;
//   is_active?: string;
//   routes?: number[];
//   depots?: number[];
//   zones?: number[];
//   customer_categories?: number[];
//   customerGroups?: Array<{
//     customer_id: number;
//     joined_at?: string;
//     is_active?: string;
//     log_inst?: number;
//   }>;
// }
// const generateCustomerGroupCode = async (name: string) => {
//   const prefix = name.slice(0, 3).toUpperCase();
//   const lastCustomerGroupCode = await prisma.customer_groups.findFirst({
//     orderBy: { id: 'desc' },
//     select: { code: true },
//   });

//   let newNumber = 1;
//   if (lastCustomerGroupCode && lastCustomerGroupCode.code) {
//     const match = lastCustomerGroupCode.code.match(/(\d+)$/);
//     if (match) {
//       newNumber = parseInt(match[1], 10) + 1;
//     }
//   }
//   const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
//   return code;
// };

// // const serializeCustomerGroup = (group: any): CustomerGroupSerialized => ({
// //   id: group.id,
// //   name: group.name,
// //   code: group.code,
// //   description: group.description,
// //   discount_percentage: group.discount_percentage,
// //   credit_terms: group.credit_terms,
// //   payment_terms: group.payment_terms,
// //   price_group: group.price_group,
// //   is_active: group.is_active,
// //   createdate: group.createdate,
// //   createdby: group.createdby,
// //   updatedate: group.updatedate,
// //   updatedby: group.updatedby,
// //   log_inst: group.log_inst,
// //   members:
// //     group.customer_group_members_customer_group?.map((m: any) => ({
// //       id: m.id,
// //       customer_id: m.customer_id,
// //       group_id: m.group_id,
// //     })) || [],
// // });

// const serializeCustomerGroup = (group: any): CustomerGroupSerialized => ({
//   id: group.id,
//   name: group.name,
//   code: group.code,
//   description: group.description,
//   discount_percentage: group.discount_percentage,
//   credit_terms: group.credit_terms,
//   payment_terms: group.payment_terms,
//   price_group: group.price_group,
//   is_active: group.is_active,
//   createdate: group.createdate,
//   createdby: group.createdby,
//   updatedate: group.updatedate,
//   updatedby: group.updatedby,
//   log_inst: group.log_inst,
//   members_count: group.customer_group_members_customer_group?.length || 0,
//   members:
//     group.customer_group_members_customer_group?.map((m: any) => ({
//       id: m.id,
//       customer_id: m.customer_id,
//       group_id: m.group_id,
//     })) || [],
//   routes:
//     group.customer_group_routes_customer_groups
//       ?.filter((r: any) => r.is_active === 'Y')
//       ?.map((r: any) => ({
//         id: r.customer_group_route.id,
//         name: r.customer_group_route.name,
//         code: r.customer_group_route.code,
//       })) || [],
//   depots:
//     group.customer_group_depots_customer_groups
//       ?.filter((d: any) => d.is_active === 'Y')
//       ?.map((d: any) => ({
//         id: d.customer_group_depot.id,
//         name: d.customer_group_depot.name,
//         code: d.customer_group_depot.code,
//       })) || [],
//   zones:
//     group.customer_group_zones_customer_groups
//       ?.filter((z: any) => z.is_active === 'Y')
//       ?.map((z: any) => ({
//         id: z.customer_group_zone.id,
//         name: z.customer_group_zone.name,
//         code: z.customer_group_zone.code,
//       })) || [],
//   customer_categories:
//     group.customer_group_customer_category_customer_groups
//       ?.filter((c: any) => c.is_active === 'Y')
//       ?.map((c: any) => ({
//         id: c.customer_group_customer_category_customer_category.id,
//         category_name:
//           c.customer_group_customer_category_customer_category.category_name,
//         category_code:
//           c.customer_group_customer_category_customer_category.category_code,
//       })) || [],
// });
// export const customerGroupsController = {
//   // async createCustomerGroups(req: Request, res: Response) {
//   //   try {
//   //     const { customerGroups, ...groupData } = req.body;
//   //     const newCode = await generateCustomerGroupCode(groupData.name);

//   //     const group = await prisma.customer_groups.create({
//   //       data: {
//   //         ...groupData,
//   //         code: newCode,
//   //         is_active: groupData.is_active || 'Y',
//   //         createdate: new Date(),
//   //         createdby: req.user?.id || 1,
//   //         log_inst: groupData.log_inst || 1,
//   //         customer_group_members_customer_group: {
//   //           create: customerGroups?.map((member: any) => ({
//   //             customer_id: member.customer_id,
//   //             joined_at: member.joined_at || new Date(),
//   //             is_active: member.is_active || 'Y',
//   //             createdate: new Date(),
//   //             createdby: req.user?.id || 1,
//   //             log_inst: member.log_inst || 1,
//   //           })),
//   //         },
//   //       },
//   //       include: {
//   //         customer_group_members_customer_group: true,
//   //       },
//   //     });

//   //     res.status(201).json({
//   //       message: 'Customer group created successfully',
//   //       data: serializeCustomerGroup(group),
//   //     });
//   //   } catch (error: any) {
//   //     console.error('Create Customer Group Error:', error);
//   //     res.status(500).json({ message: error.message });
//   //   }
//   // },

//   async createCustomerGroups(req: Request, res: Response) {
//     try {
//       const input: CustomerGroupCreateInput = req.body;
//       const newCode =
//         input.code || (await generateCustomerGroupCode(input.name));

//       const group = await prisma.customer_groups.create({
//         data: {
//           name: input.name,
//           code: newCode,
//           description: input.description || null,
//           discount_percentage: input.discount_percentage || 0,
//           credit_terms: input.credit_terms || 30,
//           payment_terms: input.payment_terms || null,
//           price_group: input.price_group || null,
//           is_active: input.is_active || 'Y',
//           createdate: new Date(),
//           createdby: req.user?.id || 1,
//           log_inst: 1,
//         },
//       });

//       const groupId = group.id;

//       const routes = input.routes || [];
//       if (routes.length > 0) {
//         for (const routeId of routes) {
//           await prisma.customer_group_routes.create({
//             data: {
//               parent_id: groupId,
//               route_id: routeId,
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });
//         }
//       }

//       const depots = input.depots || [];
//       if (depots.length > 0) {
//         for (const depotId of depots) {
//           await prisma.customer_group_depots.create({
//             data: {
//               parent_id: groupId,
//               depot_id: depotId,
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });
//         }
//       }

//       const zones = input.zones || [];
//       if (zones.length > 0) {
//         for (const zoneId of zones) {
//           await prisma.customer_group_zones.create({
//             data: {
//               parent_id: groupId,
//               zone_id: zoneId,
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });
//         }
//       }

//       const customerCategories = input.customer_categories || [];
//       if (customerCategories.length > 0) {
//         for (const categoryId of customerCategories) {
//           await prisma.customer_group_customer_category.create({
//             data: {
//               parent_id: groupId,
//               customer_category_id: categoryId,
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });
//         }
//       }

//       const customerGroups = input.customerGroups || [];
//       if (customerGroups.length > 0) {
//         for (const member of customerGroups) {
//           await prisma.customer_group_members.create({
//             data: {
//               customer_group_id: groupId,
//               customer_id: member.customer_id,
//               joined_at: member.joined_at
//                 ? new Date(member.joined_at)
//                 : new Date(),
//               is_active: member.is_active || 'Y',
//               createdate: new Date(),
//               createdby: req.user?.id || 1,
//               log_inst: member.log_inst || 1,
//             },
//           });
//         }
//       }

//       const completeGroup = await prisma.customer_groups.findUnique({
//         where: { id: groupId },
//         include: {
//           customer_group_members_customer_group: true,
//           customer_group_routes_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_route: true },
//           },
//           customer_group_depots_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_depot: true },
//           },
//           customer_group_zones_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_zone: true },
//           },
//           customer_group_customer_category_customer_groups: {
//             where: { is_active: 'Y' },
//             include: {
//               customer_group_customer_category_customer_category: true,
//             },
//           },
//         },
//       });

//       res.status(201).json({
//         message: 'Customer group created successfully',
//         data: serializeCustomerGroup(completeGroup),
//       });
//     } catch (error: any) {
//       console.error('Create Customer Group Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   // async getAllCustomerGroups(req: any, res: any) {
//   //   try {
//   //     const { page, limit, search, status } = req.query;
//   //     const pageNum = parseInt(page as string, 10) || 1;
//   //     const limitNum = parseInt(limit as string, 10) || 10;
//   //     const searchLower = search ? (search as string).toLowerCase() : '';
//   //     const statusLower = status ? (status as string).toLowerCase() : '';

//   //     const filters: any = {
//   //       ...(search && {
//   //         OR: [
//   //           { name: { contains: searchLower } },
//   //           { code: { contains: searchLower } },
//   //         ],
//   //       }),
//   //       ...(statusLower === 'active' && { is_active: 'Y' }),
//   //       ...(statusLower === 'inactive' && { is_active: 'N' }),
//   //     };

//   //     const { data, pagination } = await paginate({
//   //       model: prisma.customer_groups,
//   //       filters,
//   //       page: pageNum,
//   //       limit: limitNum,
//   //       orderBy: { createdate: 'desc' },
//   //       include: {
//   //         customer_group_members_customer_group: true,
//   //       },
//   //     });

//   //     const totalGroups = await prisma.customer_groups.count();
//   //     const activeGroups = await prisma.customer_groups.count({
//   //       where: { is_active: 'Y' },
//   //     });
//   //     const inactiveGroups = await prisma.customer_groups.count({
//   //       where: { is_active: 'N' },
//   //     });

//   //     const now = new Date();
//   //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//   //     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

//   //     const avgResult = await prisma.customer_groups.aggregate({
//   //       where: {
//   //         createdate: {
//   //           gte: startOfMonth,
//   //           lte: endOfMonth,
//   //         },
//   //       },
//   //       _avg: { discount_percentage: true },
//   //     });

//   //     const avgDiscount = avgResult._avg.discount_percentage || 0;

//   //     const newGroups = await prisma.customer_groups.count({
//   //       where: {
//   //         createdate: {
//   //           gte: startOfMonth,
//   //           lte: endOfMonth,
//   //         },
//   //       },
//   //     });

//   //     res.success(
//   //       'Customer groups retrieved successfully',
//   //       data.map((g: any) => serializeCustomerGroup(g)),
//   //       200,
//   //       pagination,
//   //       {
//   //         total_groups: totalGroups,
//   //         active_groups: activeGroups,
//   //         inactive_groups: inactiveGroups,
//   //         new_groups: newGroups,
//   //         avg_discount: avgDiscount,
//   //       }
//   //     );
//   //   } catch (error: any) {
//   //     console.error('Get Customer Groups Error:', error);
//   //     res.status(500).json({ message: error.message });
//   //   }
//   // },

//   async getAllCustomerGroups(req: any, res: any) {
//     try {
//       const { page, limit, search, status } = req.query;
//       const pageNum = parseInt(page as string, 10) || 1;
//       const limitNum = parseInt(limit as string, 10) || 10;
//       const searchLower = search ? (search as string).toLowerCase() : '';
//       const statusLower = status ? (status as string).toLowerCase() : '';

//       const filters: any = {
//         ...(search && {
//           OR: [
//             { name: { contains: searchLower } },
//             { code: { contains: searchLower } },
//           ],
//         }),
//         ...(statusLower === 'active' && { is_active: 'Y' }),
//         ...(statusLower === 'inactive' && { is_active: 'N' }),
//       };

//       const { data, pagination } = await paginate({
//         model: prisma.customer_groups,
//         filters,
//         page: pageNum,
//         limit: limitNum,
//         orderBy: { createdate: 'desc' },
//         include: {
//           customer_group_members_customer_group: true,
//           customer_group_routes_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_route: true },
//           },
//           customer_group_depots_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_depot: true },
//           },
//           customer_group_zones_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_zone: true },
//           },
//           customer_group_customer_category_customer_groups: {
//             where: { is_active: 'Y' },
//             include: {
//               customer_group_customer_category_customer_category: true,
//             },
//           },
//         },
//       });

//       const totalGroups = await prisma.customer_groups.count();
//       const activeGroups = await prisma.customer_groups.count({
//         where: { is_active: 'Y' },
//       });
//       const inactiveGroups = await prisma.customer_groups.count({
//         where: { is_active: 'N' },
//       });

//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

//       const avgResult = await prisma.customer_groups.aggregate({
//         where: {
//           createdate: {
//             gte: startOfMonth,
//             lte: endOfMonth,
//           },
//         },
//         _avg: { discount_percentage: true },
//       });

//       const avgDiscount = avgResult._avg.discount_percentage || 0;

//       const newGroups = await prisma.customer_groups.count({
//         where: {
//           createdate: {
//             gte: startOfMonth,
//             lte: endOfMonth,
//           },
//         },
//       });

//       const totalMembersResult = await prisma.customer_group_members.aggregate({
//         _count: {
//           id: true,
//         },
//       });
//       const members_count = totalMembersResult._count.id || 0;

//       res.success(
//         'Customer groups retrieved successfully',
//         data.map((g: any) => serializeCustomerGroup(g)),
//         200,
//         pagination,
//         {
//           total_groups: totalGroups,
//           active_groups: activeGroups,
//           inactive_groups: inactiveGroups,
//           new_groups: newGroups,
//           members_count: members_count,
//           avg_discount: avgDiscount,
//         }
//       );
//     } catch (error: any) {
//       console.error('Get Customer Groups Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async getCustomerGroupsById(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const group = await prisma.customer_groups.findUnique({
//         where: { id: Number(id) },
//         include: {
//           customer_group_members_customer_group: true,
//           customer_group_routes_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_route: true },
//           },
//           customer_group_depots_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_depot: true },
//           },
//           customer_group_zones_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_zone: true },
//           },
//           customer_group_customer_category_customer_groups: {
//             where: { is_active: 'Y' },
//             include: {
//               customer_group_customer_category_customer_category: true,
//             },
//           },
//         },
//       });

//       if (!group)
//         return res.status(404).json({ message: 'Customer group not found' });

//       res.json({
//         message: 'Customer group fetched successfully',
//         data: serializeCustomerGroup(group),
//       });
//     } catch (error: any) {
//       console.error('Get Customer Group Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   // async updateCustomerGroups(req: any, res: any) {
//   //   try {
//   //     const { id } = req.params;
//   //     const { customerGroups, ...groupData } = req.body;

//   //     const existingGroup = await prisma.customer_groups.findUnique({
//   //       where: { id: Number(id) },
//   //     });

//   //     if (!existingGroup)
//   //       return res.status(404).json({ message: 'Customer group not found' });

//   //     if (customerGroups) {
//   //       await prisma.customer_group_members.deleteMany({
//   //         where: { customer_group_id: Number(id) },
//   //       });

//   //       if (customerGroups.length > 0) {
//   //         await prisma.customer_group_members.createMany({
//   //           data: customerGroups.map((member: any) => ({
//   //             customer_group_id: Number(id),
//   //             customer_id: member.customer_id,
//   //             joined_at: member.joined_at || new Date(),
//   //             is_active: member.is_active || 'Y',
//   //             createdate: new Date(),
//   //             createdby: req.user?.id || 1,
//   //             log_inst: member.log_inst || 1,
//   //           })),
//   //         });
//   //       }
//   //     }

//   //     const data = {
//   //       ...groupData,
//   //       updatedate: new Date(),
//   //       updatedby: req.user?.id,
//   //     };

//   //     const group = await prisma.customer_groups.update({
//   //       where: { id: Number(id) },
//   //       data,
//   //       include: {
//   //         customer_group_members_customer_group: true,
//   //       },
//   //     });

//   //     res.json({
//   //       message: 'Customer group updated successfully',
//   //       data: serializeCustomerGroup(group),
//   //     });
//   //   } catch (error: any) {
//   //     console.error('Update Customer Group Error:', error);
//   //     res.status(500).json({ message: error.message });
//   //   }
//   // },

//   async updateCustomerGroups(req: any, res: any) {
//     try {
//       const { id } = req.params;
//       const input: CustomerGroupCreateInput = req.body;

//       const existingGroup = await prisma.customer_groups.findUnique({
//         where: { id: Number(id) },
//       });

//       if (!existingGroup)
//         return res.status(404).json({ message: 'Customer group not found' });

//       if (input.routes !== undefined) {
//         await prisma.customer_group_routes.deleteMany({
//           where: { parent_id: Number(id) },
//         });

//         if (input.routes.length > 0) {
//           for (const routeId of input.routes) {
//             await prisma.customer_group_routes.create({
//               data: {
//                 parent_id: Number(id),
//                 route_id: routeId,
//                 is_active: 'Y',
//                 createdby: req.user?.id || 1,
//                 createdate: new Date(),
//                 log_inst: 1,
//               },
//             });
//           }
//         }
//       }

//       if (input.depots !== undefined) {
//         await prisma.customer_group_depots.deleteMany({
//           where: { parent_id: Number(id) },
//         });

//         if (input.depots.length > 0) {
//           for (const depotId of input.depots) {
//             await prisma.customer_group_depots.create({
//               data: {
//                 parent_id: Number(id),
//                 depot_id: depotId,
//                 is_active: 'Y',
//                 createdby: req.user?.id || 1,
//                 createdate: new Date(),
//                 log_inst: 1,
//               },
//             });
//           }
//         }
//       }

//       if (input.zones !== undefined) {
//         await prisma.customer_group_zones.deleteMany({
//           where: { parent_id: Number(id) },
//         });

//         if (input.zones.length > 0) {
//           for (const zoneId of input.zones) {
//             await prisma.customer_group_zones.create({
//               data: {
//                 parent_id: Number(id),
//                 zone_id: zoneId,
//                 is_active: 'Y',
//                 createdby: req.user?.id || 1,
//                 createdate: new Date(),
//                 log_inst: 1,
//               },
//             });
//           }
//         }
//       }

//       if (input.customer_categories !== undefined) {
//         await prisma.customer_group_customer_category.deleteMany({
//           where: { parent_id: Number(id) },
//         });

//         if (input.customer_categories.length > 0) {
//           for (const categoryId of input.customer_categories) {
//             await prisma.customer_group_customer_category.create({
//               data: {
//                 parent_id: Number(id),
//                 customer_category_id: categoryId,
//                 is_active: 'Y',
//                 createdby: req.user?.id || 1,
//                 createdate: new Date(),
//                 log_inst: 1,
//               },
//             });
//           }
//         }
//       }

//       if (input.customerGroups !== undefined) {
//         await prisma.customer_group_members.deleteMany({
//           where: { customer_group_id: Number(id) },
//         });

//         if (input.customerGroups.length > 0) {
//           for (const member of input.customerGroups) {
//             await prisma.customer_group_members.create({
//               data: {
//                 customer_group_id: Number(id),
//                 customer_id: member.customer_id,
//                 joined_at: member.joined_at
//                   ? new Date(member.joined_at)
//                   : new Date(),
//                 is_active: member.is_active || 'Y',
//                 createdate: new Date(),
//                 createdby: req.user?.id || 1,
//                 log_inst: member.log_inst || 1,
//               },
//             });
//           }
//         }
//       }

//       const data = {
//         name: input.name,
//         description: input.description,
//         discount_percentage: input.discount_percentage,
//         credit_terms: input.credit_terms,
//         payment_terms: input.payment_terms,
//         price_group: input.price_group,
//         is_active: input.is_active,
//         updatedate: new Date(),
//         updatedby: req.user?.id,
//       };

//       const group = await prisma.customer_groups.update({
//         where: { id: Number(id) },
//         data,
//         include: {
//           customer_group_members_customer_group: true,
//           customer_group_routes_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_route: true },
//           },
//           customer_group_depots_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_depot: true },
//           },
//           customer_group_zones_customer_groups: {
//             where: { is_active: 'Y' },
//             include: { customer_group_zone: true },
//           },
//           customer_group_customer_category_customer_groups: {
//             where: { is_active: 'Y' },
//             include: {
//               customer_group_customer_category_customer_category: true,
//             },
//           },
//         },
//       });

//       res.json({
//         message: 'Customer group updated successfully',
//         data: serializeCustomerGroup(group),
//       });
//     } catch (error: any) {
//       console.error('Update Customer Group Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async deleteCustomerGroups(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const existingGroup = await prisma.customer_groups.findUnique({
//         where: { id: Number(id) },
//       });

//       if (!existingGroup)
//         return res.status(404).json({ message: 'Customer group not found' });

//       const warnings = [];

//       await prisma.customer_group_routes.deleteMany({
//         where: { parent_id: Number(id) },
//       });

//       await prisma.customer_group_depots.deleteMany({
//         where: { parent_id: Number(id) },
//       });

//       await prisma.customer_group_zones.deleteMany({
//         where: { parent_id: Number(id) },
//       });

//       await prisma.customer_group_customer_category.deleteMany({
//         where: { parent_id: Number(id) },
//       });

//       await prisma.customer_group_members.deleteMany({
//         where: { customer_group_id: Number(id) },
//       });

//       const dependentProducts = await prisma.products.findMany({
//         where: { outlet_group_id: Number(id) },
//       });

//       if (dependentProducts.length > 0) {
//         await prisma.products.updateMany({
//           where: { outlet_group_id: Number(id) },
//           data: { outlet_group_id: null },
//         });
//         warnings.push(
//           `${dependentProducts.length} product(s) were updated to remove customer group reference`
//         );
//       }

//       await prisma.customer_groups.delete({ where: { id: Number(id) } });

//       res.json({
//         message: 'Customer group deleted successfully',
//         warnings: warnings.length > 0 ? warnings : undefined,
//       });
//     } catch (error: any) {
//       if (
//         error.code === 'P2003' ||
//         error.message.includes('Foreign key constraint violated')
//       ) {
//         return res.status(400).json({
//           message:
//             'Cannot delete customer group. It is referenced by other records. Please update or delete those records first.',
//         });
//       }

//       res.status(500).json({ message: error.message });
//     }
//   },
// };

import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface CustomerGroupSerialized {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  discount_percentage?: number | null;
  credit_terms?: number | null;
  payment_terms?: string | null;
  price_group?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  members_count?: number;
  members?: { id: number; customer_id: number; group_id: number }[];
  routes?: { id: number; name: string; code: string }[];
  depots?: { id: number; name: string; code: string }[];
  zones?: { id: number; name: string; code: string }[];
  customer_categories?: {
    id: number;
    category_name: string;
    category_code: string;
    members_count?: number;
  }[];
}

interface CustomerGroupCreateInput {
  name: string;
  code?: string;
  description?: string;
  discount_percentage?: number;
  credit_terms?: number;
  payment_terms?: string;
  price_group?: string;
  is_active?: string;
  routes?: number[];
  depots?: number[];
  zones?: number[];
  customer_categories?: number[];
  customerGroups?: Array<{
    customer_id: number;
    joined_at?: string;
    is_active?: string;
    log_inst?: number;
  }>;
}
const generateCustomerGroupCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();
  const lastCustomerGroupCode = await prisma.customer_groups.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastCustomerGroupCode && lastCustomerGroupCode.code) {
    const match = lastCustomerGroupCode.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }
  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
  return code;
};

const updateCustomerGroupMemberCounts = async () => {
  try {
    console.log(
      ' Updating customer group member counts based on customer categories...'
    );

    const customerGroups = await prisma.customer_groups.findMany({
      include: {
        customer_group_customer_category_customer_groups: {
          where: {
            is_active: 'Y',
          },
        },
      },
    });

    for (const group of customerGroups) {
      const linkedCategoryIds =
        group.customer_group_customer_category_customer_groups?.map(
          (cat: any) => cat.customer_category_id
        ) || [];

      let memberCount = 0;

      if (linkedCategoryIds.length > 0) {
        const customersByCategory = await prisma.customers.findMany({
          where: {
            customer_category_id: {
              in: linkedCategoryIds,
            },
            is_active: 'Y',
          },
          select: {
            id: true,
            customer_category_id: true,
          },
        });

        memberCount = customersByCategory.length;

        console.log(
          `   Group "${group.name}": ${memberCount} customers in categories [${linkedCategoryIds.join(', ')}]`
        );
      } else {
        const directMembers = await prisma.customer_group_members.findMany({
          where: {
            customer_group_id: group.id,
            is_active: 'Y',
          },
        });
        memberCount = directMembers.length;
        console.log(
          `   Group "${group.name}": ${memberCount} direct members (no categories linked)`
        );
      }
    }

    console.log(' Customer group member counts updated');
    return { updated: customerGroups.length, success: true };
  } catch (error: any) {
    console.error(' Error updating member counts:', error.message);
    return { updated: 0, success: false, error: error.message };
  }
};

// const serializeCustomerGroup = (group: any): CustomerGroupSerialized => ({
//   id: group.id,
//   name: group.name,
//   code: group.code,
//   description: group.description,
//   discount_percentage: group.discount_percentage,
//   credit_terms: group.credit_terms,
//   payment_terms: group.payment_terms,
//   price_group: group.price_group,
//   is_active: group.is_active,
//   createdate: group.createdate,
//   createdby: group.createdby,
//   updatedate: group.updatedate,
//   updatedby: group.updatedby,
//   log_inst: group.log_inst,
//   members:
//     group.customer_group_members_customer_group?.map((m: any) => ({
const serializeCustomerGroup = async (
  group: any
): Promise<CustomerGroupSerialized> => {
  const linkedCategoryIds =
    group.customer_group_customer_category_customer_groups?.map(
      (cat: any) => cat.customer_category_id
    ) || [];

  let membersCount = 0;
  let membersList: { id: number; customer_id: number; group_id: number }[] = [];
  let categoriesWithCounts: {
    id: number;
    category_name: string;
    category_code: string;
    members_count?: number;
  }[] = [];

  if (linkedCategoryIds.length > 0) {
    const customersByCategory = await prisma.customers.findMany({
      where: {
        customer_category_id: {
          in: linkedCategoryIds,
        },
        is_active: 'Y',
      },
      select: {
        id: true,
        customer_category_id: true,
        name: true,
        code: true,
      },
    });

    membersCount = customersByCategory.length;

    membersList = customersByCategory.map((customer: any) => ({
      id: customer.id,
      customer_id: customer.id,
      group_id: group.id,
    }));

    const categoryMemberCounts: { [key: number]: number } = {};
    customersByCategory.forEach((customer: any) => {
      const categoryId = customer.customer_category_id;
      categoryMemberCounts[categoryId] =
        (categoryMemberCounts[categoryId] || 0) + 1;
    });

    categoriesWithCounts =
      group.customer_group_customer_category_customer_groups
        ?.filter((c: any) => c.is_active === 'Y')
        ?.map((c: any) => {
          const categoryId =
            c.customer_group_customer_category_customer_category.id;
          return {
            id: categoryId,
            category_name:
              c.customer_group_customer_category_customer_category
                .category_name,
            category_code:
              c.customer_group_customer_category_customer_category
                .category_code,
            members_count: categoryMemberCounts[categoryId] || 0,
          };
        }) || [];
  } else {
    const directMembers = group.customer_group_members_customer_group || [];
    membersCount = directMembers.length;
    membersList = directMembers.map((m: any) => ({
      id: m.id,
      customer_id: m.customer_id,
      group_id: m.group_id,
    }));
  }

  return {
    id: group.id,
    name: group.name,
    code: group.code,
    description: group.description,
    discount_percentage: group.discount_percentage,
    credit_terms: group.credit_terms,
    payment_terms: group.payment_terms,
    price_group: group.price_group,
    is_active: group.is_active,
    createdate: group.createdate,
    createdby: group.createdby,
    updatedate: group.updatedate,
    updatedby: group.updatedby,
    log_inst: group.log_inst,
    members_count: membersCount,
    members: membersList,
    routes:
      group.customer_group_routes_customer_groups
        ?.filter((r: any) => r.is_active === 'Y')
        ?.map((r: any) => ({
          id: r.customer_group_route.id,
          name: r.customer_group_route.name,
          code: r.customer_group_route.code,
        })) || [],
    depots:
      group.customer_group_depots_customer_groups
        ?.filter((d: any) => d.is_active === 'Y')
        ?.map((d: any) => ({
          id: d.customer_group_depot.id,
          name: d.customer_group_depot.name,
          code: d.customer_group_depot.code,
        })) || [],
    zones:
      group.customer_group_zones_customer_groups
        ?.filter((z: any) => z.is_active === 'Y')
        ?.map((z: any) => ({
          id: z.customer_group_zone.id,
          name: z.customer_group_zone.name,
          code: z.customer_group_zone.code,
        })) || [],
    customer_categories: categoriesWithCounts,
  };
};
export const customerGroupsController = {
  // async createCustomerGroups(req: Request, res: Response) {
  //   try {
  //     const { customerGroups, ...groupData } = req.body;
  //     const newCode = await generateCustomerGroupCode(groupData.name);

  //     const group = await prisma.customer_groups.create({
  //       data: {
  //         ...groupData,
  //         code: newCode,
  //         is_active: groupData.is_active || 'Y',
  //         createdate: new Date(),
  //         createdby: req.user?.id || 1,
  //         log_inst: groupData.log_inst || 1,
  //         customer_group_members_customer_group: {
  //           create: customerGroups?.map((member: any) => ({
  //             customer_id: member.customer_id,
  //             joined_at: member.joined_at || new Date(),
  //             is_active: member.is_active || 'Y',
  //             createdate: new Date(),
  //             createdby: req.user?.id || 1,
  //             log_inst: member.log_inst || 1,
  //           })),
  //         },
  //       },
  //       include: {
  //         customer_group_members_customer_group: true,
  //       },
  //     });

  //     res.status(201).json({
  //       message: 'Customer group created successfully',
  //       data: serializeCustomerGroup(group),
  //     });
  //   } catch (error: any) {
  //     console.error('Create Customer Group Error:', error);
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  async createCustomerGroups(req: Request, res: Response) {
    try {
      const input: CustomerGroupCreateInput = req.body;
      const newCode =
        input.code || (await generateCustomerGroupCode(input.name));

      const group = await prisma.customer_groups.create({
        data: {
          name: input.name,
          code: newCode,
          description: input.description || null,
          discount_percentage: input.discount_percentage || 0,
          credit_terms: input.credit_terms || 30,
          payment_terms: input.payment_terms || null,
          price_group: input.price_group || null,
          is_active: input.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: 1,
        },
      });

      const groupId = group.id;

      const routes = input.routes || [];
      if (routes.length > 0) {
        for (const routeId of routes) {
          await prisma.customer_group_routes.create({
            data: {
              parent_id: groupId,
              route_id: routeId,
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });
        }
      }

      const depots = input.depots || [];
      if (depots.length > 0) {
        for (const depotId of depots) {
          await prisma.customer_group_depots.create({
            data: {
              parent_id: groupId,
              depot_id: depotId,
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });
        }
      }

      const zones = input.zones || [];
      if (zones.length > 0) {
        for (const zoneId of zones) {
          await prisma.customer_group_zones.create({
            data: {
              parent_id: groupId,
              zone_id: zoneId,
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });
        }
      }

      const customerCategories = input.customer_categories || [];
      if (customerCategories.length > 0) {
        for (const categoryId of customerCategories) {
          await prisma.customer_group_customer_category.create({
            data: {
              parent_id: groupId,
              customer_category_id: categoryId,
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });
        }
      }

      const customerGroups = input.customerGroups || [];
      if (customerGroups.length > 0) {
        for (const member of customerGroups) {
          await prisma.customer_group_members.create({
            data: {
              customer_group_id: groupId,
              customer_id: member.customer_id,
              joined_at: member.joined_at
                ? new Date(member.joined_at)
                : new Date(),
              is_active: member.is_active || 'Y',
              createdate: new Date(),
              createdby: req.user?.id || 1,
              log_inst: member.log_inst || 1,
            },
          });
        }
      }

      const completeGroup = await prisma.customer_groups.findUnique({
        where: { id: groupId },
        include: {
          customer_group_members_customer_group: true,
          customer_group_routes_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_route: true },
          },
          customer_group_depots_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_depot: true },
          },
          customer_group_zones_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_zone: true },
          },
          customer_group_customer_category_customer_groups: {
            where: { is_active: 'Y' },
            include: {
              customer_group_customer_category_customer_category: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Customer group created successfully',
        data: await serializeCustomerGroup(completeGroup),
      });
    } catch (error: any) {
      console.error('Create Customer Group Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCustomerGroups(req: any, res: any) {
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
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customer_groups,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_group_members_customer_group: true,
          customer_group_routes_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_route: true },
          },
          customer_group_depots_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_depot: true },
          },
          customer_group_zones_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_zone: true },
          },
          customer_group_customer_category_customer_groups: {
            where: { is_active: 'Y' },
            include: {
              customer_group_customer_category_customer_category: true,
            },
          },
        },
      });

      const totalGroups = await prisma.customer_groups.count();
      const activeGroups = await prisma.customer_groups.count({
        where: { is_active: 'Y' },
      });
      const inactiveGroups = await prisma.customer_groups.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const avgResult = await prisma.customer_groups.aggregate({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _avg: { discount_percentage: true },
      });

      const avgDiscount = avgResult._avg.discount_percentage || 0;

      const newGroups = await prisma.customer_groups.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const totalMembersResult = await prisma.customer_group_members.aggregate({
        _count: {
          id: true,
        },
      });
      const members_count = totalMembersResult._count.id || 0;

      const serializedData = await Promise.all(
        data.map((g: any) => serializeCustomerGroup(g))
      );

      res.success(
        'Customer groups retrieved successfully',
        serializedData,
        200,
        pagination,
        {
          total_groups: totalGroups,
          active_groups: activeGroups,
          inactive_groups: inactiveGroups,
          new_groups: newGroups,
          members_count: members_count,
          avg_discount: avgDiscount,
        }
      );
    } catch (error: any) {
      console.error('Get Customer Groups Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCustomerGroupsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const group = await prisma.customer_groups.findUnique({
        where: { id: Number(id) },
        include: {
          customer_group_members_customer_group: true,
          customer_group_routes_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_route: true },
          },
          customer_group_depots_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_depot: true },
          },
          customer_group_zones_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_zone: true },
          },
          customer_group_customer_category_customer_groups: {
            where: { is_active: 'Y' },
            include: {
              customer_group_customer_category_customer_category: true,
            },
          },
        },
      });

      if (!group)
        return res.status(404).json({ message: 'Customer group not found' });

      res.json({
        message: 'Customer group fetched successfully',
        data: await serializeCustomerGroup(group),
      });
    } catch (error: any) {
      console.error('Get Customer Group Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // async updateCustomerGroups(req: any, res: any) {
  //   try {
  //     const { id } = req.params;
  //     const { customerGroups, ...groupData } = req.body;

  //     const existingGroup = await prisma.customer_groups.findUnique({
  //       where: { id: Number(id) },
  //     });

  //     if (!existingGroup)
  //       return res.status(404).json({ message: 'Customer group not found' });

  //     if (customerGroups) {
  //       await prisma.customer_group_members.deleteMany({
  //         where: { customer_group_id: Number(id) },
  //       });

  //       if (customerGroups.length > 0) {
  //         await prisma.customer_group_members.createMany({
  //           data: customerGroups.map((member: any) => ({
  //             customer_group_id: Number(id),
  //             customer_id: member.customer_id,
  //             joined_at: member.joined_at || new Date(),
  //             is_active: member.is_active || 'Y',
  //             createdate: new Date(),
  //             createdby: req.user?.id || 1,
  //             log_inst: member.log_inst || 1,
  //           })),
  //         });
  //       }
  //     }

  //     const data = {
  //       ...groupData,
  //       updatedate: new Date(),
  //       updatedby: req.user?.id,
  //     };

  //     const group = await prisma.customer_groups.update({
  //       where: { id: Number(id) },
  //       data,
  //       include: {
  //         customer_group_members_customer_group: true,
  //       },
  //     });

  //     res.json({
  //       message: 'Customer group updated successfully',
  //       data: serializeCustomerGroup(group),
  //     });
  //   } catch (error: any) {
  //     console.error('Update Customer Group Error:', error);
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  async updateCustomerGroups(req: any, res: any) {
    try {
      const { id } = req.params;
      const input: CustomerGroupCreateInput = req.body;

      const existingGroup = await prisma.customer_groups.findUnique({
        where: { id: Number(id) },
      });

      if (!existingGroup)
        return res.status(404).json({ message: 'Customer group not found' });

      if (input.routes !== undefined) {
        await prisma.customer_group_routes.deleteMany({
          where: { parent_id: Number(id) },
        });

        if (input.routes.length > 0) {
          for (const routeId of input.routes) {
            await prisma.customer_group_routes.create({
              data: {
                parent_id: Number(id),
                route_id: routeId,
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
      }

      if (input.depots !== undefined) {
        await prisma.customer_group_depots.deleteMany({
          where: { parent_id: Number(id) },
        });

        if (input.depots.length > 0) {
          for (const depotId of input.depots) {
            await prisma.customer_group_depots.create({
              data: {
                parent_id: Number(id),
                depot_id: depotId,
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
      }

      if (input.zones !== undefined) {
        await prisma.customer_group_zones.deleteMany({
          where: { parent_id: Number(id) },
        });

        if (input.zones.length > 0) {
          for (const zoneId of input.zones) {
            await prisma.customer_group_zones.create({
              data: {
                parent_id: Number(id),
                zone_id: zoneId,
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
      }

      if (input.customer_categories !== undefined) {
        await prisma.customer_group_customer_category.deleteMany({
          where: { parent_id: Number(id) },
        });

        if (input.customer_categories.length > 0) {
          for (const categoryId of input.customer_categories) {
            await prisma.customer_group_customer_category.create({
              data: {
                parent_id: Number(id),
                customer_category_id: categoryId,
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
      }

      if (input.customerGroups !== undefined) {
        await prisma.customer_group_members.deleteMany({
          where: { customer_group_id: Number(id) },
        });

        if (input.customerGroups.length > 0) {
          for (const member of input.customerGroups) {
            await prisma.customer_group_members.create({
              data: {
                customer_group_id: Number(id),
                customer_id: member.customer_id,
                joined_at: member.joined_at
                  ? new Date(member.joined_at)
                  : new Date(),
                is_active: member.is_active || 'Y',
                createdate: new Date(),
                createdby: req.user?.id || 1,
                log_inst: member.log_inst || 1,
              },
            });
          }
        }
      }

      const data = {
        name: input.name,
        description: input.description,
        discount_percentage: input.discount_percentage,
        credit_terms: input.credit_terms,
        payment_terms: input.payment_terms,
        price_group: input.price_group,
        is_active: input.is_active,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const group = await prisma.customer_groups.update({
        where: { id: Number(id) },
        data,
        include: {
          customer_group_members_customer_group: true,
          customer_group_routes_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_route: true },
          },
          customer_group_depots_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_depot: true },
          },
          customer_group_zones_customer_groups: {
            where: { is_active: 'Y' },
            include: { customer_group_zone: true },
          },
          customer_group_customer_category_customer_groups: {
            where: { is_active: 'Y' },
            include: {
              customer_group_customer_category_customer_category: true,
            },
          },
        },
      });

      res.json({
        message: 'Customer group updated successfully',
        data: await serializeCustomerGroup(group),
      });
    } catch (error: any) {
      console.error('Update Customer Group Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCustomerGroups(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingGroup = await prisma.customer_groups.findUnique({
        where: { id: Number(id) },
      });

      if (!existingGroup)
        return res.status(404).json({ message: 'Customer group not found' });

      const warnings = [];

      await prisma.customer_group_routes.deleteMany({
        where: { parent_id: Number(id) },
      });

      await prisma.customer_group_depots.deleteMany({
        where: { parent_id: Number(id) },
      });

      await prisma.customer_group_zones.deleteMany({
        where: { parent_id: Number(id) },
      });

      await prisma.customer_group_customer_category.deleteMany({
        where: { parent_id: Number(id) },
      });

      await prisma.customer_group_members.deleteMany({
        where: { customer_group_id: Number(id) },
      });

      const dependentProducts = await prisma.products.findMany({
        where: { outlet_group_id: Number(id) },
      });

      if (dependentProducts.length > 0) {
        await prisma.products.updateMany({
          where: { outlet_group_id: Number(id) },
          data: { outlet_group_id: null },
        });
        warnings.push(
          `${dependentProducts.length} product(s) were updated to remove customer group reference`
        );
      }

      await prisma.customer_groups.delete({ where: { id: Number(id) } });

      res.json({
        message: 'Customer group deleted successfully',
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    } catch (error: any) {
      if (
        error.code === 'P2003' ||
        error.message.includes('Foreign key constraint violated')
      ) {
        return res.status(400).json({
          message:
            'Cannot delete customer group. It is referenced by other records. Please update or delete those records first.',
        });
      }

      res.status(500).json({ message: error.message });
    }
  },
};
