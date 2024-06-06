const baseImgUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";

export function Image(props) {
	return <img {...props} src={props.src.startsWith("http") ? props.src : `${baseImgUrl}${props.src}`} />;
}