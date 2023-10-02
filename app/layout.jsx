import "./globals.css";

export const metadata = {
	title: "Discord Fake Avatar Decorations",
	description: "Get Discord avatar decorations without spending money"
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head></head>
			<body className="bg-surface4">{children}</body>
		</html>
	);
}
