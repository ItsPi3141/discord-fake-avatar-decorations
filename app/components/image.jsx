const baseImgUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";

export default function Image(props) {
	return (
		<>
			{props.src !== "" && (
				<img
					{...props}
					alt=""
					src={
						props.src.startsWith("http") || props.src.startsWith("data:")
							? props.src
							: `${baseImgUrl}${props.src}`
					}
					loading="lazy"
				/>
			)}
		</>
	);
}
