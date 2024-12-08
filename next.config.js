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
	sassOptions: {
		silenceDeprecations: ["legacy-js-api"],
	},
};

module.exports = nextConfig;
