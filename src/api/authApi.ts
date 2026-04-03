import axiosClient from './axiosClient';
import type {
	LoginResponse,
	RegisterResponse,
	VendorRegisterRequest,
	VendorLoginRequest,
	LoginRequest,
} from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

const authApi = {
	loginEmail: (
		data: VendorLoginRequest,
	): Promise<ApiResponse<LoginResponse>> => {
		return axiosClient.post('/auth/login-email', data);
	},
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
