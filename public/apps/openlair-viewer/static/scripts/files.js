const programTypes = {
	coder: ['html','htm','php','js','css','xml','json','rtf'],
	notepad: ['txt','ini','log','cfg','nfo','md'],
	wordpad: ['rtf','html'],
	paint: ['bmp','jpg','jpeg','png','gif','tif','tiff','webp'],
	viewer: ['jpg','jpeg','png','gif','tif','tiff','webp','bmp'],
	player: ['mp3','wav','ogg','flac','mp4','avi','mkv','mov','wmv','webm']
};

const fileTypes = {
	exe: 'Executable File',
	dll: 'Dynamic Link Library',
	sys: 'System File',
	com: 'Command File',
	bat: 'Batch File',
	cmd: 'Command Script',
	lnk: 'Shortcut File',
	ps1: 'PowerShell Script',
	vbs: 'VBScript File',
	js: 'JavaScript File',
	efi: 'EFI Executable',
	inf: 'Setup Information',
	reg: 'Registry File',
	ini: 'Initialization File',
	log: 'Log File',
	tmp: 'Temporary File',
	bak: 'Backup File',
	url: 'Internet Shortcut',
	doc: 'Microsoft Word Document',
	docx: 'Microsoft Word Open XML Document',
	xls: 'Microsoft Excel Spreadsheet',
	xlsx: 'Microsoft Excel Open XML Spreadsheet',
	ppt: 'Microsoft PowerPoint Presentation',
	pptx: 'Microsoft PowerPoint Open XML Presentation',
	pub: 'Microsoft Publisher Document',
	one: 'Microsoft OneNote Document',
	rtf: 'Rich Text Document',
	txt: 'Text Document',
	pdf: 'PDF Document',
	odt: 'OpenDocument Text',
	ods: 'OpenDocument Spreadsheet',
	odp: 'OpenDocument Presentation',
	csv: 'Comma Separated Values',
	md: 'Markdown Document',
	nfo: 'Information File',
	cfg: 'Configuration File',
	bmp: 'Bitmap Image',
	jpg: 'JPEG Image',
	jpeg: 'JPEG Image',
	png: 'PNG Image',
	gif: 'GIF Image',
	tif: 'TIFF Image',
	tiff: 'TIFF Image',
	webp: 'WebP Image',
	svg: 'Scalable Vector Graphic',
	ico: 'Icon File',
	cur: 'Cursor File',
	mp3: 'MP3 Audio',
	wav: 'WAV Audio',
	ogg: 'OGG Audio',
	flac: 'FLAC Audio',
	aac: 'AAC Audio',
	m4a: 'M4A Audio',
	wma: 'Windows Media Audio',
	mp4: 'MP4 Video',
	avi: 'AVI Video',
	mkv: 'Matroska Video',
	mov: 'QuickTime Movie',
	wmv: 'Windows Media Video',
	webm: 'WebM Video',
	flv: 'Flash Video',
	mpeg: 'MPEG Video',
	mpg: 'MPEG Video',
	zip: 'ZIP Archive',
	rar: 'RAR Archive',
	tar: 'TAR Archive',
	gz: 'GZip Compressed File',
	iso: 'ISO Disc Image',
	img: 'Disc Image',
	ttf: 'TrueType Font',
	otf: 'OpenType Font',
	fon: 'Bitmap Font',
	java: 'Java Source File',
	py: 'Python Script',
	sql: 'SQL File',
	json: 'JSON File',
	xml: 'XML Document',
	eml: 'Email Message',
	msg: 'Outlook Message',
	torrent: 'BitTorrent File',
	theme: 'Windows Theme File',
	xps: 'XPS Document',
	asp: 'Active Server Page',
	aspx: 'ASP.NET Page',
	jsp: 'Java Server Page',
	php: 'PHP Script',
	lock: 'Lock File'
};

const DRIVE_INFO = {
	C: { total: 20 * 1024 * 1024 * 1024, type: 'Local Disk', fs: 'NTFS' },
	A: { total: 1.44 * 1024 * 1024, type: '3\u00BD  Floppy', fs: 'FAT' },
	D: { total: 4.7 * 1024 * 1024 * 1024, type: 'DVD Drive', fs: 'UDF', readonly: true }
};

const DB_NAME = "VFS_XPerience";
const DB_VERSION = 1;

const driveLocks = {};

let vfsReadyPromise = null;

async function ensureVFSReady() {
	if (!vfsReadyPromise) vfsReadyPromise = initVFS();
	return vfsReadyPromise;
}

function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = e => {
			const db = e.target.result;
			for (const drive in DRIVE_INFO) {
				if (!db.objectStoreNames.contains(drive)) db.createObjectStore(drive);
			}
		};
		request.onsuccess = e => resolve(e.target.result);
		request.onerror = e => reject(e.target.error);
	});
}

async function initVFS() {
	try {
		const db = await openDB();
		const drives = Object.keys(DRIVE_INFO);
		const checks = await Promise.all(drives.map(async drive => {
			try {
				const nodes = await loadAllNodes(drive);
				return { drive, empty: !nodes || Object.keys(nodes).length === 0 };
			} catch {
				return { drive, empty: true };
			}
		}));
		const needPopulate = checks.some(c => c.empty);
		if (needPopulate) {
			const blob = await doRequest('payload=files');
			const text = await blob.text();
			const structure = JSON.parse(text);
			if (structure && structure.length) await populateVFS(structure);
		}
		await Promise.all(Object.keys(DRIVE_INFO).map(drive => syncFolderSizes(getDrivePrefix(drive)).catch(() => {})));
	} catch (error) {
		console.error("Error initializing VFS:", error);
	}
}

function normalizePath(path) {
	if (!path || typeof path !== "string") return path;
	let p = path.replace(/\\/g, '/');
	const driveRoot = /^([A-Z]):\/?$/i.exec(p);
	if (driveRoot) return driveRoot[1].toUpperCase() + ":/";
	p = p.replace(/\/+/g, '/');
	return p;
}

function getDrivePrefix(driveKey) {
	return driveKey.toUpperCase() + ":/";
}

function extractDriveLetter(pathOrDrive) {
	if (!pathOrDrive || typeof pathOrDrive !== "string") throw new Error("Invalid drive input");
	const m = pathOrDrive.match(/^([a-zA-Z]):/);
	if (m) {
		const letter = m[1].toUpperCase();
		if (!DRIVE_INFO[letter]) throw new Error("Unknown drive");
		return letter;
	}
	const letter = pathOrDrive[0].toUpperCase();
	if (!DRIVE_INFO[letter]) throw new Error("Unknown drive");
	return letter;
}

async function getDiskUsage(pathOrDrive) {
	pathOrDrive = normalizePath(pathOrDrive);
	const driveLetter = extractDriveLetter(pathOrDrive);
	const allNodes = await loadAllNodes(driveLetter);
	let total = 0;
	for (const key in allNodes) {
		const n = allNodes[key];
		if (!n.children) total += n.size || 0;
	}
	return total;
}

async function ensureDriveHasSpace(pathOrDrive, deltaBytes) {
	pathOrDrive = normalizePath(pathOrDrive);
	const drive = extractDriveLetter(pathOrDrive);
	const used = await getDiskUsage(drive);
	const total = DRIVE_INFO[drive].total;
	const available = total - used;
	if (deltaBytes <= 0) return true;
	if (deltaBytes > available) {
		getWindow({load:'dialog', open:'error', message:'Not enough space on ' + getDrivePrefix(drive) + '. Required: ' + formatBytes(deltaBytes) + '. Available: ' + formatBytes(available) + '.'})
		return false;
	}
	return true;
}

function isDriveReadOnly(pathOrDrive) {
	try {
		const letter = extractDriveLetter(pathOrDrive);
		return Boolean(DRIVE_INFO[letter].readonly);
	} catch {
		return false;
	}
}

async function isProtected(path, action, options = ['system','readonly','recursive']) {
	path = normalizePath(path);
	let node = null;
	try {
		node = await getNode(path);
	} catch {
		node = null;
	}
	if (options.includes('readonly') && isDriveReadOnly(path)) {
		getWindow({ load: 'dialog', open: 'error', message: 'This drive is read-only and cannot be modified.' });
		return true;
	}
	if (options.includes('system') && node && node.system) {
		const msg = node.children
			? 'This folder is a system folder and cannot be modified.'
			: 'This file is a system file and cannot be modified.';
		getWindow({ load: 'dialog', open: 'error', message: msg });
		return true;
	}
	if (options.includes('recursive') && node && node.children) {
		const children = await listDir(path);
		for (const child of children) {
			if (await isProtected(child.path, options)) return true;
		}
	}
	return false;
}

async function saveNode(path, node, updateModified = true) {
	path = normalizePath(path);
	const db = await openDB();
	const now = Date.now();
	if (!node.created) node.created = now;
	if (updateModified) node.modified = now;
	node.accessed = now;
	if (node.children) node.size = node.size ?? 0;
	else if (typeof node.content === "string") node.size = node.size ?? new TextEncoder().encode(node.content).length;
	else if (node.content instanceof Blob) node.size = node.size ?? new TextEncoder().encode(await node.content.text()).length;
	else node.size = node.size ?? 0;
	return new Promise((resolve, reject) => {
		const tx = db.transaction(extractDriveLetter(path), "readwrite");
		tx.objectStore(extractDriveLetter(path)).put(node, path);
		tx.oncomplete = () => resolve(true);
		tx.onerror = e => reject(e.target.error);
	});
}

async function getNode(path) {
	path = normalizePath(path);
	const storeName = extractDriveLetter(path);
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, "readonly");
		const req = tx.objectStore(storeName).get(path);
		req.onsuccess = async () => {
			const node = req.result || null;
			if (node) {
				node.accessed = Date.now();
				try { await saveNode(path, node, false); } catch {}
			}
			resolve(node);
		};
		req.onerror = e => reject(e.target.error);
	});
}

async function deleteNode(path) {
	path = normalizePath(path);
	const db = await openDB();
	const storeName = extractDriveLetter(path);
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, "readwrite");
		tx.objectStore(storeName).delete(path);
		tx.oncomplete = () => resolve(true);
		tx.onerror = e => reject(e.target.error);
	});
}

async function loadAllNodes(storeName) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, "readonly");
		const store = tx.objectStore(storeName);
		const result = {};
		const cursorReq = store.openCursor();
		cursorReq.onsuccess = e => {
			const cursor = e.target.result;
			if (cursor) {
				result[cursor.key] = cursor.value;
				cursor.continue();
			} else resolve(result);
		};
		cursorReq.onerror = e => reject(e.target.error);
	});
}

async function findNodes(phrase) {
	phrase = String(phrase || "").trim().toLowerCase();
	if (!phrase) return [];
	const drives = Object.keys(DRIVE_INFO);
	const loadPromises = drives.map(d => loadAllNodes(d).then(nodes => ({ drive: d, nodes })).catch(() => ({ drive: d, nodes: {} })));
	const results = [];
	const responses = await Promise.all(loadPromises);
	for (const res of responses) {
		const allNodes = res.nodes;
		for (const key in allNodes) {
			const node = allNodes[key];
			if (!node || node.children) continue;
			const path = key.replace(/\\/g, "/");
			const pathLower = path.toLowerCase();
			if (pathLower.includes(phrase)) {
				results.push({ ...node, path });
				continue;
			}
			const content = node.content;
			if (!content) continue;
			if (typeof content === "string") {
				if (content.toLowerCase().includes(phrase)) results.push({ ...node, path });
				continue;
			}
			if (content instanceof Blob) {
				try {
					const txt = (await content.text()).toLowerCase();
					if (txt.includes(phrase)) results.push({ ...node, path });
				} catch {}
				continue;
			}
			try {
				if (String(content).toLowerCase().includes(phrase)) results.push({ ...node, path });
			} catch {}
		}
	}
	return results;
}

async function calculateFolderSize(path) {
	path = normalizePath(path);
	const p = path;
	const folder = await getNode(path);
	if (!folder || !folder.children) return folder?.size ?? 0;
	const storeName = extractDriveLetter(path);
	const allNodes = await loadAllNodes(storeName);
	let totalSize = 0;
	const prefix = p.endsWith("/") ? p.slice(0, -1) + "/" : p + "/";
	for (const key in allNodes) {
		const k = key.replace(/\\/g, '/');
		if (k.startsWith(prefix)) {
			const n = allNodes[key];
			if (!n.children) totalSize += n.size || 0;
		}
	}
	folder.size = totalSize;
	folder.modified = Date.now();
	folder.accessed = Date.now();
	await saveNode(path, folder, false);
	return totalSize;
}

async function syncFolderSizes(path) {
	path = normalizePath(path);
	const p = path;
	const storeName = extractDriveLetter(path);
	const stack = [path];
	const visited = new Set();
	while (stack.length) {
		const current = stack.pop();
		if (visited.has(current)) continue;
		visited.add(current);
		const node = await getNode(current);
		if (!node || !node.children) continue;
		const cursorNodes = await loadAllNodes(storeName);
		for (const key in cursorNodes) {
			if (getParentPath(key) === current) {
				const child = cursorNodes[key];
				if (child.children) stack.push(key);
			}
		}
		await calculateFolderSize(current);
	}
}

function getExtensionFromName(name) {
	const m = name.toLowerCase().match(/\.([^./]+)$/);
	return m ? m[1] : "";
}

async function runConcurrent(items, worker, concurrency = 8) {
	return new Promise(resolve => {
		let idx = 0;
		let active = 0;
		let done = 0;
		if (!items || !items.length) return resolve();
		function next() {
			while (active < concurrency && idx < items.length) {
				const i = idx++;
				active++;
				Promise.resolve().then(() => worker(items[i])).then(() => {
					active--; done++; if (done === items.length) return resolve(); next();
				}).catch(() => {
					active--; done++; if (done === items.length) return resolve(); next();
				});
			}
		}
		next();
	});
}

async function populateVFS(nodes) {
	const q = Array.isArray(nodes) ? [...nodes] : [];
	const flat = [];
	while (q.length) {
		const n = q.shift();
		if (!n || !n.path) continue;
		const p = normalizePath(n.path);
		flat.push({ path: p, node: n, isFolder: Array.isArray(n.children) });
		if (Array.isArray(n.children) && n.children.length) q.push(...n.children);
	}
	if (!flat.length) return;
	const perDrive = flat.reduce((acc, e) => {
		const d = extractDriveLetter(e.path);
		(acc[d] || (acc[d] = [])).push(e);
		return acc;
	}, {});
	await Promise.all(Object.keys(perDrive).map(async drive => {
		const entries = perDrive[drive];
		const existingMap = await loadAllNodes(drive);
		for (const e of entries) {
			const n = e.node;
			if (!e.isFolder && n.size == null) {
				if (n.content instanceof Blob) {
					try {
						const txt = await n.content.text();
						n.size = new TextEncoder().encode(txt).length;
					} catch {
						n.size = 0;
					}
				} else if (typeof n.content === "string") {
					n.size = new TextEncoder().encode(n.content).length;
				} else {
					n.size = 0;
				}
			} else if (e.isFolder && n.size == null) {
				n.size = 0;
			}
		}
		const totalDelta = entries.reduce((acc, e) => {
			const newSize = e.node.size || 0;
			const oldSize = existingMap[e.path] ? (existingMap[e.path].size || 0) : 0;
			return acc + Math.max(newSize - oldSize, 0);
		}, 0);
		if (!await ensureDriveHasSpace(getDrivePrefix(drive), totalDelta)) return;
		const db = await openDB();
		const tx = db.transaction(drive, "readwrite");
		const store = tx.objectStore(drive);
		for (const e of entries) {
			const n = e.node;
			const existing = existingMap[e.path];
			const now = Date.now();
			const base = {
				hidden: !!n.hidden,
				created: n.created ?? (existing ? existing.created : now),
				modified: n.modified ?? now,
				accessed: n.accessed ?? now,
				system: !!n.system,
				size: n.size,
			};
			if (n.icon !== undefined) base.icon = n.icon;
			if (e.isFolder) base.children = existing?.children ?? {};
			else base.content = n.content instanceof Blob ? n.content : new Blob([n.content || ""], { type: "text/plain" });
			const merged = Object.assign({}, existing || {}, base);
			store.put(merged, e.path);
			existingMap[e.path] = merged;
		}
		await new Promise((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = e => reject(e.target.error);
			tx.onabort = e => reject(e.target.error);
		});
		for (const e of entries) {
			if (e.isFolder) await touchFolder(e.path);
		}
	}));
}

async function mkdir(path, options = {}) {
	path = normalizePath(path);
	const parent = getParentPath(path);
	if (parent && !await getNode(parent)) throw new Error("Parent not found");
	if (await isProtected(path, 'create', ['readonly'])) return;
	const size = options.size ?? 0;
	if (!await ensureDriveHasSpace(path, size)) return;
	try {
		const nodeToSave = {
			children: {},
			size,
			hidden: Boolean(options.hidden || false),
			system: Boolean(options.system || false),
			created: Date.now(),
			modified: Date.now(),
			accessed: Date.now(),
		};
		if (options.icon !== undefined) nodeToSave.icon = options.icon;
		await saveNode(path, nodeToSave);
		if (parent) await touchFolder(parent);
		checkRecycleBin(path);
	} catch (err) {
		console.error(err);
	}
}

async function writeFile(path, content, options = {}) {
	path = normalizePath(path);
	if (await isProtected(path, 'create', ['system','readonly'])) return;
	const existing = await getNode(path);
	const now = Date.now();
	const blobContent = content instanceof Blob ? content : new Blob([content], { type: "text/plain" });
	const size = new TextEncoder().encode(await blobContent.text()).length;
	const oldSize = existing?.size ?? 0;
	const delta = size - oldSize;
	await lockDrive(path);
	try {
		if (!await ensureDriveHasSpace(path, delta)) return;
		const computedIcon = existing?.icon ?? (options.icon !== undefined ? options.icon : undefined);
		const nodeToSave = Object.assign({}, existing || {}, {
			content: blobContent,
			size,
			icon: computedIcon,
			created: existing ? existing.created : now,
			modified: now,
			accessed: now,
			hidden: options.hidden ?? (existing ? existing.hidden : false),
			system: options.system ?? (existing ? existing.system : false),
		});
		if (nodeToSave.icon === undefined) delete nodeToSave.icon;
		await saveNode(path, nodeToSave);
		const parent = getParentPath(path);
		if (parent) await touchFolder(parent);
		checkRecycleBin(path);
	} catch (err) {
		console.error(err);
	} finally {
		await unlockDrive(path);
	}
}

async function deleteEntry(path, bypass = false) {
	path = normalizePath(path);
	if(bypass === false) {
		if (await isProtected(path, 'modify')) return;
	}
	const storeName = extractDriveLetter(path);
	const allNodes = await loadAllNodes(storeName);
	const keysToDelete = [];
	for (const key in allNodes) {
		const k = key;
		if (k === path || k.replace(/\\/g, '/').startsWith(path.replace(/\\/g, '/') + "/")) keysToDelete.push(k);
	}
	await runConcurrent(keysToDelete, async k => await deleteNode(k), 16);
	const parent = getParentPath(path);
	if (parent) await touchFolder(parent);
}

async function renameEntry(oldPath, newPath, bypass = false) {
	oldPath = normalizePath(oldPath);
	newPath = normalizePath(newPath);
	if (oldPath === newPath) return;
	if (bypass === false) {
		if (await isProtected(oldPath, 'modify')) return;
		if (await isProtected(newPath, 'modify', ['system','readonly'])) return;
	}
	const node = await getNode(oldPath);
	if (!node) throw new Error("Node not found");
	const isOldRecycle = oldPath.startsWith('C:/RECYCLE');
	const isNewRecycle = newPath.startsWith('C:/RECYCLE');
	if (!isOldRecycle && isNewRecycle) {
		node.restore = oldPath;
	} else if (isOldRecycle && !isNewRecycle) {
		delete node.restore;
	}
	const oldDrive = oldPath.slice(0, 3);
	const newDrive = newPath.slice(0, 3);
	const existingDest = await (async () => { try { return await getNode(newPath); } catch { return null; } })();
	if (bypass === false) {
		if (existingDest && existingDest.system) {
			getWindow({load:'dialog', open:'error', message:'Destination is a system item and cannot be overwritten.'});
			return;
		}
	}
	const destParent = getParentPath(newPath);
	const destExistingSize = existingDest ? (existingDest.size || 0) : 0;
	const needed = (node.size || 0) - destExistingSize;
	let reserved = false;
	if (oldDrive !== newDrive && needed > 0) {
		reserved = await ensureDriveHasSpace(newPath, needed);
		if (!reserved) return;
	}
	try {
		await lockDrive(newPath);
		if (!await ensureDriveHasSpace(newPath, needed)) return;
		const nodeClone = Object.assign({}, node);
		await saveNode(newPath, nodeClone);
		await deleteNode(oldPath);
		if (node.children) {
			const allNodes = await loadAllNodes(extractDriveLetter(oldPath));
			const childKeys = [];
			for (const key in allNodes) {
				if (key.replace(/\\/g, '/').startsWith(oldPath.replace(/\\/g, '/') + "/")) childKeys.push(key);
			}
			await runConcurrent(childKeys, async key => {
				const child = allNodes[key];
				const childNewPath = newPath + key.slice(oldPath.length);
				const childClone = Object.assign({}, child);
				await saveNode(childNewPath, childClone);
				await deleteNode(key);
			}, 8);
		}
		const parentOld = getParentPath(oldPath);
		const parentNew = getParentPath(newPath);
		checkRecycleBin(oldPath);
		checkRecycleBin(newPath);
		if (parentOld) await touchFolder(parentOld);
		if (parentNew) await touchFolder(parentNew);
		if (parentOld) checkRecycleBin(parentOld);
		if (parentNew) checkRecycleBin(parentNew);
	} catch (err) {
		console.error(err);
	} finally {
		await unlockDrive(newPath);
	}
}

async function copyEntry(oldPath, newPath) {
	oldPath = normalizePath(oldPath);
	newPath = normalizePath(newPath);
	if (oldPath === newPath) throw new Error("Paths equal")
	const node = await getNode(oldPath)
	if (!node) throw new Error("Source node not found")
	const parentNew = getParentPath(newPath)
	const existingDest = await (async () => { try { return await getNode(newPath) } catch { return null } })()
	if (await isProtected(oldPath, 'access', [])) return
	if (await isProtected(newPath, 'create', ['system','readonly'])) return
	const srcSize = node.size || 0
	const destExistingSize = existingDest ? (existingDest.size || 0) : 0
	const delta = srcSize - destExistingSize
	await lockDrive(newPath)
	try {
		if (!await ensureDriveHasSpace(newPath, delta)) return
		const now = Date.now()
		const cloneNode = { ...node }
		cloneNode.created = now
		cloneNode.modified = now
		cloneNode.accessed = now
		await saveNode(newPath, cloneNode)
		if (node.children) {
			const allNodes = await loadAllNodes(extractDriveLetter(oldPath))
			const childKeys = []
			for (const key in allNodes) {
				if (key.replace(/\\/g, '/').startsWith(oldPath.replace(/\\/g, '/') + "/")) childKeys.push(key)
			}
			await runConcurrent(childKeys, async key => {
				const child = allNodes[key]
				const childNewPath = newPath + key.slice(oldPath.length)
				const childClone = { ...child }
				childClone.created = now
				childClone.modified = now
				childClone.accessed = now
				await saveNode(childNewPath, childClone)
			}, 8)
		}
		if (parentNew) await touchFolder(parentNew)
		if (parentNew) checkRecycleBin(parentNew)
		checkRecycleBin(oldPath)
		checkRecycleBin(newPath)
	} catch (err) {
		console.error(err)
	} finally {
		await unlockDrive(newPath)
	}
}

async function touchFolder(path) {
	path = normalizePath(path);
	const folder = await getNode(path);
	if (!folder || !folder.children) return 0;
	const total = await calculateFolderSize(path);
	folder.size = total;
	folder.modified = Date.now();
	folder.accessed = Date.now();
	await saveNode(path, folder, false);
	const parent = getParentPath(path);
	if (parent) await touchFolder(parent);
	return total;
}

async function listDir(path) {
	path = path ? normalizePath(path) : null;
	if (!path) {
		return Object.keys(DRIVE_INFO).map(drive => ({
			path: normalizePath(drive + ":"),
			children: {}
		}));
	}
	const storeName = extractDriveLetter(path);
	const allNodes = await loadAllNodes(storeName);
	const items = [];
	for (const key in allNodes) {
		const normalizedKey = normalizePath(key);
		let parent = getParentPath(normalizedKey);
		parent = parent ? normalizePath(parent) : null;
		if (parent === path) {
			const node = allNodes[key];
			const item = {
				path: normalizedKey,
				children: node.children,
				hidden: !!node.hidden,
				system: !!node.system,
				size: node.size,
				created: node.created,
				modified: node.modified
			};
			if (node.icon !== undefined) item.icon = node.icon;
			items.push(item);
		}
	}
	return items;
}

async function lockDrive(path) {
	path = normalizePath(path);
	const drive = extractDriveLetter(path);
	while (driveLocks[drive]) {
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	driveLocks[drive] = true;
}

async function unlockDrive(path) {
	path = normalizePath(path);
	const drive = extractDriveLetter(path);
	driveLocks[drive] = false;
}
