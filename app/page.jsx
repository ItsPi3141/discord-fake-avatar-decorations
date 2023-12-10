"use client";

import decorationsData from "../decorations.json";
import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { addDecoration, cropToSquare } from "@/ffmpeg/processImage";
import { Modal } from "./components/modal";
import Link from "next/link";
import Twemoji from "./components/twemoji";

export default function Home() {
	const [loaded, setLoaded] = useState(false);
	const ffmpegRef = useRef(new FFmpeg());

	const load = async () => {
		const baseURL = "/ffmpeg/";
		const ffmpeg = ffmpegRef.current;
		// toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${baseURL}ffmpeg-core.wasm`, "application/wasm")
		});
		setLoaded(true);
	};

	const previewAvatar = async (url) => {
		setAvUrl("loading");
		var res = await cropToSquare(ffmpegRef.current, url);
		if (!res) return setAvUrl(null);
		setAvUrl(res);
	};

	const createAvatar = async (url, deco) => {
		try {
			addDecoration(ffmpegRef.current, url, deco).then((res) => {
				if (!res) return setFinishedAv(null), setGenerationFailed(true);
				setFinishedAv(res);
				setIsGeneratingAv(false);
			});
		} catch {
			setGenerationFailed(true);
			setIsGeneratingAv(false);
		}
	};

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [decoUrl, setDecoUrl] = useState("");
	const [avUrl, setAvUrl] = useState("");

	const [finishedAv, setFinishedAv] = useState("");
	const [isGeneratingAv, setIsGeneratingAv] = useState(false);
	const [generationFailed, setGenerationFailed] = useState(false);
	const [downloadModalVisible, setDownloadModalVisible] = useState(false);

	useEffect(() => {
		load();
	}, []);

	return (
		<>
			{loaded ? (
				<>
					<main className="text-white w-screen h-screen overflow-auto flex flex-col items-center discord-scrollbar">
						<div
							className="bg-primary min-h-[20rem] w-[calc(100%-6rem)] flex flex-col items-center justify-center text-center p-4 sm:p-16 mt-8 rounded-3xl"
							style={{
								backgroundImage: new Date().getMonth() == 11 ? "url(/wallpaper/winter.jpg)" : "",
								backgroundPosition: "center bottom"
							}}
						>
							<p className="text-3xl sm:text-5xl ginto">DISCORD</p>
							<p className="text-2xl sm:text-4xl ginto mb-4">FAKE AVATAR DECORATIONS</p>
							<p className="text-sm sm:text-base">Create profile pictures with avatar decorations so you can use them in Discord without spending money</p>
						</div>
						<div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full max-w-[900px] px-8 py-12">
							{/* SETTINGS */}
							<div
								id="settings"
								className="grow block select-none"
							>
								{/* UPLOAD AVATAR */}
								<p className="text-sm font-semibold text-gray-300 [letter-spacing:.05em] scale-y-90 my-2">AVATAR</p>
								<div className="flex gap-3 sm:items-center sm:flex-row flex-col">
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
									<p className="text-center sm:text-left">or</p>
									<input
										type="text"
										className="bg-surface1 outline-none py-2 px-2.5 rounded transition grow"
										placeholder="Enter image URL..."
										onChange={async (e) => {
											var res = await fetch(e.target.value);
											if (res.status < 200 || res.status >= 400) return setAvUrl(null);
											var blob = await res.blob();
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
								<div className="discord-scrollbar flex flex-col gap-8 max-h-[532px] overflow-auto py-1">
									{decorationsData.map((category, index) => {
										return (
											<div
												key={index}
												className="w-fit"
											>
												<div
													className="w-full h-28 mb-4 flex flex-col justify-center items-center rounded-2xl p-4"
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
													<p className="text-xs text-center xs:w-full w-[232px]">{category.description}</p>
												</div>

												<div className="flex flex-wrap gap-3 w-[264px] xs:w-[356px] sm:w-[448px]">
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

							<div className="flex flex-col gap-8">
								{/* PROFILE PREVIEW */}
								<div
									id="profile-preview"
									className="relative bg-surface2 w-[256px] xs:w-[340px] rounded-xl shadow-lg overflow-hidden select-none"
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
									<div className="p-4 m-4 bg-surface0 w-[calc(100%-32px)] rounded-lg mt-[calc(15rem/4)]">
										<p className="text-xl font-semibold [letter-spacing:.02em]">{name || "Display Name"}</p>
										<p className="text-sm">{description || "username"}</p>
										<hr />
										<p className="text-xs font-semibold [letter-spacing:.02em] scale-y-95 mb-1">ABOUT ME</p>
										<p className="text-sm">Hello, this is an example profile so that you can see what the profile picture would actually look like on Discord.</p>
										<p className="text-xs font-semibold [letter-spacing:.02em] scale-y-95 mt-3 mb-1">DISCORD MEMBER SINCE</p>
										<p className="text-sm">May 13, 2015</p>
										<button
											className="bg-secondary hover:bg-secondaryAlt py-1.5 rounded-[3px] transition w-full mt-3 flex items-center justify-center gap-2"
											onClick={() => {
												setFinishedAv("");
												setIsGeneratingAv(true);
												setGenerationFailed(false);
												setDownloadModalVisible(true);
												createAvatar(avUrl || "/avatar.png", decoUrl);
											}}
										>
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
								{/* Message preview */}
								<div className="py-4 bg-surface3 border border-surface1 w-full rounded-lg select-none cursor-default">
									{[
										{
											styled: false,
											groupStart: true,
											text: "Look at me I'm a beautiful butterfly"
										},
										{
											styled: false,
											groupStart: false,
											text: (
												<>
													Fluttering in the moonlight <Twemoji emoji={"🌝"} />
												</>
											)
										},
										{
											styled: false,
											groupStart: false,
											text: "Waiting for the day when"
										},
										{
											styled: false,
											groupStart: false,
											text: "I get a profile picture decoration"
										},
										{
											styled: true,
											groupStart: true,
											text: (
												<>
													{decoUrl ? (
														<>
															Yay! Here it is! <Twemoji emoji={"🎉"} />
														</>
													) : (
														<>
															Hmm... I still don't see it <Twemoji emoji={"🤔"} />
														</>
													)}
												</>
											)
										}
									].map((m, i) => {
										return (
											<div
												className="flex px-4 py-0.5 items-center gap-4 hover:bg-[#02020210]"
												style={{
													marginTop: m.groupStart && i != 0 ? "17px" : "0"
												}}
												key={i}
											>
												{m.groupStart && (
													<>
														{m.styled ? (
															<div className="w-10 h-10 rounded-full overflow-hidden relative">
																<img
																	src={avUrl || "/avatar.png"}
																	className="absolute top-[calc(40px*0.09)] left-[calc(40px*0.09)] w-[calc(40px*0.82)] h-[calc(40px*0.82)] rounded-full"
																/>
																<img
																	src={decoUrl}
																	className="absolute top-0 left-0"
																/>
															</div>
														) : (
															<img
																src={avUrl || "/avatar.png"}
																className="w-10 h-10 rounded-full"
															/>
														)}
													</>
												)}
												<div className="flex flex-col">
													{m.groupStart && (
														<div className="flex items-center gap-2">
															<p className="text-base font-medium h-fit">{name || "Display Name"}</p>
															<p className="text-xs h-4 text-secondaryLight">
																Today at {[new Date().getHours() % 12, new Date().getMinutes()].join(":") + (new Date().getHours() >= 12 ? " PM" : " AM")}
															</p>
														</div>
													)}

													<p
														style={{
															marginLeft: m.groupStart ? "0" : "56px",
															height: m.groupStart ? "" : "22px"
														}}
													>
														{m.text}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
						<p className="mb-4 text-gray-400 text-sm text-center">
							Website made by{" "}
							<Link
								href={"https://github.com/ItsPi3141"}
								className="underline hover:text-gray-200"
								target="_blank"
							>
								ItsPi3141
							</Link>
							<br />
							This project is open-source! View{" "}
							<Link
								href={"https://github.com/ItsPi3141/discord-fake-avatar-decorations"}
								className="underline hover:text-gray-200"
								target="_blank"
							>
								source code
							</Link>{" "}
							on GitHub.
							<br />
							This site is NOT affiliated with Discord Inc. in any way. All images and assets belong to Discord Inc.
						</p>
					</main>
					<Modal
						title={"Download Decorated Avatar"}
						subtitle={
							isGeneratingAv
								? "Please wait while the image is being generated."
								: "You can download the image below. You may need to use an external tool to extract a still frame from the image if you do not have an active Nitro subscription."
						}
						visible={downloadModalVisible}
						onClose={() => {
							setDownloadModalVisible(false);
						}}
					>
						{isGeneratingAv ? (
							<div className="flex flex-col grow justify-center items-center gap-4">
								<span className="loading-container">
									<span className="loading-cube"></span>
									<span className="loading-cube"></span>
								</span>
								<p>Creating image...</p>
							</div>
						) : (
							<>
								{generationFailed ? (
									<div className="flex flex-col grow justify-center items-center gap-4">
										<p className="text-red-400">Failed to generate image</p>
									</div>
								) : (
									<div className="flex flex-col grow justify-center items-center gap-4">
										<img
											src={finishedAv}
											draggable={false}
											width={128}
											height={128}
										/>
										<div className="flex gap-2 w-full justify-center">
											<button
												className="bg-secondary hover:bg-secondaryAlt py-1.5 rounded-[3px] transition w-72 mt-3 flex items-center justify-center gap-1"
												onClick={() => {
													const a = document.createElement("a");
													a.href = finishedAv;
													a.download = `discord_fake_avatar_decorations_${Date.now()}.gif`;
													a.click();
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													height="1.1em"
													viewBox="0 0 24 24"
												>
													<g fill="currentColor">
														<path d="M17.707 10.708L16.293 9.29398L13 12.587V2.00098H11V12.587L7.70697 9.29398L6.29297 10.708L12 16.415L17.707 10.708Z"></path>
														<path d="M18 18.001V20.001H6V18.001H4V20.001C4 21.103 4.897 22.001 6 22.001H18C19.104 22.001 20 21.103 20 20.001V18.001H18Z"></path>
													</g>
												</svg>
												Download
											</button>
										</div>
									</div>
								)}
							</>
						)}
					</Modal>
				</>
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
