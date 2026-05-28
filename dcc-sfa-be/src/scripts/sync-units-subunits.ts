import prisma from '../configs/prisma.client';

async function syncUnitsToSubunits() {
  try {
    console.log('Starting sync of units to subunits...');

    // Get all units that don't have a subunit
    const unitsWithoutSubunit = await prisma.unit_of_measurement.findMany({
      where: {
        subunit: null,
      },
    });

    console.log(`Found ${unitsWithoutSubunit.length} units without subunits`);

    // Create subunits for each unit
    for (const unit of unitsWithoutSubunit) {
      try {
        const subunit = await prisma.subunits.create({
          data: {
            name: unit.name,
            code: unit.name.toUpperCase().replace(/\s/g, '_'),
            description: unit.description,
            unit_of_measurement_id: unit.id,
            is_active: unit.is_active,
            createdate: unit.createdate || new Date(),
            createdby: unit.createdby,
            updatedate: unit.updatedate,
            updatedby: unit.updatedby,
            log_inst: unit.log_inst,
          },
        });
        console.log(`Created subunit for unit: ${unit.name} (ID: ${unit.id})`);
      } catch (error: any) {
        console.error(`Failed to create subunit for unit ${unit.name}:`, error.message);
      }
    }

    console.log('Sync completed successfully');
  } catch (error: any) {
    console.error('Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncUnitsToSubunits();
