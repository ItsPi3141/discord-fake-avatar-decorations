const baseImgUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";

export default function Image(props) {
	return (
		<img
			{...props}
			alt=""
			src={
				props.src.startsWith("http") ||
				props.src.startsWith("data:") ||
				props.src === ""
					? props.src
					: `${baseImgUrl}${props.src}`
			}
		/>
	);
}
