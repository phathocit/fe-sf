import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { QRCode, QRCodeCreateRequest } from '../types/qrcode.types';

const qrCodeApi = {
	create: (data: QRCodeCreateRequest): Promise<ApiResponse<QRCode>> => {
		return axiosClient.post('/qr', data);
	},

	update: (
		id: number,
		data: Partial<QRCodeCreateRequest>,
	): Promise<ApiResponse<QRCode>> => {
		return axiosClient.put(`/qr/${id}`, data);
	},

	delete: (id: number): Promise<ApiResponse<void>> => {
		return axiosClient.delete(`/qr/${id}`);
	},

	toggle: (id: number): Promise<ApiResponse<QRCode>> => {
		return axiosClient.patch(`/qr/${id}/toggle`);
	},
	regenerate: (id: number): Promise<ApiResponse<QRCode>> => {
		return axiosClient.patch(`/qr/${id}/regenerate`);
	},

	getById: (id: number): Promise<ApiResponse<QRCode>> => {
		return axiosClient.get(`/qr/${id}`);
	},

	getByStallId: (stallId: number): Promise<ApiResponse<QRCode>> => {
		return axiosClient.get(`/qr/stall/${stallId}`);
	},

	getGateway: (): Promise<ApiResponse<QRCode>> => {
		return axiosClient.get('/qr/gateway');
	},
	getAll: (): Promise<ApiResponse<QRCode[]>> => {
		return axiosClient.get('/qr');
	},
};

export default qrCodeApi;
