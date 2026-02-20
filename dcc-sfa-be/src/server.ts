import { createApp } from './app';
import logger from './configs/logger';
import { isPortInUse, killPort } from './utils/killPort';
import { AttendanceCronService } from './v1/services/attendance.cron.service';

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

    console.log(process.env.DATABASE_URL,"DATABASE_URL")
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
