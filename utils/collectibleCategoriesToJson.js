function collectibleCategoriesToJson(collectibleCategories) {
	return collectibleCategories.map((category) => ({
		name: category.name,
		description: category.summary,
		banner: {
			image: `/banners/${category.name.toLowerCase().replaceAll(" ", "_")}.png`,
			text: `/bannertext/${category.name.toLowerCase().replaceAll(" ", "_")}.png`,
			height: 50,
		},
		items: category.products
			.filter((p) => p.type === 0)
			.map((p) => ({
				name: p.name,
				description: p.summary,
				file: `${p.name
					.toLowerCase()
					.replaceAll("'", "")
					.replaceAll(/[^A-Za-z0-9]+/g, "_")
					.replaceAll(/(^_|_$)/g, "")}.png`,
			})),
	}));
}
