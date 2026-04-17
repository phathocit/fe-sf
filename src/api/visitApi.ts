import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const visitApi = {
	logVisit: async (sessionId?: string) => {
		try {
			await axios.post(`${API_URL}/visit/log`, null, {
				params: { sessionId },
			});
		} catch (error) {
			console.error('Failed to log visit:', error);
		}
	},
    getStats: async () => {
        const response = await axios.get(`${API_URL}/admin/dashboard/stats`);
        return response.data;
    }
};

export default visitApi;
