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
				primary: "#5865f2",
				primaryAlt: "#4752c4",
				secondary: "#222225",
				secondaryAlt: "#2c2c30",
				secondaryLight: "#878790",
				surface0: "#121214",
				surface1: "#1e1f22",
				surface2: "#242429",
				surface3: "#2e2e34",
				surface4: "#303035",
				surface5: "#34343a",
				surface6: "#404046",
				surface7: "#48484e",
				error: "#d9373d",
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
