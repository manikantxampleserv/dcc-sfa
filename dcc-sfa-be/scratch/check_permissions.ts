import prisma from '../src/configs/prisma.client';

async function main() {
  try {
    const users = await prisma.users.findMany({
      include: {
        user_role: {
          include: {
            roles_permission: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    const userSummary = users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.user_role?.name,
      permissions: u.user_role?.roles_permission.map(rp => rp.permission.name)
    }));

    console.log(JSON.stringify(userSummary, null, 2));
  } catch (err) {
    console.error('Error fetching users:', err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma client in this project handles its own disconnect via proxy/getPrisma
  });
