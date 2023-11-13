"use client";
import Image from "next/image";

import decorationsData from "../decorations.json";
import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { cropToSquare } from "@/ffmpeg/cropImage";

export default function Home() {
	const [loaded, setLoaded] = useState(false);
	const ffmpegRef = useRef(new FFmpeg());

	const load = async () => {
		const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
		const ffmpeg = ffmpegRef.current;
		ffmpeg.on("log", ({ message }) => {
			// console.log(message);
		});
		// toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm")
		});
		setLoaded(true);
	};

	const previewAvatar = async (url) => {
		setAvUrl("loading");
		var res = await cropToSquare(ffmpegRef.current, url);
		if (!res) return setAvUrl(null);
		setAvUrl(res);
	};

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
					<div className="bg-primary min-h-[20rem] w-[calc(100%-6rem)] flex flex-col items-center justify-center text-center p-16 mt-8 rounded-3xl">
						<p className="text-5xl ginto">DISCORD</p>
						<p className="text-4xl ginto mb-4">FAKE AVATAR DECORATIONS</p>
						<p>Create profile pictures with avatar decorations so you can use them in Discord without spending money</p>
					</div>
					<div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full max-w-[900px] px-8 py-12">
						{/* SETTINGS */}
						<div
							id="settings"
							className="grow block select-none"
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
											if (file) {
												const reader = new FileReader();
												reader.readAsDataURL(file);
												reader.onload = () => {
													previewAvatar(reader.result);
												};
											}
										}}
									/>
									Upload image
								</button>
								<p>or</p>
								<input
									type="text"
									className="bg-surface1 outline-none py-2 px-2.5 rounded transition grow"
									placeholder="Enter image URL..."
									onChange={async (e) => {
										var res = await fetch(e.target.value);
										if (res.status < 200 || res.status >= 400) return setAvUrl(null);
										var blob = await res.blob();
										console.log(blob);
										if (!["image/png", "image/jpeg", "image/gif"].includes(blob.type)) return setAvUrl(null);
										const reader = new FileReader();
										reader.readAsDataURL(blob);
										reader.onload = () => {
											previewAvatar(reader.result);
										};
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
															className="decor bg-surface1 h-20 w-20 rounded-[5px] p-1 border-2 border-surface1"
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
							className="relative bg-surface2 w-[340px] h-[422px] rounded-xl shadow-lg overflow-hidden select-none"
						>
							<div className="h-[60px] bg-[#5461f2]"></div>
							<div className="rounded-full w-[92px] h-[92px] border-[6px] bg-surface2 border-surface2 absolute top-4 left-5 select-none">
								<div className="relative w-[80px] h-[80px] rounded-full overflow-hidden">
									{avUrl == "loading" ? (
										<div className="absolute top-[24px] left-[24px]">
											<span className="loading-container">
												<span className="loading-cube"></span>
												<span className="loading-cube"></span>
											</span>
										</div>
									) : (
										<>
											<img
												id="avatar"
												src={avUrl || "/avatar.png"}
												className={"absolute top-[calc(80px*0.09)] left-[calc(80px*0.09)] w-[calc(80px*0.82)] h-[calc(80px*0.82)] rounded-full"}
												draggable={false}
											/>
											<img
												id="decoration"
												src={decoUrl}
												className="absolute top-0 left-0"
												draggable={false}
											/>
										</>
									)}
								</div>
								<div className="bg-[#229f56] w-7 h-7 absolute right-[-4px] bottom-[-4px] rounded-full border-[5px] border-surface2"></div>
							</div>
							<div className="p-4 m-4 bg-surface0 w-[calc(100%-32px)] h-[286px] rounded-lg absolute bottom-0">
								<p className="text-xl font-semibold [letter-spacing:.02em]">{name || "Display Name"}</p>
								<p className="text-sm">{description || "username"}</p>
								<hr />
								<p className="text-xs font-semibold [letter-spacing:.02em] scale-y-95 mb-1">ABOUT ME</p>
								<p className="text-sm">Hello, this is an example profile so that you can see what the profile picture would actually look like on Discord.</p>
								<p className="text-xs font-semibold [letter-spacing:.02em] scale-y-95 mt-3 mb-1">DISCORD MEMBER SINCE</p>
								<p className="text-sm">May 13, 2015</p>
								<button className="bg-secondary hover:bg-secondaryAlt py-1.5 rounded-[3px] transition w-full my-3 flex items-center justify-center gap-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										height="1em"
										viewBox="0 0 448 512"
									>
										<path
											fill="#ffffff"
											d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
										/>
									</svg>
									Save image
								</button>
							</div>
						</div>
					</div>
					<p className="mb-4 text-gray-400 text-sm">This site is NOT affiliated with Discord Inc. in any way</p>
				</main>
			) : (
				<main className="flex flex-col justify-center items-center h-screen w-full text-white p-8">
					<p className="text-4xl text-center ginto absolute mx-8 top-8 max-w-xl">DISCORD FAKE AVATAR DECORATIONS</p>
					<span className="loading-container mb-8">
						<span className="loading-cube"></span>
						<span className="loading-cube"></span>
					</span>
					<p>Loading...</p>
				</main>
			)}
		</>
	);
}
