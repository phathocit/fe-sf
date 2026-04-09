/**
 * Hook to fetch foods with offline cache support
 * Automatically falls back to cache when offline
 */

import { useState, useEffect, useCallback } from 'react';
import foodApi from '../api/foodApi';
import { offlineDB, type DBFood } from '../utils/offlineDB';
import { offlineDetector } from '../utils/offlineDetector';
import type { Food } from '../types/food.types';

interface UseOfflineFoodsOptions {
	stallId: number;
	autoSync?: boolean;
}

interface UseOfflineFoodsReturn {
	foods: Food[];
	loading: boolean;
	error: string | null;
	isOffline: boolean;
	isCached: boolean;
	refetch: () => Promise<void>;
}

export function useOfflineFoods({
	stallId,
	autoSync = true,
}: UseOfflineFoodsOptions): UseOfflineFoodsReturn {
	const [foods, setFoods] = useState<Food[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isOffline, setIsOffline] = useState(!navigator.onLine);
	const [isCached, setIsCached] = useState(false);

	const fetchFoods = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			if (offlineDetector.isOffline()) {
				// Offline - try to get from cache
				console.log('🔴 Offline - fetching foods from cache');
				const cachedFoods = await offlineDB.getFoodsByStall(stallId);

				if (cachedFoods.length > 0) {
					setFoods(cachedFoods as unknown as Food[]);
					setIsCached(true);
				} else {
					setError('No cached food data available.');
					setFoods([]);
				}
			} else {
				// Online - fetch from API and cache
				console.log('🟢 Online - fetching foods from API');
				const response = await foodApi.getByStallId(stallId);

				if (response.result) {
					// Save to cache
					const foodsToCache: DBFood[] = response.result.map((f) => ({
						id: Number(f.id),
						stallId: Number(f.stallId) || stallId,
						name: f.name,
						price: f.price,
						description: f.description,
						image: f.image,
						isAvailable: f.isAvailable ?? true,
					}));

					await offlineDB.saveFoods(foodsToCache);
					setFoods(response.result);
					setIsCached(false);
					console.log('✅ Foods cached:', foodsToCache.length);
				}
			}
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch foods';
			console.error('Error fetching foods:', errorMessage);
			setError(errorMessage);

			// Try fallback to cache on error
			try {
				const cachedFoods = await offlineDB.getFoodsByStall(stallId);
				if (cachedFoods.length > 0) {
					console.log('📦 Using cache as fallback for foods');
					setFoods(cachedFoods as unknown as Food[]);
					setIsCached(true);
					setError(null);
				}
			} catch (cacheErr) {
				console.error('Cache fallback failed:', cacheErr);
			}
		} finally {
			setLoading(false);
		}
	}, [stallId]);

	// Initial fetch
	useEffect(() => {
		fetchFoods();
	}, [fetchFoods]);

	// Subscribe to online/offline changes
	useEffect(() => {
		const unsubscribe = offlineDetector.subscribe((isOnline) => {
			console.log(isOnline ? '🟢 Online' : '🔴 Offline');
			setIsOffline(!isOnline);

			// Auto refetch when coming online if enabled
			if (isOnline && autoSync) {
				console.log('🔄 Auto-syncing foods cache...');
				fetchFoods();
			}
		});

		return unsubscribe;
	}, [fetchFoods, autoSync]);

	return {
		foods,
		loading,
		error,
		isOffline,
		isCached,
		refetch: fetchFoods,
	};
}
