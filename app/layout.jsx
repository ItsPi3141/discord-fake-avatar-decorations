"use client";

import "./globals.css";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				<title>Discord Fake Avatar Decorations</title>
				<meta
					name="description"
					content="Get Discord avatar decorations without spending money"
				/>

				<meta
					property="og:type"
					content="website"
				/>
				<meta
					property="og:title"
					content="Discord Fake Avatar Decorations"
				/>
				<meta
					property="og:description"
					content="Get Discord avatar decorations without spending money"
				/>

				<meta
					name="twitter:title"
					content="Discord Fake Avatar Decorations"
				/>
				<meta
					name="twitter:description"
					content="Get Discord avatar decorations without spending money"
				/>
			</head>
			<body className="bg-surface4">{children}</body>
		</html>
	);
}
