import axiosClient from './axiosClient';
import type {
	LoginResponse,
	RegisterResponse,
	VendorRegisterRequest,
	LoginRequest,
} from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

const authApi = {
	login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
		return axiosClient.post('/auth/login', data);
	},
	registerVendor: (
		data: VendorRegisterRequest,
	): Promise<ApiResponse<RegisterResponse>> => {
		return axiosClient.post('/auth/register-vendor', data);
	},
};

export default authApi;
