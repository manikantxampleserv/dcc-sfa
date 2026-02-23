import dotenv from 'dotenv';
import { createApp } from './app';
import logger from './configs/logger';
import { isPortInUse, killPort } from './utils/killPort';
import { AttendanceCronService } from './v1/services/attendance.cron.service';
import { resolve } from 'path';

// First check if DATABASE_URL is already set in environment variables
if (!process.env.DATABASE_URL) {
  // Load environment variables from the root directory
  const possiblePaths = [
    resolve(process.cwd(), '.env'), // Current working directory
    resolve(__dirname, '../.env'), // Relative to compiled file
    resolve(__dirname, '../../../.env'), // For production builds
    '.env', // Fallback
  ];

  for (const path of possiblePaths) {
    try {
      const result = dotenv.config({ path, quiet: true });
      if (result.error) {
        continue;
      }
      if (process.env.DATABASE_URL) {
        break;
      }
    } catch (error) {
      continue;
    }
  }
}

export const startServer = async () => {
  const port = process.env.PORT || 4000;

  try {
    const app = createApp();

    if (await isPortInUse(port)) {
      logger.warn(
        `Port ${port} is in use. Attempting to kill existing processes...`
      );
      await killPort(port);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const server = app.listen(port, async () => {
      AttendanceCronService.startAutoPunchOut();
      AttendanceCronService.startMidnightStatusReset();
      logger.info('Attendance cron jobs started');
      logger.success(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};
