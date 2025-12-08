/**
 * Logger utility for development and production environments
 * 
 * In development mode, all logs are output to console.
 * In production mode, only errors and warnings are output.
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * Log informational messages (development only)
     */
    log: (...args: any[]) => {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * Log error messages (always shown)
     */
    error: (...args: any[]) => {
        console.error(...args);
    },

    /**
     * Log warning messages (always shown)
     */
    warn: (...args: any[]) => {
        console.warn(...args);
    },

    /**
     * Log debug messages with prefix (development only)
     */
    debug: (component: string, ...args: any[]) => {
        if (isDev) {
            console.log(`[${component}]`, ...args);
        }
    },
};
