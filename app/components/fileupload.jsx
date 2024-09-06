import { useEffect, useState } from "react";
import "./fileupload.css";

let closeInter = 0;
export default function FileUpload({ onUpload }) {
	const [visible, setVisible] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		document.addEventListener("dragover", (e) => {
			e.preventDefault();
			e.stopPropagation();
			setError(false);
			setVisible(true);
			try {
				clearInterval(closeInter);
			} catch {}
		});
	}, []);

	return (
		<div
			className="top-0 right-0 bottom-0 left-0 z-50 fixed flex justify-center items-center bg-[#000d] text-white transition-opacity select-none"
			style={{
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? "" : "none",
			}}
			onDragLeave={() => {
				setVisible(false);
				setError(false);
			}}
			onDrop={async (e) => {
				e.preventDefault();
				e.stopPropagation();
				try {
					await onUpload(e);
					setVisible(false);
				} catch {
					setError(true);
					closeInter = setInterval(() => {
						setVisible(false);
						clearInterval(closeInter);
					}, 1000);
				}
			}}
		>
			{visible && (
				<div
					className={`relative p-2.5 rounded-[10px] w-[330px] h-[190px] pointer-events-none transition-colors duration-200 ${
						error ? "bg-error upload-shake" : "bg-primary"
					}`}
				>
					{/* Sparkle effects container */}
					<div>
						<div
							className="sparkle-white upload-effect"
							style={{ bottom: "-40px", right: "-15px" }}
						/>
						<div
							className="sparkle-white upload-effect"
							style={{ top: "-67px", right: "12px" }}
						/>
						<div
							className="light-white upload-effect"
							style={{ top: "24px", right: "-35px" }}
						/>
						<div
							className="light-white upload-effect"
							style={{ top: "-32px", left: "-10px" }}
						/>
						<div
							className="cross-white upload-effect"
							style={{ right: "100px", bottom: "-35px" }}
						/>
						<div
							className="cross-white upload-effect"
							style={{ left: "-70px", bottom: "50px" }}
						/>
						<div
							className="pop-white upload-effect"
							style={{ bottom: "-40px", left: "50px" }}
						/>
					</div>
					{/* Upload box */}
					<div className="flex flex-col justify-center items-center border-[#fff6] border-2 border-dashed rounded-md w-full h-full">
						<div className="relative w-[100px] h-[60px]">
							<div className="static upload-icon-wrapper">
								<div className="upload-icon-left upload-icon">
									<ImageSvg />
								</div>
							</div>
							<div className="static upload-icon-wrapper">
								<div className="upload-icon-right upload-icon">
									<ImageSvg />
								</div>
							</div>
							<div className="static upload-icon-wrapper-middle">
								<div className="upload-icon upload-icon-middle">
									<ImageSvg />
								</div>
							</div>
						</div>
						<p className="font-bold text-2xl">
							{error ? "Invalid file format" : "Upload image"}
						</p>
						<p className="text-sm">
							{error
								? "Please select a valid image file"
								: "Drop your avatar here to use it"}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

function ImageSvg() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="96"
			viewBox="0 0 72 96"
			width="72"
			xmlns="http://www.w3.org/2000/svg"
		>
			<clipPath id="a">
				<path d="m0 0h72v96h-72z" />
			</clipPath>
			<clipPath id="b">
				<path d="m0 0h72v96h-72z" />
			</clipPath>
			<clipPath id="c">
				<path d="m12 36h48v48h-48z" />
			</clipPath>
			<g clipPath="url(#a)">
				<g clipPath="url(#b)">
					<path
						d="m72 29.3v60.3c0 2.24 0 3.36-.44 4.22-.38.74-1 1.36-1.74 1.74-.86.44-1.98.44-4.22.44h-59.20002c-2.24 0-3.36 0-4.22-.44-.74-.38-1.359997-1-1.739996-1.74-.44000025-.86-.44000006-1.98-.43999967-4.22l.00001455-83.2c.00000039-2.24.00000059-3.36.44000112-4.22.38-.74 1-1.36 1.74-1.74.86-.43999947 1.98-.43999927 4.22-.43999888l36.3.00000635c1.96.00000034 2.94.00000051 3.86.22000053.5.12.98.28 1.44.5v16.879992c0 2.24 0 3.36.44 4.22.38.74 1 1.36 1.74 1.74.86.44 1.98.44 4.22.44h16.88c.22.46.38.94.5 1.44.22.92.22 1.9.22 3.86z"
						fill="#d3d6fd"
					/>
					<path
						d="m68.26 20.26c1.38 1.38 2.06 2.06 2.56 2.88.18.28.32.56.46.86h-16.88c-2.24 0-3.36 0-4.22-.44-.74-.38-1.36-1-1.74-1.74-.44-.86-.44-1.98-.44-4.22v-16.880029c.3.14.58.28.86.459999.82.5 1.5 1.18 2.88 2.56z"
						fill="#939bf9"
					/>
				</g>
				<g clipPath="url(#c)" fill="#5865f2">
					<path d="m24 56c4.4183 0 8-3.5817 8-8s-3.5817-8-8-8-8 3.5817-8 8 3.5817 8 8 8z" />
					<path d="m44 55.998-10.352 15.528-5.648-7.528-12 16h40z" />
				</g>
			</g>
		</svg>
	);
}
