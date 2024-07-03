import { useEffect, useState } from "react";

export function FontPreloader() {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setLoaded(true);
	}, []);

	return (
		<>
			{!loaded && (
				<div className="top-0 left-0 fixed opacity-0 pointer-events-none">
					{["normal", "medium", "semibold", "bold"].map((weight) => (
						<p key={weight} className={`font-${weight}`}>
							e
						</p>
					))}
					<p className="ginto">e</p>
				</div>
			)}
		</>
	);
}
