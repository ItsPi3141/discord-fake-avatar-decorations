import { Icons } from "./icons";

export default function Modal(props) {
	return (
		<div
			className="top-0 left-0 fixed flex justify-center items-center bg-black/80 w-screen h-screen select-none"
			style={{
				transition: "opacity 0.2s ease-in-out",
				opacity: props.visible ? 1 : 0,
				pointerEvents: props.visible ? "" : "none",
			}}
		>
			<div
				className="relative flex flex-col gap-4 border-[#97979f1f] bg-surface5 shadow-sm shadow-surface1/60 p-4 border xs:rounded-xl w-screen xs:w-[420px] min-h-screen xs:min-h-[200px] text-white overflow-hidden modal-box"
				style={{
					transition: "all 0.2s ease-in-out",
					scale: props.visible ? 1 : 0,
					transform: props.visible ? "translateY(0)" : "translateY(100%)",
				}}
			>
				<button
					type="button"
					className="top-4 right-4 absolute opacity-50 hover:opacity-100 text-iconButton transition-opacity [transition-duration:200ms]"
					onClick={props.onClose}
				>
					<Icons.close width="24px" height="24px" />
				</button>
				<div className="flex flex-col gap-2">
					{props.title && (
						<div className="flex justify-center">
							<p className="font-semibold text-2xl text-white/80 [letter-spacing:.02em] text-center">
								{props.title}
							</p>
						</div>
					)}
					{props.subtitle && (
						<div className="flex justify-center">
							<p className="text-center text-sm text-white/70 xs:text-base">
								{props.subtitle}
							</p>
						</div>
					)}
				</div>
				<div className="flex flex-col justify-stretch grow">
					{props.children}
				</div>
				<div className="flex justify-end bg-surface5 mt-4 h-[38px]">
					{props.secondaryText && (
						<button
							type="button"
							className="px-6 py-2 rounded-lg text-sm text-white/70 hover:underline transition"
							onClick={props.onClose}
						>
							{props.secondaryText || "Cancel"}
						</button>
					)}
					<button
						type="button"
						className="px-6 py-2 text-sm button-primary"
						onClick={props.onClose}
					>
						{props.closeText || "Close"}
					</button>
				</div>
			</div>
		</div>
	);
}
