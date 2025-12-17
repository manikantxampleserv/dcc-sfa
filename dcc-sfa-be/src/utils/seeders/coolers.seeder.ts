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

export async function seedCoolers(): Promise<void> {
  const coolerData = loadCoolerMasterData();

  if (coolerData.length === 0) {
    logger.warn('No cooler data found. Skipping cooler seeding.');
    return;
  }

  logger.info(`Loading ${coolerData.length} coolers from master data...`);

  const customers = await prisma.customers.findMany({
    select: { id: true, code: true },
  });
  const customerMap = new Map(
    customers.map(customer => [customer.code, customer.id])
  );

  const coolerTypes = await prisma.cooler_types.findMany({
    select: { id: true, name: true },
  });
  const typeMap = new Map(
    coolerTypes.map(type => [type.name.toUpperCase(), type.id])
  );

  const coolerSubTypes = await prisma.cooler_sub_types.findMany({
    select: { id: true, name: true },
  });
  const subTypeMap = new Map(
    coolerSubTypes.map(subType => [subType.name.toUpperCase(), subType.id])
  );

  const users = await prisma.users.findMany({
    select: { id: true },
    where: { is_active: 'Y' },
  });
  const userIds = users.map(user => user.id);

  if (customers.length === 0) {
    logger.warn('No customers found. Skipping cooler seeding.');
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

    const coolersToCreate = batchData
      .map(cooler => {
        const customerId = cooler.customer_code
          ? customerMap.get(cooler.customer_code.toString())
          : undefined;

        if (!customerId) {
          return null;
        }

        const coolerTypeId = cooler.cooler_type
          ? typeMap.get(cooler.cooler_type.toUpperCase())
          : undefined;

        const coolerSubTypeId = cooler.cooler_sub_type
          ? subTypeMap.get(cooler.cooler_sub_type.toUpperCase())
          : undefined;

        const isActive =
          cooler.is_active?.toLowerCase() === 'no' ||
          cooler.status?.toLowerCase() === 'active'
            ? 'Y'
            : 'N';

        const status = cooler.status || 'working';

        const installDate = cooler.install_date
          ? excelDateToJSDate(
              typeof cooler.install_date === 'string'
                ? parseFloat(cooler.install_date)
                : cooler.install_date
            )
          : undefined;

        const lastScannedDate = cooler.last_scanned_date
          ? excelDateToJSDate(
              typeof cooler.last_scanned_date === 'string'
                ? parseFloat(cooler.last_scanned_date)
                : cooler.last_scanned_date
            )
          : undefined;

        const randomTechnicianId =
          userIds.length > 0
            ? userIds[Math.floor(Math.random() * userIds.length)]
            : undefined;

        const coolerDataToCreate: {
          customer_id: number;
          code: string;
          brand?: string;
          model?: string;
          serial_number?: string;
          capacity?: number;
          install_date?: Date;
          last_service_date?: Date;
          next_service_due?: Date;
          cooler_type_id?: number;
          cooler_sub_type_id?: number;
          status?: string;
          temperature?: number;
          energy_rating?: string;
          warranty_expiry?: Date;
          maintenance_contract?: string;
          technician_id?: number;
          last_scanned_date?: Date;
          is_active: string;
          createdate: Date;
          createdby: number;
          log_inst?: number;
        } = {
          customer_id: customerId,
          code: cooler.code.toString(),
          is_active: isActive,
          createdate: new Date(),
          createdby: 1,
          log_inst: 1,
        };

        if (cooler.brand) {
          coolerDataToCreate.brand = cooler.brand;
        }
        if (cooler.serial_number) {
          coolerDataToCreate.serial_number = cooler.serial_number.toString();
        }
        if (cooler.model) {
          coolerDataToCreate.model = cooler.model;
        }
        if (coolerTypeId) {
          coolerDataToCreate.cooler_type_id = coolerTypeId;
        }
        if (coolerSubTypeId) {
          coolerDataToCreate.cooler_sub_type_id = coolerSubTypeId;
        }
        if (status) {
          coolerDataToCreate.status = status;
        }
        if (installDate) {
          coolerDataToCreate.install_date = installDate;
        }
        if (lastScannedDate) {
          coolerDataToCreate.last_scanned_date = lastScannedDate;
        }
        if (randomTechnicianId) {
          coolerDataToCreate.technician_id = randomTechnicianId;
        }

        return coolerDataToCreate;
      })
      .filter(
        (cooler): cooler is NonNullable<typeof cooler> => cooler !== null
      );

    try {
      for (const cooler of coolersToCreate) {
        try {
          const existing = await prisma.coolers.findUnique({
            where: { code: cooler.code },
          });

          if (!existing) {
            await prisma.coolers.create({
              data: cooler,
            });
            successCount++;
          } else {
            skipCount++;
          }
        } catch (error: any) {
          if (error?.code === 'P2002') {
            skipCount++;
          } else {
            logger.warn(
              `Failed to create cooler ${cooler.code}: ${error.message}`
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
      skipCount += coolersToCreate.length;
    }
  }

  logger.success(
    `Cooler seeding completed: ${successCount} created, ${skipCount} skipped`
  );
}

export async function clearCoolers(): Promise<void> {
  try {
    await prisma.coolers.deleteMany({});
    logger.info('All coolers cleared successfully');
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      logger.warn(
        '⚠️  Could not clear all coolers due to foreign key constraints. Some records may be in use.'
      );
    } else {
      throw error;
    }
  }
}
