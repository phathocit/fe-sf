export interface QRCode {
    id: number;
    name: string;
    code: string;
    stallId: number;
    stallName: string;
    isActive: boolean;
    scanCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface QRCodeCreateRequest {
    name: string;
    code: string;
    stallId: number;
    isActive?: boolean;
}
