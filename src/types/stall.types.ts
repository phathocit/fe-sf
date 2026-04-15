export interface Stall {
	id: number;
	streetId: number;
	vendorId: number;
	name: string;
	category: string;
	latitude: string;
	longitude: string;
	image: string;
	description?: string;
	script?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	radius?: number;
	coordinates?: [number, number];
	imageFile?: File;
}

