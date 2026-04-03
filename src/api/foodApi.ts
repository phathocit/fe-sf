import type { ApiResponse } from '../types/api.types';
import type { Food } from '../types/food.types';
import axiosClient from './axiosClient';

const foodApi = {
	getAll: (): Promise<ApiResponse<Food[]>> => {
		return axiosClient.get('/foods');
	},
	getByStallId: (stallId: number): Promise<ApiResponse<Food[]>> => {
		return axiosClient.get(`/foods/stall/${stallId}`);
	},
	create: (data: Partial<Food>): Promise<ApiResponse<Food>> => {
		return axiosClient.post('/foods', data);
	},
	update: (id: string | number, data: Partial<Food>): Promise<ApiResponse<Food>> => {
		return axiosClient.put(`/foods/${id}`, data);
	},
	delete: (id: string | number): Promise<ApiResponse<void>> => {
		return axiosClient.delete(`/foods/${id}`);
	},
};

export default foodApi;
