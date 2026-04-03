export interface ApiResponse<T> {
	result: T;
	message: string;
	code: number;
}
