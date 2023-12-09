import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { getMimeTypeFromArrayBuffer } from "./utils";


/**
 * Crop the image to a square shape using FFmpeg.
 *
 * @param {FFmpeg} ffmpeg - The FFmpeg instance.
 * @param {String} url - The URL or B64 string of the image to crop.
 * @return {Promise} A promise that resolves with the cropped image data.
 */
export function cropToSquare(/** @type {FFmpeg} */ ffmpeg, /** @type {String} */ url) {
	return new Promise(async (resolve, reject) => {
		const data = await fetchFile(url);
		const type = getMimeTypeFromArrayBuffer(data);
		if (type == null) return false;

		const ext = type.replace("image/", "");
		await ffmpeg.writeFile(`avatarpreview.${ext}`, data);

		// run ffmpeg -i avatarpreview.png -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512" avatarpreviewcropped.png
		await ffmpeg.exec(["-i", `avatarpreview.${ext}`, "-vf", "scale=512:512:force_original_aspect_ratio=increase,crop=512:512", `avatarpreviewcropped.${ext}`]);

		const res = await ffmpeg.readFile(`avatarpreviewcropped.${ext}`);
		const reader = new FileReader();
		reader.readAsDataURL(new Blob([new Uint8Array(res.buffer, res.byteOffset, res.length)], { type: type }));
		reader.onload = () => {
			resolve(reader.result);
		};
	});
}
