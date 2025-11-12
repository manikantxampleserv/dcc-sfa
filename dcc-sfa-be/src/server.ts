import dotenv from 'dotenv';
import { createApp } from './app';
import logger from './configs/logger';
import { killPort, isPortInUse } from './utils/killPort';
import { AttendanceCronService } from './v1/services/attendance.cron.service';
dotenv.config({ quiet: true });

const port = process.env.PORT || 4000;

export const startServer = async () => {
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

    server.on('error', error => {
      logger.error('Server error:', error);
    });

    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
      });
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};
