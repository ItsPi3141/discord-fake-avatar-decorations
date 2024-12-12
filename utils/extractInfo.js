function extractInfo(collectibleCategories) {
	const json = collectibleCategories.map((category) => ({
		name: category.name,
		description: category.summary,
		banner: {
			image: `/banners/${category.name.toLowerCase().replaceAll(" ", "_")}.png`,
			text: `/bannertext/${category.name.toLowerCase().replaceAll(" ", "_")}.png`,
			height: 50,
		},
		items: category.products
			.filter((p) => p.type === 0 || p.type === 2000)
			.flatMap((p) => {
				if (p.type === 0) {
					return {
						name: p.name,
						description: p.summary,
						file: `${p.name
							.toLowerCase()
							.replaceAll("'", "")
							.replaceAll(/[^A-Za-z0-9]+/g, "_")
							.replaceAll(/(^_|_$)/g, "")}.png`,
					};
				}
				if (p.type === 2000) {
					return p.variants
						.filter((p) => p.type === 0)
						.map((v) => ({
							name: v.name,
							description: v.summary,
							file: `${v.name
								.toLowerCase()
								.replaceAll("'", "")
								.replaceAll(/[^A-Za-z0-9]+/g, "_")
								.replaceAll(/(^_|_$)/g, "")}.png`,
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
