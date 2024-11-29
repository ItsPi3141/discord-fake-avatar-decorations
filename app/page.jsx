"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { addDecoration, cropToSquare } from "@/ffmpeg/processImage.js";
import { getMimeTypeFromArrayBuffer } from "@/ffmpeg/utils.js";

import Modal from "./components/modal.jsx";
import Twemoji from "./components/twemoji.jsx";
import Image from "./components/image.jsx";
import FileUpload from "./components/fileupload.jsx";

import { printMsg, printErr } from "./print.js";

import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { Icons } from "./components/icons.jsx";

const decorationsData = require("../decorations.json");
const avatarsData = require("../avatars.json");

const baseImgUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";

export default function Home() {
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
	});

	const [t, setT] = useState(false);
	useEffect(() => {
		if (t) return;
		setT(true);
		load();
	}, [load, t]);

	return (
		<>
			{loaded ? (
				<App ffmpegRef={ffmpegRef} isServer={isServer} />
			) : (
				<LoadingScreen />
			)}
		</>
	);
}

const LoadingScreen = () => (
	<main className="flex flex-col justify-center items-center p-8 w-full h-screen text-white">
		<p className="top-8 absolute mx-8 max-w-xl font-bold text-4xl text-center ginto">
			Discord
			<br />
			FAKE AVATAR DECORATIONS
		</p>
		<LoadingSpinner className="mb-8" />
		<p>Loading...</p>
	</main>
);

const App = ({ ffmpegRef, isServer }) => {
	const previewAvatar = useCallback(async (url) => {
		if (isServer) return;
		setAvUrl("loading");
		const res = await cropToSquare(ffmpegRef.current, url).catch((reason) =>
			printErr(reason),
		);
		if (!res) return setAvUrl(null);
		setAvUrl(res);
	});

	const createAvatar = useCallback(async (url, deco) => {
		if (isServer) return;
		addDecoration(
			ffmpegRef.current,
			url,
			deco === "" ? "" : `${baseImgUrl}${deco}`,
		)
			.then((res) => {
				if (!res) {
					setFinishedAv(null);
					setGenerationFailed(true);
					return;
				}
				setFinishedAv(res);
				setIsGeneratingAv(false);
			})
			.catch((reason) => {
				setGenerationFailed(true);
				setIsGeneratingAv(false);
				printErr(reason);
			});
	});

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [decoUrl, setDecoUrl] = useState("");
	const [avUrl, setAvUrl] = useState("");

	const [finishedAv, setFinishedAv] = useState("");
	const [isGeneratingAv, setIsGeneratingAv] = useState(false);
	const [generationFailed, setGenerationFailed] = useState(false);
	const [downloadModalVisible, setDownloadModalVisible] = useState(false);
	const [shared, setShared] = useState(false);
	const [fileTooBig, setFileTooBig] = useState(false);

	const router = useRouter();

	return (
		<>
			<main className="flex flex-col items-center w-screen h-screen text-white overflow-auto discord-scrollbar">
				<div
					className="flex flex-col justify-center items-center bg-primary mt-8 px-4 py-8 sm:p-8 md:p-12 lg:p-16 rounded-3xl w-[calc(100%-6rem)] text-center"
					style={{
						backgroundImage:
							new Date().getMonth() === 11
								? `url(${baseImgUrl}/wallpaper/winter.jpg)`
								: "",
						backgroundPosition: "center bottom",
						backgroundSize: "cover",
					}}
				>
					<h1 className="font-bold text-3xl md:text-5xl ginto">Discord</h1>
					<h1 className="mb-4 text-2xl md:text-4xl ginto">
						FAKE AVATAR DECORATIONS
					</h1>
					<h2 className="text-sm sm:text-base">
						Create profile pictures with avatar decorations so you can use them
						in Discord for free without spending money
					</h2>
				</div>
				<div className="flex md:flex-row flex-col items-center md:items-start gap-8 px-8 py-12 w-full max-w-[900px]">
					{/* SETTINGS */}
					<div id="settings" className="block select-none grow">
						{/* UPLOAD AVATAR */}
						<p className="my-2 font-semibold text-gray-300 text-sm [letter-spacing:.05em] scale-y-90">
							AVATAR
						</p>
						<div className="flex sm:flex-row flex-col sm:items-center gap-3">
							<button
								type="button"
								className="px-4 py-1.5 button-primary"
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
								className="border-white/5 bg-surface4 px-2.5 py-2 border rounded-lg transition grow outline-none"
								placeholder="Enter image URL..."
								onChange={async (e) => {
									const res = await fetch(e.target.value);
									if (res.status < 200 || res.status >= 400)
										return setAvUrl(null);
									const blob = await res.blob();
									if (
										!["image/png", "image/jpeg", "image/gif"].includes(
											blob.type,
										)
									)
										return setAvUrl(null);
									const reader = new FileReader();
									reader.readAsDataURL(blob);
									reader.onload = () => {
										previewAvatar(reader.result);
									};
								}}
							/>
						</div>
						<p className="mt-4 mb-2">
							You can also pick from one of these avatars below
						</p>
						{/* SELECT AVATAR */}
						<div className="flex flex-col gap-8 py-1 max-h-[280px] overflow-auto discord-scrollbar">
							<div className="gap-3 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 min-[600px]:grid-cols-6 min-[720px]:grid-cols-7 xs:grid-cols-4">
								{avatarsData.map((avatar, index) => {
									return (
										<div
											key={index}
											className="flex flex-col items-center text-center"
										>
											<button
												key={index}
												type="button"
												data-tooltip-id={avatar.name
													.toLowerCase()
													.replaceAll(" ", "-")}
												data-tooltip-content={avatar.name}
												className="border-2 border-surface2 bg-surface2 p-2 rounded-[5px] w-full aspect-square avatar-preset outline-none"
												onClick={(e) => {
													setAvUrl(`${baseImgUrl}/avatars/${avatar.file}`);
													for (const el of document.querySelectorAll(
														"button.avatar-preset.border-2.border-primary",
													)) {
														el.classList.remove("border-primary");
														el.classList.add("border-surface2");
													}
													e.target.classList.add("border-primary");
													e.target.classList.remove("border-surface2");
												}}
											>
												<Image
													src={`/avatars/${avatar.file}`}
													className="rounded-full pointer-events-none"
												/>
											</button>
											<Tooltip
												id={avatar.name.toLowerCase().replaceAll(" ", "-")}
												opacity={1}
												style={{
													background: "#111214",
													borderRadius: "8px",
													padding: "6px 12px 4px 12px",
													boxShadow:
														"0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2)",
												}}
											/>
										</div>
									);
								})}
							</div>
						</div>
						<hr />

						{/* SELECT DECORATION */}
						<p className="my-2 font-semibold text-gray-300 text-sm [letter-spacing:.05em] scale-y-90">
							AVATAR DECORATION
						</p>
						<div className="flex flex-col gap-8 py-1 max-h-[532px] overflow-auto discord-scrollbar">
							{decorationsData.map((category, index) => {
								return (
									<div key={index}>
										<div className="relative justify-center items-center grid grid-cols-1 grid-rows-1 bg-black mb-4 rounded-2xl h-28 overflow-hidden">
											{typeof category.banner.image !== "string" ? (
												<>
													<div
														className="top-0 right-0 bottom-0 left-0 absolute"
														style={{
															background: category.banner.background || "#000",
														}}
													/>
													{category.banner.image.map((e, i) => (
														<Image
															key={i}
															className={"object-cover bottom-0 absolute"}
															src={e.url}
															alt={""}
															draggable={false}
															loading="eager"
															height={0}
															width={0}
															style={{
																height: e.height || "auto",
																width: e.width || (e.height ? "auto" : "100%"),
																left:
																	e.align === "left" || e.align === "center"
																		? 0
																		: "",
																right:
																	e.align === "right" || e.align === "center"
																		? 0
																		: "",
																objectPosition: e.align,
															}}
														/>
													))}
												</>
											) : (
												<Image
													className="[grid-column:1/1] [grid-row:1/1] object-cover"
													src={category.banner.image}
													alt={""}
													draggable={false}
													loading="eager"
													height={0}
													width={0}
													style={{
														height: "100%",
														width: "100%",
														objectFit: "cover",
														objectPosition: category.banner.bgPos || "",
													}}
												/>
											)}
											<div className="relative flex flex-col justify-center items-center [grid-column:1/1] [grid-row:1/1] p-4 h-full">
												{category.banner.text ? (
													category.banner.text === "" ? (
														<div
															style={{
																height: `${category.banner.height || 48}px`,
																width: "100%",
															}}
														/>
													) : (
														<Image
															src={category.banner.text}
															alt={category.name}
															draggable={false}
															loading="eager"
															height={0}
															width={0}
															style={{
																height: `${category.banner.height || 48}px`,
																width: "auto",
															}}
														/>
													)
												) : (
													<>
														{!category.hideTitle && (
															<p
																className="px-4 text-3xl text-center ginto"
																style={{
																	color:
																		category.darkText || false
																			? "#000"
																			: "#fff",
																}}
															>
																{category.name}
															</p>
														)}
													</>
												)}
												<p
													className="w-[232px] xs:w-full font-medium text-center text-sm"
													style={{
														color: category.darkText || false ? "#000" : "#fff",
														marginTop: category.descriptionTopMargin || "",
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
										</div>

										<div className="gap-3 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 min-[600px]:grid-cols-6 min-[720px]:grid-cols-7 xs:grid-cols-4">
											{category.items.map((decor, index) => {
												return (
													<button
														key={index}
														type="button"
														className="border-2 border-surface2 bg-surface2 p-1 rounded-[5px] w-full aspect-square decor"
														onClick={(e) => {
															setName(decor.name);
															setDescription(decor.description);
															setDecoUrl(`/decorations/${decor.file}`);
															for (const el of document.querySelectorAll(
																"button.decor.border-2.border-primary",
															)) {
																el.classList.remove("border-primary");
																el.classList.add("border-surface2");
															}
															e.target.classList.add("border-primary");
															e.target.classList.remove("border-surface2");
														}}
													>
														<Image
															src={`/decorations/${decor.file}`}
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

					<div className="flex flex-col items-center gap-8">
						{/* PROFILE PREVIEW */}
						<div
							id="profile-preview"
							className="relative bg-surface0 shadow-lg rounded-lg w-[300px] overflow-hidden select-none"
						>
							<div className="bg-[#5461f2] h-[105px]" />
							<div className="top-[61px] left-[16px] absolute bg-surface0 p-[6px] rounded-full w-[92px] h-[92px] select-none">
								<div className="relative rounded-full w-[80px] h-[80px] overflow-hidden">
									{avUrl === "loading" ? (
										<div className="top-[24px] left-[24px] absolute">
											<LoadingSpinner />
										</div>
									) : (
										<>
											<Image
												id="avatar"
												src={avUrl || `${baseImgUrl}/avatars/blue.png`}
												className={
													"absolute top-[calc(80px*0.09)] left-[calc(80px*0.09)] w-[calc(80px*0.82)] h-[calc(80px*0.82)] rounded-full"
												}
												draggable={false}
											/>
											<Image
												id="decoration"
												src={decoUrl}
												className="top-0 left-0 absolute"
												draggable={false}
											/>
										</>
									)}
								</div>
								<div className="right-[-4px] bottom-[-4px] absolute border-[5px] border-surface2 bg-[#229f56] rounded-full w-7 h-7" />
							</div>
							<div className="bg-surface0 mt-[35px] p-4 rounded-lg w-[calc(100%)]">
								<p className="font-semibold text-xl [letter-spacing:.02em]">
									{name || "Display Name"}
								</p>
								<p className="mb-3 text-sm">username</p>
								<p className="text-sm">
									{description ||
										"This is an example profile so that you can see what the profile picture would actually look like on Discord."}
								</p>
								<button
									type="button"
									className="flex justify-center items-center gap-1.5 mt-3 px-4 py-1.5 w-full button-dark"
									onClick={() => {
										setFinishedAv("");
										setIsGeneratingAv(true);
										setGenerationFailed(false);
										setDownloadModalVisible(true);
										createAvatar(
											avUrl || `${baseImgUrl}/avatars/blue.png`,
											decoUrl,
										);
									}}
								>
									<Icons.image />
									Save image
								</button>
							</div>
						</div>
						{/* Message preview */}
						<div className="border-secondaryAlt bg-surface5 py-4 border rounded-lg w-[300px] cursor-default select-none">
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
										className="flex items-center gap-4 hover:bg-surface4 px-4 py-0.5"
										style={{
											marginTop: m.groupStart && i !== 0 ? "17px" : "0",
										}}
										key={i}
									>
										{m.groupStart && (
											<>
												{avUrl === "loading" ? (
													<div className="relative w-10 h-10 scale-75">
														<LoadingSpinner />
													</div>
												) : (
													<>
														{m.styled ? (
															<div className="relative rounded-full w-10 h-10 overflow-hidden">
																<Image
																	src={
																		avUrl || `${baseImgUrl}/avatars/blue.png`
																	}
																	draggable={false}
																	className="top-[calc(40px*0.09)] left-[calc(40px*0.09)] absolute rounded-full w-[calc(40px*0.82)] h-[calc(40px*0.82)]"
																/>
																{decoUrl && (
																	<Image
																		src={decoUrl}
																		draggable={false}
																		className="top-0 left-0 absolute"
																	/>
																)}
															</div>
														) : (
															<Image
																src={avUrl || `${baseImgUrl}/avatars/blue.png`}
																draggable={false}
																className="rounded-full w-10 h-10"
															/>
														)}
													</>
												)}
											</>
										)}
										<div className="flex flex-col overflow-hidden">
											{m.groupStart && (
												<p className="flex items-center max-w-[250px] h-fit font-medium text-base">
													<span className="mr-1 text-ellipsis text-nowrap overflow-hidden">
														{name || "Display Name"}
													</span>
													<span className="ml-1 h-4 text-nowrap text-secondaryLight text-xs">
														Today at{" "}
														{[
															new Date().getHours() % 12,
															new Date().getMinutes(),
														]
															.map((e) => e.toString().padStart(2, "0"))
															.join(":") +
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

						{/* pls support */}
						<div className="flex flex-col justify-start items-stretch p-4 rounded-lg w-full text-center highlight">
							<p>
								Help support the project <Twemoji emoji="🙏" />
							</p>
							<button
								type="button"
								className="flex justify-center items-center gap-1.5 bg-white/10 hover:bg-white/20 mt-3 py-1.5 rounded-lg transition shiny-button"
								onClick={() => {
									window.open(
										"https://github.com/ItsPi3141/discord-fake-avatar-decorations",
									);
								}}
							>
								<Icons.star />
								Star on GitHub
							</button>
							<button
								type="button"
								className="flex justify-center items-center gap-1.5 bg-white/10 hover:bg-white/20 mt-3 py-1.5 rounded-lg transition"
								onClick={() => {
									navigator.clipboard.writeText(window.location.href);
									setShared(true);
									setTimeout(() => {
										setShared(false);
									}, 1500);
								}}
								data-tooltip-id="share-tooltip"
								data-tooltip-content="Copied to clipboard!"
							>
								<Icons.link />
								Share the website
							</button>
							<Tooltip
								id="share-tooltip"
								opacity={1}
								style={{
									display: shared ? "block" : "none",
									background: "#229f56",
									color: "white",
									borderRadius: "8px",
									padding: "6px 12px 4px 12px",
									boxShadow:
										"0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
								}}
								closeEvents={[]}
								place="bottom"
							/>
							<button
								type="button"
								className="flex justify-center items-center gap-1.5 bg-white/10 hover:bg-white/20 mt-3 py-1.5 rounded-lg transition"
								onClick={() => {
									window.open(
										"https://github.com/ItsPi3141/discord-fake-avatar-decorations/issues/new",
									);
								}}
							>
								<Icons.bug />
								Report a bug
							</button>
						</div>
					</div>
				</div>
				<p className="mb-4 text-center text-gray-400 text-sm">
					Website made by{" "}
					<Link
						href={"https://github.com/ItsPi3141"}
						className="hover:text-gray-200 underline"
						target="_blank"
					>
						ItsPi3141
					</Link>
					<br />
					This project is open-source! View{" "}
					<Link
						href={
							"https://github.com/ItsPi3141/discord-fake-avatar-decorations"
						}
						className="hover:text-gray-200 underline"
						target="_blank"
					>
						source code
					</Link>{" "}
					on GitHub.
					<br />
					This site is NOT affiliated with Discord Inc. in any way. All images
					and assets belong to Discord Inc.
					<br />
					Discord Character avatars were created by Bred and Jace. View the
					collection on{" "}
					<Link
						href={
							"https://www.figma.com/community/file/1316822758717784787/ultimate-discord-library"
						}
						className="hover:text-gray-200 underline"
						target="_blank"
					>
						Figma
					</Link>
				</p>
			</main>
			<Modal
				title={"Save Decorated Avatar"}
				subtitle={
					isGeneratingAv
						? "Please wait while the image is being generated."
						: "You can save the image below. You may need to extract a still frame from the image if you do not have an active Nitro subscription."
				}
				visible={downloadModalVisible}
				onClose={() => {
					setDownloadModalVisible(false);
				}}
			>
				{isGeneratingAv ? (
					<div className="flex flex-col justify-center items-center gap-4 grow">
						<LoadingSpinner />
						<p>Creating image...</p>
					</div>
				) : (
					<>
						{generationFailed ? (
							<div className="flex flex-col justify-center items-center gap-4 grow">
								<p className="text-center text-red-400">
									Failed to generate image
									<br />
									Please try again.
								</p>
							</div>
						) : (
							<div className="flex flex-col justify-center items-center gap-4 grow">
								<Image
									src={finishedAv}
									draggable={false}
									width={128}
									height={128}
								/>
								<div className="flex flex-col w-full">
									<div className="flex flex-col items-center gap-2 mt-3 w-full">
										<button
											type="button"
											className="flex justify-center items-center gap-1.5 py-1.5 w-72 button-light"
											onClick={() => {
												const a = document.createElement("a");
												a.href = finishedAv;
												a.download = `discord_fake_avatar_decorations_${Date.now()}.gif`;
												a.click();
											}}
										>
											<Icons.download />
											Save
										</button>
										<button
											type="button"
											className="flex justify-center items-center gap-1.5 py-1.5 w-72 button-light"
											onClick={() => {
												if (!isServer) {
													try {
														sessionStorage.setItem("image", finishedAv);
														router.push("/gif-extractor");
													} catch {
														setFileTooBig(true);
													}
												}
											}}
										>
											<Icons.image />
											Extract still image
										</button>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</Modal>
			<Modal
				title={"File too big"}
				subtitle={
					"You will need to save the image and upload to the GIF frame extractor manually"
				}
				visible={fileTooBig}
				onClose={() => {
					setDownloadModalVisible(false);
					setFileTooBig(false);
					router.push("/gif-extractor");
				}}
				secondaryText="Cancel"
				closeText="Proceed"
			>
				<div className="flex flex-col items-center">
					<button
						type="button"
						className="flex justify-center items-center gap-1.5 py-1.5 w-72 button-dark"
						onClick={() => {
							const a = document.createElement("a");
							a.href = finishedAv;
							a.download = `discord_fake_avatar_decorations_${Date.now()}.gif`;
							a.click();
						}}
					>
						<Icons.download />
						Save
					</button>
				</div>
			</Modal>
			<FileUpload
				onUpload={async (e) => {
					const file = e.dataTransfer.files.item(0);
					if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
						printErr(
							`Expected image/png, image/jpeg, or image/gif. Got ${file.type}`,
						);
						throw printErr("Invalid file type");
					}
					const ab = await file.arrayBuffer();
					if (getMimeTypeFromArrayBuffer(ab) == null) {
						throw printErr("Invalid image file");
					}
					const reader = new FileReader();
					reader.readAsDataURL(new Blob([ab]));
					reader.onload = () => {
						previewAvatar(reader.result);
					};
				}}
			/>
		</>
	);
};

const LoadingSpinner = (props) => (
	<span {...props} className={`loading-container ${props.className || ""}`}>
		<span className="loading-cube" />
		<span className="loading-cube" />
	</span>
);
