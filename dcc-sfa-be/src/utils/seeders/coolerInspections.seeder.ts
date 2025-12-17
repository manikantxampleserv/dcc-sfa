import * as fs from 'fs';
import * as path from 'path';
import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface CoolerMasterData {
  code: string;
  serial_number?: string | number;
  cooler_type?: string;
  cooler_sub_type?: string;
  model?: string;
  brand?: string;
  customer_code?: string;
  status?: string;
  is_active?: string;
  install_date?: number | string;
  last_scanned_date?: number | string;
  place?: string;
  dist_code?: string | number;
  dist_name?: string;
  outlet_name?: string;
  last_seller_code?: string;
  last_seller_name?: string;
}

function loadCoolerMasterData(): CoolerMasterData[] {
  const jsonPath = path.join(__dirname, '../cooler-master-data.json');

  if (!fs.existsSync(jsonPath)) {
    logger.warn(
      `Cooler master data file not found at ${jsonPath}. Using empty array.`
    );
    return [];
  }

  try {
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const rawData: CoolerMasterData[] = JSON.parse(fileContent);

    return rawData.filter(
      item =>
        item.code &&
        item.code.toString().trim() !== '' &&
        item.customer_code &&
        item.customer_code.toString().trim() !== ''
    );
  } catch (error) {
    logger.error('Error loading cooler master data:', error);
    return [];
  }
}

function excelDateToJSDate(excelDate: number | string): Date | undefined {
  if (!excelDate) return undefined;

  if (typeof excelDate === 'string') {
    const parsed = new Date(excelDate);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  if (typeof excelDate === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
    return isNaN(jsDate.getTime()) ? undefined : jsDate;
  }

  return undefined;
}

export async function seedCoolerInspections(): Promise<void> {
  const coolerData = loadCoolerMasterData();

  if (coolerData.length === 0) {
    logger.warn('No cooler data found. Skipping cooler inspection seeding.');
    return;
  }

  logger.info(
    `Loading ${coolerData.length} cooler inspections from master data...`
  );

  const coolers = await prisma.coolers.findMany({
    select: { id: true, code: true },
  });
  const coolerMap = new Map(coolers.map(cooler => [cooler.code, cooler.id]));

  const users = await prisma.users.findMany({
    select: { id: true },
    where: { is_active: 'Y' },
  });
  const userIds = users.map(user => user.id);

  const visits = await prisma.visits.findMany({
    select: { id: true },
    where: { is_active: 'Y' },
  });
  const visitIds = visits.map(visit => visit.id);

  if (coolers.length === 0) {
    logger.warn('No coolers found. Skipping cooler inspection seeding.');
    return;
  }

  if (userIds.length === 0) {
    logger.warn('No active users found. Skipping cooler inspection seeding.');
    return;
  }

  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil(coolerData.length / BATCH_SIZE);

  let successCount = 0;
  let skipCount = 0;

  for (let batch = 0; batch < totalBatches; batch++) {
    const startIndex = batch * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, coolerData.length);
    const batchData = coolerData.slice(startIndex, endIndex);

    const inspectionsToCreate = batchData
      .map(cooler => {
        const coolerId = cooler.code
          ? coolerMap.get(cooler.code.toString())
          : undefined;

        if (!coolerId) {
          return null;
        }

        const lastReadDate = cooler.last_scanned_date
          ? excelDateToJSDate(
              typeof cooler.last_scanned_date === 'string'
                ? parseFloat(cooler.last_scanned_date)
                : cooler.last_scanned_date
            )
          : undefined;

        if (!lastReadDate) {
          return null;
        }

        const isWorking =
          cooler.status?.toLowerCase() === 'active' &&
          cooler.is_active?.toLowerCase() !== 'yes'
            ? 'Y'
            : 'N';

        const randomInspectorId =
          userIds.length > 0
            ? userIds[Math.floor(Math.random() * userIds.length)]
            : undefined;

        const randomVisitId =
          visitIds.length > 0
            ? visitIds[Math.floor(Math.random() * visitIds.length)]
            : undefined;

        if (!randomInspectorId) {
          return null;
        }

        const inspectionData: {
          cooler_id: number;
          visit_id?: number;
          inspected_by: number;
          inspection_date: Date;
          temperature?: number;
          is_working: string;
          issues?: string;
          action_required: string;
          is_active: string;
          createdate: Date;
          createdby: number;
          log_inst?: number;
        } = {
          cooler_id: coolerId,
          inspected_by: randomInspectorId,
          inspection_date: lastReadDate,
          is_working: isWorking,
          action_required: isWorking === 'N' ? 'Y' : 'N',
          is_active: 'Y',
          createdate: new Date(),
          createdby: 1,
          log_inst: 1,
        };

        if (randomVisitId) {
          inspectionData.visit_id = randomVisitId;
        }

        if (cooler.status && cooler.status.toLowerCase() !== 'active') {
          inspectionData.issues = `Status: ${cooler.status}`;
        }

        return inspectionData;
      })
      .filter(
        (inspection): inspection is NonNullable<typeof inspection> =>
          inspection !== null
      );

    try {
      for (const inspection of inspectionsToCreate) {
        try {
          await prisma.cooler_inspections.create({
            data: inspection,
          });
          successCount++;
        } catch (error: any) {
          if (error?.code === 'P2002') {
            skipCount++;
          } else {
            logger.warn(
              `Failed to create cooler inspection for cooler ${inspection.cooler_id}: ${error.message}`
            );
            skipCount++;
          }
        }
      }

      if ((batch + 1) % 10 === 0 || batch === totalBatches - 1) {
        logger.info(
          `Batch ${batch + 1}/${totalBatches}: Created ${successCount}, Skipped ${skipCount}`
        );
      }
    } catch (error: any) {
      logger.warn(
        `Batch ${batch + 1}/${totalBatches} failed: ${error.message}`
      );
      skipCount += inspectionsToCreate.length;
    }
  }

  logger.success(
    `Cooler inspection seeding completed: ${successCount} created, ${skipCount} skipped`
  );
}

export async function clearCoolerInspections(): Promise<void> {
  try {
    await prisma.cooler_inspections.deleteMany({});
    logger.info('All cooler inspections cleared successfully');
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      logger.warn(
        '⚠️  Could not clear all cooler inspections due to foreign key constraints. Some records may be in use.'
      );
    } else {
      throw error;
    }
  }
}
