import prisma from '../configs/prisma.client';
import { isHiddenUser } from '../configs/hiddenUsers.config';

/**
 * @interface DepotStaffInfo
 * @description Resolved coordinator and supervisor information for a depot or salesperson
 */
export interface DepotStaffInfo {
  depotId: number | null;
  depotName: string;
  coordinatorName: string;
  supervisorName: string;
  coordinatorId: number | null;
  supervisorId: number | null;
}

/**
 * @interface ResolveStaffParams
 * @description Input parameters to resolve coordinator, supervisor, and depot
 */
export interface ResolveStaffParams {
  depotId?: number | null;
  depotName?: string | null;
  customerDepot?: any;
  salesperson?: any;
  salespersonId?: number | null;
}

/**
 * @interface DepotStaffLookup
 * @description Fast in-memory lookup interface for resolving staff per row
 */
export interface DepotStaffLookup {
  resolveStaff: (params: ResolveStaffParams) => DepotStaffInfo;
}

/**
 * @interface CachedLookupData
 * @description Internal cached structure of depots, users, and hierarchy
 */
interface CachedLookupData {
  timestamp: number;
  depotsById: Map<number, any>;
  depotsByName: Map<string, any>;
  usersById: Map<number, any>;
  depotSupervisorsMap: Map<number, any[]>;
  depotCoordinatorsMap: Map<number, any[]>;
  salesmanDepotMap: Map<number, number[]>;
}

let cachedLookup: CachedLookupData | null = null;
const CACHE_TTL_MS = 60 * 1000;

/**
 * @function isCoordinatorRole
 * @description Checks if a given role name or key represents a coordinator
 * @param {any} role User role object
 * @returns {boolean} True if coordinator
 */
const isCoordinatorRole = (role?: { name?: string | null; role_key?: string | null } | null): boolean => {
  if (!role) return false;
  const name = (role.name || '').toLowerCase();
  const key = (role.role_key || '').toLowerCase();
  return name.includes('coordinator') || key.includes('coordinator');
};

/**
 * @function isSupervisorRole
 * @description Checks if a given role name or key represents a supervisor
 * @param {any} role User role object
 * @returns {boolean} True if supervisor
 */
const isSupervisorRole = (role?: { name?: string | null; role_key?: string | null } | null): boolean => {
  if (!role) return false;
  const name = (role.name || '').toLowerCase();
  const key = (role.role_key || '').toLowerCase();
  return name.includes('supervisor') || key.includes('supervisor');
};

/**
 * @function getDepotStaffLookup
 * @description Fetches all active depots, users, and assignments into fast memory structures
 * @returns {Promise<DepotStaffLookup>} Fast lookup resolver
 */
export const getDepotStaffLookup = async (): Promise<DepotStaffLookup> => {
  const now = Date.now();
  if (cachedLookup && now - cachedLookup.timestamp < CACHE_TTL_MS) {
    return buildResolver(cachedLookup);
  }

  /**
   * 1. Fetch active depots with direct coordinator/supervisor relations
   */
  const depots = await prisma.depots.findMany({
    where: { is_active: 'Y' },
    select: {
      id: true,
      name: true,
      code: true,
      coordinator_id: true,
      supervisor_id: true,
      depots_coodrinator: {
        select: {
          id: true,
          name: true,
          email: true,
          employee_id: true,
        },
      },
      depots_supervisior: {
        select: {
          id: true,
          name: true,
          email: true,
          employee_id: true,
        },
      },
      user_depots_depot_id: {
        where: { is_active: 'Y' },
        select: {
          users_depots_users: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              reporting_to: true,
              depot_id: true,
              user_role: {
                select: {
                  id: true,
                  name: true,
                  role_key: true,
                },
              },
            },
          },
        },
      },
    },
  });

  /**
   * 2. Fetch active users to build global hierarchy and role mappings
   */
  const users = await prisma.users.findMany({
    where: { is_active: 'Y' },
    select: {
      id: true,
      name: true,
      email: true,
      employee_id: true,
      reporting_to: true,
      depot_id: true,
      user_role: {
        select: {
          id: true,
          name: true,
          role_key: true,
        },
      },
      users_depots_users: {
        where: { is_active: 'Y' },
        select: {
          depot_id: true,
        },
      },
    },
  });

  const depotsById = new Map<number, any>();
  const depotsByName = new Map<string, any>();
  const usersById = new Map<number, any>();
  const depotSupervisorsMap = new Map<number, any[]>();
  const depotCoordinatorsMap = new Map<number, any[]>();
  const salesmanDepotMap = new Map<number, number[]>();

  for (const d of depots) {
    depotsById.set(d.id, d);
    if (d.name) {
      depotsByName.set(d.name.trim().toLowerCase(), d);
    }
  }

  for (const u of users) {
    if (isHiddenUser(u)) continue;
    usersById.set(u.id, u);

    const userDepotIds = new Set<number>();
    if (u.depot_id) {
      userDepotIds.add(u.depot_id);
    }
    if (u.users_depots_users && Array.isArray(u.users_depots_users)) {
      for (const ud of u.users_depots_users) {
        if (ud.depot_id) userDepotIds.add(ud.depot_id);
      }
    }

    if (userDepotIds.size > 0) {
      salesmanDepotMap.set(u.id, Array.from(userDepotIds));
    }

    const isCoord = isCoordinatorRole(u.user_role);
    const isSup = isSupervisorRole(u.user_role);

    for (const did of userDepotIds) {
      if (isCoord) {
        const list = depotCoordinatorsMap.get(did) || [];
        if (!list.some(existing => existing.id === u.id)) {
          list.push(u);
        }
        depotCoordinatorsMap.set(did, list);
      }
      if (isSup) {
        const list = depotSupervisorsMap.get(did) || [];
        if (!list.some(existing => existing.id === u.id)) {
          list.push(u);
        }
        depotSupervisorsMap.set(did, list);
      }
    }
  }

  /**
   * Also register direct coordinator_id / supervisor_id from depots
   */
  for (const d of depots) {
    if (d.depots_coodrinator && !isHiddenUser(d.depots_coodrinator)) {
      const coord = d.depots_coodrinator;
      const list = depotCoordinatorsMap.get(d.id) || [];
      if (!list.some(existing => existing.id === coord.id)) {
        list.push(coord);
      }
      depotCoordinatorsMap.set(d.id, list);
    }
    if (d.depots_supervisior && !isHiddenUser(d.depots_supervisior)) {
      const sup = d.depots_supervisior;
      const list = depotSupervisorsMap.get(d.id) || [];
      if (!list.some(existing => existing.id === sup.id)) {
        list.push(sup);
      }
      depotSupervisorsMap.set(d.id, list);
    }

    if (d.user_depots_depot_id && Array.isArray(d.user_depots_depot_id)) {
      for (const item of d.user_depots_depot_id) {
        const assignedUser = item.users_depots_users;
        if (!assignedUser || isHiddenUser(assignedUser)) continue;

        if (isCoordinatorRole(assignedUser.user_role)) {
          const list = depotCoordinatorsMap.get(d.id) || [];
          if (!list.some(existing => existing.id === assignedUser.id)) {
            list.push(assignedUser);
          }
          depotCoordinatorsMap.set(d.id, list);
        }

        if (isSupervisorRole(assignedUser.user_role)) {
          const list = depotSupervisorsMap.get(d.id) || [];
          if (!list.some(existing => existing.id === assignedUser.id)) {
            list.push(assignedUser);
          }
          depotSupervisorsMap.set(d.id, list);
        }
      }
    }
  }

  cachedLookup = {
    timestamp: now,
    depotsById,
    depotsByName,
    usersById,
    depotSupervisorsMap,
    depotCoordinatorsMap,
    salesmanDepotMap,
  };

  return buildResolver(cachedLookup);
};

/**
 * @function buildResolver
 * @description Creates the row-level resolver function using cached structures
 * @param {CachedLookupData} data Cached lookup tables
 * @returns {DepotStaffLookup} Resolver object
 */
const buildResolver = (data: CachedLookupData): DepotStaffLookup => {
  const {
    depotsById,
    depotsByName,
    usersById,
    depotSupervisorsMap,
    depotCoordinatorsMap,
    salesmanDepotMap,
  } = data;

  return {
    resolveStaff(params: ResolveStaffParams): DepotStaffInfo {
      let targetDepot: any = null;

      /**
       * 1. Try to find depot by ID
       */
      if (params.depotId && depotsById.has(params.depotId)) {
        targetDepot = depotsById.get(params.depotId);
      } else if (params.customerDepot?.id && depotsById.has(params.customerDepot.id)) {
        targetDepot = depotsById.get(params.customerDepot.id);
      }

      /**
       * 2. Try to find depot by Name
       */
      if (!targetDepot) {
        const rawName = (params.depotName || params.customerDepot?.name || '').trim().toLowerCase();
        if (rawName && depotsByName.has(rawName)) {
          targetDepot = depotsByName.get(rawName);
        }
      }

      /**
       * 3. Resolve salesperson
       */
      const spId = params.salesperson?.id || params.salespersonId;
      const salesperson = spId ? usersById.get(spId) || params.salesperson : params.salesperson;

      /**
       * 4. If depot still unknown, infer from salesperson's assigned depots
       */
      if (!targetDepot && spId) {
        const assignedDepotIds = salesmanDepotMap.get(spId);
        if (assignedDepotIds && assignedDepotIds.length > 0) {
          targetDepot = depotsById.get(assignedDepotIds[0]);
        }
      }

      const depotId = targetDepot?.id || params.depotId || params.customerDepot?.id || null;
      const depotName = targetDepot?.name || params.depotName || params.customerDepot?.name || '';

      /**
       * 5. Salesperson direct reporting manager
       */
      const directManagerId = salesperson?.reporting_to;
      const directManager = directManagerId ? usersById.get(directManagerId) : null;

      /**
       * 6. Resolve Supervisor for this Depot / Salesman
       * Rule: Area Sales Supervisor who belongs to same depot as salesman
       */
      let supervisorUser: any = null;
      const depotSupervisors = depotId ? depotSupervisorsMap.get(depotId) || [] : [];

      if (directManager && isSupervisorRole(directManager.user_role)) {
        const managerInDepot = depotSupervisors.some(s => s.id === directManager.id);
        if (managerInDepot || depotSupervisors.length === 0) {
          supervisorUser = directManager;
        }
      }

      if (!supervisorUser && depotSupervisors.length > 0) {
        supervisorUser = depotSupervisors[0];
      }

      if (!supervisorUser && directManager && isSupervisorRole(directManager.user_role)) {
        supervisorUser = directManager;
      }

      if (!supervisorUser && targetDepot?.depots_supervisior) {
        supervisorUser = targetDepot.depots_supervisior;
      }

      /**
       * 7. Resolve Coordinator for this Depot / Salesman
       * Rule: Sales coordinator who belongs to same depot as salesman
       */
      let coordinatorUser: any = null;
      const depotCoordinators = depotId ? depotCoordinatorsMap.get(depotId) || [] : [];

      /** Check if supervisor reports to a coordinator */
      const supervisorManagerId = supervisorUser?.reporting_to;
      const supervisorManager = supervisorManagerId ? usersById.get(supervisorManagerId) : null;

      if (supervisorManager && isCoordinatorRole(supervisorManager.user_role)) {
        const coordInDepot = depotCoordinators.some(c => c.id === supervisorManager.id);
        if (coordInDepot || depotCoordinators.length === 0) {
          coordinatorUser = supervisorManager;
        }
      }

      /** Check if salesman's direct manager reports to a coordinator */
      if (!coordinatorUser && directManager) {
        const directManagerMgrId = directManager.reporting_to;
        const directManagerMgr = directManagerMgrId ? usersById.get(directManagerMgrId) : null;
        if (directManagerMgr && isCoordinatorRole(directManagerMgr.user_role)) {
          const coordInDepot = depotCoordinators.some(c => c.id === directManagerMgr.id);
          if (coordInDepot || depotCoordinators.length === 0) {
            coordinatorUser = directManagerMgr;
          }
        }
      }

      if (!coordinatorUser && depotCoordinators.length > 0) {
        coordinatorUser = depotCoordinators[0];
      }

      if (!coordinatorUser && targetDepot?.depots_coodrinator) {
        coordinatorUser = targetDepot.depots_coodrinator;
      }

      if (!coordinatorUser && supervisorManager && isCoordinatorRole(supervisorManager.user_role)) {
        coordinatorUser = supervisorManager;
      }

      return {
        depotId,
        depotName,
        coordinatorName: coordinatorUser?.name || '',
        supervisorName: supervisorUser?.name || '',
        coordinatorId: coordinatorUser?.id || null,
        supervisorId: supervisorUser?.id || null,
      };
    },
  };
};

