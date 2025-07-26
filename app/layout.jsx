import "./globals.css";

import "./components/modal.css";
import "./components/twemoji.css";

import { FontPreloader } from "./components/fontpreload.jsx";
import { Utils } from "./components/utils";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				{/* Meta tags */}
				<title>Fake Discord Avatar Decorations</title>
				<meta
					name="description"
					content="Get Discord avatar decorations for free!"
				/>

				{/* Open Graph embeds */}
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Fake Discord Avatar Decorations" />
				<meta
					property="og:description"
					content="Get Discord avatar decorations for free!"
				/>
				<meta
					property="og:image"
					content={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "https://discord-decorations.vercel.app"}/android-chrome-192x192.png`}
				/>

				{/* Twitter embeds */}
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:title" content="Fake Discord Avatar Decorations" />
				<meta
					name="twitter:description"
					content="Get Discord avatar decorations for free!"
				/>
				<meta
					property="twitter:image"
					content={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "https://discord-decorations.vercel.app"}/android-chrome-192x192.png`}
				/>

				{/* Favicon */}
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL || ""}/apple-touch-icon.png`}
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL || ""}/favicon-32x32.png`}
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL || ""}/favicon-16x16.png`}
				/>
				<link rel="manifest" href="/site.webmanifest" />

				{/* Fonts */}
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/gh/itspi3141/discord-fonts/font.css"
				/>
			</head>
			<body className="bg-base-lower overflow-x-hidden">
				{children}
				<FontPreloader />
				<Utils />
			</body>
		</html>
	);
}
