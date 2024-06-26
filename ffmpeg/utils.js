import { printErr } from "@/app/print";

/**
 * Retrieves the MIME type of an ArrayBuffer or Uint8Array.
 *
 * @param {Uint8Array | ArrayBuffer} arrayBuffer - The input ArrayBuffer or Uint8Array.
 * @return {string | null} The MIME type of the input data, or null if it is not recognized.
 */
export function getMimeTypeFromArrayBuffer(/** @type {Uint8Array | ArrayBuffer} */ arrayBuffer) {
	const uint8arr = new Uint8Array(arrayBuffer);

	const len = 4;
	if (uint8arr.length >= len) {
		let signatureArr = new Array(len);
		for (let i = 0; i < len; i++) signatureArr[i] = uint8arr[i].toString(16);
		const signature = signatureArr.join("").toUpperCase();

		switch (true) {
			case signature === "89504E47":
				return "image/png";
			case signature === "47494638":
				return "image/gif";
			case signature.startsWith("FFD8FF"):
				return "image/jpeg";
			default:
				printErr(`Unknown file type. Signature: ${signature}`);
				return null;
		}
	}
	return null;
}
