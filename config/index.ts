/**
 * Configuration Manager
 * Loads and validates all configuration from environment
 */

import { loadEnvironment, validateEnvironment, type AppEnvironment } from './env'
import { createDatabaseConfig, type DatabaseConfig } from './database'
import { createCacheConfig, type CacheConfig } from './cache'
import { createApiConfig, type ApiConfig } from './api'
import { createLoggerConfig, type LoggerConfig } from './logger'
import { createSecurityConfig, type SecurityConfig } from './security'

/**
 * Complete application configuration
 */
export interface AppConfig {
  env: AppEnvironment
  database: DatabaseConfig
  cache: CacheConfig
  api: ApiConfig
  logger: LoggerConfig
  security: SecurityConfig
}

/**
 * Load all configuration from environment
 */
export function loadConfig(): AppConfig {
  // Load environment variables
  const env = loadEnvironment()

  // Validate environment
  validateEnvironment(env)

  // Create all configurations
  const config: AppConfig = {
    env,
    database: createDatabaseConfig(env),
    cache: createCacheConfig(env),
    api: createApiConfig(env),
    logger: createLoggerConfig(env),
    security: createSecurityConfig(env),
  }

  // Log configuration loaded
  if (env.nodeEnv !== 'test') {
    console.log('✅ Application configuration loaded')
    console.log(`   Environment: ${env.nodeEnv}`)
    console.log(`   Port: ${env.port}`)
    console.log(`   Log Level: ${env.logLevel}`)
  }

  return config
}

/**
 * Singleton configuration instance
 */
let configInstance: AppConfig | null = null

/**
 * Get configuration instance (lazy loaded)
 */
export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig()
  }
  return configInstance
}

/**
 * Reset configuration (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null
}

// Export all configuration types and functions
export type {
  AppConfig,
  AppEnvironment,
  DatabaseConfig,
  CacheConfig,
  ApiConfig,
  LoggerConfig,
  SecurityConfig,
}

export {
  loadEnvironment,
  validateEnvironment,
  createDatabaseConfig,
  createCacheConfig,
  createApiConfig,
  createLoggerConfig,
  createSecurityConfig,
}

// Export sub-config modules
export * from './database'
export * from './cache'
export * from './api'
export * from './logger'
export * from './security'
