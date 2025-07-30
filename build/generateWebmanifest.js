const base = process.env.VITE_BASE_IMAGE_URL || "";

export const generateWebmanifest = (outPath) => {
	return JSON.stringify({
		name: "Discord Fake Avatar Decorations",
		short_name: "Discord Decorations",
		icons: [
			{
				src: `${base}/android-chrome-192x192.png`,
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: `${base}/android-chrome-512x512.png`,
				sizes: "512x512",
				type: "image/png",
			},
		],
		theme_color: "#5865f2",
		background_color: "#2d2d32",
		display: "standalone",
	});
};
