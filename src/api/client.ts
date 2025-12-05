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

import { AppConfig } from '../config';

// Configuration
const BACKEND_URL = AppConfig.backendUrl;

// Backend Public API (no authentication required)
// Note: Backend uses camelCase for field names (via #[serde(rename_all = "camelCase")])
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
        // 注意：RegisterDeviceRequest/Response 使用 snake_case
        // 返回data对象以保持兼容性
        return response.data || response;
    },

    async injectKey(deviceId: string): Promise<any> {
        const res = await fetch(`${BACKEND_URL}/api/v1/public/keys/inject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId }),  // camelCase for backend
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
export const apiClient = backendApi;
