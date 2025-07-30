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
						pointerEvents: "none",
						fontSize: "1px",
					}}
				>
					{[400, 500, 600, 700].map((weight) => (
						<p key={weight} style={{ fontWeight: weight }}>
							e
						</p>
					))}
					<p className="ginto">e</p>
					<p className="nitro-font">e</p>
				</div>
			)}
		</>
	);
}
