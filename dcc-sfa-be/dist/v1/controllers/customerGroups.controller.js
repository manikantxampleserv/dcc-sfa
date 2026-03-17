"use strict";
// import { Request, Response } from 'express';
// import { paginate } from '../../utils/paginate';
// import prisma from '../../configs/prisma.client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerGroupsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const generateCustomerGroupCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastCustomerGroupCode = await prisma_client_1.default.customer_groups.findFirst({
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
        console.log(' Updating customer group member counts based on customer categories...');
        const customerGroups = await prisma_client_1.default.customer_groups.findMany({
            include: {
                customer_group_customer_category_customer_groups: {
                    where: {
                        is_active: 'Y',
                    },
                },
            },
        });
        for (const group of customerGroups) {
            const linkedCategoryIds = group.customer_group_customer_category_customer_groups?.map((cat) => cat.customer_category_id) || [];
            let memberCount = 0;
            if (linkedCategoryIds.length > 0) {
                const customersByCategory = await prisma_client_1.default.customers.findMany({
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
                console.log(`   Group "${group.name}": ${memberCount} customers in categories [${linkedCategoryIds.join(', ')}]`);
            }
            else {
                const directMembers = await prisma_client_1.default.customer_group_members.findMany({
                    where: {
                        customer_group_id: group.id,
                        is_active: 'Y',
                    },
                });
                memberCount = directMembers.length;
                console.log(`   Group "${group.name}": ${memberCount} direct members (no categories linked)`);
            }
        }
        console.log(' Customer group member counts updated');
        return { updated: customerGroups.length, success: true };
    }
    catch (error) {
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
const serializeCustomerGroup = async (group) => {
    const linkedCategoryIds = group.customer_group_customer_category_customer_groups?.map((cat) => cat.customer_category_id) || [];
    let membersCount = 0;
    let membersList = [];
    let categoriesWithCounts = [];
    if (linkedCategoryIds.length > 0) {
        const customersByCategory = await prisma_client_1.default.customers.findMany({
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
        membersList = customersByCategory.map((customer) => ({
            id: customer.id,
            customer_id: customer.id,
            group_id: group.id,
        }));
        const categoryMemberCounts = {};
        customersByCategory.forEach((customer) => {
            const categoryId = customer.customer_category_id;
            categoryMemberCounts[categoryId] =
                (categoryMemberCounts[categoryId] || 0) + 1;
        });
        categoriesWithCounts =
            group.customer_group_customer_category_customer_groups
                ?.filter((c) => c.is_active === 'Y')
                ?.map((c) => {
                const categoryId = c.customer_group_customer_category_customer_category.id;
                return {
                    id: categoryId,
                    category_name: c.customer_group_customer_category_customer_category
                        .category_name,
                    category_code: c.customer_group_customer_category_customer_category
                        .category_code,
                    members_count: categoryMemberCounts[categoryId] || 0,
                };
            }) || [];
    }
    else {
        const directMembers = group.customer_group_members_customer_group || [];
        membersCount = directMembers.length;
        membersList = directMembers.map((m) => ({
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
        routes: group.customer_group_routes_customer_groups
            ?.filter((r) => r.is_active === 'Y')
            ?.map((r) => ({
            id: r.customer_group_route.id,
            name: r.customer_group_route.name,
            code: r.customer_group_route.code,
        })) || [],
        depots: group.customer_group_depots_customer_groups
            ?.filter((d) => d.is_active === 'Y')
            ?.map((d) => ({
            id: d.customer_group_depot.id,
            name: d.customer_group_depot.name,
            code: d.customer_group_depot.code,
        })) || [],
        zones: group.customer_group_zones_customer_groups
            ?.filter((z) => z.is_active === 'Y')
            ?.map((z) => ({
            id: z.customer_group_zone.id,
            name: z.customer_group_zone.name,
            code: z.customer_group_zone.code,
        })) || [],
        customer_categories: categoriesWithCounts,
    };
};
exports.customerGroupsController = {
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
    async createCustomerGroups(req, res) {
        try {
            const input = req.body;
            const newCode = input.code || (await generateCustomerGroupCode(input.name));
            const group = await prisma_client_1.default.customer_groups.create({
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
                    await prisma_client_1.default.customer_group_routes.create({
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
                    await prisma_client_1.default.customer_group_depots.create({
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
                    await prisma_client_1.default.customer_group_zones.create({
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
                    await prisma_client_1.default.customer_group_customer_category.create({
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
                    await prisma_client_1.default.customer_group_members.create({
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
            const completeGroup = await prisma_client_1.default.customer_groups.findUnique({
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
        }
        catch (error) {
            console.error('Create Customer Group Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllCustomerGroups(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
                ...(search && {
                    OR: [
                        { name: { contains: searchLower } },
                        { code: { contains: searchLower } },
                    ],
                }),
                ...(statusLower === 'active' && { is_active: 'Y' }),
                ...(statusLower === 'inactive' && { is_active: 'N' }),
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.customer_groups,
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
            const totalGroups = await prisma_client_1.default.customer_groups.count();
            const activeGroups = await prisma_client_1.default.customer_groups.count({
                where: { is_active: 'Y' },
            });
            const inactiveGroups = await prisma_client_1.default.customer_groups.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const avgResult = await prisma_client_1.default.customer_groups.aggregate({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                _avg: { discount_percentage: true },
            });
            const avgDiscount = avgResult._avg.discount_percentage || 0;
            const newGroups = await prisma_client_1.default.customer_groups.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            const totalMembersResult = await prisma_client_1.default.customer_group_members.aggregate({
                _count: {
                    id: true,
                },
            });
            const members_count = totalMembersResult._count.id || 0;
            const serializedData = await Promise.all(data.map((g) => serializeCustomerGroup(g)));
            res.success('Customer groups retrieved successfully', serializedData, 200, pagination, {
                total_groups: totalGroups,
                active_groups: activeGroups,
                inactive_groups: inactiveGroups,
                new_groups: newGroups,
                members_count: members_count,
                avg_discount: avgDiscount,
            });
        }
        catch (error) {
            console.error('Get Customer Groups Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getCustomerGroupsById(req, res) {
        try {
            const { id } = req.params;
            const group = await prisma_client_1.default.customer_groups.findUnique({
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
        }
        catch (error) {
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
    async updateCustomerGroups(req, res) {
        try {
            const { id } = req.params;
            const input = req.body;
            const existingGroup = await prisma_client_1.default.customer_groups.findUnique({
                where: { id: Number(id) },
            });
            if (!existingGroup)
                return res.status(404).json({ message: 'Customer group not found' });
            if (input.routes !== undefined) {
                await prisma_client_1.default.customer_group_routes.deleteMany({
                    where: { parent_id: Number(id) },
                });
                if (input.routes.length > 0) {
                    for (const routeId of input.routes) {
                        await prisma_client_1.default.customer_group_routes.create({
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
                await prisma_client_1.default.customer_group_depots.deleteMany({
                    where: { parent_id: Number(id) },
                });
                if (input.depots.length > 0) {
                    for (const depotId of input.depots) {
                        await prisma_client_1.default.customer_group_depots.create({
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
                await prisma_client_1.default.customer_group_zones.deleteMany({
                    where: { parent_id: Number(id) },
                });
                if (input.zones.length > 0) {
                    for (const zoneId of input.zones) {
                        await prisma_client_1.default.customer_group_zones.create({
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
                await prisma_client_1.default.customer_group_customer_category.deleteMany({
                    where: { parent_id: Number(id) },
                });
                if (input.customer_categories.length > 0) {
                    for (const categoryId of input.customer_categories) {
                        await prisma_client_1.default.customer_group_customer_category.create({
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
                await prisma_client_1.default.customer_group_members.deleteMany({
                    where: { customer_group_id: Number(id) },
                });
                if (input.customerGroups.length > 0) {
                    for (const member of input.customerGroups) {
                        await prisma_client_1.default.customer_group_members.create({
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
            const group = await prisma_client_1.default.customer_groups.update({
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
        }
        catch (error) {
            console.error('Update Customer Group Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteCustomerGroups(req, res) {
        try {
            const { id } = req.params;
            const existingGroup = await prisma_client_1.default.customer_groups.findUnique({
                where: { id: Number(id) },
            });
            if (!existingGroup)
                return res.status(404).json({ message: 'Customer group not found' });
            const warnings = [];
            await prisma_client_1.default.customer_group_routes.deleteMany({
                where: { parent_id: Number(id) },
            });
            await prisma_client_1.default.customer_group_depots.deleteMany({
                where: { parent_id: Number(id) },
            });
            await prisma_client_1.default.customer_group_zones.deleteMany({
                where: { parent_id: Number(id) },
            });
            await prisma_client_1.default.customer_group_customer_category.deleteMany({
                where: { parent_id: Number(id) },
            });
            await prisma_client_1.default.customer_group_members.deleteMany({
                where: { customer_group_id: Number(id) },
            });
            const dependentProducts = await prisma_client_1.default.products.findMany({
                where: { outlet_group_id: Number(id) },
            });
            if (dependentProducts.length > 0) {
                await prisma_client_1.default.products.updateMany({
                    where: { outlet_group_id: Number(id) },
                    data: { outlet_group_id: null },
                });
                warnings.push(`${dependentProducts.length} product(s) were updated to remove customer group reference`);
            }
            await prisma_client_1.default.customer_groups.delete({ where: { id: Number(id) } });
            res.json({
                message: 'Customer group deleted successfully',
                warnings: warnings.length > 0 ? warnings : undefined,
            });
        }
        catch (error) {
            if (error.code === 'P2003' ||
                error.message.includes('Foreign key constraint violated')) {
                return res.status(400).json({
                    message: 'Cannot delete customer group. It is referenced by other records. Please update or delete those records first.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=customerGroups.controller.js.map