/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: "/.well-known/discord",
				destination: "/.well-known/discord/index.html",
			},
		];
	},
};

module.exports = nextConfig;
