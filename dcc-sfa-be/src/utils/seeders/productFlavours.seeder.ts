import prisma from '../../configs/prisma.client';

interface MockProductFlavour {
  name: string;
  code: string;
  is_active: string;
}

const mockProductFlavours: MockProductFlavour[] = [
  { name: 'BITTER LEMON', code: 'FLAV-BIT-LEM', is_active: 'Y' },
  { name: 'CLUB SODA', code: 'FLAV-CLU-SOD', is_active: 'Y' },
  { name: 'COKE', code: 'FLAV-COKE', is_active: 'Y' },
  { name: 'COKE ZERO', code: 'FLAV-COK-ZER', is_active: 'Y' },
  { name: 'CREAM SODA', code: 'FLAV-CRE-SOD', is_active: 'Y' },
  { name: 'FANTA FRUIT BLAS', code: 'FLAV-FAN-FRU', is_active: 'Y' },
  { name: 'FANTA ORANGE', code: 'FLAV-FAN-ORA', is_active: 'Y' },
  { name: 'FANTA PASSION', code: 'FLAV-FAN-PAS', is_active: 'Y' },
  { name: 'FANTA PINE APPLE', code: 'FLAV-FAN-PIN', is_active: 'Y' },
  { name: 'GINGER ALE', code: 'FLAV-GIN-ALE', is_active: 'Y' },
  { name: 'KDW 12 Ltr', code: 'FLAV-KDW-12L', is_active: 'Y' },
  { name: 'KDW 18.9 Ltr', code: 'FLAV-KDW-189L', is_active: 'Y' },
  { name: 'KDW 6 Ltr', code: 'FLAV-KDW-6L', is_active: 'Y' },
  { name: 'KDW1000', code: 'FLAV-KDW-1000', is_active: 'Y' },
  { name: 'KDW1500', code: 'FLAV-KDW-1500', is_active: 'Y' },
  { name: 'KDW500', code: 'FLAV-KDW-500', is_active: 'Y' },
  { name: 'MM APPLE', code: 'FLAV-MM-APP', is_active: 'Y' },
  { name: 'MM MANGO', code: 'FLAV-MM-MAN', is_active: 'Y' },
  { name: 'MM TROPICAL', code: 'FLAV-MM-TRO', is_active: 'Y' },
  { name: 'NOVIDA', code: 'FLAV-NOV', is_active: 'Y' },
  { name: 'ORANGE ZERO', code: 'FLAV-ORA-ZER', is_active: 'Y' },
  { name: 'RED APPLE', code: 'FLAV-RED-APP', is_active: 'Y' },
  { name: 'S/PINE NUT', code: 'FLAV-SPI-NUT', is_active: 'Y' },
  { name: 'SPARLETTA PINE A', code: 'FLAV-SPA-PIN', is_active: 'Y' },
  { name: 'SPRITE', code: 'FLAV-SPR', is_active: 'Y' },
  { name: 'SPRITE ZERO', code: 'FLAV-SPR-ZER', is_active: 'Y' },
  { name: 'STONEY TANGAWIZI', code: 'FLAV-STO-TAN', is_active: 'Y' },
  { name: 'STONEY ZERO', code: 'FLAV-STO-ZER', is_active: 'Y' },
  { name: 'TONIC WATER', code: 'FLAV-TON-WAT', is_active: 'Y' },
];

export async function seedProductFlavours(): Promise<void> {
  try {
    for (const flavour of mockProductFlavours) {
      const existingFlavour = await prisma.product_flavours.findFirst({
        where: { name: flavour.name },
      });

      if (!existingFlavour) {
        await prisma.product_flavours.create({
          data: {
            name: flavour.name,
            code: flavour.code,
            is_active: flavour.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });
      }
    }
  } catch (error) {
    throw error;
  }
}

export async function clearProductFlavours(): Promise<void> {
  try {
    await prisma.product_flavours.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockProductFlavours };
