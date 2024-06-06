"use client";

import decorationsData from "../decorations.json";
import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { addDecoration, cropToSquare } from "@/ffmpeg/processImage";
import { Modal } from "./components/modal";
import Link from "next/link";
import Twemoji from "./components/twemoji";

import { Image } from "./components/image";
const baseImgUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";

export default function Home() {
	const [loaded, setLoaded] = useState(false);
	const ffmpegRef = useRef(new FFmpeg());

	const load = async () => {
		const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/";
		const ffmpeg = ffmpegRef.current;
		// toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${baseURL}ffmpeg-core.wasm`, "application/wasm"),
		});
		setLoaded(true);
	};

	const previewAvatar = async (url) => {
		setAvUrl("loading");
		const res = await cropToSquare(ffmpegRef.current, url);
		if (!res) return setAvUrl(null);
		setAvUrl(res);
	};

	const createAvatar = async (url, deco) => {
		addDecoration(ffmpegRef.current, url, deco)
			.then((res) => {
				if (!res) return setFinishedAv(null), setGenerationFailed(true);
				setFinishedAv(res);
				setIsGeneratingAv(false);
			})
			.catch(() => {
				setGenerationFailed(true);
				setIsGeneratingAv(false);
			});
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
	}, [load]);

	return (
		<>
			{loaded ? (
				<>
					<main className="flex flex-col items-center w-screen h-screen text-white overflow-auto discord-scrollbar">
						<div
							className="flex flex-col justify-center items-center bg-primary mt-8 p-4 sm:p-16 rounded-3xl w-[calc(100%-6rem)] min-h-[20rem] text-center"
							style={{
								backgroundImage: new Date().getMonth() == 11 ? "url(/wallpaper/winter.jpg)" : "",
								backgroundPosition: "center bottom",
							}}
						>
							<h1 className="text-3xl sm:text-5xl ginto">DISCORD</h1>
							<h1 className="mb-4 text-2xl sm:text-4xl ginto">FAKE AVATAR DECORATIONS</h1>
							<h2 className="text-sm sm:text-base">
								Create profile pictures with avatar decorations so you can use them in Discord for free without spending money
							</h2>
						</div>
						<div className="flex md:flex-row flex-col items-center md:items-start gap-8 px-8 py-12 w-full max-w-[900px]">
							{/* SETTINGS */}
							<div id="settings" className="block select-none grow">
								{/* UPLOAD AVATAR */}
								<p className="my-2 font-semibold text-gray-300 text-sm [letter-spacing:.05em] scale-y-90">AVATAR</p>
								<div className="flex sm:flex-row flex-col sm:items-center gap-3">
									<button
										type="button"
										className="bg-primary hover:bg-primaryAlt px-4 py-2 rounded transition"
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
										className="bg-surface1 px-2.5 py-2 rounded transition grow outline-none"
										placeholder="Enter image URL..."
										onChange={async (e) => {
											const res = await fetch(e.target.value);
											if (res.status < 200 || res.status >= 400) return setAvUrl(null);
											const blob = await res.blob();
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
								<p className="my-2 font-semibold text-gray-300 text-sm [letter-spacing:.05em] scale-y-90">AVATAR DECORATION</p>
								<div className="flex flex-col gap-8 py-1 max-h-[532px] overflow-auto discord-scrollbar">
									{decorationsData.map((category, index) => {
										return (
											<div key={index}>
												<div className="relative justify-center items-center grid grid-cols-1 grid-rows-1 bg-black mb-4 rounded-2xl w-full h-28 overflow-hidden">
													{(() => {
														if (category.name === "VALORANT") {
															return (
																<>
																	<div className="top-0 right-0 bottom-0 left-0 absolute bg-[#ff4655]" />
																	{category.banner.image.map((e, i) => (
																		<Image
																			key={i}
																			className={`object-cover bottom-0 absolute`}
																			src={e.url}
																			alt={""}
																			draggable={false}
																			loading="eager"
																			height={0}
																			width={0}
																			sizes="640px"
																			style={{
																				height: "150%",
																				width: "150%",
																				left: e.align == "left" ? 0 : "",
																				right: e.align == "right" ? 0 : "",
																				objectPosition: e.align,
																			}}
																		/>
																	))}
																	<div className="relative top-0 right-0 bottom-0 left-0 flex flex-col justify-center items-center p-4 h-full">
																		<Image
																			src={category.banner.text}
																			alt={category.name}
																			draggable={false}
																			loading="eager"
																			height={0}
																			width={0}
																			sizes="256px"
																			style={{
																				height: `${category.banner.height || 48}px`,
																				width: "auto",
																			}}
																		/>
																		<p
																			className="-mt-4 w-[232px] xs:w-full font-medium text-center text-sm"
																			style={{
																				color: category.darkText || false ? "#000" : "#fff",
																			}}
																		>
																			{category.description}
																		</p>
																		{category.badge && (
																			<p className="top-2 right-2 absolute bg-white m-0 px-2 py-0 rounded-full font-semibold text-black text-xs [letter-spacing:0]">
																				{category.badge}
																			</p>
																		)}
																	</div>
																</>
															);
														}
														if (category.name === "Discord") {
															return (
																<>
																	<div className="top-0 right-0 bottom-0 left-0 absolute bg-gradient-to-r from-[#3441d9] to-[#9a44f7]" />
																	{category.banner.image.map((e, i) => (
																		<Image
																			key={i}
																			className="absolute object-cover"
																			src={e.url}
																			alt={""}
																			draggable={false}
																			loading="eager"
																			height={0}
																			width={0}
																			sizes="640px"
																			style={{
																				height: e.height || "auto",
																				width: e.height ? "auto" : "100%",
																				opacity: e.opacity || 0.5,
																				left: e.align == "left" ? 0 : "",
																				right: e.align == "right" ? 0 : "",
																				objectPosition: e.align,
																			}}
																		/>
																	))}
																	<div className="relative top-0 right-0 bottom-0 left-0 flex flex-col justify-center items-center p-4 h-full">
																		<p className="text-3xl ginto">Discord</p>
																		<p
																			className="w-[232px] xs:w-full font-medium text-center text-sm"
																			style={{
																				color: category.darkText || false ? "#000" : "#fff",
																			}}
																		>
																			{category.description}
																		</p>
																		{category.badge && (
																			<p className="top-2 right-2 absolute bg-white m-0 px-2 py-0 rounded-full font-semibold text-black text-xs [letter-spacing:0]">
																				{category.badge}
																			</p>
																		)}
																	</div>
																</>
															);
														}
														return (
															<>
																<Image
																	className="[grid-column:1/1] [grid-row:1/1] object-cover"
																	src={category.banner.image}
																	alt={""}
																	draggable={false}
																	loading="eager"
																	height={0}
																	width={0}
																	sizes="640px"
																	style={{
																		height: "100%",
																		width: "auto",
																	}}
																/>
																<div className="relative flex flex-col justify-center items-center [grid-column:1/1] [grid-row:1/1] p-4 h-full">
																	<Image
																		src={category.banner.text}
																		alt={category.name}
																		draggable={false}
																		loading="eager"
																		height={0}
																		width={0}
																		sizes="256px"
																		style={{
																			height: `${category.banner.height || 48}px`,
																			width: "auto",
																		}}
																	/>
																	<p
																		className="w-[232px] xs:w-full font-medium text-center text-sm"
																		style={{
																			color: category.darkText || false ? "#000" : "#fff",
																		}}
																	>
																		{category.description}
																	</p>
																	{category.badge && (
																		<p className="top-2 right-2 absolute bg-white m-0 px-2 py-0 rounded-full font-semibold text-black text-xs [letter-spacing:0]">
																			{category.badge}
																		</p>
																	)}
																</div>
															</>
														);
													})()}
												</div>

												<div className="flex flex-wrap gap-3 w-[264px] sm:w-[448px] xs:w-[356px]">
													{category.items.map((decor, index) => {
														return (
															<button
																key={index}
																className="border-2 border-surface1 bg-surface1 p-1 rounded-[5px] w-20 h-20 decor"
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
																<Image src={decor.file} className="pointer-events-none" />
															</button>
														);
													})}
												</div>
											</div>
										);
									})}
								</div>
							</div>

							<div className="flex flex-col items-center gap-8">
								{/* PROFILE PREVIEW */}
								<div
									id="profile-preview"
									className="relative bg-surface2 shadow-lg rounded-xl w-[256px] xs:w-[340px] overflow-hidden select-none"
								>
									<div className="bg-[#5461f2] h-[60px]"></div>
									<div className="top-4 left-5 absolute border-[6px] border-surface2 bg-surface2 rounded-full w-[92px] h-[92px] select-none">
										<div className="relative rounded-full w-[80px] h-[80px] overflow-hidden">
											{avUrl == "loading" ? (
												<div className="top-[24px] left-[24px] absolute">
													<span className="loading-container">
														<span className="loading-cube"></span>
														<span className="loading-cube"></span>
													</span>
												</div>
											) : (
												<>
													<Image
														id="avatar"
														src={avUrl || "/avatar.png"}
														className={
															"absolute top-[calc(80px*0.09)] left-[calc(80px*0.09)] w-[calc(80px*0.82)] h-[calc(80px*0.82)] rounded-full"
														}
														draggable={false}
													/>
													<Image id="decoration" src={decoUrl} className="top-0 left-0 absolute" draggable={false} />
												</>
											)}
										</div>
										<div className="right-[-4px] bottom-[-4px] absolute border-[5px] border-surface2 bg-[#229f56] rounded-full w-7 h-7"></div>
									</div>
									<div className="bg-surface0 m-4 mt-[calc(15rem/4)] p-4 rounded-lg w-[calc(100%-32px)]">
										<p className="font-semibold text-xl [letter-spacing:.02em]">{name || "Display Name"}</p>
										<p className="text-sm">{description || "username"}</p>
										<hr />
										<p className="font-semibold text-xs [letter-spacing:.02em] mb-1 scale-y-95">ABOUT ME</p>
										<p className="text-sm">
											Hello, this is an example profile so that you can see what the profile picture would actually look like on Discord.
										</p>
										<p className="font-semibold text-xs [letter-spacing:.02em] mt-3 mb-1 scale-y-95">DISCORD MEMBER SINCE</p>
										<p className="text-sm">May 13, 2015</p>
										<button
											className="flex justify-center items-center gap-2 bg-secondary hover:bg-secondaryAlt mt-3 py-1.5 rounded-[3px] w-full transition"
											onClick={() => {
												setFinishedAv("");
												setIsGeneratingAv(true);
												setGenerationFailed(false);
												setDownloadModalVisible(true);
												createAvatar(baseImgUrl + (avUrl || "/avatar.png"), decoUrl);
											}}
										>
											<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
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
								<div className="border-surface1 bg-surface3 py-4 border rounded-lg w-full cursor-default select-none">
									{[
										{
											styled: false,
											groupStart: true,
											text: "Look at me I'm a beautiful butterfly",
										},
										{
											styled: false,
											groupStart: false,
											text: (
												<>
													Fluttering in the moonlight <Twemoji emoji={"🌝"} />
												</>
											),
										},
										{
											styled: false,
											groupStart: false,
											text: "Waiting for the day when",
										},
										{
											styled: false,
											groupStart: false,
											text: "I get a profile picture decoration",
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
											),
										},
									].map((m, i) => {
										return (
											<div
												className="flex items-center gap-4 hover:bg-[#02020210] px-4 py-0.5"
												style={{
													marginTop: m.groupStart && i != 0 ? "17px" : "0",
												}}
												key={i}
											>
												{m.groupStart && (
													<>
														{avUrl == "loading" ? (
															<div className="relative w-10 h-10 scale-75">
																<span className="loading-container">
																	<span className="loading-cube"></span>
																	<span className="loading-cube"></span>
																</span>
															</div>
														) : (
															<>
																{m.styled ? (
																	<div className="relative rounded-full w-10 h-10 overflow-hidden">
																		<Image
																			src={avUrl || "/avatar.png"}
																			draggable={false}
																			className="top-[calc(40px*0.09)] left-[calc(40px*0.09)] absolute rounded-full w-[calc(40px*0.82)] h-[calc(40px*0.82)]"
																		/>
																		{decoUrl && <Image src={decoUrl} draggable={false} className="top-0 left-0 absolute" />}
																	</div>
																) : (
																	<Image src={avUrl || "/avatar.png"} draggable={false} className="rounded-full w-10 h-10" />
																)}
															</>
														)}
													</>
												)}
												<div className="flex flex-col">
													{m.groupStart && (
														<p className="h-fit font-medium text-base">
															<span className="mr-1">{name || "Display Name"}</span>
															<span className="ml-1 h-4 text-secondaryLight text-xs">
																Today at{" "}
																{[new Date().getHours() % 12, new Date().getMinutes()].join(":") +
																	(new Date().getHours() >= 12 ? " PM" : " AM")}
															</span>
														</p>
													)}

													<p
														style={{
															marginLeft: m.groupStart ? "0" : "56px",
															lineHeight: "22px",
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
						<p className="mb-4 text-center text-gray-400 text-sm">
							Website made by{" "}
							<Link href={"https://github.com/ItsPi3141"} className="hover:text-gray-200 underline" target="_blank">
								ItsPi3141
							</Link>
							<br />
							This project is open-source! View{" "}
							<Link
								href={"https://github.com/ItsPi3141/discord-fake-avatar-decorations"}
								className="hover:text-gray-200 underline"
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
							<div className="flex flex-col justify-center items-center gap-4 grow">
								<span className="loading-container">
									<span className="loading-cube"></span>
									<span className="loading-cube"></span>
								</span>
								<p>Creating image...</p>
							</div>
						) : (
							<>
								{generationFailed ? (
									<div className="flex flex-col justify-center items-center gap-4 grow">
										<p className="text-red-400">Failed to generate image</p>
									</div>
								) : (
									<div className="flex flex-col justify-center items-center gap-4 grow">
										<img src={finishedAv} draggable={false} width={128} height={128} />
										<div className="flex justify-center gap-2 w-full">
											<button
												className="flex justify-center items-center gap-1 bg-secondary hover:bg-secondaryAlt mt-3 py-1.5 rounded-[3px] w-72 transition"
												onClick={() => {
													const a = document.createElement("a");
													a.href = finishedAv;
													a.download = `discord_fake_avatar_decorations_${Date.now()}.gif`;
													a.click();
												}}
											>
												<svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 24 24">
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
				<main className="flex flex-col justify-center items-center p-8 w-full h-screen text-white">
					<p className="top-8 absolute mx-8 max-w-xl text-4xl text-center ginto">DISCORD FAKE AVATAR DECORATIONS</p>
					<span className="mb-8 loading-container">
						<span className="loading-cube"></span>
						<span className="loading-cube"></span>
					</span>
					<p>Loading...</p>
				</main>
			)}
		</>
	);
}
