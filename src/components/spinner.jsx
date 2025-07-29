export const LoadingCubes = (props) => (
	<span
		{...props}
		className={`loading-cube-container ${props.className || ""}`}
	>
		<span className="loading-cube" />
		<span className="loading-cube" />
	</span>
);

export const LoadingCircle = (props) => (
	<div
		{...props}
		className={`loading-circle-container ${props.className || ""}`}
	>
		<div className="loading-circle-inner">
			<svg className="loading-circle" viewBox="25 25 50 50" aria-hidden="true">
				<circle className="path path3" cx="50" cy="50" r="20" />
				<circle className="path path2" cx="50" cy="50" r="20" />
				<circle className="path" cx="50" cy="50" r="20" />
			</svg>
		</div>
	</div>
);
