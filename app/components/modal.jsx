export default function Modal(props) {
	return (
		<div
			className="top-0 left-0 fixed flex justify-center items-center bg-[#000d] w-screen h-screen select-none"
			style={{
				transition: "opacity 0.2s ease-in-out",
				opacity: props.visible ? 1 : 0,
				pointerEvents: props.visible ? "" : "none",
			}}
		>
			<div
				className="relative flex flex-col bg-surface4 xs:rounded-lg w-screen xs:w-[420px] min-h-screen xs:min-h-[200px] text-white overflow-hidden modal-box"
				style={{
					transition: "all 0.2s ease-in-out",
					scale: props.visible ? 1 : 0,
					transform: props.visible ? "translateY(0)" : "translateY(100%)",
				}}
			>
				<button
					type="button"
					className="top-4 right-4 absolute text-secondaryAlt hover:text-white transition-colors [transition-duration:200ms]"
					onClick={props.onClose}
				>
					<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
						/>
					</svg>
				</button>
				{props.title && (
					<div className="flex justify-center pt-8">
						<p className="font-semibold text-2xl [letter-spacing:.02em] text-center">
							{props.title}
						</p>
					</div>
				)}
				{props.subtitle && (
					<div className="flex justify-center px-4">
						<p className="text-center text-sm text-white/70 xs:text-base">
							{props.subtitle}
						</p>
					</div>
				)}
				<div className="flex flex-col justify-stretch p-4 grow">
					{props.children}
				</div>
				<div className="flex justify-end bg-surface3 p-4 h-[70px]">
					{props.secondaryText && (
						<button
							type="button"
							className="px-6 py-2 rounded text-sm text-white/70 hover:underline transition"
							onClick={props.onClose}
						>
							{props.secondaryText || "Cancel"}
						</button>
					)}
					<button
						type="button"
						className="bg-primary hover:bg-primaryAlt px-6 py-2 rounded text-sm transition"
						onClick={props.onClose}
					>
						{props.closeText || "Close"}
					</button>
				</div>
			</div>
		</div>
	);
}
