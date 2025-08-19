import { printErr, printMsg } from "@/utils/print";
import { downloadWithProgress } from "@/utils/download";
import { storeData } from "@/utils/dataHandler";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

import {
  decodeAnimated as decodeAnimatedWebp,
  init as initDecodeWebp,
} from "@jsquash/webp/decode";
import { encode as encodeGif, init as initGif } from "gifski-wasm";

export let /** @type {FFmpeg} */ ffmpeg;
export const setFfmpeg = (/** @type {FFmpeg} */ f) => (ffmpeg = f);

export const initFfmpeg = async (onProgress) => {
  const ffmpegBaseUrl =
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/";
  const ffmpegMtBaseUrl =
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm/";

  if (
    typeof SharedArrayBuffer === "undefined" ||
    (navigator.userAgent.includes("Chrome/") &&
      window.location.hostname === "localhost")
  ) {
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${ffmpegBaseUrl}ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: onProgress
        ? URL.createObjectURL(
            new Blob(
              [
                await downloadWithProgress(
                  `${ffmpegBaseUrl}ffmpeg-core.wasm`,
                  onProgress
                ),
              ],
              { type: "application/wasm" }
            )
          )
        : await toBlobURL(
            `${ffmpegBaseUrl}ffmpeg-core.wasm`,
            "application/wasm"
          ),
    });
  } else {
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${ffmpegMtBaseUrl}ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: onProgress
        ? URL.createObjectURL(
            new Blob(
              [
                await downloadWithProgress(
                  `${ffmpegMtBaseUrl}ffmpeg-core.wasm`,
                  onProgress
                ),
              ],
              { type: "application/wasm" }
            )
          )
        : await toBlobURL(
            `${ffmpegMtBaseUrl}ffmpeg-core.wasm`,
            "application/wasm"
          ),
      workerURL: await toBlobURL(
        `${ffmpegMtBaseUrl}ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
  }
  ffmpeg.on("log", (e) =>
    printMsg(
      ["ffmpeg", e.message],
      [
        {
          color: "white",
          background: "#5765f2",
          padding: "2px 8px",
          borderRadius: "10px",
        },
      ]
    )
  );
  storeData("ffmpeg", ffmpeg);
};

/**
 * Retrieves the MIME type of an ArrayBuffer or Uint8Array.
 *
 * @param {Uint8Array | ArrayBuffer} arrayBuffer - The input ArrayBuffer or Uint8Array.
 * @return {string | null} The MIME type of the input data, or null if it is not recognized.
 */
export function getMimeTypeFromArrayBuffer(
  /** @type {Uint8Array | ArrayBuffer} */ arrayBuffer
) {
  const uint8arr = new Uint8Array(arrayBuffer);

  const len = 12;
  if (uint8arr.length >= len) {
    const signatureArr = new Array(len);
    for (let i = 0; i < len; i++) signatureArr[i] = uint8arr[i].toString(16);
    const signature = signatureArr.join("").toUpperCase();

    switch (true) {
      // 89 50 4E 47 0D 0A 1A 0A
      case signature.startsWith("89504E47"):
        return "image/png";
      // 47 49 46 38 ?? 61
      case signature.startsWith("47494638"):
        return "image/gif";
      // FF D8 FF E0 ?? ??
      case signature.startsWith("FFD8FF"):
        return "image/jpeg";
      // 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
      case signature.startsWith("52494646") && signature.includes("57454250"):
        return "image/webp";
      default:
        printErr(`Unknown file type. Signature: ${signature}`);
        return null;
    }
  }
  return null;
}

// https://stackoverflow.com/a/74236879

/**
 * Calculates the duration of a GIF file.
 *
 * @param {ArrayBuffer} arraybuf - The GIF file as an ArrayBuffer.
 * @return {number} The duration of the GIF file in seconds.
 */
export function getGifDuration(arraybuf) {
  const uint8 = new Uint8Array(arraybuf);
  let duration = 0;
  for (let i = 0, len = uint8.length; i < len; i++) {
    if (
      uint8[i] === 0x21 &&
      uint8[i + 1] === 0xf9 &&
      uint8[i + 2] === 0x04 &&
      uint8[i + 7] === 0x00
    ) {
      const delay = (uint8[i + 5] << 8) | (uint8[i + 4] & 0xff);
      duration += delay < 2 ? 10 : delay;
    }
  }
  return duration / 100;
}

export function arraybuffer2base64(arraybuffer) {
  try {
    let binary = "";
    const bytes = new Uint8Array(arraybuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    return "";
  }
}

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

/**
 * Fetches and converts an image file to a format that ffmpeg supports.
 *
 * @param {Blob} blob - The image file as a Blob.
 * @return {Promise<{arrayBuffer: ArrayBuffer, data: Uint8Array, type: string}>} A promise that resolves with the converted image file.
 */
export async function ffmpegFetchAndConvert(blob) {
  const ab = await blob.arrayBuffer();
  const type = getMimeTypeFromArrayBuffer(ab);
  if (type == null) throw new Error("Invalid image type");

  if (type !== "image/webp") {
    return {
      arrayBuffer: ab,
      data: await fetchFile(blob),
      type,
    };
  }

  const u8arr = new Uint8Array(ab);
  const isAnimated = u8arr.slice(30, 34).join("") === "65787377";
  if (!isAnimated) {
    return {
      arrayBuffer: ab,
      data: await fetchFile(blob),
      type,
    };
  }

  return await awebp2gif(ab);
}
