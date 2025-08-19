import {
  decodeAnimated as decodeAnimatedWebp,
  init as initDecodeWebp,
} from "@jsquash/webp/decode";
import { encode as encodeGif, init as initGif } from "gifski-wasm";
import { printMsg } from "./print";
import { fetchFile } from "@ffmpeg/util";

/**
 * Converts a WebP file to a GIF file.
 *
 * @param {ArrayBuffer} arraybuf - The WebP file as an ArrayBuffer.
 * @return {Promise<{arrayBuffer: ArrayBuffer, data: Uint8Array, type: string}>} A promise that resolves with an ffmpeg-compatible file.
 */
export async function awebp2gif(arraybuf) {
  printMsg("Decoding animated WebP");
  await initDecodeWebp(null, {
    locateFile: (path) =>
      `https://cdn.jsdelivr.net/npm/@jsquash/webp@1.5.0-animated-webp-support-beta.2/codec/dec/${path}`,
  });

  const [frames] = await Promise.all([
    new Promise(async (resolve) => {
      const frames = await decodeAnimatedWebp(arraybuf);
      resolve(frames);
    }),
    new Promise(async (resolve) => {
      await initGif(
        "https://cdn.jsdelivr.net/npm/gifski-wasm@2.2.0/pkg/gifski_wasm_bg.wasm"
      );
      resolve();
    }),
  ]);

  printMsg("Converting to GIF");
  const res = await encodeGif({
    frames: frames.map((frame) => frame.imageData),
    width: frames[0].imageData.width,
    height: frames[0].imageData.height,
    frameDurations: frames.map((frame) => frame.duration),
  });
  printMsg("Done");
  const gif = res.buffer;
  return {
    // @ts-ignore
    arrayBuffer: gif,
    // @ts-ignore
    data: await fetchFile(new Blob([gif], { type: "image/gif" })),
    type: "image/gif",
  };
}
