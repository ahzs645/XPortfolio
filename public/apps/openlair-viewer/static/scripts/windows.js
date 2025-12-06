const windowHistory = {};
const windowStates = {};
let topWindowZ = 1;
let locked = false;

const windowPosition = {
	x: 20,
	y: 20,
	step: 30,
	count: 0,
	max: 5,
	reset: 10,
	totalOpened: 0
};

function getPosition() {
	const pos = { top: windowPosition.y, left: windowPosition.x };
	windowPosition.x += windowPosition.step;
	windowPosition.y += windowPosition.step;
	windowPosition.count++;
	windowPosition.totalOpened++;
	if (windowPosition.count >= windowPosition.max) {
		windowPosition.count = 0;
		windowPosition.x += 50;
		windowPosition.y = 20;
	}
	if (windowPosition.totalOpened >= windowPosition.reset) {
		windowPosition.count = 0;
		windowPosition.totalOpened = 0;
		windowPosition.x = 20;
		windowPosition.y = 20;
	}
	return pos;
}

function parseTransformScale(style) {
	const transform = style.transform || style.webkitTransform || '';
	if (transform && transform !== 'none') {
		const m = transform.match(/matrix\(([^)]+)\)/);
		if (m) return parseFloat(m[1].split(',')[0]) || 1;
	}
	if (style.zoom) return parseFloat(style.zoom) || 1;
	return 1;
}

function getContainer() {
	return document.querySelector('#container') || document.querySelector('#windows') || document.body;
}

function getScaledPosition(el) {
	if (!el) return { left: 0, top: 0, width: 0, height: 0 };
	const prevDisplay = el.style.display;
	const prevVisibility = el.style.visibility;
	const needToggle = getComputedStyle(el).display === 'none';
	if (needToggle) {
		el.style.display = 'block';
		el.style.visibility = 'hidden';
	}
	const rect = el.getBoundingClientRect();
	const containerStyle = getComputedStyle(getContainer());
	const scale = parseTransformScale(containerStyle) || 1;
	const pos = {
		left: (rect.left + window.scrollX) / scale,
		top: (rect.top + window.scrollY) / scale,
		width: rect.width / scale,
		height: rect.height / scale
	};
	if (needToggle) {
		el.style.display = prevDisplay;
		el.style.visibility = prevVisibility;
	}
	return pos;
}

function setWindowState(id, state) {
	if (!id) return;
	if (!windowStates[id]) windowStates[id] = {};
	Object.assign(windowStates[id], state);
}

function getWindowState(id) {
	return windowStates[id] || null;
}

async function animateWindowTitle(id, action, opts = {}) {
	locked = true
	const win = typeof id === 'string' ? document.querySelector(`.window[data-id="${id}"]`) : id
	if (!win) return
	const container = getContainer()
	const task = document.querySelector(`#taskbar .tasks .task[data-id="${win.dataset.id}"]`)
	const title = win.querySelector('.titlebar') || win
	let startPos, endPos
	const cached = getWindowState(win.dataset.id)

	if (action === 'minimize') {
		startPos = cached?.title || getScaledPosition(title)
		const taskPos = task ? getScaledPosition(task) : (cached?.task || { left: startPos.left, top: startPos.top + 20, width: startPos.width, height: startPos.height })
		endPos = taskPos
	} else if (action === 'restore') {
		const taskPos = task ? getScaledPosition(task) : (cached?.task || getScaledPosition(title))
		startPos = taskPos
		let titlePos = cached?.title
		if (!titlePos) {
			const prevDisplay = win.style.display
			win.style.display = ''
			win.style.visibility = 'hidden'
			titlePos = getScaledPosition(title)
			win.style.display = 'none'
			win.style.visibility = prevDisplay || ''
		}
		endPos = titlePos
	} else if (action === 'open') {
		const taskPos = task ? getScaledPosition(task) : (cached?.task || getScaledPosition(title))
		startPos = taskPos
		let titlePos = cached?.title
		if (!titlePos) {
			win.style.display = ''
			win.style.visibility = 'hidden'
			titlePos = getScaledPosition(title)
			win.style.visibility = ''
			win.style.display = 'none'
		}
		endPos = titlePos
	} else if (action === 'maximize') {
		startPos = cached?.title || getScaledPosition(title)
		const titleHeight = startPos.height
		const containerRect = container.getBoundingClientRect()
		endPos = {
			left: containerRect.left + window.scrollX,
			top: containerRect.top + window.scrollY,
			width: container.clientWidth,
			height: titleHeight
		}
		win.dataset.prevLeft = win.style.left || (win.getBoundingClientRect().left + window.scrollX) + 'px'
		win.dataset.prevTop = win.style.top || (win.getBoundingClientRect().top + window.scrollY) + 'px'
		win.dataset.prevWidth = win.style.width || win.getBoundingClientRect().width + 'px'
		win.dataset.prevHeight = win.style.height || win.getBoundingClientRect().height + 'px'
		win.dataset.prevTitle = JSON.stringify(startPos)
	} else if (action === 'restoreMax') {
		const prevTitle = win.dataset.prevTitle ? JSON.parse(win.dataset.prevTitle) : cached?.title
		const titleHeight = prevTitle?.height || getScaledPosition(title).height
		startPos = cached?.title || { left: container.getBoundingClientRect().left + window.scrollX, top: container.getBoundingClientRect().top + window.scrollY, width: container.clientWidth, height: titleHeight }
		if (prevTitle) {
			endPos = prevTitle
		} else {
			endPos = {
				left: parseFloat(win.dataset.prevLeft || startPos.left) || startPos.left,
				top: parseFloat(win.dataset.prevTop || startPos.top) || startPos.top,
				width: parseFloat(win.dataset.prevWidth || startPos.width) || startPos.width,
				height: parseFloat(win.dataset.prevHeight || startPos.height) || startPos.height
			}
		}
	} else {
		return
	}

	const clone = title.cloneNode(true)

	function copyStyles(source, target) {
		const computed = getComputedStyle(source)
		for (let i = 0; i < computed.length; i++) {
			const prop = computed[i]
			target.style.setProperty(prop, computed.getPropertyValue(prop), computed.getPropertyPriority(prop))
		}
		const children = source.children
		for (let i = 0; i < children.length; i++) {
			copyStyles(children[i], target.children[i])
		}
	}
	copyStyles(title, clone)

	clone.querySelector('.buttons').remove()
	clone.style.position = 'absolute'
	clone.style.left = startPos.left + 'px'
	clone.style.top = startPos.top + 'px'
	clone.style.width = startPos.width + 'px'
	clone.style.height = startPos.height + 'px'
	clone.style.maxWidth = 'unset'
	clone.style.maxHeight = 'unset'
	clone.style.margin = '0'
	clone.style.zIndex = '9999'
	document.getElementById('windows').appendChild(clone)

	const dur = opts.duration || 250
	const startTime = performance.now()

	return new Promise((resolve) => {
		function step(now) {
			const elapsed = now - startTime
			const p = Math.min(elapsed / dur, 1)
			const lerp = (a, b) => a + (b - a) * p
			clone.style.left = lerp(startPos.left, endPos.left) + 'px'
			clone.style.top = lerp(startPos.top, endPos.top) + 'px'
			clone.style.width = lerp(startPos.width, endPos.width) + 'px'
			clone.style.height = lerp(startPos.height, endPos.height) + 'px'
			if (p < 1) {
				requestAnimationFrame(step)
			} else {
				clone.style.left = endPos.left + 'px'
				clone.style.top = endPos.top + 'px'
				clone.style.width = endPos.width + 'px'
				clone.style.height = endPos.height + 'px'

				requestAnimationFrame(() => {
					clone.remove()
					if (action === 'minimize') {
						win.style.display = 'none'
						win.classList.remove('active')
						task?.classList.remove('active')
						setWindowState(win.dataset.id, { window: getScaledPosition(win), title: cached?.title || startPos })
					} else if (action === 'restore' || action === 'open') {
						win.style.display = ''
						win.style.visibility = ''
						focusWindow(win.dataset.id)
						task?.classList.add('active')
						setWindowState(win.dataset.id, { window: getScaledPosition(win), title: getScaledPosition(title) })
					} else if (action === 'maximize') {
						win.style.left = '-4px'
						win.style.top = '-2px'
						win.style.width = 'calc(100% + 8px)'
						win.style.height = 'calc(100% + 6px)'
						win.dataset.maximized = 'true'
						focusWindow(win.dataset.id)
						setWindowState(win.dataset.id, { window: getScaledPosition(win) })
					} else if (action === 'restoreMax') {
						win.style.left = (parseFloat(win.dataset.prevLeft) || endPos.left) + 'px'
						win.style.top = (parseFloat(win.dataset.prevTop) || endPos.top) + 'px'
						win.style.width = (parseFloat(win.dataset.prevWidth) || endPos.width) + 'px'
						win.style.height = (parseFloat(win.dataset.prevHeight) || endPos.height) + 'px'
						delete win.dataset.maximized
						focusWindow(win.dataset.id)
						const prevTitle = win.dataset.prevTitle ? JSON.parse(win.dataset.prevTitle) : getScaledPosition(title)
						setWindowState(win.dataset.id, { window: getScaledPosition(win), title: prevTitle })
						delete win.dataset.prevTitle
					}
					locked = false
					resolve()
				})
			}
		}
		requestAnimationFrame(step)
	})
}

function minimizeWindows() {
	document.querySelectorAll('.window[data-minimizable="true"]').forEach((w) => {
		w.style.display = 'none';
		w.classList.remove('active');
		const task = document.querySelector(`#taskbar .tasks .task[data-id="${w.dataset.id}"]`);
		task?.classList.remove('active');
		const cached = getWindowState(w.dataset.id) || {};
		setWindowState(w.dataset.id, { window: getScaledPosition(w), title: cached?.title || getScaledPosition(w.querySelector('.titlebar') || w) });
	});
	blurWindows();
}

function blurWindows() {
	document.querySelectorAll('.window.active').forEach((w) => w.classList.remove('active'));
	document.querySelectorAll('.task.active').forEach((t) => t.classList.remove('active'));
}

async function closeWindow(id) {
	const win = document.querySelector(`.window[data-id="${id}"]`);
	const task = document.querySelector(`#taskbar .tasks .task[data-id="${id}"]`);
	const overlay = document.querySelector(`.overlay[data-id="${id}"]`);
	
	if (!win) return;

	if(win.dataset.confirm === 'true') {
		const proceed = await getWindow({load:'dialog', open:'confirm', message:'Are you sure you want to close this window?'});
		if (!proceed) return;
	}
	
	win?.remove();
	task?.remove();
	overlay?.remove();
	delete windowHistory[id];
	delete windowStates[id];
}

async function closeWindows() {
	const wins = document.querySelectorAll('.window')
	wins.forEach(win => {
		const id = win.dataset.id
		const task = document.querySelector(`#taskbar .tasks .task[data-id="${id}"]`)
		const overlay = document.querySelector(`.overlay[data-id="${id}"]`)
		win.remove()
		task?.remove()
		overlay?.remove()
		delete windowHistory[id]
		delete windowStates[id]
	})
}

function focusWindow(id) {
	const win = document.querySelector(`.window[data-id="${id}"]`);
	const task = document.querySelector(`#taskbar .tasks .task[data-id="${id}"]`);
	if (!win) return;
	topWindowZ++;
	win.style.zIndex = topWindowZ;

	document.querySelectorAll('.window.active').forEach((w) => w.classList.remove('active'));
	document.querySelectorAll('.task.active').forEach((t) => t.classList.remove('active'));

	win.classList.add('active');
	task?.classList.add('active');
	win.style.display = '';
	win.style.visibility = '';
	setWindowState(id, { window: getScaledPosition(win), title: getScaledPosition(win.querySelector('.titlebar') || win) });
}

async function toggleWindow(id) {
	const win = document.querySelector(`.window[data-id="${id}"]`);
	if (!win) return;

	const isHidden = getComputedStyle(win).display === 'none';
	const z = parseInt(getComputedStyle(win).zIndex) || 0;

	if (isHidden) {
		await animateWindowTitle(id, 'restore');
		focusWindow(id);
	} else if (z < topWindowZ) {
		focusWindow(id);
	} else {
		await animateWindowTitle(id, 'minimize');
	}
}

async function toggleMinimize(id) {
	const win = document.querySelector(`.window[data-minimizable="true"][data-id="${id}"]`);
	if (!win) return;
	if (getComputedStyle(win).display === 'none') {
		await animateWindowTitle(id, 'restore');
		focusWindow(id);
	} else {
		await animateWindowTitle(id, 'minimize');
	}
}

async function toggleMaximize(id) {
	const win = document.querySelector(`.window[data-maximizable="true"][data-id="${id}"]`);
	if (!win) return;
	const btn = win.querySelector('.titlebar .maximize');
	if (win.dataset.maximized === 'true') {
		await animateWindowTitle(id, 'restoreMax');
		win.dataset.maximized = 'false';
		if (btn) btn.src = '/static/images/interface/maximize.png';
	} else {
		await animateWindowTitle(id, 'maximize');
		win.dataset.maximized = 'true';
		if (btn) btn.src = '/static/images/interface/restore.png';
	}
}

function iframeWindow(id) {
	const win = document.querySelector(`.window[data-id="${id}"]`);
	const iframe = win?.querySelector('iframe');
	if (!iframe) return;
	iframe.onload = function () {
		const doc = iframe.contentDocument;
		const handleFocus = (e) => {
			window.parent.focusWindow(id);
			if (e.target.tagName === 'CANVAS') {
				e.target.tabIndex = 1;
				e.target.focus();
			}
		};
		doc.addEventListener('mousedown', handleFocus, true);
		doc.addEventListener('touchstart', handleFocus, true);
		iframe.addEventListener('mousedown', () => window.parent.focusWindow(id));
	};
}

function scriptsWindow(id) {
	const win = document.querySelector(`.window[data-id="${id}"]`);
	const scripts = Array.from(win.querySelectorAll('script'));
	function loadNext(i) {
		if (i >= scripts.length) return;
		const oldScript = scripts[i];
		const newScript = document.createElement('script');
		Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
		if (oldScript.src) {
			newScript.async = false;
			newScript.onload = () => loadNext(i + 1);
			newScript.onerror = () => loadNext(i + 1);
			newScript.src = oldScript.src;
			oldScript.parentNode.replaceChild(newScript, oldScript);
		} else {
			newScript.textContent = oldScript.textContent;
			oldScript.parentNode.replaceChild(newScript, oldScript);
			loadNext(i + 1);
		}
	}
	loadNext(0);
}

function taskWindow(json) {
	if (!json.window_task) return;
	const taskContainer = document.querySelector('#taskbar .tasks');
	let task = taskContainer.querySelector(`.task[data-id="${json.window_id}"]`);
	if (!task) {
		task = document.createElement('div');
		task.className = 'task';
		task.dataset.context = 'task';
		task.dataset.id = json.window_id;
		taskContainer.appendChild(task);
		task.addEventListener('click', () => toggleWindow(json.window_id));
	}
	task.innerHTML = `${json.window_icon ? `<img class="image" src="${json.window_icon}">` : ''}<span class="label">${json.window_name}</span>`;
	task.classList.add('active');
	setWindowState(json.window_id, { task: getScaledPosition(task) });
}

function overlayWindow(json) {
	if (!json.window_overlay) return;
	const windowContainer = document.querySelector('#windows');
	const win = windowContainer.querySelector(`.window[data-id="${json.window_id}"]`);
	if (!win) return;
	let overlay = windowContainer.querySelector(`.overlay[data-id="${json.window_id}"]`);
	if (!overlay) {
		const winZ = parseInt(win.style.zIndex) || 0;
		overlay = document.createElement('div');
		overlay.classList.add('overlay');
		overlay.dataset.id = json.window_id;
		overlay.style.position = 'fixed';
		overlay.style.top = '0';
		overlay.style.left = '0';
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		overlay.style.background = 'rgba(0,0,0,0)';
		overlay.style.zIndex = winZ > 0 ? winZ - 1 : 0;
		overlay.style.pointerEvents = 'auto';
		overlay.innerHTML = "<style>#taskbar {pointer-events: none;}</style>";
		overlay.addEventListener('mousedown', () => {
			new Audio('/static/sounds/ding.wav').play();
			let count = 0;
			const interval = setInterval(() => {
				win.classList.toggle('active');
				count++;
				if (count >= 7) clearInterval(interval);
			}, 100);
		});
		windowContainer.insertBefore(overlay, win);
	}
}

function fullscreenWindow(json) {
	if (!json.window_fullscreen) return;
	const win = document.querySelector(`.window[data-id="${json.window_id}"]`);
	if (!win) return;
	const el = win.querySelector('.inner .body');
	if (!el) return;
	if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		el.requestFullscreen?.() || el.webkitRequestFullscreen?.() || el.msRequestFullscreen?.();
	} else {
		document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
	}
}

function promiseWindow(json) {
	if (!json.window_promise) return;
	const win = document.querySelector(`.window[data-id="${json.window_id}"]`);
	if (!win) return;

	return new Promise((resolve) => {

		// DIALOG
		if (json.window_id === 'dialog') {
			const buttons = win.querySelectorAll('button.resolve');
			buttons.forEach(btn => {
				btn.addEventListener('click', () => {
					const value = btn.dataset.value;
					if (value === 'false') {
						closeWindow(json.window_id);
						return resolve(false);
					}
					const inputEl = win.querySelector('.prompt-input');
					const result = inputEl ? inputEl.value : value;
					closeWindow(json.window_id);
					resolve(result);
				});
			});
			const inputEl = win.querySelector('.prompt-input');
			if (inputEl) inputEl.focus();
		}

		// OPENER
		if (json.window_id === 'opener') {
			const buttons = win.querySelectorAll('button.resolve');
			const check = win.querySelector('input.default');
			buttons.forEach(btn => {
				btn.addEventListener('click', () => {
					const value = btn.dataset.value;
					if (value === 'false') {
						closeWindow(json.window_id);
						return resolve(false);
					}
					if (check?.checked) {
						updateSettings([{ key1: 'defaults', key2: check.value, value: value }]);
					}
					closeWindow(json.window_id);
					resolve(value);
				});
			});
		}

		// BROWSER
        if (json.window_id === 'browser') {
        	const buttons = win.querySelectorAll('button.resolve');
        	const container = win.querySelector('#browse');
        	const inputFile = win.querySelector('#currentActive');
        	const selectType = win.querySelector('#currentType');
        
        	buttons.forEach(btn => {
        		btn.addEventListener('click', () => {
        		    
        			if (btn.dataset.value === 'false') {
        				closeWindow(json.window_id);
        				return resolve(false);
        			}
        
        			const userInput = (inputFile?.value || '').trim();
        			if(!userInput) return;
        
        			if (json.window_path === 'open') {
        				closeWindow(json.window_id);
        				return resolve(userInput || false);
        			}
        
        			if (json.window_path === 'save') {
        			    
            			const dir = (container?.dataset.directory || '').replace(/[\\\/]+$/, '');
            			let name = userInput;
            			const filetype = selectType?.value || '';
            
            			if (!/^[A-Za-z]:[\\/]/.test(name) && dir) {
            				name = dir + '/' + name;
            			}
            
            			if (filetype && name && !name.toLowerCase().endsWith('.' + filetype.toLowerCase())) {
            				name += '.' + filetype;
            			}
            
            			closeWindow(json.window_id);
            			resolve(name);
        			}
        			
        		});
        	});
        
        	if (inputFile) inputFile.focus();
        }

	});
}

function buttonsWindow(id) {
	const win = document.querySelector(`.window[data-id="${id}"]`);
	if (!win) return;
	const backBtn = win.querySelector('.buttons .back');
	const forwardBtn = win.querySelector('.buttons .forward');
	backBtn?.addEventListener('click', () => navigateTo(id, getHistory(id).index - 1));
	forwardBtn?.addEventListener('click', () => navigateTo(id, getHistory(id).index + 1));
}

function updateNavButtons(id) {
	const win = document.querySelector(`.window[data-id="${id}"]`);
	if (!win) return;
	const h = getHistory(id);
	const back = win.querySelector('.buttons .back');
	const forward = win.querySelector('.buttons .forward');
	if (back) {
		const disableBack = h.index <= 0;
		back.classList.toggle('disabled', disableBack);
		back.disabled = disableBack;
	}
	if (forward) {
		const disableForward = h.index >= h.stack.length - 1;
		forward.classList.toggle('disabled', disableForward);
		forward.disabled = disableForward;
	}
}

function getHistory(id) {
	if (!windowHistory[id]) windowHistory[id] = { stack: [], index: -1 };
	return windowHistory[id];
}

function pushHistory(id, data) {
	const h = getHistory(id);
	const last = h.stack[h.index];
	if (last && last.payload === data) return;
	if (h.index < h.stack.length - 1) h.stack = h.stack.slice(0, h.index + 1);
	h.stack.push({ payload: data, owner: id });
	h.index++;
	updateNavButtons(id);
}

function navigateTo(id, index) {
	const h = getHistory(id);
	if (index < 0 || index >= h.stack.length) return;
	h.index = index;
	const entry = h.stack[h.index];
	window.getWindow(entry.payload, true);
	updateNavButtons(id);
}

window.getWindow = async function (data, fromHistory = false) {
    
    document.getElementById('container').classList.add('loading');
    
	const blob = await doRequest('payload=window', data);
	const text = await blob.text();
	const json = JSON.parse(text);
	if (json.window_invalid) {
		if (data.open) {
			const program = await window.getWindow({ load: 'opener', open: data.open });
			if (program) {
				return window.getWindow({ load: program, open: data.open });
			}
		}
		return;
	}
	const windowContainer = document.querySelector('#windows');
	let win = windowContainer.querySelector(`.window[data-id="${json.window_id}"]`);
	let isNew = false;
	
	if (!win) {
		isNew = true;
		win = document.createElement('div');
		win.className = 'window window_' + json.window_id;
		win.style.width = json.window_width;
		win.style.height = json.window_height;
		requestAnimationFrame(() => {
			let pos;
			if (json.window_centered) {
				pos = win.getBoundingClientRect();
				win.style.top = `calc(max(0px,50% - ${pos.height / 2}px))`;
				win.style.left = `calc(50% - ${pos.width / 2}px)`;
			} else {
				pos = getPosition();
				win.style.top = pos.top + 'px';
				win.style.left = pos.left + 'px';
			}
		});
		windowContainer.appendChild(win);
		win.dataset.listenersAttached = 'false';
	}
	win.dataset.id = json.window_id;
	win.dataset.path = json.window_path || '';
	win.dataset.maximizable = json.window_maximizable;
	win.dataset.minimizable = json.window_minimizable;
	win.dataset.resizable = json.window_resizable;
	win.dataset.draggable = json.window_draggable;
	win.dataset.confirm = json.window_confirm;
	if (win.dataset.listenersAttached === 'false') {
		win.addEventListener('mousedown', () => focusWindow(json.window_id));
		win.dataset.listenersAttached = 'true';
	}
	
    if (json.window_sound) {
        await new Audio(json.window_sound).play();
    }
	
	win.innerHTML = `
		<div class="titlebar">
			<div class="title">
				${json.window_icon ? `<img class="image" src="${json.window_icon}">` : ''}
				${json.window_name ? `<span class="label">${json.window_name}</span>` : ''}
			</div>
			<div class="buttons">
				${json.window_minimizable ? `<img class="minimize" src="/static/images/interface/minimize.png">` : ''}
				${json.window_maximizable ? `<img class="maximize" src="/static/images/interface/maximize.png">` : ''}
				${json.window_closable ? `<img class="close" src="/static/images/interface/close.png">` : ''}
			</div>
		</div>
		<div class="inner">
			<div class="head">${json.window_head ? json.window_head : ''}</div>
			<div class="middle">
				${json.window_side ? `<div class="side">${json.window_side}</div>` : ''}
				${json.window_body ? `<div class="body">${json.window_body}</div>` : ''}
			</div>
			${json.window_foot ? `<div class="foot">${json.window_foot}</div>` : ''}
		</div>
	`;
	if (!fromHistory) {
		pushHistory(json.window_id, data);
	} else {
		updateNavButtons(json.window_id);
	}
	if (json.window_minimizable) {
		const btn = win.querySelector('.titlebar .minimize');
		btn?.addEventListener('click', () => toggleMinimize(json.window_id));
	}
	if (json.window_maximizable) {
		const btn = win.querySelector('.titlebar .maximize');
		btn?.addEventListener('click', () => toggleMaximize(json.window_id));
		win.querySelector('.titlebar')?.addEventListener('dblclick', () => toggleMaximize(json.window_id));
	}
	if (json.window_closable) {
		win.querySelector('.titlebar .close')?.addEventListener('click', () => closeWindow(json.window_id));
	}
	buttonsWindow(json.window_id);
	scriptsWindow(json.window_id);
	iframeWindow(json.window_id);
	fullscreenWindow(json);
	overlayWindow(json);
	taskWindow(json);
    if (isNew && !fromHistory) {
    	win.style.display = '';
    	win.style.visibility = '';
    }
	requestAnimationFrame(() => {
		setWindowState(json.window_id, { window: getScaledPosition(win), title: getScaledPosition(win.querySelector('.titlebar') || win) });
		const taskEl = document.querySelector(`#taskbar .tasks .task[data-id="${json.window_id}"]`);
		if (taskEl) setWindowState(json.window_id, { task: getScaledPosition(taskEl) });
	});
	
	
	
	
	buildMenuBarFromStructure(win);

	
	
	
	
	focusWindow(json.window_id);
	
    document.getElementById('container').classList.remove('loading');

	return await promiseWindow(json);
};

document.addEventListener('DOMContentLoaded', () => {
	const edge = 10,
		minW = 100,
		minH = 60;
	let winEl = null,
		isResizing = false,
		isDragging = false,
		dir = '';
	let startX = 0,
		startY = 0,
		startL = 0,
		startT = 0,
		startW = 0,
		startH = 0,
		scale = 1;
	let dragOffsetX = 0,
		dragOffsetY = 0;

	function getDir(e, el) {
		const r = el.getBoundingClientRect();
		const x = e.clientX - r.left,
			y = e.clientY - r.top;
		const l = x <= edge,
			rgt = x >= r.width - edge,
			t = y <= edge,
			b = y >= r.height - edge;
		if (t && l) return 'nw';
		if (t && rgt) return 'ne';
		if (b && l) return 'sw';
		if (b && rgt) return 'se';
		if (l) return 'w';
		if (rgt) return 'e';
		if (t) return 'n';
		if (b) return 's';
		return '';
	}

	function setCursor(c) {
		document.body.style.cursor = c || '';
		if (winEl) winEl.style.cursor = c || 'default';
	}

	function initInteraction(el, resizing, e) {
		const rect = el.getBoundingClientRect();
		const cs = getComputedStyle(el);
		startL = parseFloat(cs.left) || rect.left + window.scrollX;
		startT = parseFloat(cs.top) || rect.top + window.scrollY;
		startW = parseFloat(cs.width) || rect.width;
		startH = parseFloat(cs.height) || rect.height;
		scale = startW ? rect.width / startW : 1;
		if (!isFinite(scale) || scale <= 0) scale = 1;
		startX = e.clientX;
		startY = e.clientY;
		if (!resizing) {
			dragOffsetX = (e.clientX - rect.left) / scale;
			dragOffsetY = (e.clientY - rect.top) / scale;
		}
		winEl = el;
		document.body.classList.add('resizing');
	}

	document.addEventListener('mousemove', (e) => {
		if (isResizing) return;
		const target = e.target.closest('.window[data-resizable="true"]');
		if (!target) return;
		if (target.dataset.maximized === 'true') return (target.style.cursor = 'default');
		const d = getDir(e, target);
		target.style.cursor = d ? d + '-resize' : 'default';
	});

	document.addEventListener('mousedown', (e) => {
		const target = e.target.closest('.window[data-resizable="true"]');
		if (!target || target.dataset.maximized === 'true') return;
		const d = getDir(e, target);
		if (!d) return;
		e.preventDefault();
		isResizing = true;
		dir = d;
		initInteraction(target, true, e);
		setCursor(dir + '-resize');
	});

	document.addEventListener('mousedown', (e) => {
		const head = e.target.closest('.window .titlebar');
		const parent = head?.closest('.window[data-draggable="true"]');
		if (!head || !parent) return;
		if (parent.dataset.maximized === 'true') return;
		if (getDir(e, parent)) return;
		e.preventDefault();
		isDragging = true;
		initInteraction(parent, false, e);
	});

	document.addEventListener('mousemove', (e) => {
		if (!winEl) return;
		const container = document.getElementById('windows');
		if (isResizing) {
			let dx = (e.clientX - startX) / scale;
			let dy = (e.clientY - startY) / scale;
			let w = startW,
				h = startH,
				l = startL,
				t = startT;
			if (dir.includes('e')) w = Math.max(minW, startW + dx);
			if (dir.includes('s')) h = Math.max(minH, startH + dy);
			if (dir.includes('w')) {
				dx = Math.min(dx, startW - minW);
				w = startW - dx;
				l = startL + dx;
			}
			if (dir.includes('n')) {
				dy = Math.min(dy, startH - minH);
				h = startH - dy;
				t = startT + dy;
			}
			if (l < 0) {
				w += l;
				l = 0;
			}
			if (t < 0) {
				h += t;
				t = 0;
			}
			if (container && l + w > container.clientWidth) w = container.clientWidth - l;
			if (container && t + h > container.clientHeight) h = container.clientHeight - t;
			winEl.style.width = w + 'px';
			winEl.style.height = h + 'px';
			winEl.style.left = l + 'px';
			winEl.style.top = t + 'px';
		} else if (isDragging) {
			const container = document.getElementById('windows');
			let l = (e.clientX + (container ? container.scrollLeft : 0)) / scale - dragOffsetX;
			let t = (e.clientY + (container ? container.scrollTop : 0)) / scale - dragOffsetY;
			l = Math.min(Math.max(l, 0 - dragOffsetX), (container ? container.clientWidth : window.innerWidth) - dragOffsetX);
			t = Math.min(Math.max(t, 0 - dragOffsetY), (container ? container.clientHeight : window.innerHeight) - dragOffsetY);
			winEl.style.left = Math.round(l) + 'px';
			winEl.style.top = Math.round(t) + 'px';
		}
	});

	document.addEventListener('mouseup', () => {
		isResizing = false;
		isDragging = false;
		if (winEl) {
			const id = winEl.dataset.id;
			setWindowState(id, { window: getScaledPosition(winEl), title: getScaledPosition(winEl.querySelector('.titlebar') || winEl) });
			winEl.style.cursor = 'default';
		}
		winEl = null;
		dir = '';
		document.body.style.cursor = '';
		document.body.classList.remove('resizing');
	});
        	
    ['click','dblclick','mousedown','mouseup','keydown','keyup','keypress','contextmenu'].forEach(event => {
    	document.addEventListener(event, e => {
    		if (locked) {
    			e.preventDefault();
    			e.stopImmediatePropagation();
    		}
    	}, true);
    });
});

