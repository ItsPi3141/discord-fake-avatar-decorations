function extractInfo(collectibleCategories) {
  const transformCategory = (category) => ({
    n: category.name,
    d: category.summary,
    b: `${category.name.toLowerCase().replaceAll(" ", "_")}`,
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
  });
  const transformLinks = (category) =>
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
              .replaceAll(/(^_|_$)/g, "")
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
                  .replaceAll(/(^_|_$)/g, "")
              )
            );
        }
      })
      .join("\n");

  const createLink = (asset, name) =>
    `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=1024&name=${name}.png`;

  let json;
  let links;

  if (collectibleCategories?.length) {
    json = collectibleCategories.map(transformCategory);
    links = collectibleCategories.map(transformLinks);
  } else if (collectibleCategories.products?.length) {
    json = transformCategory(collectibleCategories);
    links = transformLinks(collectibleCategories);
  } else {
    throw new Error("Invalid data");
  }
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
                  .replaceAll(/(^_|_$)/g, "")
              )
            )
          )
        )
        .catch(reject);
    })();
  });
}
