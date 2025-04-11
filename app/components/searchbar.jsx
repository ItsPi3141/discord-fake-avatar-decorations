"use client";

import { useState } from "react";
import { Icons } from "./icons";

export default function SearchBar({ onValueChanged, placeholder }) {
	const [query, setQuery] = useState("");

	return (
		<div className="relative">
			<input
				type="text"
				className="pr-12 w-full text-input"
				placeholder={placeholder}
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					onValueChanged(e.target.value);
				}}
			/>
			{query.length > 0 ? (
				<button
					type="button"
					onClick={() => setQuery("")}
					className="top-1/2 right-4 absolute h-fit text-text-muted hover:text-white transition-colors -translate-y-1/2 transform"
				>
					<Icons.close width="1.25em" height="1.25em" />
				</button>
			) : (
				<div className="top-1/2 right-4 absolute text-text-muted -translate-y-1/2 transform">
					<Icons.search width="1.25em" height="1.25em" />
				</div>
			)}
		</div>
	);
}
