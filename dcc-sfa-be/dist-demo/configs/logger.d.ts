import { Logger as WinstonLogger } from 'winston';
export interface CustomLogger extends WinstonLogger {
    success: (message: string) => void;
}
declare const logger: CustomLogger;
export default logger;
//# sourceMappingURL=logger.d.ts.map