import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { Account } from '../types/auth.types';

const accountApi = {
	getById: (id: number): Promise<ApiResponse<Account>> => {
		return axiosClient.get(`/accounts/${id}`);
	},
	getAll: (): Promise<ApiResponse<Account[]>> => {
		return axiosClient.get('/accounts');
	},
	update: (id: string | number, data: Partial<Account>): Promise<ApiResponse<Account>> => {
		return axiosClient.put(`/accounts/${id}`, data);
	},
};

export default accountApi;
