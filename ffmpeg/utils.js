import { printErr } from "@/app/print";
import { fetchFile } from "@ffmpeg/util";
import { ImageMagick, MagickFormat } from "@imagemagick/magick-wasm";
import parseAPNG from "apng-js";

/**
 * Retrieves the MIME type of an ArrayBuffer or Uint8Array.
 *
 * @param {Uint8Array | ArrayBuffer} arrayBuffer - The input ArrayBuffer or Uint8Array.
 * @return {string | null} The MIME type of the input data, or null if it is not recognized.
 */
export function getMimeTypeFromArrayBuffer(
	/** @type {Uint8Array | ArrayBuffer} */ arrayBuffer,
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

/**
 * Calculates the duration of an APNG file. Returns 0 if the provided PNG file is not an APNG.
 *
 * @param {ArrayBuffer} arraybuf - The APNG file as an ArrayBuffer.
 * @return {number} The duration of the APNG file in seconds.
 */
export function getAPngDuration(arraybuf) {
	const apng = parseAPNG(arraybuf);
	if (apng instanceof Error) {
		return 1;
	}
	return apng.playTime / 1000;
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
 * @return {Promise<Uint8Array>} A promise that resolves with the converted GIF file as a Blob.
 */
export async function webp2png(arraybuf) {
	return new Promise((resolve) => {
		ImageMagick.read(new Uint8Array(arraybuf), MagickFormat.WebP, (image) => {
			image.write(MagickFormat.Png, resolve);
		});
	});
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

	const convertedAb = await webp2png(ab);
	return {
		arrayBuffer: convertedAb,
		data: await fetchFile(new Blob([convertedAb])),
		type: "image/png",
	};
}
