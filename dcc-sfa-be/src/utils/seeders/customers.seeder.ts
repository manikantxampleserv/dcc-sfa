import * as fs from 'fs';
import * as path from 'path';
import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface OutletMasterData {
  code: string;
  name: string;
  short_name?: string;
  internal_code_one?: string;
  internal_code_two?: string;
  contact_person?: string;
  status: string;
  outlet_type?: string;
  outlet_channel?: string;
  gps_status?: string;
}

function loadOutletMasterData(): OutletMasterData[] {
  const jsonPath = path.join(__dirname, '../outlet-master-data.json');

  if (!fs.existsSync(jsonPath)) {
    logger.warn(
      `Outlet master data file not found at ${jsonPath}. Using empty array.`
    );
    return [];
  }

  try {
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const rawData: OutletMasterData[] = JSON.parse(fileContent);

    return rawData.filter(
      item =>
        item.code &&
        item.name &&
        item.code.trim() !== '' &&
        item.name.trim() !== ''
    );
  } catch (error) {
    logger.error('Error loading outlet master data:', error);
    return [];
  }
}

export async function seedCustomers(): Promise<void> {
  const outletData = loadOutletMasterData();

  if (outletData.length === 0) {
    logger.warn('No outlet data found. Skipping customer seeding.');
    return;
  }

  logger.info(`Loading ${outletData.length} outlets from master data...`);

  const customerTypes = await prisma.customer_type.findMany({
    select: { id: true, type_name: true },
  });
  const typeMap = new Map(customerTypes.map(type => [type.type_name, type.id]));

  const customerChannels = await prisma.customer_channel.findMany({
    select: { id: true, channel_name: true },
  });
  const channelMap = new Map(
    customerChannels.map(channel => [channel.channel_name, channel.id])
  );

  const customerCategories = await prisma.customer_category.findMany({
    select: { id: true },
    where: { is_active: 'Y' },
  });
  const categoryIds = customerCategories.map(category => category.id);

  const availableZones = await prisma.zones.findMany({
    select: { id: true },
    where: { is_active: 'Y' },
  });

  if (availableZones.length === 0) {
    logger.warn('No active zones found. Skipping customer seeding.');
    return;
  }

  const zoneIds = availableZones.map(zone => zone.id);
  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil(outletData.length / BATCH_SIZE);

  let successCount = 0;
  let skipCount = 0;

  for (let batch = 0; batch < totalBatches; batch++) {
    const startIndex = batch * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, outletData.length);
    const batchData = outletData.slice(startIndex, endIndex);

    const customersToCreate = batchData
      .map(outlet => {
        const customerTypeId = outlet.outlet_type
          ? typeMap.get(outlet.outlet_type)
          : undefined;
        const customerChannelId = outlet.outlet_channel
          ? channelMap.get(outlet.outlet_channel)
          : undefined;
        const isActive = outlet.status?.toLowerCase() === 'active' ? 'Y' : 'N';
        const gpsStatus = outlet.gps_status || 'Not Available';

        const randomZoneId =
          zoneIds.length > 0
            ? zoneIds[Math.floor(Math.random() * zoneIds.length)]
            : undefined;

        const randomCategoryId =
          categoryIds.length > 0
            ? categoryIds[Math.floor(Math.random() * categoryIds.length)]
            : undefined;

        const customerData: {
          code: string;
          name: string;
          short_name?: string;
          internal_code_one?: string;
          internal_code_two?: string;
          contact_person?: string;
          customer_type_id?: number;
          customer_channel_id?: number;
          customer_category_id?: number;
          type?: string;
          gps_status?: string;
          phone_number?: string;
          email?: string;
          address?: string;
          city?: string;
          state?: string;
          zipcode?: string;
          latitude?: number;
          longitude?: number;
          credit_limit?: number;
          outstanding_amount?: number;
          route_id?: number;
          salesperson_id?: number;
          nfc_tag_code?: string;
          last_visit_date?: Date;
          zones_id?: number;
          is_active: string;
          createdate: Date;
          createdby: number;
          updatedate?: Date;
          updatedby?: number;
          log_inst?: number;
          outlet_images?: string;
          profile_picture?: string;
        } = {
          code: outlet.code,
          name: outlet.name,
          is_active: isActive,
          createdate: new Date(),
          createdby: 1,
          log_inst: 1,
        };

        if (outlet.short_name) {
          customerData.short_name = outlet.short_name;
        }
        if (outlet.internal_code_one) {
          customerData.internal_code_one = outlet.internal_code_one;
        }
        if (outlet.internal_code_two) {
          customerData.internal_code_two = outlet.internal_code_two;
        }
        if (outlet.contact_person) {
          customerData.contact_person = outlet.contact_person;
        }
        if (customerTypeId) {
          customerData.customer_type_id = customerTypeId;
        }
        if (customerChannelId) {
          customerData.customer_channel_id = customerChannelId;
        }
        if (gpsStatus) {
          customerData.gps_status = gpsStatus;
        }
        if (randomZoneId) {
          customerData.zones_id = randomZoneId;
        }
        if (randomCategoryId) {
          customerData.customer_category_id = randomCategoryId;
        }

        return customerData;
      })
      .filter(customer => customer.code && customer.name);

    try {
      for (const customer of customersToCreate) {
        try {
          const existing = await prisma.customers.findUnique({
            where: { code: customer.code },
          });

          if (!existing) {
            await prisma.customers.create({
              data: customer,
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
              `Failed to create customer ${customer.code}: ${error.message}`
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
      skipCount += customersToCreate.length;
    }
  }

  logger.success(
    `Customer seeding completed: ${successCount} created, ${skipCount} skipped`
  );
}

export async function clearCustomers(): Promise<void> {
  try {
    await prisma.customers.deleteMany({});
    logger.info('All customers cleared successfully');
  } catch (error: any) {
    if (
      error?.code === 'P2003' ||
      error?.message?.includes('Foreign key constraint')
    ) {
      logger.warn(
        '⚠️  Could not clear all customers due to foreign key constraints. Some records may be in use.'
      );
    } else {
      throw error;
    }
  }
}
