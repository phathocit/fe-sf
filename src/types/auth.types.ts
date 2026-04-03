export interface LoginRequest {
	userName: string;
	password: string;
}

export interface VendorLoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	userName: string;
	password: string;
}

export interface VendorRegisterRequest {
	ownerName: string;
	stallName: string;
	email: string;
	password: string;
}
export interface Account {
	id: string;
	userName: string;
	fullName: string;
	email: string;
	isActive: boolean;
	roles: Array<{ name: string }>;
}

export interface LoginResponse {
	token: string;
	authenticated: boolean;
	account: Account;
}

export interface RegisterResponse {
	accountId: string;
	userName: string;
}
