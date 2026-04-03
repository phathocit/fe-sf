export interface Food {
	id: string;
	name: string;
	stallId: string;
	price: number;
	image: string;
	description: string;
	isAvailable: boolean;
	imageFile?: File;
}

