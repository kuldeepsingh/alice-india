/**
 * Frontend Logger - Consolidated Export
 * 
 * This file re-exports the logger from logger.ts to ensure
 * all parts of the application use the same logger instance.
 * 
 * Previously there were two separate logger implementations,
 * which caused logs to be stored in different places.
 * This consolidates them into a single instance.
 */

export { frontendLogger } from './logger'
export type { LogLevel } from './logger'
