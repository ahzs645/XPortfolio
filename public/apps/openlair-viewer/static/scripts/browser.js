async function fileOpen(program) {
	const path = await getWindow({ load: 'browser', open: 'open', program });
	if (!path) return null;
	getWindow({ load: program, open: path });
	return path;
}

async function fileLoad(path) {
	if (!path) return null;
	const blob = await doRequest(path);
	const type = blob.type;
	if (type && type.startsWith('text/')) return await blob.text();
	if (type === 'application/json') return JSON.parse(await blob.text());
	return blob;
}

async function fileSave(program, path, content) {
    
	if (!path) {
		path = await getWindow({ load: 'browser', open: 'save', program });
		if (!path) return null;
	}
	const parts = path.replace(/\\/g, '/').split('/');
	const filename = parts.pop();
	const directory = parts.join('/');
	if (!directory) {
		await getWindow({ load: 'dialog', open: 'alert', message: 'Cannot save here' });
		return;
	}
	if (!filename) {
		await getWindow({ load: 'dialog', open: 'alert', message: 'Please enter a file name' });
		return;
	}
	if (/[\\\/:*?"<>|]/.test(filename)) {
		await getWindow({ load: 'dialog', open: 'alert', message: 'File name cannot contain: \\ / : * ? " < > |' });
		return;
	}
	const confirmed = await getWindow({ load: 'dialog', open: 'confirm', message: 'Are you sure?' });
	if (!confirmed) return;
	let blob;
	if (content instanceof Blob) blob = content;
	else if (typeof content === 'string') {
		const trimmed = content.trim();
		blob = new Blob([content], { type: trimmed.startsWith('<') && trimmed.endsWith('>') ? 'text/html' : 'text/plain' });
	} else if (typeof content === 'object') {
		blob = new Blob([JSON.stringify(content)], { type: 'application/json' });
	} else {
		await getWindow({ load: 'dialog', open: 'error', message: 'Unsupported content type for save' });
		return;
	}
	try {
		await writeFile(path, blob);
		renderContainer(directory);
		getWindow({ load: program, open: path });
	} catch {
		await getWindow({ load: 'dialog', open: 'error', message: 'Error saving file' });
	}
}
