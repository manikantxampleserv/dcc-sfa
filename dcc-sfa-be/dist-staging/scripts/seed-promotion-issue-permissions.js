"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
async function main() {
    const permissions = [
        {
            name: 'promotion_materials_read',
            module: 'Promotion Materials',
            action: 'READ',
            description: 'View and access data for Promotional Materials',
            is_active: 'Y',
            createdby: 1,
        },
        {
            name: 'promotion_materials_create',
            module: 'Promotion Materials',
            action: 'CREATE',
            description: 'Create new records for Promotional Materials',
            is_active: 'Y',
            createdby: 1,
        },
        {
            name: 'promotion_materials_update',
            module: 'Promotion Materials',
            action: 'UPDATE',
            description: 'Modify existing records for Promotional Materials',
            is_active: 'Y',
            createdby: 1,
        },
        {
            name: 'promotion_materials_delete',
            module: 'Promotion Materials',
            action: 'DELETE',
            description: 'Remove records for Promotional Materials',
            is_active: 'Y',
            createdby: 1,
        },
    ];
    try {
        for (const p of permissions) {
            /**
             * Upsert permission by unique name
             */
            const perm = await prisma_client_1.default.permissions.upsert({
                where: { name: p.name },
                update: {
                    module: p.module,
                    action: p.action,
                    description: p.description,
                    is_active: p.is_active,
                    updatedate: new Date(),
                },
                create: {
                    name: p.name,
                    module: p.module,
                    action: p.action,
                    description: p.description,
                    is_active: p.is_active,
                    createdby: p.createdby,
                    createdate: new Date(),
                    updatedate: new Date(),
                },
            });
            console.log(`Permission ensured: ${perm.name} (ID: ${perm.id})`);
            /**
             * Assign to Admin role (id: 1) if not already assigned
             */
            const adminRole = await prisma_client_1.default.roles.findFirst({
                where: { id: 1 },
            });
            if (adminRole) {
                const existingRolePerm = await prisma_client_1.default.role_permissions.findFirst({
                    where: {
                        role_id: adminRole.id,
                        permission_id: perm.id,
                    },
                });
                if (!existingRolePerm) {
                    await prisma_client_1.default.role_permissions.create({
                        data: {
                            role_id: adminRole.id,
                            permission_id: perm.id,
                            is_active: 'Y',
                            createdby: 1,
                            createdate: new Date(),
                        },
                    });
                    console.log(`   -> Linked to Admin role`);
                }
            }
        }
        console.log('Successfully configured Promotion Materials permissions.');
    }
    catch (error) {
        console.error('Error configuring permissions:', error);
    }
    finally {
        await prisma_client_1.default.$disconnect();
    }
}
main();
//# sourceMappingURL=seed-promotion-issue-permissions.js.map