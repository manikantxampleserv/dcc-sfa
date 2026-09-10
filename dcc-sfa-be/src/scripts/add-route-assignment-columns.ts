import prisma from '../configs/prisma.client';

/**
 * Migration script to add route assignment columns to roles and users tables.
 * Safely checks if columns exist before altering tables.
 */
async function migrate() {
  try {
    console.log('Starting migration for route assignment columns...');

    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('roles') AND name = 'is_assigned_route'
      )
      BEGIN
        ALTER TABLE roles ADD is_assigned_route CHAR(1) NOT NULL DEFAULT 'N';
        PRINT 'Added is_assigned_route column to roles table';
      END
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE roles 
      SET is_assigned_route = 'Y' 
      WHERE (
        name LIKE '%Salesman%' 
        OR name LIKE '%Salesperson%' 
        OR name LIKE '%Surveyor%' 
        OR role_key LIKE '%salesman%' 
        OR role_key LIKE '%salesperson%' 
        OR role_key LIKE '%surveyor%'
      ) AND (is_assigned_route IS NULL OR is_assigned_route = 'N');
    `);

    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('users') AND name = 'route_assignment_count'
      )
      BEGIN
        ALTER TABLE users ADD route_assignment_count INT NULL DEFAULT 0;
        PRINT 'Added route_assignment_count column to users table';
      END
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE u
      SET u.route_assignment_count = 3
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE r.is_assigned_route = 'Y' 
        AND (u.route_assignment_count IS NULL OR u.route_assignment_count = 0);
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
