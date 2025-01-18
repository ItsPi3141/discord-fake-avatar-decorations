function extractInfo(collectibleCategories) {
	const json = collectibleCategories.map((category) => ({
		n: category.name,
		d: category.summary,
		b: {
			i: `${category.name.toLowerCase().replaceAll(" ", "_")}.png`,
			t: `${category.name.toLowerCase().replaceAll(" ", "_")}.png`,
			h: 50,
		},
		i: category.products
			.filter((p) => p.type === 0 || p.type === 2000)
			.flatMap((p) => {
				if (p.type === 0) {
					return {
						n: p.name,
						d: p.summary,
						f: p.name
							.toLowerCase()
							.replaceAll("'", "")
							.replaceAll(/[^A-Za-z0-9]+/g, "_")
							.replaceAll(/(^_|_$)/g, ""),
					};
				}
				if (p.type === 2000) {
					return p.variants
						.filter((p) => p.type === 0)
						.map((v) => ({
							n: v.name,
							d: v.summary,
							f: v.name
								.toLowerCase()
								.replaceAll("'", "")
								.replaceAll(/[^A-Za-z0-9]+/g, "_")
								.replaceAll(/(^_|_$)/g, ""),
						}));
				}
			}),
	}));
	const createLink = (asset, name) =>
		`https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=1024&name=${name}.png`;
	const links = collectibleCategories.map((category) =>
		category.products
			.filter((p) => p.type === 0 || p.type === 2000)
			.flatMap((p) => {
				if (p.type === 0) {
					return createLink(
						p.items[0].asset,
						p.name
							.toLowerCase()
							.replaceAll("'", "")
							.replaceAll(/[^A-Za-z0-9]+/g, "_")
							.replaceAll(/(^_|_$)/g, ""),
					);
				}
				if (p.type === 2000) {
					return p.variants
						.filter((p) => p.type === 0)
						.map((v) =>
							createLink(
								v.items[0].asset,
								v.name
									.toLowerCase()
									.replaceAll("'", "")
									.replaceAll(/[^A-Za-z0-9]+/g, "_")
									.replaceAll(/(^_|_$)/g, ""),
							),
						);
				}
			})
			.join("\n"),
	);
	console.log(json);
	console.log(links);
}

let token = null;
function getInfoBySKU(sku) {
	const createLink = (asset, name) =>
		`https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=1024&name=${name}.png`;
	return new Promise((resolve, reject) => {
		(async () => {
			if (!token) {
				webpackChunkdiscord_app.push([
					[crypto.randomUUID()],
					{},
					(webpackRequire) => {
						token = Object.values(webpackRequire.c)
							.find((module) => module?.exports?.default?.getToken !== void 0)
							.exports.default.getToken();
					},
				]);
			}
			while (!token) {
				await new Promise((r) => setTimeout(r, 100));
			}
			fetch(`https://discord.com/api/v9/collectibles-products/${sku}`, {
				headers: {
					Authorization: token,
				},
			})
				.then((r) => r.json())
				.then((j) =>
					resolve(
						console.log(
							{
								n: j.name,
								d: j.summary,
								f: j.name
									.toLowerCase()
									.replaceAll("'", "")
									.replaceAll(/[^A-Za-z0-9]+/g, "_")
									.replaceAll(/(^_|_$)/g, ""),
							},
							createLink(
								j.items[0].asset,
								j.name
									.toLowerCase()
									.replaceAll("'", "")
									.replaceAll(/[^A-Za-z0-9]+/g, "_")
									.replaceAll(/(^_|_$)/g, ""),
							),
						),
					),
				)
				.catch(reject);
		})();
	});
}
