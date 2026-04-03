import axiosClient from './axiosClient';

export interface CloudinaryResponse {
	publicId: string;
	url: string;
	resourceType: string;
}

const cloudinaryApi = {
	upload: (file: File, folder?: string, publicId?: string): Promise<{ code: number; result: CloudinaryResponse }> => {
		const formData = new FormData();
		formData.append('file', file);
		
		let url = folder ? `/cloudinary/upload?folder=${folder}` : '/cloudinary/upload';
		if (publicId) {
			url += (url.includes('?') ? '&' : '?') + `publicId=${publicId}`;
		}
		
		return axiosClient.post(url, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
	},
	
	delete: (publicId: string): Promise<{ code: number; result: boolean }> => {
		return axiosClient.delete(`/cloudinary/delete?publicId=${publicId}`);
	}
};

export default cloudinaryApi;
