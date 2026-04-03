import type { ApiResponse } from '../types/api.types';
import type { Stall } from '../types/stall.types';
import axiosClient from './axiosClient';

const stallApi = {
	getByStreetId: (streetId: number): Promise<ApiResponse<Stall[]>> => {
		return axiosClient.get(`/stalls/street/${streetId}`);
	},
	getById: (id: number): Promise<ApiResponse<Stall>> => {
		return axiosClient.get(`/stalls/${id}`);
	},
	getAllActive: (): Promise<ApiResponse<Stall[]>> => {
		return axiosClient.get('/stalls');
	},
	getAll: (): Promise<ApiResponse<Stall[]>> => {
		return axiosClient.get('/stalls/all');
	},
	getByVendorId: (vendorId: number): Promise<ApiResponse<Stall>> => {
		return axiosClient.get(`/stalls/vendor/${vendorId}`);
	},
	update: (id: number, data: Partial<Stall>): Promise<ApiResponse<Stall>> => {
		return axiosClient.put(`/stalls/${id}`, data);
	},
};

export default stallApi;
