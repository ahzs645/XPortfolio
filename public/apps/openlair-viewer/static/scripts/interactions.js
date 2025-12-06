document.addEventListener('DOMContentLoaded', function () {

	let $dragPrimary = null;
	let $dragGroup = [];
	let dragOrder = [];
	let $marquee = null;
	let marqueeStart = null;
	let marqueeAdditive = false;
	let pendingSelection = null;
	let pointerDownPos = null;
	let $lastActiveItem = null;

	window.clipboard = [];
	window.clipboardMode = null;

	function createPendingSet() {
		const s = new Set();
		return {
			add(path) { s.add(path); },
			has(path) { return s.has(path); },
			clear() { s.clear(); },
			list() { return Array.from(s); }
		};
	}
	window._currentPendingSet = createPendingSet();

	function setLastActive($el) { if ($el) $lastActiveItem = $el; }

	function captureDragGroup($container) {
		$dragGroup = Array.from($container.querySelectorAll('.item.active'));
		dragOrder = $dragGroup.slice();
	}

	function isInsideSelf(sourcePath, targetPath) {
		if (!sourcePath || !targetPath) return false;
		if (targetPath === sourcePath) return false;
		return targetPath.startsWith(sourcePath + "/");
	}

	function cssEscape(str) {
		if (window.CSS && CSS.escape) return CSS.escape(str);
		return String(str).replace(/(["\\\0-\x1f\x7f-\x9f]|^-?\d|^-|[^a-zA-Z0-9-_])/g, function(ch) {
			return '\\' + ch.charCodeAt(0).toString(16) + ' ';
		});
	}

	function filenameParts(filename) {
		const dotIndex = filename.lastIndexOf('.');
		const baseName = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
		const extension = dotIndex > 0 ? filename.slice(dotIndex) : '';
		return { baseName, extension };
	}

	function existsInPending(path) {
		return window._currentPendingSet && window._currentPendingSet.has(path);
	}

	async function pathExists(path, targetDirElement = null) {
		if (!path) return false;
		if (typeof existsEntry === 'function') {
			try {
				const res = await existsEntry(path);
				if (res) return true;
			} catch (e) {}
		}
		if (targetDirElement && targetDirElement.querySelectorAll) {
			const items = targetDirElement.querySelectorAll('.item[data-open]');
			for (const it of items) {
				if (it.getAttribute('data-open') === path) return true;
			}
			return false;
		}
		return !!document.querySelector(`.item[data-open="${cssEscape(path)}"]`);
	}

	async function getUniquePath(targetDir, filename, targetDirElement = null) {
		const { baseName: rawBase, extension } = filenameParts(filename);
		let baseName = rawBase.replace(/\s\(\d+\)$/, '');
		let counter = 0;
		let newName = `${baseName}${extension}`;

		while (true) {
			const candidatePath = targetDir.endsWith('/') ? `${targetDir}${newName}` : `${targetDir}/${newName}`;

			if (existsInPending(candidatePath)) {
				counter++;
				newName = `${baseName} (${counter})${extension}`;
				continue;
			}

			const exists = await pathExists(candidatePath, targetDirElement);
			if (exists) {
				counter++;
				newName = `${baseName} (${counter})${extension}`;
				continue;
			}
			return candidatePath;
		}
	}

	function normalizeItems(items) {
		if (!items) return [];
		if (items instanceof Element) return [items];
		if (NodeList.prototype.isPrototypeOf(items) || HTMLCollection.prototype.isPrototypeOf(items)) return Array.from(items);
		if (Array.isArray(items)) return items.filter(Boolean);
		try { return Array.from(items).filter(Boolean); } catch (e) { return []; }
	}

	function collectContainersFromItems(items) {
		const set = new Set();
		const arr = normalizeItems(items);
		arr.forEach(el => {
			if (!el) return;
			const $c = el.closest ? el.closest('.items') : null;
			if ($c) set.add($c);
		});
		return Array.from(set);
	}

	async function renderContainers(containers) {
		const dirs = new Set();
		containers.forEach($c => {
			const dir = $c && $c.getAttribute ? $c.getAttribute('data-directory') : null;
			if (dir) dirs.add(dir);
		});
		for (const dir of dirs) {
            await renderContainer(dir);
		}
	}

	function getActiveContainer() {
		let $container = null;
		if (document.querySelector('.window.active')) {
			$container = document.querySelector('.window.active .items');
		} else {
			$container = document.querySelector('#desktop.items');
		}
		return $container;
	}

	function waitForElement(selector, timeout = 3000, interval = 50) {
		return new Promise(resolve => {
			const end = Date.now() + timeout;
			const iv = setInterval(() => {
				const el = document.querySelector(selector);
				if (el) {
					clearInterval(iv);
					resolve(el);
					return;
				}
				if (Date.now() > end) {
					clearInterval(iv);
					resolve(null);
				}
			}, interval);
		});
	}

	window.withLoader = async function(callback, totalItems = 1) {

		await getWindow({ load: 'loader' });
		const loaderSelector = `.window[data-id="loader"]`;
		const loaderWin = await waitForElement(loaderSelector, 5000);
		const progressEl = loaderWin ? loaderWin.querySelector('progress.loader') : null;
		const percentEl = loaderWin ? loaderWin.querySelector('.loader-percent') : null;

		function setProgress(current, total) {
			if (!progressEl) return;
			if (!total || total <= 1) {
				progressEl.removeAttribute('max');
				progressEl.removeAttribute('value');
				if (percentEl) percentEl.textContent = 'Please wait whilst operation completes...';
			} else {
				progressEl.max = total;
				progressEl.value = Math.min(current, total);
				if (percentEl) percentEl.textContent = Math.round((progressEl.value / total) * 100) + '%  of operations completed...';
			}
		}

		function makeWrap(total) {
			let processed = 0;
			return async function wrapPromises(proms) {
				if (!Array.isArray(proms) || proms.length === 0) return;
				const wrapped = proms.map(p =>
					Promise.resolve(p).then(
						v => { processed++; setProgress(processed, total); return v; },
						e => { processed++; setProgress(processed, total); throw e; }
					)
				);
				return Promise.all(wrapped);
			};
		}

		try {
			if (window._currentPendingSet && typeof window._currentPendingSet.clear === 'function')
				window._currentPendingSet.clear();

			if (!totalItems || totalItems <= 1) {
				window._currentPendingSet = createPendingSet();
				setProgress(0, 1);
				await callback(window._currentPendingSet, async (arr) => {
					if (Array.isArray(arr)) return Promise.all(arr);
				});
			} else {
				const base = createPendingSet();
				const proxy = new Proxy(base, {
					get(target, prop) {
						if (prop === 'add') {
							return function(...args) {
								return target.add.apply(target, args);
							};
						}
						const val = target[prop];
						return typeof val === 'function' ? val.bind(target) : val;
					}
				});
				window._currentPendingSet = proxy;
				setProgress(0, totalItems);
				const wrap = makeWrap(totalItems);
				await callback(proxy, wrap);
			}
		} catch (err) {
			console.error('Operation failed:', err && err.message ? err.message : err);
		} finally {
			const loader = document.querySelector(`.window[data-id="loader"]`);
			const overlay = document.querySelector(`.overlay[data-id="loader"]`);
			if (loader) loader.remove();
			if (overlay) overlay.remove();
			window._currentPendingSet = createPendingSet();
		}
	};

	window.cutItems = async function($items) {
		const items = normalizeItems($items);
		if (!items.length) return;
		window.clipboard = []; window.clipboardMode = 'cut';
		for (const itemEl of items) window.clipboard.push({ $item: itemEl, isSystem: itemEl.getAttribute('data-system') === 'true' });
	};

	window.copyItems = async function($items) {
		const items = normalizeItems($items);
		if (!items.length) return;
		window.clipboard = []; window.clipboardMode = 'copy';
		for (const itemEl of items) window.clipboard.push({ $item: itemEl, isSystem: itemEl.getAttribute('data-system') === 'true' });
	};

	window.pasteItems = async function() {
		const $targetContainer = getActiveContainer();
		if (!$targetContainer) return;
		const targetDir = $targetContainer.getAttribute('data-directory');
		if (!targetDir) return;

		const candidates = [];
		for (const clip of window.clipboard) {
			const $el = clip.$item;
			if (!$el) continue;
			const oldPath = $el.getAttribute('data-open');
			if (!oldPath) continue;
			const filename = oldPath.split('/').pop();
			if (isInsideSelf(oldPath, `${targetDir}/${filename}`)) continue;
			candidates.push({ $el, oldPath, filename });
		}
		if (!candidates.length) return;

		await withLoader(async (pendingSet, wrap) => {
			const backendOps = [];
			const involvedContainers = new Set();
			involvedContainers.add($targetContainer);

			for (const c of candidates) {
				try {
					const uniquePath = await getUniquePath(targetDir, c.filename, $targetContainer);
					if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(uniquePath);

					if (window.clipboardMode === 'copy') {
						if (typeof copyEntry === 'function') backendOps.push(copyEntry(c.oldPath, uniquePath));
					} else if (window.clipboardMode === 'cut') {
						if (typeof renameEntry === 'function') backendOps.push(renameEntry(c.oldPath, uniquePath));
						const $source = c.$el.closest ? c.$el.closest('[data-directory]') : null;
						if ($source) involvedContainers.add($source);
					}
				} catch (err) {}
			}

			try { await wrap(backendOps); } catch(e) {}
			await renderContainers(Array.from(involvedContainers));
			if (pendingSet && pendingSet.clear) pendingSet.clear();
			window.clipboard = [];
			window.clipboardMode = null;
		}, candidates.length);
	};

	window.pasteShortcuts = async function(targetDir) {
		if (!targetDir || !window.clipboard || !window.clipboard.length) return;

		const $targetContainer = document.querySelector(`[data-directory="${targetDir}"]`);
		if (!$targetContainer) return;

		const candidates = [];
		for (const clip of window.clipboard) {
			const $el = clip.$item;
			if (!$el) continue;
			const oldPath = $el.getAttribute('data-open');
			if (!oldPath) continue;
			const filename = oldPath.split('/').pop();
			candidates.push({ $el, oldPath, filename });
		}
		if (!candidates.length) return;

		await withLoader(async (pendingSet, wrap) => {
			const backendOps = [];
			const involvedContainers = new Set();
			if ($targetContainer) involvedContainers.add($targetContainer);

			for (const c of candidates) {
				try {
					const node = await getNode(c.oldPath);
					if (!node) continue;

					const icon = node.icon || '/static/images/icon/file/default.png';
					const shortcutName = c.filename.endsWith('.lnk') ? c.filename : c.filename + '.lnk';
					const targetPath = `${targetDir}/${shortcutName}`;

					if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(targetPath);

					const shortcutBlob = new Blob([JSON.stringify({ open: c.oldPath })], { type: 'application/json' });
					if (typeof writeFile === 'function') backendOps.push(writeFile(targetPath, shortcutBlob, { icon }));
				} catch (err) {}
			}

			try { await wrap(backendOps); } catch (err) {}
			await renderContainers(Array.from(involvedContainers));
			if (pendingSet && pendingSet.clear) pendingSet.clear();
			window.clipboard = [];
			window.clipboardMode = null;
		}, candidates.length);
	};

	window.deleteItems = async function($items) {
		const items = normalizeItems($items);
		if (!items.length) return;
		const proceed = await getWindow({load:'dialog', open:'confirm', message:'Are you sure you want to send ' + items.length + ' item(s) to the Recycle Bin?'});
		if (!proceed) return;

		const candidates = [];
		for (const el of items) {
			const oldPath = el.getAttribute('data-open');
			if (!oldPath) continue;
			const filename = oldPath.split('/').pop();
			candidates.push({ $item: el, oldPath, filename });
		}
		if (!candidates.length) return;

		await withLoader(async (pendingSet, wrap) => {
			const recycleDir = 'C:/RECYCLE';
			const $recycleContainer = document.querySelector(`[data-directory="${recycleDir}"]`);

			const backendOps = [];
			const involvedContainers = new Set();

			for (const c of candidates) {
				try {
					const uniquePath = await getUniquePath(recycleDir, c.filename, $recycleContainer);
					if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(uniquePath);
					if (typeof renameEntry === 'function') backendOps.push(renameEntry(c.oldPath, uniquePath));
					const $source = c.$item.closest ? c.$item.closest('[data-directory]') : null;
					if ($source) involvedContainers.add($source);
				} catch(err) {}
			}

			if ($recycleContainer) involvedContainers.add($recycleContainer);

			try { await wrap(backendOps); } catch(e) {}
			await renderContainers(Array.from(involvedContainers));
			if (pendingSet && pendingSet.clear) pendingSet.clear();
		}, candidates.length);
	};
	
window.restoreItems = async function($items) {
	const items = normalizeItems($items);
	if (!items.length) return;

	const candidates = [];
	for (const el of items) {
		const oldPath = el.getAttribute('data-open');
		if (!oldPath) continue;
		const node = await getNode(oldPath);
		if (!node || !node.restore) continue;
		const filename = oldPath.split('/').pop();
		const dest = node.restore;
		candidates.push({ $item: el, oldPath, filename, dest, node });
	}
	if (!candidates.length) return;

	const proceed = await getWindow({load:'dialog', open:'confirm', message:'Restore ' + candidates.length + ' item(s) to original __cpLocations?'});
	if (!proceed) return;

	await withLoader(async (pendingSet, wrap) => {
		const backendOps = [];
		const involvedContainers = new Set();

		for (const c of candidates) {
			if (pendingSet && typeof pendingSet.add === 'function') {
				pendingSet.add(c.oldPath);
				pendingSet.add(c.dest);
			}

			// Add all parent directories up to root to involvedContainers
			let dir = c.dest.substring(0, c.dest.lastIndexOf('/'));
			while (dir) {
				const dirContainer = document.querySelector(`[data-directory="${dir}"]`);
				if (dirContainer) involvedContainers.add(dirContainer);
				const parent = dir.substring(0, dir.lastIndexOf('/'));
				if (parent === dir) break;
				dir = parent;
			}

			const sourceContainer = c.$item.closest ? c.$item.closest('[data-directory]') : null;
			if (sourceContainer) involvedContainers.add(sourceContainer);

			backendOps.push((async () => {
				await mkdir(c.dest.substring(0, c.dest.lastIndexOf('/')));
				await renameEntry(c.oldPath, c.dest);
				delete c.node.restore;
			})());
		}

		try { await wrap(backendOps); } catch (e) {}
		await renderContainers(Array.from(involvedContainers));
	}, candidates.length);
};


	window.createUpload = async function($container) {
		if (!$container) return;

		const dirPath = $container.getAttribute('data-directory');
		if (!dirPath) return;
		await ensureVFSReady();

		try {
			const input = document.createElement('input');
			input.type = 'file';
			input.style.display = 'none';
			document.body.appendChild(input);

			input.onchange = async () => {
				const file = input.files?.[0];
				document.body.removeChild(input);
				if (!file) return;

				await withLoader(async (pendingSet) => {
					try {
						if (file.size > 100 * 1024 * 1024) {
							getWindow({load:'dialog', open:'alert', message:'Cannot be larger than 100mb'});
							return;
						}

						const blob = new Blob([await file.arrayBuffer()], { type: file.type || 'application/octet-stream' });
						const targetPath = dirPath.replace(/\/+$/, '') + '/' + file.name;

						if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(targetPath);

						await writeFile(targetPath, blob);
						const parentNew = getParentPath(targetPath);
						if (parentNew) await touchFolder(parentNew);
						if (parentNew) checkRecycleBin(parentNew);
						checkRecycleBin(targetPath);
						checkRecycleBin(dirPath);
						await renderContainers([$container]);
					} catch (err) {}
				}, 1);
			};

			input.click();
		} catch (err) {}
	};

	window.createFolder = async function($container) {
		if (!$container) return;

		const dirPath = $container.getAttribute('data-directory');
		if (!dirPath) return;

		const INVALID_CHARS = /[\\\/:*?"<>|]/g;

		try {
			let baseName = await getWindow({load:'dialog', open:'prompt', message:'New folder name:', default:'New Folder'});
			if (baseName === false) return;
			baseName = String(baseName).trim();
			if (!baseName) {
				getWindow({load:'dialog', open:'alert', message:'Folder name cannot be empty'});
				return;
			}
			if (INVALID_CHARS.test(baseName)) { getWindow({load:'dialog', open:'alert', message:'Invalid Characters'}); return; }

			const finalPath = await getUniquePath(dirPath, baseName, $container);

			await withLoader(async (pendingSet) => {
				if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(finalPath);
				try {
					await mkdir(finalPath);
					await renderContainers([$container]);
				} catch (err) {}
			}, 1);
		} catch (err) {}
	};

	window.createFile = async function($container, extension, mimeType) {
		if (!$container || !mimeType) return;
		const dir = $container.getAttribute('data-directory');
		if (!dir) return;
		const INVALID = /[\\\/:*?"<>|]/g;

		try {
			let name = await getWindow({load:'dialog', open:'prompt', message:'New file name:', default:'New File'});
			if (!name) return;
			name = name.trim();
			if (!name) { getWindow({load:'dialog', open:'alert', message:'File name cannot be empty'}); return; }
			if (INVALID.test(name)) { getWindow({load:'dialog', open:'alert', message:'Invalid Characters'}); return; }
			if (!name.toLowerCase().endsWith('.' + extension.toLowerCase())) name += '.' + extension;
			const path = await getUniquePath(dir, name, $container);

			let blob;
			if (mimeType.startsWith('text/')) blob = new Blob([''], {type:mimeType});
			else if (mimeType==='application/json') blob = new Blob(['{}'], {type:mimeType});
			else if (mimeType==='text/html') blob = new Blob(['<!DOCTYPE html><html><head><title></title></head><body></body></html>'], {type:mimeType});
			else if (mimeType.startsWith('image/')) {
				const c=document.createElement('canvas'); c.width=400; c.height=300;
				c.getContext('2d').fillStyle='#fff'; c.getContext('2d').fillRect(0,0,400,300);
				const data=atob(c.toDataURL(mimeType).split(',')[1]), arr=new Uint8Array(data.length);
				for(let i=0;i<data.length;i++) arr[i]=data.charCodeAt(i);
				blob = new Blob([arr], {type:mimeType});
			} else blob = new Blob([''], {type:mimeType});

			await withLoader(async (pendingSet) => {
				if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(path);
				try {
					await writeFile(path, blob, {icon:'/static/images/icon/file/'+extension+'.png'});
					await renderContainers([$container]);
				} catch(e){}
			}, 1);
		} catch(e){}
	};

	window.renameItem = async function($item) {
		if (!$item) return;

		const oldPath = $item.getAttribute('data-open');
		if (!oldPath) return;
		const INVALID_CHARS = /[\\\/:*?"<>|]/g;
		const pathParts = oldPath.split('/');
		const oldFilename = pathParts.pop();
		const dirPath = pathParts.join('/');
		const dotIndex = oldFilename.lastIndexOf('.');
		const baseName = dotIndex > 0 ? oldFilename.slice(0, dotIndex) : oldFilename;
		const extension = dotIndex > 0 ? oldFilename.slice(dotIndex) : '';

		try {
			let newBaseName = await getWindow({load:'dialog', open:'prompt', message:'Rename item:', default:baseName});
			if (newBaseName === null || newBaseName === undefined) return;
			newBaseName = String(newBaseName).trim();
			if (!newBaseName) { getWindow({load:'dialog', open:'alert', message:'File name cannot be empty'}); return; }
			if (newBaseName === baseName) return;
			if (INVALID_CHARS.test(newBaseName)) { getWindow({load:'dialog', open:'alert', message:'Invalid Characters'}); return; }

			const newFilename = newBaseName + extension;
			const $container = $item.closest ? $item.closest('[data-directory]') : null;
			const finalPath = await getUniquePath(dirPath, newFilename, $container);

			if (isInsideSelf(oldPath, finalPath)) return;

			await withLoader(async (pendingSet) => {
				if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(finalPath);
				try {
					if (typeof renameEntry === 'function') await renameEntry(oldPath, finalPath);
					if ($container) await renderContainers([$container]);
				} catch(err){}
			}, 1);
		} catch(err){}
	};

	window.emptyRecycleBin = async function() {
		const recycleDir = 'C:/RECYCLE';
		await ensureVFSReady();
		const items = await listDir(recycleDir);
		if (!items || items.length === 0) {
			getWindow({load: 'dialog', open: 'alert', message: 'Already empty'});
			return;
		}

		const proceed = await getWindow({load:'dialog', open:'confirm', message:'Are you sure you want to permanently delete ' + items.length + ' item(s)?'});
		if (!proceed) return;

		await withLoader(async (pendingSet, wrap) => {
			const backendOps = [];
			const involved = new Set();
			const recycleContainer = document.querySelector(`[data-directory="${recycleDir}"]`);
			if (recycleContainer) involved.add(recycleContainer);
			for (const it of items) {
				const path = it.path;
				if (!path) continue;
				if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(path);
				backendOps.push(deleteEntry(path));
			}
			try { await wrap(backendOps); } catch (e) {}
			await renderContainers(Array.from(involved));
			try { await touchFolder(recycleDir); } catch (e) {}
			new Audio('/static/sounds/recycle_empty.wav').play();
			checkRecycleBin(recycleDir);
		}, items.length);
	};

window.restoreRecycleBin = async function() {
	const recycleDir = 'C:/RECYCLE';
	await ensureVFSReady();
	const items = await listDir(recycleDir);
	if (!items || items.length === 0) {
		getWindow({load: 'dialog', open: 'alert', message: 'Already empty'});
		return;
	}

	const proceed = await getWindow({load:'dialog', open:'confirm', message:'Restore ' + items.length + ' item(s) to original __cpLocations?'});
	if (!proceed) return;

	await withLoader(async (pendingSet, wrap) => {
		const backendOps = [];
		const involved = new Set();
		const recycleContainer = document.querySelector(`[data-directory="${recycleDir}"]`);
		if (recycleContainer) involved.add(recycleContainer);

		for (const it of items) {
			const path = it.path;
			if (!path) continue;
			const node = await getNode(path);
			if (!node || !node.restore) continue;

			const dest = node.restore;
			if (path === dest) continue;

			if (pendingSet && typeof pendingSet.add === 'function') {
				pendingSet.add(path);
				pendingSet.add(dest);
			}

			// Add all parent directories up to root to involved
			let dir = normalizePath(dest.substring(0, dest.lastIndexOf('/')));
			while (dir) {
				const dirContainer = document.querySelector(`[data-directory="${dir}"]`);
				if (dirContainer) involved.add(dirContainer);
				const parent = normalizePath(dir.substring(0, dir.lastIndexOf('/')));
				if (parent === dir) break;
				dir = parent;
			}

			if (recycleContainer) involved.add(recycleContainer);

			backendOps.push((async () => {
				await mkdir(dest.substring(0, dest.lastIndexOf('/')));
				await renameEntry(path, dest, true);
				delete node.restore;
			})());
		}

		try { await wrap(backendOps); } catch (e) {}
		await renderContainers(Array.from(involved));
		try { await touchFolder(recycleDir); } catch (e) {}
		new Audio('/static/sounds/recycle_restore.wav').play();
		checkRecycleBin(recycleDir);
	}, items.length);
};


	window.createShortcut = async function($item, path = 'C:/Documents and Settings/Desktop') {
		if (!$item) return;
		const oldPath = $item.getAttribute('data-open');
		if (!oldPath) return;

		const node = await getNode(oldPath);
		if (!node) return;

		const filename = node.name || oldPath.split('/').pop();
		const icon = node.icon || '/static/images/icon/file/default.png';
		const shortcutName = filename.endsWith('.lnk') ? filename : filename + '.lnk';
		const targetPath = `${path}/${shortcutName}`;

		const shortcutBlob = new Blob([JSON.stringify({ open: oldPath })], { type: 'application/json' });

		await withLoader(async (pendingSet) => {
			if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(targetPath);
			try {
				await writeFile(targetPath, shortcutBlob, { icon });
				const containerEl = document.querySelector(`[data-directory="${path}"]`);
				if (containerEl) await renderContainers([containerEl]);
			} catch(err) {}
		}, 1);
	};

	document.addEventListener('keydown', async function(e) {
		const isCtrl = e.ctrlKey || e.metaKey;
		const key = (e.key || '').toLowerCase();

		const $container = getActiveContainer();
		if (!$container) return;

		if (isCtrl && (key === 'x' || key === 'c')) {
			e.preventDefault();
			if ($container) {
				const $allActive = Array.from($container.querySelectorAll('.item.active'));
				if (key === 'x') await window.cutItems($allActive);
				else if (key === 'c') await window.copyItems($allActive);
			}
		}

		if (isCtrl && key === 'v') {
			e.preventDefault();
			if ($container) await window.pasteItems($container);
		}

		if (isCtrl && key === 'a') {
			e.preventDefault();
			if ($container) {
				$container.querySelectorAll('.item:not(.hidden)').forEach(i => i.classList.add('active'));
				const all = $container.querySelectorAll('.item');
				if (all.length) setLastActive(all[all.length - 1]);
			}
		}

		if (key === 'delete') {
			e.preventDefault();
			if ($container) {
				const $allActive = Array.from($container.querySelectorAll('.item.active'));
				const $candidates = $allActive.filter(el => el.closest('.items[data-directory]').getAttribute('data-directory') !== 'C:/RECYCLE');
				await window.deleteItems($candidates);
			}
		}

		if (e.key === 'F2' && $lastActiveItem && $lastActiveItem.classList.contains('active')) {
			await window.renameItem($lastActiveItem);
		}

		if (e.key === 'Enter' && $lastActiveItem && $lastActiveItem.classList.contains('active')) {
			doOpen($lastActiveItem.dataset.open);
		}

		if (e.key === 'Escape') {
			if ($container) $container.querySelectorAll('.item.active').forEach(i => i.classList.remove('active'));
			$lastActiveItem = null;
		}
	});

	document.addEventListener('pointerdown', function(e) {
		const container = e.target.closest ? e.target.closest('.items') : null;
		if (!container) return;
		const candidate = e.target.closest ? e.target.closest('.item') : null;
		const $container = container;
		const $targetItem = (candidate && container.contains(candidate)) ? candidate : null;

		if (pendingSelection) {
			pendingSelection = null;
			pointerDownPos = null;
			document.removeEventListener('pointermove', _pendingMoveHandler);
			document.removeEventListener('pointerup', _pendingUpHandler);
			document.removeEventListener('pointercancel', _pendingUpHandler);
		}

		if ($targetItem) {
			if (e.ctrlKey || e.metaKey) {
				$targetItem.classList.toggle('active');
				if ($targetItem.classList.contains('active')) setLastActive($targetItem);
				return;
			}

			if ($targetItem.classList.contains('active')) {
				pendingSelection = { container: $container, target: $targetItem };
				pointerDownPos = { x: e.pageX, y: e.pageY };

				document.addEventListener('pointermove', _pendingMoveHandler);
				document.addEventListener('pointerup', _pendingUpHandler);
				document.addEventListener('pointercancel', _pendingUpHandler);
			} else {
				$container.querySelectorAll('.item.active').forEach(i => i.classList.remove('active'));
				$targetItem.classList.add('active');
				setLastActive($targetItem);
			}
		} else if (!(e.ctrlKey || e.metaKey)) {
			$container.querySelectorAll('.item.active').forEach(i => i.classList.remove('active'));
		}
	});

	function _pendingMoveHandler(ev) {
		if (!pendingSelection || !pointerDownPos) return;
		const dx = ev.pageX - pointerDownPos.x;
		const dy = ev.pageY - pointerDownPos.y;
		if ((dx * dx + dy * dy) > (5 * 5)) {
			pendingSelection = null;
			pointerDownPos = null;
			document.removeEventListener('pointermove', _pendingMoveHandler);
			document.removeEventListener('pointerup', _pendingUpHandler);
			document.removeEventListener('pointercancel', _pendingUpHandler);
		}
	}

	function _pendingUpHandler() {
		if (!pendingSelection) return;
		pendingSelection.container.querySelectorAll('.item.active').forEach(i => i.classList.remove('active'));
		pendingSelection.target.classList.add('active');
		setLastActive(pendingSelection.target);
		pendingSelection = null;
		pointerDownPos = null;
		document.removeEventListener('pointermove', _pendingMoveHandler);
		document.removeEventListener('pointerup', _pendingUpHandler);
		document.removeEventListener('pointercancel', _pendingUpHandler);
	}

	document.addEventListener('mousedown', function(ev) {
		const container = ev.target.closest ? ev.target.closest('.items') : null;
		if (!container) return;
		if (ev.target.closest && ev.target.closest('.item', container)) return;

		marqueeAdditive = ev.ctrlKey || ev.metaKey;
		const rect = container.getBoundingClientRect();

		const scaleX = rect.width / (container.clientWidth || rect.width || 1);
		const scaleY = rect.height / (container.clientHeight || rect.height || 1);
		const contentW = container.scrollWidth;
		const contentH = container.scrollHeight;

		let startX = (ev.pageX - (rect.left + window.pageXOffset)) / scaleX + container.scrollLeft;
		let startY = (ev.pageY - (rect.top + window.pageYOffset)) / scaleY + container.scrollTop;
		startX = Math.max(0, Math.min(startX, contentW - 1));
		startY = Math.max(0, Math.min(startY, contentH - 1));
		marqueeStart = { x: startX, y: startY };

		$marquee = document.createElement('div');
		$marquee.className = 'marquee';
		$marquee.style.left = marqueeStart.x + 'px';
		$marquee.style.top = marqueeStart.y + 'px';
		$marquee.style.width = '0px';
		$marquee.style.height = '0px';
		$marquee.style.position = 'absolute';
		$marquee.style.pointerEvents = 'none';
		container.appendChild($marquee);

		function onMove(e) {
			let x = (e.pageX - (rect.left + window.pageXOffset)) / scaleX + container.scrollLeft;
			let y = (e.pageY - (rect.top + window.pageYOffset)) / scaleY + container.scrollTop;
			x = Math.max(0, Math.min(x, contentW - 1));
			y = Math.max(0, Math.min(y, contentH - 1));

			const x1 = Math.min(marqueeStart.x, x);
			const y1 = Math.min(marqueeStart.y, y);
			const x2 = Math.max(marqueeStart.x, x);
			const y2 = Math.max(marqueeStart.y, y);

			$marquee.style.left = x1 + 'px';
			$marquee.style.top = y1 + 'px';
			$marquee.style.width = Math.max(0, x2 - x1) + 'px';
			$marquee.style.height = Math.max(0, y2 - y1) + 'px';

			const marqueeViewport = {
				left: rect.left + (x1 - container.scrollLeft) * scaleX,
				top: rect.top + (y1 - container.scrollTop) * scaleY,
				right: rect.left + (x2 - container.scrollLeft) * scaleX,
				bottom: rect.top + (y2 - container.scrollTop) * scaleY
			};

			if (!marqueeAdditive) container.querySelectorAll('.item.active').forEach(i => i.classList.remove('active'));
			let $last = null;
			Array.from(container.querySelectorAll('.item')).forEach(node => {
				const r = node.getBoundingClientRect();
				if (!(r.right < marqueeViewport.left || r.left > marqueeViewport.right || r.bottom < marqueeViewport.top || r.top > marqueeViewport.bottom)) {
					node.classList.add('active');
					$last = node;
				} else if (!marqueeAdditive) {
					node.classList.remove('active');
				}
			});
			if ($last) setLastActive($last);
		}

		function onUp() {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
			if ($marquee) { $marquee.remove(); $marquee = null; }
			marqueeStart = null;
		}

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	});

	document.addEventListener('mouseenter', function(e) {
		if (e.target && e.target.matches && e.target.matches('.item')) {
			e.target.draggable = true;
		}
	}, true);

	document.addEventListener('dragstart', function(e) {
		const el = e.target.closest ? e.target.closest('.item') : null;
		if (!el) return;

		$dragPrimary = el;
		const $container = $dragPrimary.closest('.items');

		if (!$dragPrimary.classList.contains('active')) {
			const items = $container ? Array.from($container.querySelectorAll('.item.active')) : [];
			items.forEach(i => i.classList.remove('active'));
			$dragPrimary.classList.add('active');
		}
		setLastActive($dragPrimary);
		captureDragGroup($container || document);

		function cloneWithInlineComputedStyles(node){
			const clone = node.cloneNode(true);
			function copyComputed(src, dst){
				const cs = window.getComputedStyle(src);
				for(let i=0;i<cs.length;i++){
					const prop = cs[i];
					const val = cs.getPropertyValue(prop);
					const prio = cs.getPropertyPriority(prop);
					dst.style.setProperty(prop, val, prio);
				}
				const srcChildren = src.children;
				const dstChildren = dst.children;
				for(let j=0;j<srcChildren.length && j<dstChildren.length;j++){
					copyComputed(srcChildren[j], dstChildren[j]);
				}
			}
			copyComputed(node, clone);
			return clone;
		}

		try {
			e.dataTransfer.effectAllowed = 'copyMove';
			e.dataTransfer.setData('text/plain', 'group-drag');
			const ghost = cloneWithInlineComputedStyles($dragPrimary);
			Object.assign(ghost.style, { position:'absolute', top:'-9999px', left:'-9999px', zIndex:9999 });
			document.body.appendChild(ghost);
			e.dataTransfer.setDragImage(ghost, 0, 0);
			setTimeout(() => { try { ghost.remove(); } catch(err) {} }, 0);
		} catch (err) {}

	});

	document.addEventListener('dragend', function() {
		$dragPrimary = null;
		$dragGroup = [];
		dragOrder = [];
		document.querySelectorAll('.drag-over').forEach(e => e.classList.remove('drag-over'));
		document.querySelectorAll('.item.drag-hover').forEach(e => e.classList.remove('active', 'drag-hover'));
	});

	document.addEventListener('dragover', function(e) {
		e.preventDefault();
		if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const $target = el ? el.closest('[data-droppable="true"]') : null;

		document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
		document.querySelectorAll('.item.drag-hover').forEach(el => el.classList.remove('active', 'drag-hover'));

		if ($target) {
			$target.classList.add('drag-over');
			const isCopy = e.ctrlKey || e.metaKey;
			try { e.dataTransfer.dropEffect = isCopy ? 'copy' : 'move'; } catch(err){}
			if ($target.classList.contains('item') && !$target.classList.contains('active')) $target.classList.add('active', 'drag-hover');
		} else {
			try { e.dataTransfer.dropEffect = 'none'; } catch(err){}
		}
	});

	document.addEventListener('dragleave', function(e) {
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const $target = el ? el.closest('[data-droppable="true"]') : null;
		if (!$target) {
			document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
			document.querySelectorAll('.item.drag-hover').forEach(el => el.classList.remove('active', 'drag-hover'));
		}
	});

	document.addEventListener('drop', async function(e) {
		e.preventDefault();
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const $target = el ? el.closest('[data-droppable="true"]') : null;
		if (!$target) return;

		$target.classList.remove('drag-over');
		document.querySelectorAll('.item.drag-hover').forEach(el => el.classList.remove('active', 'drag-hover'));

		const targetPath = $target.classList.contains('item') ? $target.getAttribute('data-open') : $target.getAttribute('data-directory');
		if (!targetPath) return;

		const itemsToMove = dragOrder.length ? dragOrder : ($dragPrimary ? [$dragPrimary] : []);
		if (!itemsToMove.length) return;

		const preliminary = [];
		for (let elItem of itemsToMove) {
			const $item = elItem;
			if (! $item) continue;
			const oldPath = $item.getAttribute('data-open');
			if (!oldPath) continue;
			const filename = oldPath.split('/').pop();
			const oldDir = oldPath.split('/').slice(0,-1).join('/');
			if (oldDir === targetPath) continue;
			if (isInsideSelf(oldPath, `${targetPath}/${filename}`)) continue;
			preliminary.push({ $item, oldPath, filename });
		}
		if (!preliminary.length) return;

		await withLoader(async (pendingSet, wrap) => {
			window._currentPendingSet = window._currentPendingSet || createPendingSet();
			const isCopy = e.ctrlKey || e.metaKey;
			const backendOps = [];
			const involvedContainers = new Set();

			const $targetContainer = $target.classList.contains('items') ? $target : ($target.closest ? $target.closest('.items') : null);
			if ($targetContainer) involvedContainers.add($targetContainer);

			for (const p of preliminary) {
				try {
					const uniquePath = await getUniquePath(targetPath, p.filename, $targetContainer);
					if (pendingSet && typeof pendingSet.add === 'function') pendingSet.add(uniquePath);
					if (isCopy) {
						if (typeof copyEntry === 'function') backendOps.push(copyEntry(p.oldPath, uniquePath));
					} else {
						if (typeof renameEntry === 'function') backendOps.push(renameEntry(p.oldPath, uniquePath));
					}
					const $source = p.$item.closest ? p.$item.closest('[data-directory]') : null;
					if ($source) involvedContainers.add($source);
				} catch(err) {}
			}

			try { await wrap(backendOps); } catch(e) {}
			await renderContainers(Array.from(involvedContainers));
			if (pendingSet && pendingSet.clear) pendingSet.clear();
			$dragGroup.forEach(g => { if (g && g.style) g.style.opacity = ''; });
			$dragPrimary = null;
			$dragGroup = [];
			dragOrder = [];
		}, preliminary.length);
	});

	document.addEventListener("mousedown", function(e) {
		if (e.target.closest && (e.target.closest('#context') || e.target.closest('.window.active'))) return;
		if (!e.target.closest(".window")) {
			if (typeof blurWindows === 'function') blurWindows();
		}
	});

	document.addEventListener('click', function(e) {
		const t = e.target;
		const menu = document.getElementById('startmenu');
		if (!menu) return;
		if (t.closest && t.closest('#taskbar .start')) {
			const visible = (menu.style.display !== 'none' && getComputedStyle(menu).display !== 'none');
			menu.style.display = visible ? 'none' : 'block';
		} else {
			menu.style.display = 'none';
		}
	});

	document.addEventListener('click', function(e) {
		const el = e.target.closest ? e.target.closest('[data-open]') : null;
		if (!el) return;
		if (el.classList.contains('item')) return;
		doOpen(el.dataset.open);
	});

	document.addEventListener('dblclick', function(e) {
		const el = e.target.closest ? e.target.closest('[data-open]') : null;
		if (!el) return;
		if (!el.classList.contains('item')) return;
		doOpen(el.dataset.open);
	});

	document.addEventListener('click', function(e) {
		const target = e.target.closest('[data-view]');
		if (!target) return;
		const view = target.getAttribute('data-view');
		updateSettings([{ key1: 'display', key2: 'view', value: view }])

	});

	document.addEventListener('keydown', function(e) {
		const key = e.key.toLowerCase();
		if (!['arrowup','arrowdown','arrowleft','arrowright'].includes(key)) return;

		const $container = getActiveContainer();
		if (!$container) return;

		const items = Array.from($container.querySelectorAll('.item:not(.hidden)'));
		if (!items.length) return;

		const current = $lastActiveItem || items[0];
		if (!current) return;

		const rect = current.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;

		let best = null;
		let bestScore = Infinity;

		items.forEach(item => {
			if (item === current) return;
			const r = item.getBoundingClientRect();
			const ix = r.left + r.width / 2;
			const iy = r.top + r.height / 2;

			let dx = ix - cx;
			let dy = iy - cy;

			switch(key) {
				case 'arrowup': if (dy >= 0) return; break;
				case 'arrowdown': if (dy <= 0) return; break;
				case 'arrowleft': if (dx >= 0) return; break;
				case 'arrowright': if (dx <= 0) return; break;
			}

			const distance = dx*dx + dy*dy;
			if (distance < bestScore) {
				bestScore = distance;
				best = item;
			}
		});

		if (!best) return;

		if (!e.shiftKey) items.forEach(i => i.classList.remove('active'));
		best.classList.add('active');
		setLastActive(best);
		best.scrollIntoView({ block: 'nearest', inline: 'nearest' });

		e.preventDefault();
	});


});
