/**
 * IndexedDB utilities for offline POI data caching
 * Stores stalls, foods, and metadata for offline map functionality
 */

interface DBStall {
	id: number;
	name: string;
	category: string;
	latitude: number;
	longitude: number;
	image?: string;
	isActive: boolean;
	streetId: number;
	vendorId: number;
}

interface DBFood {
	id: number;
	stallId: number;
	name: string;
	price: number;
	description?: string;
	image?: string;
	isAvailable: boolean;
}

interface DBAudio {
	stallId: number;
	language: string;
	audioUrl: string;
	audioHash: string;
	status: 'COMPLETED' | 'PROCESSING' | 'ERROR';
	cachedAt: number;
	fileSize?: number;
}

interface CacheMetadata {
	key: string;
	timestamp: number;
}

class OfflineDB {
	private dbName = 'SmartFood-Offline';
	private dbVersion = 1;
	private db: IDBDatabase | null = null;

	// Object store names
	private storesConfig = {
		stalls: 'stalls',
		foods: 'foods',
		audio: 'audio',
		metadata: 'metadata',
	};

	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => {
				console.error('IndexedDB open error:', request.error);
				reject(request.error);
			};

			request.onsuccess = () => {
				this.db = request.result;
				console.log('IndexedDB initialized successfully');
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Create stalls store
				if (!db.objectStoreNames.contains(this.storesConfig.stalls)) {
					const stallStore = db.createObjectStore(
						this.storesConfig.stalls,
						{ keyPath: 'id' }
					);
					stallStore.createIndex('streetId', 'streetId', {
						unique: false,
					});
					stallStore.createIndex('category', 'category', {
						unique: false,
					});
				}

				// Create foods store
				if (!db.objectStoreNames.contains(this.storesConfig.foods)) {
					const foodStore = db.createObjectStore(
						this.storesConfig.foods,
						{ keyPath: 'id' }
					);
					foodStore.createIndex('stallId', 'stallId', {
						unique: false,
					});
				}

				// Create audio store
				if (!db.objectStoreNames.contains(this.storesConfig.audio)) {
					const audioStore = db.createObjectStore(
						this.storesConfig.audio,
						{ keyPath: ['stallId', 'language'] }
					);
					audioStore.createIndex('stallId', 'stallId', {
						unique: false,
					});
				}

				// Create metadata store
				if (!db.objectStoreNames.contains(this.storesConfig.metadata)) {
					db.createObjectStore(this.storesConfig.metadata, {
						keyPath: 'key',
					});
				}

				console.log('Database schema created');
			};
		});
	}

	// Save stalls to cache
	async saveStalls(stalls: DBStall[]): Promise<void> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.stalls],
				'readwrite'
			);
			const store = transaction.objectStore(this.storesConfig.stalls);

			// Clear existing stalls
			store.clear();

			// Add new stalls
			stalls.forEach((stall) => {
				store.add(stall);
			});

			transaction.oncomplete = () => {
				console.log(`Saved ${stalls.length} stalls to cache`);
				this.updateSyncTime();
				resolve();
			};

			transaction.onerror = () => {
				reject(transaction.error);
			};
		});
	}

	// Get all cached stalls
	async getStalls(): Promise<DBStall[]> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.stalls],
				'readonly'
			);
			const store = transaction.objectStore(this.storesConfig.stalls);
			const request = store.getAll();

			request.onsuccess = () => {
				resolve(request.result as DBStall[]);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	// Get stalls by street ID
	async getStallsByStreet(streetId: number): Promise<DBStall[]> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.stalls],
				'readonly'
			);
			const store = transaction.objectStore(this.storesConfig.stalls);
			const index = store.index('streetId');
			const request = index.getAll(streetId);

			request.onsuccess = () => {
				resolve(request.result as DBStall[]);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	// Save foods to cache
	async saveFoods(foods: DBFood[]): Promise<void> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.foods],
				'readwrite'
			);
			const store = transaction.objectStore(this.storesConfig.foods);

			// Clear existing foods
			store.clear();

			// Add new foods
			foods.forEach((food) => {
				store.add(food);
			});

			transaction.oncomplete = () => {
				console.log(`Saved ${foods.length} foods to cache`);
				resolve();
			};

			transaction.onerror = () => {
				reject(transaction.error);
			};
		});
	}

	// Get foods by stall ID
	async getFoodsByStall(stallId: number): Promise<DBFood[]> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.foods],
				'readonly'
			);
			const store = transaction.objectStore(this.storesConfig.foods);
			const index = store.index('stallId');
			const request = index.getAll(stallId);

			request.onsuccess = () => {
				resolve(request.result as DBFood[]);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	// Get all foods
	async getAllFoods(): Promise<DBFood[]> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.foods],
				'readonly'
			);
			const store = transaction.objectStore(this.storesConfig.foods);
			const request = store.getAll();

			request.onsuccess = () => {
				resolve(request.result as DBFood[]);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	// Update sync timestamp
	private async updateSyncTime(): Promise<void> {
		if (!this.db) return;

		return new Promise((resolve) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.metadata],
				'readwrite'
			);
			const store = transaction.objectStore(this.storesConfig.metadata);

			store.put({
				key: 'lastSync',
				timestamp: Date.now(),
			});

			transaction.oncomplete = () => {
				resolve();
			};
		});
	}

	// Get last sync time
	async getLastSyncTime(): Promise<number> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.metadata],
				'readonly'
			);
			const store = transaction.objectStore(this.storesConfig.metadata);
			const request = store.get('lastSync');

			request.onsuccess = () => {
				const result = request.result as CacheMetadata | undefined;
				resolve(result?.timestamp ?? 0);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	// Check if cache exists and is valid (within 24 hours)
	async isCacheValid(): Promise<boolean> {
		try {
			const lastSync = await this.getLastSyncTime();
			const oneDayMs = 24 * 60 * 60 * 1000;
			return lastSync > 0 && Date.now() - lastSync < oneDayMs;
		} catch {
			return false;
		}
	}

	// Clear all data
	async clearAll(): Promise<void> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.stalls, this.storesConfig.foods, this.storesConfig.audio, this.storesConfig.metadata],
				'readwrite'
			);

			transaction.objectStore(this.storesConfig.stalls).clear();
			transaction.objectStore(this.storesConfig.foods).clear();
			transaction.objectStore(this.storesConfig.audio).clear();
			transaction.objectStore(this.storesConfig.metadata).clear();

			transaction.oncomplete = () => {
				console.log('Cache cleared');
				resolve();
			};

			transaction.onerror = () => {
				reject(transaction.error);
			};
		});
	}

	// Save audio to cache
	async saveAudio(stallId: number, language: string, audioData: DBAudio): Promise<void> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.audio],
				'readwrite'
			);
			const store = transaction.objectStore(this.storesConfig.audio);
			const request = store.put(audioData);

			request.onsuccess = () => {
				console.log(`Cached audio for stall ${stallId} (${language})`);
				resolve();
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	// Get audio by stall and language
	async getAudio(stallId: number, language: string = 'vi'): Promise<DBAudio | null> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.audio],
				'readonly'
			);
			const store = transaction.objectStore(this.storesConfig.audio);
			const request = store.get([stallId, language]);

			request.onsuccess = () => {
				resolve((request.result as DBAudio) || null);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	// Get all audio for a stall
	async getAudioByStall(stallId: number): Promise<DBAudio[]> {
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(
				[this.storesConfig.audio],
				'readonly'
			);
			const store = transaction.objectStore(this.storesConfig.audio);
			const index = store.index('stallId');
			const request = index.getAll(stallId);

			request.onsuccess = () => {
				resolve(request.result as DBAudio[]);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}
}

// Export singleton instance
export const offlineDB = new OfflineDB();
export type { DBStall, DBFood, DBAudio, CacheMetadata };
