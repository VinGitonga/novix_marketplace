import path from "path";
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5439,
  },
  resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
