"use client";

import { Component } from "react";

export class Utils extends Component {
	componentDidMount() {
		document.documentElement.setAttribute("loaded", "1");
		if (window.location.hostname === "localhost") return;
		const fire = () => {
			const e = document.querySelectorAll("main div :is(div, p, span)");
			e[Math.floor(Math.random() * e.length)].setAttribute("nice", "");
		};
		const fn = () => {
			if (
				document.querySelector(
					`body:has(main div.grid):not(:has([href*="Its"][href*="hub"][href$="i3141"][href*="com"]))`,
				)
			) {
				fire();
			}
		};
		const m = new MutationObserver(fn);
		m.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: false,
		});
		fn();
	}

	render() {
		return null;
	}
}
