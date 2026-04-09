/**
 * Service Worker for offline functionality
 * Caches API responses and serves them when offline
 */

const CACHE_VERSION = 'smartfood-v1';
const CACHE_URLS = [
	'/api/stalls',
	'/api/foods',
	'/api/stall-translations',
];

// Install event - cache important resources
self.addEventListener('install', (event: ExtendableEvent) => {
	console.log('Service Worker installing...');
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_VERSION);
			console.log('Cache opened:', CACHE_VERSION);
			// Pre-cache essential resources if needed
			self.skipWaiting(); // Activate immediately
		})()
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
	console.log('Service Worker activating...');
	event.waitUntil(
		(async () => {
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames.map((name) => {
					if (name !== CACHE_VERSION) {
						console.log('Deleting old cache:', name);
						return caches.delete(name);
					}
				})
			);
			// Take control of page immediately
			const clients = await (self as any).clients.matchAll();
			clients.forEach((client) => client.postMessage({ type: 'SKIP_WAITING' }));
		})()
	);
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event: FetchEvent) => {
	const { request } = event;
	const url = new URL(request.url);

	// Only handle API calls
	if (!url.pathname.startsWith('/api/')) {
		return;
	}

	// Skip non-GET requests (POST, PUT, DELETE)
	if (request.method !== 'GET') {
		return;
	}

	// Network first strategy for API calls
	event.respondWith(
		fetch(request)
			.then((response) => {
				// Cache successful responses
				if (response.ok) {
					const cache = caches.open(CACHE_VERSION);
					cache.then((c) => c.put(request, response.clone()));
				}
				return response;
			})
			.catch(() => {
				// Return cached response if network fails
				return caches.match(request).then((response) => {
					if (response) {
						console.log('Serving from cache:', request.url);
						return response;
					}

					// Return offline response
					return new Response(
						JSON.stringify({
							code: -1,
							message: 'Offline - No cached data available',
							result: null,
						}),
						{
							status: 503,
							headers: { 'Content-Type': 'application/json' },
						}
					);
				});
			})
	);
});

// Handle messages from main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
	if (event.data.type === 'CLEAR_CACHE') {
		caches.delete(CACHE_VERSION);
		console.log('Cache cleared by client');
	}
});

export {};
