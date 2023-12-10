"use client";

import "./globals.css";
import "./components/modal.css";
import "./components/twemoji.css";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				{/* Meta tags */}
				<title>Discord Fake Avatar Decorations</title>
				<meta
					name="description"
					content="Get Discord avatar decorations without spending money"
				/>

				{/* Open Graph embeds */}
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
					property="og:image"
					content="https://discord-decorations.netlify.app/android-chrome-192x192.png"
				/>

				{/* Twitter embeds */}
				<meta
					name="twitter:card"
					content="summary"
				/>
				<meta
					name="twitter:title"
					content="Discord Fake Avatar Decorations"
				/>
				<meta
					name="twitter:description"
					content="Get Discord avatar decorations without spending money"
				/>
				<meta
					property="twitter:image"
					content="https://discord-decorations.netlify.app/android-chrome-192x192.png"
				/>

				{/* Favicon */}
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link
					rel="manifest"
					href="/site.webmanifest"
				/>
			</head>
			<body className="bg-surface4">{children}</body>
		</html>
	);
}
