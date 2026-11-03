import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';

/**
 * Calculates days between two dates.
 *
 * @param {Date} dateA - Later date.
 * @param {Date} dateB - Earlier date.
 * @returns {number} Difference in days.
 */
function daysBetween(dateA: Date, dateB: Date): number {
  return Math.max(
    0,
    Math.floor((dateA.getTime() - dateB.getTime()) / 86_400_000)
  );
}

/**
 * Formats relative time string (e.g. "1 day ago", "3 hours ago", "Just now").
 *
 * @param {Date} date - The date to format.
 * @returns {string} Relative time label.
 */
function formatTimeAgo(date: Date): string {
  const diffDays = daysBetween(new Date(), date);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  return `${diffMonths} months ago`;
}

/**
 * Formats a Date object to British date string (e.g. "28 Oct 2026").
 *
 * @param {Date} date - The date to format.
 * @returns {string} Formatted date.
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const cooler360Controller = {
  /**
   * Retrieves unified Cooler 360 view payload for a cooler/asset.
   *
   * @param {Request} req Express request with identifier param (id, code, serial, barcode).
   * @param {Response} res Express response.
   */
  async getCooler360Data(req: Request, res: Response) {
    try {
      const { identifier } = req.params;
      const cleanIdent = identifier ? identifier.trim() : '';
      const numId = cleanIdent ? parseInt(cleanIdent, 10) : NaN;

      const includeRelations = {
        asset_master_asset_types: true,
        asset_master_asset_sub_types: true,
        asset_master_brands: true,
        asset_master_brand: true,
        asset_master_depot: true,
        asset_master_image: true,
        asset_master_outlet: {
          include: {
            customer_channel_customer: true,
            customer_routes: {
              include: {
                salespersons: {
                  include: { user: { select: { id: true, name: true } } },
                },
              },
            },
            customer_zones: true,
            customer_depot: true,
          },
        },
        asset_master_last_read: { select: { id: true, name: true } },
        cooler_asset_master: {
          include: {
            cooler_sub_types: true,
            cooler_types: true,
          },
        },
      };

      /** Look up asset by numeric ID first if identifier provided */
      let asset: any = null;

      if (!isNaN(numId)) {
        asset = await prisma.asset_master.findUnique({
          where: { id: numId },
          include: includeRelations,
        });
      }

      /** Look up asset by code, serial_number, or barcode */
      if (!asset && cleanIdent) {
        asset = await prisma.asset_master.findFirst({
          where: {
            OR: [
              { code: cleanIdent },
              { serial_number: cleanIdent },
              { barcode: cleanIdent },
              { code: { contains: cleanIdent } },
              { serial_number: { contains: cleanIdent } },
              { barcode: { contains: cleanIdent } },
            ],
          },
          include: includeRelations,
        });
      }

      /** Fallback lookup on coolers table if not matched in asset_master */
      if (!asset && cleanIdent) {
        const cooler = await prisma.coolers.findFirst({
          where: {
            OR: [
              ...(!isNaN(numId) ? [{ id: numId }] : []),
              { code: cleanIdent },
              { serial_number: cleanIdent },
              { code: { contains: cleanIdent } },
              { serial_number: { contains: cleanIdent } },
            ],
          },
          include: {
            cooler_asset_master: {
              include: includeRelations,
            },
            coolers_customers: {
              include: {
                customer_channel_customer: true,
                customer_routes: {
                  include: {
                    salespersons: {
                      include: { user: { select: { id: true, name: true } } },
                    },
                  },
                },
                customer_zones: true,
                customer_depot: true,
              },
            },
            cooler_sub_types: true,
            cooler_types: true,
          },
        });

        if (cooler && cooler.cooler_asset_master) {
          asset = {
            ...cooler.cooler_asset_master,
            cooler_asset_master: [cooler],
          };
        }
      }

      /** Fallback lookup by maintenance ticket job_number */
      if (!asset && cleanIdent) {
        const ticket = await prisma.asset_maintenance.findFirst({
          where: {
            OR: [
              { job_number: cleanIdent },
              ...(!isNaN(numId) ? [{ id: numId }] : []),
            ],
          },
          select: { asset_id: true },
        });

        if (ticket && ticket.asset_id) {
          asset = await prisma.asset_master.findUnique({
            where: { id: ticket.asset_id },
            include: includeRelations,
          });
        }
      }

      /** Default to first available asset if no identifier provided */
      if (!asset && !cleanIdent) {
        asset = await prisma.asset_master.findFirst({
          orderBy: { id: 'desc' },
          include: includeRelations,
        });
      }

      if (!asset) {
        return res
          .status(404)
          .json({ message: `Cooler / Asset not found${cleanIdent ? ` for '${cleanIdent}'` : ''}` });
      }

      const linkedCooler = asset.cooler_asset_master?.[0] || null;

      /** Fetch timeline events from asset_activities */
      const rawActivities = await prisma.asset_activities.findMany({
        where: {
          asset_id: asset.id,
        },
        orderBy: { event_date: 'desc' },
      });

      /** Compute tab counts */
      const counts = {
        all: rawActivities.length,
        mov: rawActivities.filter(a => a.event_type === 'movement').length,
        ver: rawActivities.filter(a => a.event_type === 'verification').length,
        ins: rawActivities.filter(a => a.event_type === 'inspection').length,
        mnt: rawActivities.filter(a => a.event_type === 'maintenance').length,
      };

      /** Format activities for timeline rendering */
      const activities = rawActivities.map(a => {
        let meta: any = null;
        if (a.meta_json) {
          try {
            meta = JSON.parse(a.meta_json);
          } catch (_e) {
            meta = null;
          }
        }

        const dateStr = formatDate(a.event_date);
        const timeStr = a.event_date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });

        let tone: 'good' | 'warn' | 'alert' | 'neu' = 'neu';
        if (a.status === 'working' || a.status === 'closed') tone = 'good';
        else if (a.status === 'assigned' || a.status === 'open') tone = 'warn';
        else if (a.status === 'not_working' || a.status === 'partially_working') tone = 'alert';

        return {
          id: a.id,
          type: a.event_type as 'mov' | 'ver' | 'ins' | 'mnt',
          date: `${dateStr}, ${timeStr}`,
          title: a.title,
          badge: a.status
            ? {
                text: a.status.charAt(0).toUpperCase() + a.status.slice(1).replace(/_/g, ' '),
                tone,
              }
            : undefined,
          desc: a.description || undefined,
          by: a.performed_by_name || 'System',
          spares: meta?.parts || undefined,
          totalCost: a.cost ? Number(a.cost) : undefined,
          subLifecycle: meta?.log || undefined,
        };
      });

      /** Fetch active open ticket */
      const openTicket = await prisma.asset_maintenance.findFirst({
        where: {
          asset_id: asset.id,
          status: { in: ['open', 'assigned', 'repaired'] },
        },
        orderBy: { createdate: 'desc' },
        include: {
          asset_maintenance_technician: {
            select: { id: true, name: true },
          },
          spares: true,
        },
      });

      /** Fetch all historical maintenance records */
      const allMaintenance = await prisma.asset_maintenance.findMany({
        where: { asset_id: asset.id },
      });

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const repairsPastYear = allMaintenance.filter(
        m => m.createdate && new Date(m.createdate) >= oneYearAgo
      ).length;

      const lifetimeCost = allMaintenance.reduce(
        (sum, m) => sum + (m.cost ? Number(m.cost) : 0),
        0
      );

      /** Health Strip KPIs calculation */
      const lastVerifiedDate = asset.last_scanned_date
        ? new Date(asset.last_scanned_date)
        : null;

      const lastVerifiedKpi = {
        value: lastVerifiedDate ? formatTimeAgo(lastVerifiedDate) : 'Never',
        sub: lastVerifiedDate
          ? `${formatDate(lastVerifiedDate)} · ${asset.asset_master_last_read?.name || 'System'}`
          : 'No verification scans',
        status: (lastVerifiedDate ? 'good' : 'warn') as 'good' | 'warn',
      };

      /** Latest inspection check */
      const latestInspection = await prisma.cooler_inspections.findFirst({
        where: {
          ...(linkedCooler ? { cooler_id: linkedCooler.id } : {}),
        },
        orderBy: { createdate: 'desc' },
        include: { users: { select: { name: true } } },
      });

      const lastInspectionKpi = {
        value: latestInspection
          ? latestInspection.is_working === 'Y'
            ? 'Working'
            : 'Issue Reported'
          : 'None',
        sub: latestInspection?.createdate
          ? `${formatDate(new Date(latestInspection.createdate))}${latestInspection.temperature !== null ? ` · ${latestInspection.temperature} °C` : ''}`
          : 'No inspection recorded',
        status: (latestInspection?.is_working === 'Y'
          ? 'good'
          : latestInspection
            ? 'alert'
            : 'neu') as 'good' | 'alert' | 'neu',
      };

      /** Open ticket KPI */
      const openTicketKpi = openTicket
        ? {
            value:
              String(openTicket.status).charAt(0).toUpperCase() +
              String(openTicket.status).slice(1),
            sub: `${openTicket.job_number || `MT-${openTicket.id}`} · open ${openTicket.createdate ? daysBetween(new Date(), new Date(openTicket.createdate)) : 0}d`,
            status: 'warn' as 'warn',
            ticketId: openTicket.id,
          }
        : {
            value: 'None',
            sub: 'All clear',
            status: 'good' as 'good',
          };

      /** Days deployed at current outlet */
      const installDate = asset.installation_date || linkedCooler?.install_date;
      const daysHere = installDate
        ? daysBetween(new Date(), new Date(installDate))
        : 0;
      const daysHereLabel = installDate
        ? `since ${formatDate(new Date(installDate))}`
        : 'Not recorded';

      /** Current placement details */
      let outlet = asset.asset_master_outlet;
      if (!outlet) {
        const custAsset = await prisma.customer_assets.findFirst({
          where: {
            OR: [
              { id: asset.id },
              ...(asset.serial_number ? [{ serial_number: asset.serial_number }] : []),
            ],
          },
          include: {
            customer_assets_customers: {
              include: {
                customer_channel_customer: true,
                customer_routes: {
                  include: {
                    salespersons: {
                      include: { user: { select: { id: true, name: true } } },
                    },
                  },
                },
                customer_zones: true,
                customer_depot: true,
              },
            },
          },
        });
        if (custAsset?.customer_assets_customers) {
          outlet = custAsset.customer_assets_customers;
        }
      }

      const currentRoute = outlet?.customer_routes;
      const salesRep =
        currentRoute?.salespersons?.[0]?.user?.name ||
        asset.assigned_to ||
        'N/A';

      const placement = {
        outletName:
          outlet?.name || asset.current_location || 'Not Assigned',
        outletCode: outlet?.code || 'N/A',
        channel:
          outlet?.customer_channel_customer?.channel_name ||
          'N/A',
        route: currentRoute?.name || 'N/A',
        zone: outlet?.customer_zones?.name || 'N/A',
        depot:
          outlet?.customer_depot?.name ||
          asset.asset_master_depot?.name ||
          'N/A',
        salesRep,
        installedDate: installDate
          ? `${formatDate(new Date(installDate))} · Installation`
          : 'N/A',
        isDeployed: Boolean(outlet || asset.current_location),
      };

      /** Open ticket detail box (if present) */
      const openTicketDetails = openTicket
        ? {
            id: openTicket.id,
            jobNumber: openTicket.job_number || `MT-${openTicket.id}`,
            status: openTicket.status,
            priority: openTicket.priority || 'Medium',
            issueReported: openTicket.issue_reported || 'Maintenance needed',
            repairLocation:
              openTicket.repair_location === 'onsite' ? 'On site' : 'Workshop',
            technicianName:
              (openTicket as any).asset_maintenance_technician?.name ||
              'Unassigned',
            dueDate: openTicket.due_date
              ? formatDate(new Date(openTicket.due_date))
              : 'N/A',
            reportedDate: openTicket.createdate
              ? formatDate(new Date(openTicket.createdate))
              : 'N/A',
            sparesCount: (openTicket as any).spares?.length || 0,
            costSoFar: openTicket.cost ? Number(openTicket.cost) : 0,
          }
        : null;

      /** Real photos from asset_master_image */
      const photos = (asset.asset_master_image || []).map((img: any) => ({
        id: img.id,
        url: img.image_url,
        caption: img.caption || 'Asset photo',
        uploadedAt: img.uploaded_at ? formatDate(new Date(img.uploaded_at)) : null,
      }));

      /** Dynamic data checks computed from real database state */
      const dataChecks = [
        lastVerifiedDate
          ? {
              type: 'ok' as 'ok',
              title: 'Location scan recorded',
              detail: `Last scanned on ${formatDate(lastVerifiedDate)} by ${asset.asset_master_last_read?.name || 'System'}.`,
            }
          : {
              type: 'warn' as 'warn',
              title: 'No scans recorded',
              detail: 'This asset has not had an on-site verification scan recorded yet.',
            },
        outlet
          ? {
              type: 'ok' as 'ok',
              title: 'Outlet mapped',
              detail: `Active placement at ${outlet.name} (${outlet.code || 'N/A'}).`,
            }
          : {
              type: 'warn' as 'warn',
              title: 'No outlet assigned',
              detail: 'Asset is currently not linked to any active customer outlet.',
            },
        openTicket
          ? {
              type: 'warn' as 'warn',
              title: 'Active repair job',
              detail: `Ticket ${openTicket.job_number || openTicket.id} is currently ${openTicket.status}.`,
            }
          : {
              type: 'ok' as 'ok',
              title: 'No open repair tickets',
              detail: 'Cooler has no pending complaints or repair jobs.',
            },
      ];

      const brandTitle = asset.brand || asset.asset_master_brands?.name || asset.asset_master_brand?.name || '';
      const subTypeTitle = asset.asset_master_asset_sub_types?.name || asset.asset_master_asset_types?.name || '';
      const codeTitle = asset.barcode || asset.serial_number || asset.code || '';
      const displayTitle = [brandTitle, codeTitle, subTypeTitle].filter(Boolean).join(' - ') || asset.name || 'Asset Master';

      /** Structured response without static placeholders */
      const responseData = {
        asset: {
          id: asset.id,
          name: asset.name || asset.code,
          title: displayTitle,
          code: asset.code,
          serialNumber: asset.serial_number || 'N/A',
          barcode: asset.barcode || 'N/A',
          nfcTag: asset.nfc_tag || 'Not tagged',
          subType: subTypeTitle || 'N/A',
          capacity: linkedCooler?.capacity
            ? `${linkedCooler.capacity} L`
            : (linkedCooler?.model || 'N/A'),
          energyRating: linkedCooler?.energy_rating || 'N/A',
          purchaseDate: asset.purchase_date
            ? formatDate(new Date(asset.purchase_date))
            : 'N/A',
          warrantyExpiry: asset.warranty_expiry
            ? formatDate(new Date(asset.warranty_expiry))
            : (linkedCooler?.warranty_expiry ? formatDate(new Date(linkedCooler.warranty_expiry)) : 'N/A'),
          homeDepot: asset.asset_master_depot?.name || 'N/A',
          lastScanned: lastVerifiedDate
            ? `${formatDate(lastVerifiedDate)}, ${lastVerifiedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
            : 'Not scanned',
          lastScannedBy:
            asset.asset_master_last_read?.name || 'N/A',
          brand: brandTitle || 'N/A',
          status: asset.current_status || (placement.isDeployed ? 'Deployed' : 'In Depot'),
          isActive: asset.is_active === 'Y',
          cost: asset.cost ? Number(asset.cost) : null,
          photos,
        },
        photos,
        health: {
          lastVerified: lastVerifiedKpi,
          lastInspection: lastInspectionKpi,
          openTicket: openTicketKpi,
          repairs: {
            value: repairsPastYear,
            sub: `${allMaintenance.length} lifetime`,
            status: (repairsPastYear >= 2 ? 'warn' : 'good') as 'warn' | 'good',
          },
          lifetimeCost: {
            value: lifetimeCost.toLocaleString('en-US'),
            sub: 'TZS parts + labour',
            status: 'neu' as 'neu',
          },
          daysHere: {
            value: daysHere,
            sub: daysHereLabel,
            status: 'neu' as 'neu',
          },
        },
        placement,
        openTicket: openTicketDetails,
        counts,
        activities,
        dataChecks,
      };

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error: any) {
      console.error('Cooler 360 Controller Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
