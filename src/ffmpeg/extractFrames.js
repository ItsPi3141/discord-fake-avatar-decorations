import {
	arraybuffer2base64,
	ffmpegFetchAndConvert,
	getAPngDuration,
} from "./utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";

export function imagesFromGif(
	/** @type {FFmpeg} */ ffmpeg,
	/** @type {String} */ gifUrl,
) {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				const {
					arrayBuffer: dataAB,
					data,
					type,
				} = await ffmpegFetchAndConvert(await (await fetch(gifUrl)).blob());
				if (type == null) return reject("Invalid image type");
				const ext = type.replace("image/", "");

				if (ext === "png") {
					const duration = getAPngDuration(dataAB);
					if (duration < 0) return resolve([arraybuffer2base64(dataAB)]);
				}
				await ffmpeg.writeFile(`image.${ext}`, data);
				try {
					for (const file of (await ffmpeg.listDir("extract")).filter(
						(f) => !f.isDir,
					)) {
						await ffmpeg.deleteFile(`extract/${file.name}`);
					}
					await ffmpeg.deleteDir("extract");
				} catch {}
				try {
					await ffmpeg.createDir("extract");
				} catch {}
				await ffmpeg.exec([
					"-i",
					`image.${ext}`,
					"-vsync",
					"0",
					"extract/frame_%d.png",
				]);

				let frames = (await ffmpeg.listDir("extract"))
					.filter((f) => !f.isDir)
					.map((f) => f.name);
				frames = await Promise.all(
					frames.map(async (f) => {
						const res = await ffmpeg.readFile(`extract/${f}`);
						return arraybuffer2base64(res.buffer);
					}),
				);
				resolve(frames);
			} catch (e) {
				console.log(e);
			}
		})();
	});
}
