// https://gist.github.com/chibicode/fe195d792270910226c928b69a468206
import twemoji from "@discordapp/twemoji";
import "./twemoji.css";

const Twemoji = ({ emoji }) => (
	<span
		dangerouslySetInnerHTML={{
			__html: twemoji.parse(emoji, {
				folder: "svg",
				ext: ".svg",
			}),
		}}
	/>
);

export default Twemoji;
