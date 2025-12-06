
function sortItems(items, sort = 'name', order = 'asc') {
	return items.sort((a, b) => {
		const aIsFolder = !!a.children;
		const bIsFolder = !!b.children;
		if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
		let aVal = sort === 'name' ? getNameFromPath(a.path) : a[sort];
		let bVal = sort === 'name' ? getNameFromPath(b.path) : b[sort];
		if (typeof aVal === 'string') aVal = aVal.toLowerCase();
		if (typeof bVal === 'string') bVal = bVal.toLowerCase();
		if (aVal < bVal) return order === 'asc' ? -1 : 1;
		if (aVal > bVal) return order === 'asc' ? 1 : -1;
		return 0;
	});
}

function getIconForRender(node) {
	if (!node) return "/static/images/icon/file/unknown.png";
	if (node.icon !== undefined && node.icon !== null) return node.icon;
	if (node.children) return "/static/images/icon/folder/closed.png";
	const ext = (typeof node.path === 'string' && node.path) ? getExtensionFromName(node.path) : "";
	if (!ext) return "/static/images/icon/file.png";
	return "/static/images/icon/file/" + ext + ".png";
}

function makeItemElement(item, directory) {
	if (item.hidden) return null;
	const isFolder = !!item.children;
	const div = document.createElement("div");
	div.className = "item";
	div.dataset.system = item.system ? "true" : "false";
	div.dataset.droppable = isFolder ? "true" : "false";
	div.dataset.context = isFolder ? "folder" : "file";
	div.dataset.open = item.path;
	if (directory === 'C:/RECYCLE') {
        div.dataset.context = 'deleted';
	}
	const elImage = document.createElement("div");
	elImage.className = "image";
	const img = document.createElement("img");
	img.src = getIconForRender(item);
	img.width = 48;
	img.height = 48;
	elImage.appendChild(img);
	div.appendChild(elImage);
	const elLabel = document.createElement("div");
	elLabel.className = "label";
	elLabel.textContent = getNameFromPath(item.path).replace(/\.[^/.]+$/, "");
	div.appendChild(elLabel);
	const elSize = document.createElement("div");
	elSize.className = "size";
	elSize.style.textAlign = "right";
	elSize.textContent = formatBytes(item.size);
	div.appendChild(elSize);
	const elType = document.createElement("div");
	elType.className = "type";
	elType.textContent = isFolder ? 'Folder' : (fileTypes[getExtensionFromName(item.path)] ?? 'Unknown');
	div.appendChild(elType);
	const elDate = document.createElement("div");
	elDate.className = "date";
	elDate.textContent = formatDate(item.modified, 'short');
	div.appendChild(elDate);
	return div;
}

async function renderSearch(directory = "", query = "") {
	const results = [];
	const q = String(query ?? "").trim().toLowerCase();
	const drives = directory ? [extractDriveLetter(directory)] : Object.keys(DRIVE_INFO);
	const normDirectory = directory ? directory.replace(/\/+$/, "") : "";
	const normDirectoryLower = normDirectory.toLowerCase();
	const prefix = normDirectory ? normDirectory + "/" : "";
	const prefixLower = prefix.toLowerCase();
	const loadPromises = drives.map(async drive => {
		try {
			const allNodes = await loadAllNodes(drive);
			return { drive, allNodes };
		} catch (e) {
			console.warn(`Failed to load drive ${drive}:`, e);
			return { drive, allNodes: {} };
		}
	});
	const responses = await Promise.all(loadPromises);
	for (const resp of responses) {
		const allNodes = resp.allNodes;
		for (const key in allNodes) {
			const path = key.replace(/\\/g, "/");
			const pathLower = path.toLowerCase();
			const item = { path, ...allNodes[key] };
			if (item.hidden) continue;
			const name = getNameFromPath(path).toLowerCase();
			if (!directory) {
				if (!q || name.includes(q)) results.push(item);
				continue;
			}
			if (pathLower === normDirectoryLower) continue;
			if (!pathLower.startsWith(prefixLower)) continue;
			if (!q || name.includes(q)) results.push(item);
		}
	}
	sortItems(results);
	const container = document.querySelector('#assistant_search').closest('.window').querySelector('.items');
	container.innerHTML = "";
	for (const item of results) {
		const el = makeItemElement(item, directory);
		if (el) container.appendChild(el);
	}
}

async function renderContainer(directory) {
    if (new RegExp('^C:/Documents and Settings/Start Menu/Programs').test(directory)) {
    	renderStartMenu();
    }
    if (new RegExp('^C:/Documents and Settings/Desktop$').test(directory)) {
    	renderDesktop();
    }
	renderFolder(directory);
}

async function renderFolder(directory) {
	const containers = document.querySelectorAll('.window .items[data-directory="' + directory + '"]');
	for (const container of containers) {
		const path = container.dataset.directory;
		if (!path) throw new Error("No directory data attribute");
		container.querySelectorAll('.item').forEach(item => {
			if (!item.classList.contains('obnoxious')) item.remove();
		});
		const items = await listDir(path);
		sortItems(items)
		for (const item of items) {
			if (item.hidden) continue;
			const el = makeItemElement(item, path);
			if (el) container.appendChild(el);
		}
	}
}

let directory = null;

async function renderBrowse(dir = null) {
	const root = document.querySelector('.window .browse');
	const container = root.querySelector('#browse');
	const upButton = root.querySelector('#upDir');
	const currentDirInput = root.querySelector('#currentDir');
	const currentActiveInput = root.querySelector('#currentActive');
	const okBtn = root.querySelector('.ok-btn');
	container.dataset.directory = dir || "";
	currentDirInput.value = dir ?? 'My Computer';
	container.innerHTML = "";
	const items = await listDir(dir || null);
	sortItems(items)
	const frag = document.createDocumentFragment();
	for (const item of items) {
		if (item.hidden) continue;
		const div = document.createElement("div");
		div.className = "item";
		const isFolder = !!item.children;
		div.dataset.path = item.path;
		div.dataset.droppable = isFolder ? "true" : "false";
		div.dataset.context = isFolder ? "folder" : "file";
		div.dataset.system = item.system ? "true" : "false";
		const img = document.createElement("img");
		img.src = getIconForRender(item);
		const nameDiv = document.createElement("div");
		nameDiv.textContent = getNameFromPath(item.path);
		div.append(img, nameDiv);
		frag.appendChild(div);
	}
	container.appendChild(frag);
	container.onclick = e => {
		const div = e.target.closest('.item');
		if (!div) return;
		container.querySelectorAll('.item.active').forEach(el => el.classList.remove('active'));
		div.classList.add('active');
		if (currentActiveInput && div.dataset.context !== "folder") {
			currentActiveInput.value = div.dataset.path || "";
		}
	};
	container.ondblclick = async e => {
		const div = e.target.closest('.item');
		if (!div) return;
		const path = div.dataset.path;
		const item = items.find(i => i.path === path);
		if (item?.children) {
			await renderBrowse(path);
		} else {
			if (okBtn) okBtn.click();
		}
	};
	upButton.classList.toggle('disabled', !dir);
	upButton.disabled = !dir;
}

async function renderDesktop() {
	const directory = 'C:/Documents and Settings/Desktop';
	const container = document.querySelector('#desktop');
	if (!container) throw new Error("Desktop container not found");
	container.querySelectorAll('.item').forEach(item => {
		if (!item.classList.contains('obnoxious')) item.remove();
	});
	const items = await listDir(directory);
	sortItems(items)
	for (const item of items) {
		if (item.hidden) continue;
		const el = makeItemElement(item, directory);
		if (el) container.appendChild(el);
	}
	alignDesktopGrid();
}

async function renderInterface() {
    const blob = await doRequest('payload=interface');
    const text = await blob.text();
    document.getElementById('container').insertAdjacentHTML('afterbegin', text);
}

async function renderStartMenu() {
	const directory = 'C:/Documents and Settings/Start Menu/Programs'
	async function buildMenu(dir) {
		const items = await listDir(dir)
		sortItems(items)
		const ul = document.createElement("ul")
		ul.className = "list"
		for (const item of items) {
			if (item.hidden) continue
			const isFolder = !!item.children
			const li = document.createElement("li")
			if (isFolder) li.classList.add("folder")
			li.dataset.open = item.path
			li.dataset.context = isFolder ? "folder" : "file"
			const img = document.createElement("img")
			img.className = "image"
			img.src = getIconForRender(item)
			li.appendChild(img)
			const label = document.createTextNode(getNameFromPath(item.path).replace(/\.[^/.]+$/, ""))
			li.appendChild(label)
			if (isFolder) {
				const submenu = await buildMenu(item.path)
				submenu.className = "submenu"
				if (!submenu.children.length) {
					const emptyLi = document.createElement("li")
					emptyLi.style.justifyContent = "center"
					emptyLi.textContent = "(Empty)"
					submenu.appendChild(emptyLi)
				}
				li.appendChild(submenu)
			}
			ul.appendChild(li)
		}
		return ul
	}
	const container = document.querySelector("#startmenu .programs .menu")
	if (!container) throw new Error("Menu container not found")
	container.querySelectorAll("li").forEach(li => {
		if (!li.classList.contains('obnoxious')) li.remove()
	})
	const built = await buildMenu(directory)
	container.append(...Array.from(built.children))
}

async function renderTree(directory, foldersOnly = false) {
	async function buildTree(dir) {
		const items = await listDir(dir);
		sortItems(items);
		const ul = document.createElement("ul");
		ul.className = "tree";
		for (const item of items) {
			if (item.hidden) continue;
			const isFolder = !!item.children;
			if (foldersOnly && !isFolder) continue;
			const li = document.createElement("li");
			li.dataset.context = isFolder ? "folder" : "file";
			li.dataset.path = item.path;
			if (isFolder) {
				const details = document.createElement("details");
				const summary = document.createElement("summary");
				const img = document.createElement("img");
				img.src = getIconForRender(item);
				const textSpan = document.createElement("span");
				textSpan.textContent = getNameFromPath(item.path);
				textSpan.addEventListener("click", (e) => {
					e.stopPropagation();
					doOpen(item.path);
				});
				summary.append(img, textSpan);
				details.appendChild(summary);
				const subtree = await buildTree(item.path);
				details.appendChild(subtree);
				li.appendChild(details);
			} else {
				const img = document.createElement("img");
				img.src = getIconForRender(item);
				const textSpan = document.createElement("span");
				textSpan.textContent = getNameFromPath(item.path);
				textSpan.addEventListener("click", () => doOpen(item.path));
				li.append(img, textSpan);
			}
			ul.appendChild(li);
		}
		return ul;
	}
	const containers = document.querySelectorAll(`.tree[data-directory="${directory}"]`);
	for (const container of containers) {
		const path = container.dataset.directory;
		if (!path) throw new Error("No directory data attribute");
		container.querySelectorAll("li").forEach(li => li.remove());
		const built = await buildTree(path);
		container.append(...Array.from(built.children));
	}
}
