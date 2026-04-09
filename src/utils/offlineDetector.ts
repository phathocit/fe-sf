/**
 * Offline detection and network state management
 */

type OfflineListener = (isOnline: boolean) => void;

class OfflineDetector {
	private isOnline: boolean = navigator.onLine;
	private listeners: Set<OfflineListener> = new Set();

	constructor() {
		this.setupListeners();
	}

	private setupListeners(): void {
		window.addEventListener('online', () => {
			console.log('✅ Network restored');
			this.setOnline(true);
		});

		window.addEventListener('offline', () => {
			console.log('❌ Network lost');
			this.setOnline(false);
		});
	}

	private setOnline(online: boolean): void {
		this.isOnline = online;
		this.notifyListeners();
	}

	private notifyListeners(): void {
		this.listeners.forEach((listener) => {
			listener(this.isOnline);
		});
	}

	// Subscribe to online/offline changes
	subscribe(listener: OfflineListener): () => void {
		this.listeners.add(listener);

		// Return unsubscribe function
		return () => {
			this.listeners.delete(listener);
		};
	}

	// Get current online status
	getOnlineStatus(): boolean {
		return this.isOnline;
	}

	// Check if currently offline
	isOffline(): boolean {
		return !this.isOnline;
	}
}

export const offlineDetector = new OfflineDetector();
