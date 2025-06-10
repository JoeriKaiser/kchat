import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { barrel } from "vite-plugin-barrel";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
	plugins: [
		tailwindcss(),
		solidPlugin(),
		barrel({
			packages: ["lucide-solid"],
		}),
	],
	server: { port: 3000 },
	build: { target: "esnext" },
});
