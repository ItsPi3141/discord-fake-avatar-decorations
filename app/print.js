// it logs to console
export function print(message, style) {
	try {
		let m = "";
		let s = [];
		for (const i in message) {
			if (m === "") {
				m += "%c";
			} else {
				m += "%c %c";
				s.push("");
			}
			m += message[i];
			s.push(obj2css(style[i] || {}));
		}
		console.log(m, ...s);
	} catch {
		console.log(`%cinfo%c${message}`, "color:white;background:#444;padding:2px 8px;border-radius:10px", "");
	}
}
export function printErr(message) {
	print(
		["error", message],
		[
			{
				color: "white",
				background: "#ff4655",
				padding: "2px 8px",
				borderRadius: "10px",
			},
		]
	);
}

function obj2css(obj) {
	return Object.entries(obj)
		.map(
			([property, value]) =>
				`${property
					.split(/(?=[A-Z])/)
					.join("-")
					.toLowerCase()}:${value}`
		)
		.join(";");
}
