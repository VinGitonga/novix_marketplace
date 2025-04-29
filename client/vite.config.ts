import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 5439,
		proxy: {
			"/moonspace": {
				target: "https://moonscape.tech",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/moonspace/, ""),
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
