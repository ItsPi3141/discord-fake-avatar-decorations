const base = process.env.VITE_BASE_IMAGE_URL || "";

const faviconHtml = `
		<link rel="apple-touch-icon" sizes="180x180" href="${base}/apple-touch-icon.png" >
		<link rel="icon" type="image/png" sizes="32x32" href="${base}/favicon-32x32.png" >
		<link rel="icon" type="image/png" sizes="16x16" href="${base}/favicon-16x16.png" >
		<link rel="icon" type="image/x-icon" sizes="16x16" href="${base}/favicon.ico" >
`;

export const generateFavicons = (html) => {
	return html.replace(/(?<=<head>)/, faviconHtml);
};
