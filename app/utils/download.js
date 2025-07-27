// https://github.com/ffmpegwasm/ffmpeg.wasm/blob/096f5b2358e4d27d5798308e67382d815d5ae1a4/packages/util/src/index.ts#L104-L158
export const downloadWithProgress = async (url, cb) => {
	const resp = await fetch(url);
	let buf;

	try {
		const reader = resp.body?.getReader();
		if (!reader) throw ERROR_RESPONSE_BODY_READER;

		const chunks = [];
		let received = 0;
		for (;;) {
			const { done, value } = await reader.read();
			const delta = value ? value.length : 0;

			if (done) {
				cb?.({ url, received, delta, done });
				break;
			}

			chunks.push(value);
			received += delta;
			cb?.({ url, received, delta, done });
		}

		const data = new Uint8Array(received);
		let position = 0;
		for (const chunk of chunks) {
			data.set(chunk, position);
			position += chunk.length;
		}

		buf = data.buffer;
	} catch (e) {
		buf = await resp.arrayBuffer();
		cb?.({
			url,
			received: buf.byteLength,
			delta: 0,
			done: true,
		});
	}

	return buf;
};
