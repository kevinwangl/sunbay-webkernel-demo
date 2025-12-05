export interface KernelVersion {
    id: string;
    version: string;
    file_path: string;
    file_hash: string;
    file_size: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface HealthResponse {
    status: string;
    service: string;
    version: string;
    capabilities?: {
        nfc_available: boolean;
        tee_available: boolean;
        emv_processing: boolean;
        apdu_processing: boolean;
        network_available: boolean;
        gps_available: boolean;
        backend_connected: boolean;
    };
}

import { AppConfig } from '../config';

// Configuration
const KERNEL_SERVICE_URL = AppConfig.kernelServiceUrl;
const BACKEND_URL = AppConfig.backendUrl;

// Kernel Service API (for health check)
export const kernelServiceApi = {
    async getHealth(): Promise<HealthResponse> {
        const res = await fetch(`${KERNEL_SERVICE_URL}/health`);
        if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
        return res.json();
    },

    async selectApplication(aid: string, deviceId: string) {
        const res = await fetch(`${KERNEL_SERVICE_URL}/api/emv/select`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aid, device_id: deviceId })
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Select Application failed: ${res.status} ${text}`);
        }
        return res.json();
    },

    async readRecord(sfi: number, record: number, deviceId: string) {
        const res = await fetch(`${KERNEL_SERVICE_URL}/api/emv/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sfi, record, device_id: deviceId })
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Read Record failed: ${res.status} ${text}`);
        }
        return res.json();
    },

    async getProcessingOptions(pdol: string, deviceId: string) {
        const res = await fetch(`${KERNEL_SERVICE_URL}/api/emv/gpo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdol, device_id: deviceId })
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`GPO failed: ${res.status} ${text}`);
        }
        return res.json();
    },
};

// Backend Public API (no authentication required)
export const backendApi = {
    async getStableKernels(): Promise<KernelVersion[]> {
        const res = await fetch(`${BACKEND_URL}/api/v1/public/kernels`);
        if (!res.ok) {
            throw new Error('Failed to fetch kernels');
        }
        const response = await res.json();
        // 后端可能返回 { code, data: [...], message } 或直接返回数组
        return response.data || response;
    },

    async getLatestKernel(): Promise<KernelVersion> {
        const res = await fetch(`${BACKEND_URL}/api/v1/public/kernels/latest`);
        if (!res.ok) {
            throw new Error('Failed to fetch latest kernel');
        }
        const response = await res.json();
        // 后端可能返回 { code, data: {...}, message } 或直接返回对象
        return response.data || response;
    },

    async downloadKernel(version: string): Promise<ArrayBuffer> {
        const res = await fetch(`${BACKEND_URL}/api/v1/public/kernels/${version}/download`);
        if (!res.ok) {
            throw new Error('Download failed');
        }
        return res.arrayBuffer();
    },

    getDownloadUrl(version: string) {
        return `${BACKEND_URL}/api/v1/public/kernels/${version}/download`;
    },

    async registerDevice(data: any): Promise<any> {
        const res = await fetch(`${BACKEND_URL}/api/v1/devices/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.text();
            throw new Error(`Registration failed: ${error}`);
        }
        const response = await res.json();
        // 后端返回格式: { code: 201, data: { device_id, ... }, message: ... }
        // 返回data对象以保持兼容性
        return response.data || response;
    },

    async injectKey(deviceId: string): Promise<any> {
        const res = await fetch(`${BACKEND_URL}/api/v1/public/keys/inject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId }),
        });
        if (!res.ok) {
            const error = await res.text();
            throw new Error(`Key injection failed: ${error}`);
        }
        const response = await res.json();
        // 后端返回格式: { code: 200, data: { ... }, message: ... }
        return response.data || response;
    },
};

// Legacy API client for backward compatibility
export const apiClient = {
    ...kernelServiceApi,
    ...backendApi,
};
