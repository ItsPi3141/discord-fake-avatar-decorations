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
		await ffmpeg.exec(["-i", `avatarpreview.${ext}`, "-vf", "scale=720:720:force_original_aspect_ratio=increase,crop=720:720", `avatarpreviewcropped.${ext}`]);

		const res = await ffmpeg.readFile(`avatarpreviewcropped.${ext}`);
		const reader = new FileReader();
		reader.readAsDataURL(new Blob([new Uint8Array(res.buffer, res.byteOffset, res.length)], { type: type }));
		reader.onload = () => {
			resolve(reader.result);
		};

		// ffmpeg.terminate();
	});
}
