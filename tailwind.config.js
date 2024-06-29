/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				primary: "#5865f2",
				primaryAlt: "#4752c4",
				secondary: "#4e5058",
				secondaryAlt: "#6d6f78",
				secondaryLight: "#949ba4",
				surface0: "#111214",
				surface1: "#1e1f22",
				surface2: "#232428",
				surface3: "#2b2d31",
				surface4: "#313338",
				surface5: "#383a40",
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
