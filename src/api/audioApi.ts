import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export interface StallAudioResponse {
	needDownload: boolean;
	audioUrl: string;
	fileSize: number;
	audioHash: string;
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
	message?: string;
}

export interface StallTranslation {
	id: number;
	stallId: number;
	languageCode: string;
	name: string;
	ttsScript: string;
	audioUrl: string;
	audioStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
	audioHash?: string;
}

const audioApi = {
	getStallAudio: (stallId: number, language: string = 'vi'): Promise<ApiResponse<StallAudioResponse>> => {
		return axiosClient.get(`/stall-translations/audio`, {
			params: { stallId, language },
		});
	},
	getTranslationsByStall: (stallId: number): Promise<ApiResponse<StallTranslation[]>> => {
		return axiosClient.get(`/stall-translations/stall/${stallId}`);
	},
	createTranslation: (data: { stallId: number; languageCode: string; ttsScript: string }): Promise<ApiResponse<StallTranslation>> => {
		return axiosClient.post(`/stall-translations`, data);
	},
	updateTranslation: (id: number, data: { stallId: number; languageCode: string; ttsScript: string }): Promise<ApiResponse<StallTranslation>> => {
		return axiosClient.put(`/stall-translations/${id}`, data);
	},
};

export default audioApi;
