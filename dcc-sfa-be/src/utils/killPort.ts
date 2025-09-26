import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../configs/logger';

const execAsync = promisify(exec);

/**
 * Kills any process running on the specified port
 * @param {number | string} port - Port number to kill processes on
 * @returns {Promise<void>} Promise that resolves when all processes are killed
 * @example
 * await killPort(4000);
 * await killPort('5173');
 */
export const killPort = async (port: number | string): Promise<void> => {
  try {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

    if (process.platform === 'win32') {
      await killPortWindows(portNum);
    } else {
      await killPortUnix(portNum);
    }
  } catch (error) {
    logger.error(`Error killing processes on port ${port}:`, error);
  }
};

/**
 * Kills processes on Windows using netstat and taskkill
 * @param {number} portNum - Port number to kill processes on
 * @returns {Promise<void>} Promise that resolves when processes are killed
 */
const killPortWindows = async (portNum: number): Promise<void> => {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${portNum}`);
    if (stdout) {
      const lines = stdout
        .split('\n')
        .filter(line => line.includes('LISTENING'));
      const uniquePids = new Set<string>();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          uniquePids.add(pid);
        }
      }

      for (const pid of uniquePids) {
        try {
          await execAsync(`taskkill /PID ${pid} /F`);
          logger.info(`Killed process ${pid} on port ${portNum}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (killError: any) {
          if (!killError.message?.includes('not found')) {
            logger.warn(
              `Could not kill process ${pid}: ${killError.message || killError}`
            );
          }
        }
      }
    }
  } catch (error) {
    logger.debug(`No process found on port ${portNum}`);
  }
};

/**
 * Kills processes on Unix/Linux/Mac using lsof and kill
 * @param {number} portNum - Port number to kill processes on
 * @returns {Promise<void>} Promise that resolves when processes are killed
 */
const killPortUnix = async (portNum: number): Promise<void> => {
  try {
    const { stdout } = await execAsync(`lsof -ti:${portNum}`);
    if (stdout.trim()) {
      const pids = stdout.trim().split('\n');
      for (const pid of pids) {
        if (pid) {
          try {
            await execAsync(`kill -9 ${pid}`);
            logger.info(`Killed process ${pid} on port ${portNum}`);
          } catch (killError) {
            logger.warn(`Could not kill process ${pid}: ${killError}`);
          }
        }
      }
    }
  } catch (error) {
    logger.debug(`No process found on port ${portNum}`);
  }
};

/**
 * Checks if a port is currently in use by any process
 * @param {number | string} port - Port number to check
 * @returns {Promise<boolean>} Promise that resolves to true if port is in use, false otherwise
 * @example
 * const inUse = await isPortInUse(4000);
 * if (inUse) {
 *   console.log('Port 4000 is busy');
 * }
 */
export const isPortInUse = async (port: number | string): Promise<boolean> => {
  try {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${portNum}`);
      return stdout.includes('LISTENING');
    } else {
      const { stdout } = await execAsync(`lsof -ti:${portNum}`);
      return stdout.trim().length > 0;
    }
  } catch (error) {
    return false;
  }
};
