import dotenv from 'dotenv';
import { createApp } from './app';
import logger from './configs/logger';
import { killPort, isPortInUse } from './utils/killPort';
dotenv.config({ quiet: true });

export const startServer = async () => {
  try {
    const app = createApp();
    const port = process.env.PORT || 4000;

    // Check if port is in use and kill any existing processes
    if (await isPortInUse(port)) {
      logger.warn(
        `Port ${port} is in use. Attempting to kill existing processes...`
      );
      await killPort(port);
      // Wait a moment for the port to be freed
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const server = app.listen(port, async () => {
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
