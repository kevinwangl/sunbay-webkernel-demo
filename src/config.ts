/**
 * Application Configuration
 * 
 * This file contains the configuration for the Sunbay WebKernel Demo.
 * Configuration can be loaded from:
 * 1. External config.json file (recommended for production)
 * 2. Default values defined here (fallback)
 * 
 * To customize configuration:
 * - Copy config.example.json to config.json
 * - Modify config.json with your settings
 * - The app will automatically load from config.json if it exists
 */

export interface AppConfiguration {
    // The URL of the Sunbay SoftPOS Backend
    backendUrl: string;
    
    // The Fixed IMEI to use for this device
    defaultImei: string;
    
    // Device Model Name
    deviceModel: string;
    
    // TEE Type (Must be 'QTEE' or 'TRUST_ZONE')
    teeType: 'QTEE' | 'TRUST_ZONE';
    
    // Device Mode (Must be 'FULL_POS' or 'PIN_PAD')
    deviceMode: 'FULL_POS' | 'PIN_PAD';
    
    // Enable debug mode
    debug?: boolean;
    
    // Auto register device on startup
    autoRegister?: boolean;
    
    // Preferred kernel version
    kernelVersion?: string;
}

// Default configuration (fallback)
const defaultConfig: AppConfiguration = {
    backendUrl: 'http://localhost:8080',
    defaultImei: '863592048725123',
    deviceModel: 'Sunbay-Web-Demo',
    teeType: 'QTEE',
    deviceMode: 'FULL_POS',
    debug: true,
    autoRegister: true,
    kernelVersion: 'v1.0.0'
};

// Runtime configuration (will be loaded from config.json or use defaults)
let runtimeConfig: AppConfiguration = { ...defaultConfig };

/**
 * Load configuration from external config.json file
 */
export async function loadConfig(): Promise<AppConfiguration> {
    try {
        const response = await fetch('/config.json');
        if (response.ok) {
            const externalConfig = await response.json();
            runtimeConfig = { ...defaultConfig, ...externalConfig };
            console.log('✅ Configuration loaded from config.json:', runtimeConfig);
        } else {
            console.warn('⚠️  config.json not found, using default configuration');
        }
    } catch (error) {
        console.warn('⚠️  Failed to load config.json, using default configuration:', error);
    }
    return runtimeConfig;
}

/**
 * Get current configuration
 */
export function getConfig(): AppConfiguration {
    return runtimeConfig;
}

/**
 * Update configuration at runtime
 */
export function updateConfig(updates: Partial<AppConfiguration>): void {
    runtimeConfig = { ...runtimeConfig, ...updates };
    console.log('🔄 Configuration updated:', runtimeConfig);
}

// Export default config for backward compatibility
export const AppConfig = defaultConfig;
