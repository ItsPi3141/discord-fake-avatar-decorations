import readline from "node:readline";

function extractInfo(collectibleCategories) {
  const transformCategory = (category) => ({
    n: category.name,
    d: category.summary,
    b: {
      i: `${category.name.toLowerCase().replaceAll(" ", "_")}`,
      t: `${category.name.toLowerCase().replaceAll(" ", "_")}`,
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
              .replaceAll(/['"’]/g, "")
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const hLine = () => Array(process.stdout.columns).fill("-").join("");

console.log("- Data is auto-validated, finishes when valid JSON is detected.");
console.log("- Enter ^C to quit.");
console.log("Paste data now");
console.log(hLine());
rl.prompt();
let json = "";
rl.on("line", (line) => {
  json += line;
  if (
    (() => {
      try {
        JSON.parse(json);
        return true;
      } catch (err) {
        if (err.toString().includes("not valid")) {
          console.log("Invalid JSON, please try again.");
          process.exit(1);
        }
        return false;
      }
    })()
  ) {
    rl.close();
    console.log(`\n\n${hLine()}\n\n`);
    extractInfo(JSON.parse(json));
  }
});
