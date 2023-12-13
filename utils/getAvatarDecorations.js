(() => {
	var e = [];
	document.querySelectorAll("div[class^='shopCard_'] svg:nth-child(2) div[class^='avatarStack_'] > img[class^='avatar_']").forEach((el) => {
		e.push(el.getAttribute("src").replace("size=160&passthrough=false", "size=1024"));
	});
	console.log(e.join("\n"));
})();
