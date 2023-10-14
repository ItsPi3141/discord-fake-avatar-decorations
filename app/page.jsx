"use client";
import Image from "next/image";

import decorationsData from "../decorations.json";
import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export default function Home() {
	const [loaded, setLoaded] = useState(false);
	const ffmpegRef = useRef(new FFmpeg());

	const load = async () => {
		const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
		const ffmpeg = ffmpegRef.current;
		ffmpeg.on("log", ({ message }) => {
			console.log(message);
		});
		// toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm")
		});
		setLoaded(true);
	};

	const previewAvatar = () => {};

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [decoUrl, setDecoUrl] = useState("");
	const [avUrl, setAvUrl] = useState("");

	useEffect(() => {
		load();
	}, []);

	return (
		<>
			{loaded ? (
				<main className="text-white w-full min-h-screen flex flex-col items-center">
					<div className="bg-primary min-h-[20rem] w-full flex flex-col items-center justify-center text-center p-16">
						<p className="text-5xl ginto">DISCORD</p>
						<p className="text-4xl ginto mb-4">FAKE AVATAR DECORATIONS</p>
						<p>Create profile pictures with avatar decorations so you can use them in Discord without spending money</p>
					</div>
					<div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full max-w-[900px] px-8 py-12">
						{/* SETTINGS */}
						<div
							id="settings"
							className="grow block"
						>
							{/* UPLOAD AVATAR */}
							<p className="text-sm font-semibold text-gray-300 [letter-spacing:.05em] scale-y-90 my-2">AVATAR</p>
							<div className="flex gap-3 items-center">
								<button
									className="bg-primary hover:bg-primaryAlt py-2 px-4 rounded transition"
									onClick={() => {
										document.getElementById("upload-avatar").click();
									}}
								>
									<input
										type="file"
										id="upload-avatar"
										className="hidden"
										accept="image/png, image/jpeg, image/gif"
										onChange={(e) => {
											const [file] = e.target.files;
											if (file) setAvUrl(URL.createObjectURL(file));
										}}
									/>
									Upload image
								</button>
								<p>or</p>
								<input
									type="text"
									className="bg-surface1 outline-none py-2 px-2.5 rounded transition grow"
									placeholder="Enter image URL..."
									onChange={(e) => {
										setAvUrl(e.target.value);
									}}
								/>
							</div>
							<hr />

							{/* SELECT DECORATION */}
							<p className="text-sm font-semibold text-gray-300 [letter-spacing:.05em] scale-y-90 my-2">AVATAR DECORATION</p>
							<div className="discord-scrollbar flex flex-col gap-8 max-h-[480px] overflow-auto py-2">
								{decorationsData.map((category, index) => {
									return (
										<div key={index}>
											<div
												className="w-full h-28 mb-4 flex flex-col justify-center items-center rounded-2xl"
												style={{
													backgroundImage: `url(${category.banner.image})`,
													backgroundSize: "cover",
													backgroundPosition: "center"
												}}
											>
												<img
													src={category.banner.text}
													alt={category.name}
													style={{
														height: `${category.banner.height || 48}px`
													}}
												/>
												<p className="text-xs">{category.description}</p>
											</div>

											<div className="flex flex-wrap gap-3 w-[448px]">
												{category.items.map((decor, index) => {
													return (
														<button
															key={index}
															className="decor bg-surface1 h-20 w-20 rounded p-1 border-2 border-surface1"
															onClick={(e) => {
																setName(decor.name);
																setDescription(decor.description);
																setDecoUrl(decor.file);
																document.querySelectorAll("button.decor.border-2.border-primary").forEach((el) => {
																	el.classList.remove("border-primary");
																	el.classList.add("border-surface1");
																});
																e.target.classList.add("border-primary");
																e.target.classList.remove("border-surface1");
															}}
														>
															<img
																src={decor.file}
																className="pointer-events-none"
															/>
														</button>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* PROFILE PREVIEW */}
						<div
							id="profile-preview"
							className="relative bg-surface2 w-[340px] h-[392px] rounded-xl shadow-lg overflow-hidden"
						>
							<div className="h-[60px] bg-[#5461f2]"></div>
							<div className="rounded-full w-[92px] h-[92px] border-[6px] bg-surface2 border-surface2 absolute top-4 left-5 select-none">
								<div className="relative w-[80px] h-[80px] rounded-full overflow-hidden">
									<img
										id="avatar"
										src={avUrl || "/avatar.png"}
										className={"absolute top-[calc(80px*0.09)] left-[calc(80px*0.09)] w-[calc(80px*0.82)] h-[calc(80px*0.82)] rounded-full"}
									/>
									<img
										id="decoration"
										src={decoUrl}
										className="absolute top-0 left-0"
									/>
								</div>
								<div className="bg-[#229f56] w-7 h-7 absolute right-[-4px] bottom-[-4px] rounded-full border-[5px] border-surface2"></div>
							</div>
							<div className="p-4 m-4 bg-surface0 w-[calc(100%-32px)] h-[256px] rounded-lg absolute bottom-0">
								<p className="text-xl font-semibold [letter-spacing:.02em]">{name || "Display Name"}</p>
								<p className="text-sm">{description || "username"}</p>
								<hr />
								<p className="text-xs font-semibold [letter-spacing:.02em] scale-y-95 mb-1">ABOUT ME</p>
								<p className="text-sm">Hello, this is an example profile so that you can see what the profile picture would actually look like on Discord.</p>
								<p className="text-xs font-semibold [letter-spacing:.02em] scale-y-95 mt-3 mb-1">DISCORD MEMBER SINCE</p>
								<p className="text-sm">May 13, 2015</p>
							</div>
						</div>
					</div>
				</main>
			) : (
				<main className="flex flex-col justify-center items-center h-screen w-full text-white p-8">
					<p className="text-4xl text-center ginto absolute mx-8 top-8 max-w-xl">DISCORD FAKE AVATAR DECORATIONS</p>
					<span class="loading-container">
						<span class="loading-cube"></span>
						<span class="loading-cube"></span>
					</span>
					<p>Loading...</p>
				</main>
			)}
		</>
	);
}
