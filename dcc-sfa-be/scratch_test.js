const prisma = require('./src/configs/prisma.client').default;

async function main() {
  const users = await prisma.users.findMany({
    where: { sub_inventory_parent_id: 99 }
  });
  console.log('Users linked to sub_inventory_parent_id 99 (count):', users.length);
  
  const user = await prisma.users.findUnique({
    where: { id: 99 },
    include: {
      sub_inventory_users: true
    }
  });
  console.log('User 99 includes sub_inventory_users:', user?.sub_inventory_users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
