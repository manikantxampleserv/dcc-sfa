import prisma from '../../configs/prisma.client';

interface TreeNode {
  id: string;
  label: string;
  type: string;
  children: TreeNode[];
}

const buildTree = (allUsers: any[]): TreeNode[] => {
  const roleMap = new Map<string, TreeNode>();

  allUsers.forEach(user => {
    const roleName = user.user_role?.name || 'Unassigned Role';
    if (!roleMap.has(roleName)) {
      roleMap.set(roleName, {
        id: `role-${roleName.toLowerCase().replace(/\s+/g, '-')}`,
        label: roleName,
        type: 'role',
        children: [],
      });
    }

    const userNode: TreeNode = {
      id: `user-${user.id}`,
      label: `${user.name} (${user.employee_id || user.user_role?.name || 'User'})`,
      type: 'user',
      children: [],
    };

    if (user.users_depots_users && user.users_depots_users.length > 0) {
      user.users_depots_users.forEach((ud: any) => {
        const depot = ud.user_depots_depot_id;
        if (!depot) return;

        const depotNode: TreeNode = {
          id: `depot-${user.id}-${depot.id}`,
          label: `${depot.name} (${depot.code})`,
          type: 'depot',
          children: [],
        };
        userNode.children.push(depotNode);

        if (depot.zone_depots && depot.zone_depots.length > 0) {
          depot.zone_depots.forEach((zone: any) => {
            const zoneNode: TreeNode = {
              id: `zone-${user.id}-${depot.id}-${zone.id}`,
              label: `${zone.name} (${zone.code})`,
              type: 'zone',
              children: [],
            };
            depotNode.children.push(zoneNode);

            if (zone.route_zones && zone.route_zones.length > 0) {
              zone.route_zones.forEach((route: any) => {
                const routeNode: TreeNode = {
                  id: `route-${user.id}-${depot.id}-${zone.id}-${route.id}`,
                  label: `${route.name} (${route.code})`,
                  type: 'route',
                  children: [],
                };
                zoneNode.children.push(routeNode);

                if (route.customer_routes && route.customer_routes.length > 0) {
                  route.customer_routes.forEach((customer: any) => {
                    const customerNode: TreeNode = {
                      id: `outlet-${user.id}-${depot.id}-${zone.id}-${route.id}-${customer.id}`,
                      label: `${customer.name} (${customer.code})`,
                      type: 'outlet',
                      children: [],
                    };
                    routeNode.children.push(customerNode);
                  });
                }
              });
            }
          });
        }
      });
    }

    roleMap.get(roleName)!.children.push(userNode);
  });

  return Array.from(roleMap.values());
};

export const getOrganizationChart = async (req: any, res: any) => {
  try {
    const allUsers = await prisma.users.findMany({
      where: { is_active: 'Y' },
      select: {
        id: true,
        name: true,
        email: true,
        employee_id: true,
        reporting_to: true,
        user_role: { select: { name: true } },
        users_depots_users: {
          select: {
            user_depots_depot_id: {
              select: {
                id: true,
                name: true,
                code: true,
                zone_depots: {
                  where: { is_active: 'Y' },
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    route_zones: {
                      where: { is_active: 'Y' },
                      select: {
                        id: true,
                        name: true,
                        code: true,
                        customer_routes: {
                          where: { is_active: 'Y' },
                          select: {
                            id: true,
                            name: true,
                            code: true,
                            type: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const tree = buildTree(allUsers);
    res.status(200).json({ success: true, data: tree });
  } catch (error: any) {
    console.error('Org Chart Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
