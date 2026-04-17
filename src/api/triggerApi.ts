import axiosClient from './axiosClient';

export interface StallTriggerConfig {
	stallId: number;
	triggerType: string;
	radius: number;
	triggerDistance: number;
	cooldownSeconds: number;
	priority: number;
}

const triggerApi = {
	getByStallId: (stallId: number) => {
		return axiosClient.get(`/stall-trigger-config/${stallId}`);
	},
	save: (data: Partial<StallTriggerConfig>) => {
		return axiosClient.post('/stall-trigger-config', data);
	},
};

export default triggerApi;
