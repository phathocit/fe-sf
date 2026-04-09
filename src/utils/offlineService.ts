/**
 * Offline service initialization
 * Handles Service Worker registration and cache initialization
 */

import { offlineDB } from './offlineDB';
import { offlineDetector } from './offlineDetector';

class OfflineService {
	private isInitialized = false;

	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			// Initialize IndexedDB
			await offlineDB.init();
			console.log('✅ OfflineDB initialized');

			// Register Service Worker
			if ('serviceWorker' in navigator) {
				try {
					const registration = await navigator.serviceWorker.register(
						'/service-worker.js',
						{ scope: '/' }
					);
					console.log('✅ Service Worker registered:', registration);

					// Handle controller change
					navigator.serviceWorker.addEventListener('controllerchange', () => {
						console.log('Service Worker controller changed');
					});
				} catch (error) {
					console.error('❌ Service Worker registration failed:', error);
				}
			} else {
				console.warn('⚠️ Service Worker not supported in this browser');
			}

			// Initialize offline detector
			offlineDetector.subscribe((isOnline) => {
				this.handleOnlineStatusChange(isOnline);
			});

			this.isInitialized = true;
			console.log('✅ Offline service initialized');
		} catch (error) {
			console.error('❌ Failed to initialize offline service:', error);
		}
	}

	private async handleOnlineStatusChange(isOnline: boolean): Promise<void> {
		if (isOnline) {
			console.log('🔄 Syncing cache with server...');
			// Optional: Trigger sync when coming online
			// This could refresh data if needed
		}
	}
}

export const offlineService = new OfflineService();
