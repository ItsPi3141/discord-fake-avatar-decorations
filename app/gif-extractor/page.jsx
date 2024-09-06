"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { imagesFromGif } from "@/ffmpeg/extractFrames.js";
import { getMimeTypeFromArrayBuffer } from "@/ffmpeg/utils.js";

import FileUpload from "../components/fileupload.jsx";
import Image from "../components/image.jsx";

import { printMsg } from "../print.js";

export default function GifExtractor() {
	const isServer = typeof window === "undefined";

	const [loaded, setLoaded] = useState(false);
	const ffmpegRef = useRef(isServer ? null : new FFmpeg());

	const load = useCallback(async () => {
		if (isServer) return;
		const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/";
		const ffmpeg = ffmpegRef.current;
		// toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(
				`${baseURL}ffmpeg-core.wasm`,
				"application/wasm",
			),
		});
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
				],
			),
		);
		setLoaded(true);

		if (!isServer) {
			const i = sessionStorage.getItem("image");
			if (i) setFile(i);
			sessionStorage.removeItem("image");
		}
	});

	const [t, setT] = useState(false);
	useEffect(() => {
		if (t) return;
		setT(true);
		load();
	}, [load, t]);

	const [file, setFile] = useState(null);
	const [frames, setFrames] = useState(null);

	return (
		<>
			{loaded ? (
				<>
					<main className="flex flex-col items-center gap-2 px-8 py-12 w-screen h-screen text-white overflow-auto overflow-x-hidden discord-scrollbar">
						<p className="mb-8 text-3xl ginto">Gif Frame Extractor</p>

						{file == null ? (
							<>
								<button
									type="button"
									className="flex justify-center items-center gap-1 bg-primary hover:bg-primaryAlt mt-3 py-1.5 rounded-[3px] w-72 transition"
									onClick={() => {
										document.getElementById("upload-gif").click();
									}}
								>
									<input
										type="file"
										id="upload-gif"
										className="hidden"
										accept="image/png, image/gif"
										onChange={(e) => {
											const [file] = e.target.files;
											if (file) {
												const reader = new FileReader();
												reader.readAsDataURL(file);
												reader.onload = () => {
													setFile(reader.result);
												};
											}
										}}
									/>
									Upload a GIF
								</button>
								<p className="text-gray-300 text-sm">
									You can also drag and drop a GIF file here
								</p>
							</>
						) : (
							<>
								<div className="relative flex flex-col items-center">
									<button
										type="button"
										className="top-2 right-2 absolute bg-surface5 hover:bg-secondary shadow p-1 rounded text-error"
										onClick={() => {
											setFile(null);
											setFrames(null);
										}}
									>
										<svg
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											fill="none"
											viewBox="0 0 24 24"
										>
											<path
												fill="currentColor"
												d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z"
											/>
											<path
												fill="currentColor"
												fillRule="evenodd"
												d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
									<Image
										src={file}
										className="rounded-lg w-72 max-w-[calc(100vw-4rem)] sm:max-w-[32rem]"
										draggable="false"
									/>
									<button
										type="button"
										className="flex justify-center items-center gap-1 bg-primary hover:bg-primaryAlt mt-3 py-1.5 rounded-[3px] w-72 max-w-[calc(100vw-4rem)] transition"
										onClick={async () => {
											setFrames(await imagesFromGif(ffmpegRef.current, file));
										}}
									>
										Extract frames
									</button>
								</div>
								<div className="flex flex-wrap justify-center gap-2 mt-8">
									{frames &&
										typeof frames === "object" &&
										typeof frames.map === "function" &&
										frames.map((frame, i) => (
											<button
												type="button"
												key={i}
												className="flex justify-center items-center border-2 border-surface1 bg-surface1 p-1 rounded-[5px] w-32 aspect-square"
												onClick={() => {
													const a = document.createElement("a");
													a.href = `data:image/png;base64,${frame}`;
													a.download = `discord_fake_avatar_decorations_${Date.now()}.png`;
													a.click();
												}}
											>
												<img
													alt=""
													src={`data:image/png;base64,${frame}`}
													className="rounded"
													draggable="false"
												/>
											</button>
										))}
								</div>
							</>
						)}
					</main>
					<FileUpload
						onUpload={async (e) => {
							const file = e.dataTransfer.files.item(0);
							if (!["image/png", "image/gif"].includes(file.type)) {
								printErr(`Expected image/png or image/gif. Got ${file.type}`);
								throw printErr("Invalid file type");
							}
							const ab = await file.arrayBuffer();
							if (
								!["image/png", "image/gif"].includes(
									getMimeTypeFromArrayBuffer(ab),
								)
							) {
								throw printErr("Invalid image file");
							}
							const reader = new FileReader();
							reader.readAsDataURL(new Blob([ab]));
							reader.onload = () => {
								setFile(reader.result);
							};
						}}
					/>
				</>
			) : (
				<main className="flex flex-col justify-center items-center p-8 w-full h-screen text-white">
					<p className="top-8 absolute mx-8 max-w-xl font-bold text-4xl text-center ginto">
						Discord
						<br />
						FAKE AVATAR DECORATIONS
						<br />
						<br />
						<span className="text-3xl text-gray-300 ginto">
							Gif Frame Extractor
						</span>
					</p>
					<span className="mb-8 loading-container">
						<span className="loading-cube" />
						<span className="loading-cube" />
					</span>
					<p>Loading...</p>
				</main>
			)}
		</>
	);
}
