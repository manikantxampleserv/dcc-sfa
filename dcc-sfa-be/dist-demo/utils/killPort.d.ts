/**
 * Kills any process running on the specified port
 * @param {number | string} port - Port number to kill processes on
 * @returns {Promise<void>} Promise that resolves when all processes are killed
 * @example
 * await killPort(4000);
 * await killPort('5173');
 */
export declare const killPort: (port: number | string) => Promise<void>;
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
export declare const isPortInUse: (port: number | string) => Promise<boolean>;
//# sourceMappingURL=killPort.d.ts.map