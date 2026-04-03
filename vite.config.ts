import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		host: true, // hoặc '0.0.0.0'
		port: 5173,
		allowedHosts: [
			'b5c6-2402-800-63b8-fc74-7d0d-20cb-9020-69c1.ngrok-free.app',
		],
	},
});
