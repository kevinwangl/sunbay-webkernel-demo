import { backendApi } from '../api/client';
import { AppConfig } from '../config';
import init, { WasmEmvProcessor } from '../wasm/sunbay_kernel_service';

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
            console.log('[KernelLoader] Fetching latest kernel from backend...');
            const latestKernel = await backendApi.getLatestKernel();
            this.currentVersion = latestKernel.version;
            console.log(`[KernelLoader] Latest kernel version: ${latestKernel.version}`);

            // 2. Download WASM
            console.log(`[KernelLoader] Downloading kernel ${latestKernel.version}...`);
            const wasmBytes = await backendApi.downloadKernel(latestKernel.version);
            console.log(`[KernelLoader] Downloaded ${wasmBytes.byteLength} bytes`);

            // 3. Initialize WASM module
            console.log('[KernelLoader] Initializing WASM module...');
            await init({ module_or_path: wasmBytes });
            console.log('[KernelLoader] WASM module initialized');

            // 4. Create processor instance
            console.log('[KernelLoader] Creating EMV processor instance...');
            this.kernelInstance = new WasmEmvProcessor("156", "CNY");

            console.log(`[KernelLoader] ✅ Kernel ${latestKernel.version} loaded successfully`);
            return latestKernel.version;
        } catch (error) {
            console.error('[KernelLoader] ❌ Kernel load failed:', error);

            // Fallback to mock kernel on error
            console.warn('[KernelLoader] ⚠️  Falling back to mock kernel');
            return this.loadMockKernel();
        }
    }

    /**
     * Load a specific kernel version
     */
    async loadKernelVersion(version: string): Promise<string> {
        try {
            console.log(`Downloading kernel ${version}...`);
            const wasmBytes = await backendApi.downloadKernel(version);

            console.log('Initializing WASM module...');
            await init(wasmBytes);

            this.kernelInstance = new WasmEmvProcessor("156", "CNY");

            this.currentVersion = version;
            console.log(`✅ Kernel ${version} loaded successfully`);
            return version;
        } catch (error) {
            console.error(`Failed to load kernel ${version}:`, error);
            throw error;
        }
    }

    /**
     * Fallback to mock kernel (local file)
     */
    private async loadMockKernel(): Promise<string> {
        const downloadUrl = '/mock_kernel.wasm';
        const version = 'v0.0.0-mock';

        try {
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Failed to download mock kernel');

            const wasmBytes = await response.arrayBuffer();

            await init({ module_or_path: wasmBytes });
            this.kernelInstance = new WasmEmvProcessor("156", "CNY");

            this.currentVersion = version;
            return version;
        } catch (error) {
            console.error('Failed to load mock kernel:', error);
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

        console.log(`[KernelLoader] 💳 Processing transaction: $${amount}`);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Use the WASM processor to select PPSE as a test
            // In a real flow, this would be a sequence of APDU commands
            console.log('[KernelLoader] Calling WASM kernel selectPpse()...');
            const ppseResult = this.kernelInstance.selectPpse();
            console.log('[KernelLoader] PPSE Selection Result:', ppseResult);

            // For demo, we just return a success result
            const cryptogram = `TC_${Date.now()}_${amount}_${Math.random().toString(36).substring(7).toUpperCase()}`;
            console.log(`[KernelLoader] ✅ Transaction processed successfully`);
            console.log(`[KernelLoader] Generated cryptogram: ${cryptogram}`);

            return {
                success: true,
                cryptogram
            };
        } catch (e) {
            console.error('[KernelLoader] ❌ WASM processing error:', e);
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
            const imei = AppConfig.defaultImei;

            console.log(`📱 Registering device with IMEI ${imei}...`);

            // Generate a mock public key
            const mockPublicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----";

            const response = await backendApi.registerDevice({
                imei: imei,
                model: AppConfig.deviceModel,
                os_version: '1.0.0',  // snake_case for RegisterDeviceRequest
                tee_type: AppConfig.teeType,  // snake_case
                public_key: mockPublicKey,  // snake_case
                device_mode: AppConfig.deviceMode,  // snake_case
                nfc_present: true  // snake_case
            });

            // The backend returns snake_case 'device_id'
            const deviceId = response.device_id;

            if (!deviceId) {
                throw new Error('No device_id in registration response');
            }

            // Check if this is an existing device or newly registered
            if (response.message && response.message.includes('already registered')) {
                console.log(`✅ Using existing device with ID: ${deviceId}`);
            } else {
                console.log(`✅ New device registered successfully with ID: ${deviceId}`);
            }

            return deviceId;
        } catch (error) {
            console.error('❌ Device registration failed:', error);
            throw error;
        }
    }

    /**
     * Inject keys from backend
     */
    async injectKeys(deviceId: string): Promise<boolean> {
        try {
            console.log(`Injecting keys for device ${deviceId}...`);
            await backendApi.injectKey(deviceId);
            console.log('✅ Keys injected successfully');
            return true;
        } catch (error) {
            // Handle key already injected error - this is not a fatal error
            if (error instanceof Error &&
                error.message.includes('already been injected')) {
                console.log('ℹ️ Keys already injected for this device, skipping...');
                return true; // Return success since keys are already there
            }

            console.error('❌ Key injection failed:', error);
            throw error;
        }
    }

    /**
     * Attest a transaction (simulate backend call)
     */
    async attestTransaction(cryptogram: string): Promise<boolean> {
        console.log('Attesting cryptogram:', cryptogram);
        // Simulate attestation with backend
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
    }

    /**
     * Get client IP address
     */
    private async getClientIp(): Promise<string> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (response.ok) {
                const data = await response.json();
                return data.ip;
            }
        } catch (e) {
            console.warn('Failed to fetch public IP, using fallback');
        }
        return '127.0.0.1';
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
        const BACKEND_URL = 'http://localhost:8080';

        console.log('💳 Processing transaction with backend...');

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
        console.log('✅ Transaction attested successfully:', attestResult);

        // 2. Process transaction with the token
        const transactionToken = attestResult.transaction_token;
        if (!transactionToken) {
            throw new Error('No transaction token returned from attestation');
        }

        console.log('💳 Completing transaction with token...');

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
        console.log('✅ Transaction processed successfully:', result);

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
