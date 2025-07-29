import { useEffect, useState } from "preact/hooks";

export function FontPreloader() {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setLoaded(true);
	}, []);

	return (
		<>
			{!loaded && (
				<div
					style={{
						top: 0,
						left: 0,
						position: "fixed",
						opacity: 0,
						color: "transparent",
						pointerEvents: "none",
					}}
				>
					{[400, 500, 600, 700].map((weight) => (
						<p key={weight} style={{ fontWeight: weight, fontSize: "1px" }}>
							e
						</p>
					))}
					<p className="ginto" style={{ fontSize: "1px" }}>
						e
					</p>
					<p className="nitro-font" style={{ fontSize: "1px" }}>
						e
					</p>
				</div>
			)}
		</>
	);
}
