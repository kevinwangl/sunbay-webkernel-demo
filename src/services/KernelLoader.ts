import { backendApi } from '../api/client';
import { getConfig } from '../config';
import init, { WasmEmvProcessor } from '../wasm/sunbay_kernel_service';
import { logger } from '../utils/logger';

export class KernelLoader {
    private static instance: KernelLoader;
    private kernelInstance: WasmEmvProcessor | null = null;
    private currentVersion: string | null = null;

    private constructor() { }

    static getInstance(): KernelLoader {
        if (!KernelLoader.instance) {
            KernelLoader.instance = new KernelLoader();
        }
        return KernelLoader.instance;
    }

    /**
     * Load the latest stable kernel from backend (public endpoint, no auth required)
     */
    async loadLatestKernel(): Promise<string> {
        try {
            // 1. Get latest stable kernel
            logger.debug('KernelLoader', 'Fetching latest kernel from backend...');
            const latestKernel = await backendApi.getLatestKernel();
            this.currentVersion = latestKernel.version;
            logger.debug('KernelLoader', `Latest kernel version: ${latestKernel.version}`);

            // 2. Download WASM
            logger.debug('KernelLoader', `Downloading kernel ${latestKernel.version}...`);
            const wasmBytes = await backendApi.downloadKernel(latestKernel.version);
            logger.debug('KernelLoader', `Downloaded ${wasmBytes.byteLength} bytes`);

            // 3. Initialize WASM module
            logger.debug('KernelLoader', 'Initializing WASM module...');
            await init({ module_or_path: wasmBytes });
            logger.debug('KernelLoader', 'WASM module initialized');

            // 4. Create processor instance
            logger.debug('KernelLoader', 'Creating EMV processor instance...');
            this.kernelInstance = new WasmEmvProcessor("156", "CNY");

            logger.debug('KernelLoader', `✅ Kernel ${latestKernel.version} loaded successfully`);
            return latestKernel.version;
        } catch (error) {
            logger.error('[KernelLoader] ❌ Kernel load failed:', error);
            throw error;
        }
    }

    /**
     * Load a specific kernel version
     */
    async loadKernelVersion(version: string): Promise<string> {
        try {
            logger.debug('KernelLoader', `Downloading kernel ${version}...`);
            const wasmBytes = await backendApi.downloadKernel(version);

            logger.debug('KernelLoader', 'Initializing WASM module...');
            await init(wasmBytes);

            this.kernelInstance = new WasmEmvProcessor("156", "CNY");

            this.currentVersion = version;
            logger.debug('KernelLoader', `✅ Kernel ${version} loaded successfully`);
            return version;
        } catch (error) {
            logger.error(`Failed to load kernel ${version}:`, error);
            throw error;
        }
    }


    /**
     * Process a transaction using the loaded kernel
     */
    async processTransaction(amount: number): Promise<{ success: boolean; cryptogram: string }> {
        if (!this.kernelInstance) {
            throw new Error('Kernel not loaded');
        }

        logger.debug('KernelLoader', `💳 Processing transaction: $${amount}`);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Use the WASM processor to select PPSE as a test
            // In a real flow, this would be a sequence of APDU commands
            logger.debug('KernelLoader', 'Calling WASM kernel selectPpse()...');
            const ppseResult = this.kernelInstance.selectPpse();
            logger.debug('KernelLoader', 'PPSE Selection Result:', ppseResult);

            // For demo, we just return a success result
            const cryptogram = `TC_${Date.now()}_${amount}_${Math.random().toString(36).substring(7).toUpperCase()}`;
            logger.debug('KernelLoader', `✅ Transaction processed successfully`);
            logger.debug('KernelLoader', `Generated cryptogram: ${cryptogram}`);

            return {
                success: true,
                cryptogram
            };
        } catch (e) {
            logger.error('[KernelLoader] ❌ WASM processing error:', e);
            throw e;
        }
    }

    /**
     * Register device with backend
     * Uses fixed IMEI from config. If device already exists, backend returns existing device_id.
     * If not, backend creates new device and returns new device_id.
     */
    async registerDevice(): Promise<string> {
        try {
            // Use fixed IMEI from configuration
            // This simulates a real device with a fixed hardware identifier
            const imei = getConfig().defaultImei;

            logger.debug('KernelLoader', `📱 Registering device with IMEI ${imei}...`);

            // Generate a mock public key
            const mockPublicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----";

            const response = await backendApi.registerDevice({
                imei: imei,
                model: getConfig().deviceModel,
                os_version: '1.0.0',  // snake_case for RegisterDeviceRequest
                tee_type: getConfig().teeType,  // snake_case
                public_key: mockPublicKey,  // snake_case
                device_mode: getConfig().deviceMode,  // snake_case
                nfc_present: true  // snake_case
            });

            // The backend returns snake_case 'device_id'
            const deviceId = response.device_id;

            if (!deviceId) {
                throw new Error('No device_id in registration response');
            }

            // Check if this is an existing device or newly registered
            if (response.message && response.message.includes('already registered')) {
                logger.debug('KernelLoader', `✅ Using existing device with ID: ${deviceId}`);
            } else {
                logger.debug('KernelLoader', `✅ New device registered successfully with ID: ${deviceId}`);
            }

            return deviceId;
        } catch (error) {
            logger.error('❌ Device registration failed:', error);
            throw error;
        }
    }

    /**
     * Inject keys from backend
     */
    async injectKeys(deviceId: string): Promise<boolean> {
        try {
            logger.debug('KernelLoader', `Injecting keys for device ${deviceId}...`);
            await backendApi.injectKey(deviceId);
            logger.debug('KernelLoader', '✅ Keys injected successfully');
            return true;
        } catch (error) {
            // Handle key already injected error - this is not a fatal error
            if (error instanceof Error &&
                error.message.includes('already been injected')) {
                logger.debug('KernelLoader', 'ℹ️ Keys already injected for this device, skipping...');
                return true; // Return success since keys are already there
            }

            logger.error('❌ Key injection failed:', error);
            throw error;
        }
    }

    /**
     * Attest a transaction (simulate backend call)
     */
    async attestTransaction(cryptogram: string): Promise<boolean> {
        logger.debug('KernelLoader', 'Attesting cryptogram:', cryptogram);
        // Simulate attestation with backend
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
    }

    /**
     * Get client IP address using multiple IP detection services
     * Tries multiple services with timeout for reliability
     */
    private async getClientIp(): Promise<string> {
        // List of IP detection services (in order of preference)
        const ipServices = [
            { url: 'https://api.ipify.org', field: null },
            { url: 'https://api64.ipify.org', field: null },
            { url: 'https://ipapi.co/json/', field: 'ip' },
            { url: 'https://ifconfig.me/ip', field: null }, // Returns plain text
        ];

        // Try each service with timeout
        for (const service of ipServices) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

                const response = await fetch(service.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json, text/plain'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    let ip: string;
                    
                    if (service.field) {
                        // JSON response
                        const data = await response.json();
                        ip = data[service.field];
                    } else {
                        // Plain text response
                        ip = (await response.text()).trim();
                    }

                    if (ip && this.isValidIp(ip)) {
                        logger.debug('KernelLoader', `📍 Detected public IP: ${ip} (from ${service.url})`);
                        return ip;
                    }
                }
            } catch (error) {
                // Try next service
                logger.debug('KernelLoader', `Failed to get IP from ${service.url}, trying next...`);
                continue;
            }
        }

        // All services failed, return fallback
        logger.warn('KernelLoader', 'All IP detection services failed, using fallback');
        return '0.0.0.0';
    }

    /**
     * Validate IP address format
     */
    private isValidIp(ip: string): boolean {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) return false;

        const parts = ip.split('.');
        return parts.every(part => {
            const num = parseInt(part, 10);
            return num >= 0 && num <= 255;
        });
    }

    /**
     * Process transaction with real backend (simplified - using attest endpoint)
     */
    async processTransactionWithBackend(transactionData: {
        deviceId: string;
        amount: number;
        currency: string;
        healthCheck?: any;
    }): Promise<any> {
        const BACKEND_URL = getConfig().backendUrl;

        logger.debug('KernelLoader', '💳 Processing transaction with backend...');

        // Use the public attest endpoint (no authentication required)
        const response = await fetch(`${BACKEND_URL}/api/v1/transactions/attest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId: transactionData.deviceId,
                amount: transactionData.amount,
                currency: transactionData.currency,
                cardNumber: '4111111111111111', // Test card
                expiryDate: '12/25',
                cvv: '123',
                cardholderName: 'TEST USER',
                // Optional location data
                latitude: 37.7749,
                longitude: -122.4194,
                // Health check data
                healthCheck: transactionData.healthCheck || {
                    rootDetection: false,
                    emulatorDetection: false,
                    debuggerDetection: false,
                    hookDetection: false,
                    tamperDetection: false,
                    securityScore: 95
                }
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Transaction failed: ${error}`);
        }

        const attestResult = await response.json();
        logger.debug('KernelLoader', '✅ Transaction attested successfully:', attestResult);

        // 2. Process transaction with the token
        const transactionToken = attestResult.transaction_token;
        if (!transactionToken) {
            throw new Error('No transaction token returned from attestation');
        }

        logger.debug('KernelLoader', '💳 Completing transaction with token...');

        const processResponse = await fetch(`${BACKEND_URL}/api/v1/transactions/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId: transactionData.deviceId,
                transactionType: 'PAYMENT',
                amount: transactionData.amount,
                currency: transactionData.currency,
                encryptedPinBlock: 'DUMMY_PIN_BLOCK', // In real app, this comes from PIN pad
                ksn: 'DUMMY_KSN', // In real app, this comes from PIN pad
                cardNumberMasked: '4111********1111',
                transactionToken: transactionToken,
                // Optional location data
                latitude: 37.7749,
                longitude: -122.4194,
                locationAccuracy: 10.0,
                locationTimestamp: new Date().toISOString(),
                clientIp: await this.getClientIp()
            }),
        });

        if (!processResponse.ok) {
            const error = await processResponse.text();
            throw new Error(`Transaction processing failed: ${error}`);
        }

        const result = await processResponse.json();
        logger.debug('KernelLoader', '✅ Transaction processed successfully:', result);

        return result;
    }

    /**
     * Get current loaded kernel version
     */
    getCurrentVersion(): string | null {
        return this.currentVersion;
    }

    /**
     * Check if kernel is loaded
     */
    isLoaded(): boolean {
        return this.kernelInstance !== null;
    }
}
