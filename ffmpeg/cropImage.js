import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { getMimeTypeFromArrayBuffer } from "./utils";

// Crops image to fit in square aspect ratio
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
