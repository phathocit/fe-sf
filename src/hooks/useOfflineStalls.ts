/**
 * Hook to fetch stalls with offline cache support
 * Automatically falls back to cache when offline
 */

import { useState, useEffect, useCallback } from 'react';
import stallApi from '../api/stallApi';
import { offlineDB, type DBStall } from '../utils/offlineDB';
import { offlineDetector } from '../utils/offlineDetector';
import type { Stall } from '../types/stall.types';

interface UseOfflineStallsOptions {
	streetId: number;
	autoSync?: boolean;
}

interface UseOfflineStallsReturn {
	stalls: Stall[];
	loading: boolean;
	error: string | null;
	isOffline: boolean;
	isCached: boolean;
	refetch: () => Promise<void>;
}

export function useOfflineStalls({
	streetId,
	autoSync = true,
}: UseOfflineStallsOptions): UseOfflineStallsReturn {
	const [stalls, setStalls] = useState<Stall[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isOffline, setIsOffline] = useState(!navigator.onLine);
	const [isCached, setIsCached] = useState(false);

	const fetchStalls = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			if (offlineDetector.isOffline()) {
				// Offline - try to get from cache (all stalls)
				console.log('🔴 Offline - fetching from cache');
				const cachedStalls = await offlineDB.getStalls();

				if (cachedStalls.length > 0) {
					setStalls(cachedStalls as unknown as Stall[]);
					setIsCached(true);
				} else {
					setError('No cached data available. Please connect to internet first.');
					setStalls([]);
				}
			} else {
				// Online - fetch from API and cache
				// Using getAllActive() instead of getByStreetId() for public access
				console.log('🟢 Online - fetching from API');
				const response = await stallApi.getAllActive();

				if (response.result) {
					// Filter by street ID if needed, or cache all
					const allStalls = response.result;
					
					// Save to cache - convert string coordinates to numbers
					const stallsToCache: DBStall[] = allStalls.map((s) => ({
						id: Number(s.id),
						name: s.name,
						category: s.category || '',
						latitude: Number(s.latitude),
						longitude: Number(s.longitude),
						image: s.image,
						isActive: s.isActive ?? true,
						streetId: s.streetId || streetId,
						vendorId: s.vendorId || 0,
					}));

					await offlineDB.saveStalls(stallsToCache);
					setStalls(allStalls);
					setIsCached(false);
					console.log('✅ Stalls cached:', stallsToCache.length);
				}
			}
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stalls';
			console.error('Error fetching stalls:', errorMessage);
			setError(errorMessage);

			// Try fallback to cache on error
			try {
				const cachedStalls = await offlineDB.getStalls();
				if (cachedStalls.length > 0) {
					console.log('📦 Using cache as fallback');
					setStalls(cachedStalls as unknown as Stall[]);
					setIsCached(true);
					setError(null);
				}
			} catch (cacheErr) {
				console.error('Cache fallback failed:', cacheErr);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	// Initial fetch
	useEffect(() => {
		fetchStalls();
	}, [fetchStalls]);

	// Subscribe to online/offline changes
	useEffect(() => {
		const unsubscribe = offlineDetector.subscribe((isOnline) => {
			console.log(isOnline ? '🟢 Online' : '🔴 Offline');
			setIsOffline(!isOnline);

			// Auto refetch when coming online if enabled
			if (isOnline && autoSync) {
				console.log('🔄 Auto-syncing cache...');
				fetchStalls();
			}
		});

		return unsubscribe;
	}, [fetchStalls, autoSync]);

	return {
		stalls,
		loading,
		error,
		isOffline,
		isCached,
		refetch: fetchStalls,
	};
}
