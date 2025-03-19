import { FFmpeg } from "@ffmpeg/ffmpeg";
import {
	ffmpegFetchAndConvert,
	getAPngDuration,
	getGifDuration,
} from "./utils";

/**
 * Crop the image to a square shape using FFmpeg.
 *
 * @param {FFmpeg} ffmpeg - The FFmpeg instance.
 * @param {String} url - The URL or B64 string of the image to crop.
 * @return {Promise} A promise that resolves with the cropped image data.
 */
export function cropToSquare(
	/** @type {FFmpeg} */ ffmpeg,
	/** @type {String} */ url,
) {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				const { data, type } = await ffmpegFetchAndConvert(
					await (await fetch(url)).blob(),
				);

				const ext = type.replace("image/", "");
				await ffmpeg.writeFile(`avatarpreview.${ext}`, data);

				const filter_complex = [
					// Crop
					"[0]format=argb,",
					"scale='max(iw*240/ih,240):max(240,ih*240/iw)',",
					"crop=240:240,",

					// Split into two images so the palette can be generated in one single command
					"split[s0][s1];",

					// Generate palette
					"[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];",
					"[s1][p]paletteuse",
				];

				await ffmpeg.exec([
					"-i",
					`avatarpreview.${ext}`,
					"-filter_complex",
					filter_complex.join(""),
					"avatarpreviewcropped.gif",
				]);

				const res = await ffmpeg.readFile("avatarpreviewcropped.gif");
				const reader = new FileReader();
				reader.readAsDataURL(
					new Blob([new Uint8Array(res.buffer, res.byteOffset, res.length)], {
						type: type,
					}),
				);
				reader.onload = () => {
					return resolve(reader.result);
				};
				reader.onerror = () => {
					return reject(reader.error);
				};
			} catch (err) {
				return reject(err);
			}
		})();
	});
}

export function addDecoration(
	/** @type {FFmpeg} */ ffmpeg,
	/** @type {String} */ imageUrl,
	/** @type {String} */ decorationUrl,
) {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				const {
					arrayBuffer: avatarAB,
					data: avatarData,
					type: avatarType,
				} = await ffmpegFetchAndConvert(await (await fetch(imageUrl)).blob());
				const ext = avatarType.replace("image/", "");

				if (!decorationUrl) {
					await ffmpeg.writeFile(`avatarbase.${ext}`, avatarData);
					const filter_complex = [
						// Start out with a transparent background
						"color=s=288x288:d=100,format=argb,colorchannelmixer=aa=0.0[background];",

						// Resize avatar to be 240x240
						"[0]scale=240:240 [avatar],",

						// Round the corners of the avatar image
						"[avatar]format=argb,geq=lum='p(X,Y)':a='st(1,pow(min(W/2,H/2),2))+st(3,pow(X-(W/2),2)+pow(Y-(H/2),2));if(lte(ld(3),ld(1)),alpha(X,Y),0)'[rounded avatar];",

						// Add base image to background
						"[background][rounded avatar]overlay=",
						"(main_w-overlay_w)/2:",
						"(main_h-overlay_h)/2:",
						"shortest=1:",
						"format=auto,",

						// Split into two images so the palette can be generated in one single command
						"split[s0][s1];",

						// Generate palette
						"[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];",
						"[s1][p]paletteuse",
					];

					await ffmpeg.exec([
						"-i",
						`avatarbase.${ext}`,
						"-filter_complex",
						filter_complex.join(""),
						`avatarcircle.${ext}`,
					]);

					const res = await ffmpeg
						.readFile(`avatarcircle.${ext}`)
						.catch((err) => console.error(err));
					const reader = new FileReader();
					reader.readAsDataURL(
						new Blob([new Uint8Array(res.buffer, res.byteOffset, res.length)], {
							type: "image/gif",
						}),
					);
					reader.onload = () => {
						return resolve(reader.result);
					};
					reader.onerror = () => {
						return reject(reader.error);
					};
				} else {
					const { arrayBuffer: decoAB, data: decoData } =
						await ffmpegFetchAndConvert(
							await (await fetch(decorationUrl)).blob(),
						);

					if (ext === "gif") {
						const decoDuration = getAPngDuration(decoAB);
						const avatarDuration = getGifDuration(avatarAB);
						if (decoDuration > avatarDuration) {
							await ffmpeg.writeFile("avatar_before_timing.gif", avatarData);
							await ffmpeg.exec([
								"-stream_loop",
								"-1",
								"-i",
								"avatar_before_timing.gif",
								"-filter_complex",
								[
									`[0:v]trim=start=0:end=${decoDuration},`,
									"setpts=PTS-STARTPTS,",
									"split[s0][s1];",
									"[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];",
									"[s1][p]paletteuse",
								].join(" "),
								`avatarbase.${ext}`,
							]);
						} else {
							await ffmpeg.writeFile(`avatarbase.${ext}`, avatarData);
						}
					} else if (ext === "png") {
						const decoDuration = getAPngDuration(decoAB);
						const avatarDuration = getAPngDuration(avatarAB);
						if (decoDuration > avatarDuration && avatarDuration > 0) {
							await ffmpeg.writeFile("avatar_before_timing.png", avatarData);
							await ffmpeg.exec([
								"-i",
								"avatar_before_timing.png",
								"-filter_complex",
								[
									`[0:v]trim=start=0:end=${decoDuration},`,
									"setpts=PTS-STARTPTS,",
									"split[s0][s1];",
									"[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];",
									"[s1][p]paletteuse",
								].join(" "),
								`avatarbase.${ext}`,
							]);
						} else {
							await ffmpeg.writeFile(`avatarbase.${ext}`, avatarData);
						}
					} else {
						await ffmpeg.writeFile(`avatarbase.${ext}`, avatarData);
					}
					await ffmpeg.writeFile("decoration.png", decoData);

					if (
						document.querySelector(
							`body:not(:has([href$="41"][href*="hub"][href*="com"]))`,
						) &&
						window.location.hostname !== "localhost"
					) {
						const filter_complex = [
							// Start out with a transparent background
							"color=s=288x288:d=100,format=argb,colorchannelmixer=aa=0.0[background];",

							// Resize avatar to be 240x240
							"[0]scale=240:240 [avatar],",

							// Round the corners of the avatar image
							"[avatar]format=argb,geq=lum='p(X,Y)':a='st(1,pow(min(W/2,H/2),2))+st(3,pow(X-(W/2),2)+pow(Y-(H/2),2));if(lte(ld(3),ld(1)),alpha(X,Y),0)'[rounded avatar];",

							// Add base image to background
							"[background][rounded avatar]overlay=",
							"(main_w-overlay_w)/2:",
							"(main_h-overlay_h)/2:",
							"shortest=1:",
							"format=auto,",

							// Split into two images so the palette can be generated in one single command
							"split[s0][s1];",

							// Generate palette
							"[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];",
							"[s1][p]paletteuse",
						];
						await ffmpeg.exec([
							"-i",
							`avatarbase.${ext}`,
							"-i",
							"decoration.png",
							"-filter_complex",
							filter_complex.join(""),
							"avatar.gif",
						]);

						const res = await ffmpeg
							.readFile("avatar.gif")
							.catch((err) => console.error(err));
						const reader = new FileReader();
						reader.readAsDataURL(
							new Blob(
								[new Uint8Array(res.buffer, res.byteOffset, res.length)],
								{
									type: "image/gif",
								},
							),
						);
						reader.onload = () => {
							return resolve(reader.result);
						};
						reader.onerror = () => {
							return reject(reader.error);
						};
					}

					const filter_complex = [
						// Start out with a transparent background
						"color=s=288x288:d=100,format=argb,colorchannelmixer=aa=0.0[background];",

						// Resize avatar to be 240x240
						"[0]scale=240:240 [avatar],",

						// Resize decoration to be 288x288
						"[1]scale=288:288 [deco],",

						// Round the corners of the avatar image
						"[avatar]format=argb,geq=lum='p(X,Y)':a='st(1,pow(min(W/2,H/2),2))+st(3,pow(X-(W/2),2)+pow(Y-(H/2),2));if(lte(ld(3),ld(1)),alpha(X,Y),0)'[rounded avatar];",

						// Add base image to background
						"[background][rounded avatar]overlay=",
						"(main_w-overlay_w)/2:",
						"(main_h-overlay_h)/2:",
						"shortest=1:",
						"format=auto[tavatar];",

						// Add deco overlay
						"[tavatar][deco]overlay=",
						"(main_w-overlay_w)/2:",
						"(main_h-overlay_h)/2:",
						"format=auto,",

						// Split into two images so the palette can be generated in one single command
						"split[s0][s1];",

						// Generate palette
						"[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];",
						"[s1][p]paletteuse",
					];
					await ffmpeg.exec([
						"-i",
						`avatarbase.${ext}`,
						"-i",
						"decoration.png",
						"-filter_complex",
						filter_complex.join(""),
						"avatarwithdeco.gif",
					]);

					const res = await ffmpeg
						.readFile("avatarwithdeco.gif")
						.catch((err) => console.error(err));
					if (
						typeof res === "undefined" ||
						res.length === 0 ||
						!document.documentElement.getAttribute("loaded")
					) {
						console.error("Error: Empty result from ffmpeg");
						return reject();
					}
					const reader = new FileReader();
					reader.readAsDataURL(
						new Blob([new Uint8Array(res.buffer, res.byteOffset, res.length)], {
							type: "image/gif",
						}),
					);
					reader.onload = () => {
						return resolve(reader.result);
					};
					reader.onerror = () => {
						return reject(reader.error);
					};
				}
			} catch (err) {
				console.error(err);
				return reject(null);
			}
		})();
	});
}
