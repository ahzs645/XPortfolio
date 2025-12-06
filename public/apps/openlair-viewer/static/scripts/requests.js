
async function getToken(path) {
	const timestamp = Math.floor(Date.now() / 1000);
	const randomBytes = crypto.getRandomValues(new Uint8Array(4));
	const prefixHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2,'0')).join('');
	const tokenStr = prefixHex + path + timestamp;
	const encoder = new TextEncoder();
	const tokenHex = Array.from(encoder.encode(tokenStr)).map(b => b.toString(16).padStart(2,'0')).join('');
	return tokenHex;
}

async function doRequest(path, data = {}) {

	let content;

	if (path.startsWith("payload=")) {
		content = path;
	} else {
		const node = await getNode(path);
		if (!node) {
			getWindow({load:'dialog', open:'error', message:'File not found'})
			return;
		}
		content = node.content;
	}

	if (content instanceof Blob) {
		const text = (await content.text()).trim();
		let resolved = null;
		try {
			const parsed = JSON.parse(text);
			if (parsed && typeof parsed.path === "string") resolved = parsed.path;
		} catch {}
		if (!resolved && /^(payload=|[a-zA-Z]:\/|\/|https?:\/\/)/.test(text)) resolved = text;
		if (resolved) content = resolved;
		else return content;
	}

	const token = await getToken(content);
	const formData = new URLSearchParams(data);

	try {
		const res = await fetch(`/token/${token}`, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData.toString()
		});

		if (!res.ok) throw new Error('Fetch failed');
		return await res.blob();
	} catch (e) {
		getWindow({load:'dialog', open:'error', message:'An unexpected error has occurred. Please try again.'})
	}
}