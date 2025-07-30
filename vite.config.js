import path from "node:path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { meta } from "vite-plugin-meta-tags";
import { generateWebmanifest } from "./build/generateWebmanifest";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	plugins: [
		preact({
			prerender: {
				enabled: true,
				renderTarget: "#app",
				additionalPrerenderRoutes: ["/404", "/discuss", "/gif-extractor"],
				previewMiddlewareEnabled: true,
				previewMiddlewareFallback: "/404",
			},
		}),
		tailwindcss(),
		meta({
			title: "Fake Discord Avatar Decorations",
			description: "Get Discord avatar decorations for free!",
			img: `${process.env.VITE_BASE_IMAGE_URL || "https://discord-decorations.vercel.app"}/android-chrome-192x192.png`,
		}),
		{
			name: "generate-webmanifest",
			generateBundle() {
				this.emitFile({
					type: "asset",
					fileName: "site.webmanifest",
					source: generateWebmanifest(),
				});
			},
		},
	],
	optimizeDeps: {
		exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
	},
});
