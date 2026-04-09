import { useState, useEffect, useCallback, useRef } from 'react';
import audioApi from '../api/audioApi';
import { offlineDB } from '../utils/offlineDB';
import { offlineDetector } from '../utils/offlineDetector';

// Type is used internally, no need to export in import

interface UseOfflineAudioResult {
	audioUrl: string | null;
	loading: boolean;
	error: string | null;
	isOffline: boolean;
	isCached: boolean;
	audioStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR' | null;
	refetch: () => Promise<void>;
}

export function useOfflineAudio(
	stallId: number,
	language: string = 'vi'
): UseOfflineAudioResult {
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isOffline, setIsOffline] = useState(offlineDetector.isOffline());
	const [isCached, setIsCached] = useState(false);
	const [audioStatus, setAudioStatus] = useState<
		'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR' | null
	>(null);

	const unsubscribeRef = useRef<(() => void) | null>(null);

	// Fetch audio from API or cache
	const fetchAudio = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// If offline, try to get from cache
			if (isOffline) {
				const cachedAudio = await offlineDB.getAudio(stallId, language);
				if (cachedAudio && cachedAudio.status === 'COMPLETED') {
					setAudioUrl(cachedAudio.audioUrl);
					setAudioStatus(cachedAudio.status);
					setIsCached(true);
					setLoading(false);
					return;
				}
				// No cache available
				setError('No cached audio available. Please connect to internet first.');
				setLoading(false);
				return;
			}

			// Online - fetch from API
			try {
				const res = await audioApi.getStallAudio(stallId, language);

				if (res.result) {
					const audioData = res.result;
					setAudioUrl(audioData.audioUrl);
					setAudioStatus(audioData.status);

					// Cache the audio if status is COMPLETED
					if (audioData.status === 'COMPLETED') {
						await offlineDB.saveAudio(stallId, language, {
							stallId,
							language,
							audioUrl: audioData.audioUrl,
							audioHash: audioData.audioHash || '',
							status: audioData.status,
							cachedAt: Date.now(),
							fileSize: audioData.fileSize,
						});
						setIsCached(true);
					}
				} else {
					setError('No audio available for this stall');
					setAudioStatus(null);
				}
			} catch (apiError) {
				console.error('API error:', apiError);
				// Try to fall back to cache if API fails
				const cachedAudio = await offlineDB.getAudio(stallId, language);
				if (cachedAudio && cachedAudio.status === 'COMPLETED') {
					setAudioUrl(cachedAudio.audioUrl);
					setAudioStatus(cachedAudio.status);
					setIsCached(true);
				} else {
					setError('Failed to fetch audio. No cache available.');
					setAudioStatus(null);
				}
			}
		} catch (err) {
			console.error('Audio fetch error:', err);
			setError('Error loading audio');
			setAudioStatus(null);
		} finally {
			setLoading(false);
		}
	}, [stallId, language, isOffline]);

	// Subscribe to offline status changes
	useEffect(() => {
		unsubscribeRef.current = offlineDetector.subscribe((status) => {
			setIsOffline(status);
		});

		return () => {
			unsubscribeRef.current?.();
		};
	}, []);

	// Fetch audio on mount and when stallId/language changes
	useEffect(() => {
		fetchAudio();
	}, [fetchAudio]);

	// Auto-refetch when coming online
	useEffect(() => {
		if (!isOffline && isCached) {
			// Optionally refresh from API when coming online
			fetchAudio();
		}
	}, [isOffline, isCached, fetchAudio]);

	const refetch = useCallback(async () => {
		await fetchAudio();
	}, [fetchAudio]);

	return {
		audioUrl,
		loading,
		error,
		isOffline,
		isCached,
		audioStatus,
		refetch,
	};
}
