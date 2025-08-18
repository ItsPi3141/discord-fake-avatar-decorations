import fs from "node:fs";
import path from "node:path";

const files = fs.readdirSync(path.resolve(process.cwd(), "dist", "assets"));
for (const file of files) {
  if (file.endsWith(".wasm")) {
    console.log("Removing", file);
    fs.rmSync(path.resolve(process.cwd(), "dist", "assets", file));
  }
}

const assetDirs = [
  "assets/animations",
  "avatars",
  "backgrounds",
  "banners",
  "bannertext",
  "decorations",
  "mdecorations",
  "nameplates",
];
for (const dir of assetDirs) {
  console.log("Removing", dir);
  fs.rmSync(path.resolve(process.cwd(), "dist", dir), { recursive: true });
}
