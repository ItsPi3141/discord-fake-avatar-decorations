export function Modal(props) {
	return (
		<div
			className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-[#000d] select-none"
			style={{
				transition: "opacity 0.2s ease-in-out",
				opacity: props.visible ? 1 : 0,
				pointerEvents: props.visible ? "" : "none"
			}}
		>
			<div
				className="w-[420px] min-h-[400px] bg-surface4 text-white rounded-lg overflow-hidden flex flex-col relative"
				style={{
					transition: "scale 0.2s ease-in-out",
					scale: props.visible ? 1 : 0
				}}
			>
				<button
					className="absolute top-4 right-4 text-secondaryAlt hover:text-white transition-colors [transition-duration:200ms]"
					onClick={props.onClose}
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
						></path>
					</svg>
				</button>
				{props.title && (
					<div className="pt-8 flex justify-center">
						<p className="text-2xl font-semibold [letter-spacing:.02em]">{props.title}</p>
					</div>
				)}
				{props.subtitle && (
					<div className="flex justify-center px-4">
						<p className="text-white text-opacity-70 text-center">{props.subtitle}</p>
					</div>
				)}
				<div className="grow p-4 flex flex-col justify-stretch">{props.children}</div>
				<div className="bg-surface3 p-4 h-[70px] flex justify-end">
					<button
						className="bg-primary hover:bg-primaryAlt py-2 px-4 rounded transition"
						onClick={props.onClose}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
