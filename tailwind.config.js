/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				primary: "hsl(234.935 85.556% 64.706%)",
				success: "#44a25b",
				warning: "#b98037",
				critical: "#d83a42",
				base: {
					low: "hsl(240 5.769% 20.392%)",
					lower: "hsl(240 5.263% 18.627%)",
					lowest: "hsl(240 5.882% 16.667%)",
				},
				surface: {
					overlay: "hsl(240 5.263% 7.451%)",
					high: "hsl(240 5.263% 22.353%)",
					higher: "hsl(240 5.691% 24.118%)",
					highest: "hsl(240 5.263% 26.078%)",
				},
				border: {
					normal: "hsl(240 4% 60.784% / 0.2)",
					faint: "hsl(240 4% 60.784% / 0.0392156862745098)",
					strong: "hsl(240 4% 60.784% / 0.4392156862745098)",
				},
				icon: {
					default: "hsl(0 0% 98.431%)",
					tertiary: "hsl(240 4.294% 68.039%)",
				},
				text: {
					default: "hsl(240 3.226% 93.922%)",
					muted: "hsl(240 4.294% 68.039%)",
					link: "hsl(213.659 83.673% 71.176%)",
					primary: "hsl(0 0% 100%)",
					secondary: "hsl(240 3.571% 78.039%)",
					positive: "hsl(130.769 37.143% 58.824%)",
					warning: "hsl(33.143 54.404% 62.157%)",
					critical: "hsl(0 100% 93.725%)",
				},
				button: {
					primary: {
						background: "hsl(234.935 85.556% 64.706%)",
						hover: "hsl(233.445 47.791% 51.176%)",
						active: "hsl(232.121 45.205% 42.941%)",
						border: "hsl(0 0% 100% / 0.1)",
					},
					secondary: {
						background: "hsl(240 4% 60.784% / 0.12156862745098039)",
						hover: "hsl(240 4% 60.784% / 0.2)",
						active: "hsl(240 5.882% 33.333% / 0.3)",
						border: "hsl(240 4% 60.784% / 0.0392156862745098)",
					},
				},
			},
		},
		screens: {
			xs: "440px",
			sm: "540px",
			md: "900px",
		},
	},
	plugins: [],
};
