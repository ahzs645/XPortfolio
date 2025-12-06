function fadeOut(el, duration = 1000, callback) {
    if (!el) { if (callback) callback(); return; }
    el.style.transition = `opacity ${duration}ms`;
    el.style.opacity = getComputedStyle(el).opacity || 1;
    void el.offsetWidth;
    el.style.opacity = 0;
    setTimeout(() => {
        el.style.transition = '';
        el.style.display = 'none';
        if (callback) callback();
    }, duration);
}

function fadeIn(el, duration = 1000, display = 'block', callback) {
    if (!el) { if (callback) callback(); return; }
    el.style.display = display;
    el.style.opacity = 0;
    el.style.transition = `opacity ${duration}ms`;
    void el.offsetWidth;
    el.style.opacity = 1;
    setTimeout(() => {
        el.style.transition = '';
        if (callback) callback();
    }, duration);
}

function getTimeago() {
	const elements = document.querySelectorAll('[data-time]');

	elements.forEach(el => {
		let timestamp = el.getAttribute('data-time');

		timestamp = isNaN(timestamp) ? Math.round(new Date(timestamp).getTime() / 1000) : Number(timestamp);
		if (timestamp === 0) {
			return;
		}

		const now = Math.round(Date.now() / 1000);
		let diff = now - timestamp;
		const future = diff < 0;
		diff = Math.abs(diff);

		const periods = {
			year: 31536000,
			month: 2630000,
			week: 604800,
			day: 86400,
			hour: 3600,
			minute: 60
		};

		let output = "";
		let granularity = 1;

		for (const [key, value] of Object.entries(periods)) {
			if (diff >= value) {
				const time = Math.round(diff / value);
				diff %= value;
				output += `${output ? " " : ""}${time} ${key}${time > 1 ? "s" : ""}`;
				granularity--;
			}
			if (granularity === 0) break;
		}

		el.textContent = output ? output + (future ? ' to go' : ' ago') : 'just now';
	});
}

function formatBytes(bytes) {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B','KB','MB','GB','TB'];
	const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatDate(ts, type = 'long') {
	if (!ts) return 'Unknown'
	const num = Number(ts)
	if (isNaN(num)) return 'Unknown'
	const d = new Date(num)
	if (type === 'short') {
		const date = d.toLocaleDateString('en-GB')
		const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
		return `${date} ${time}`
	} else {
		const weekday = d.toLocaleDateString(undefined, { weekday: 'long' })
		const monthDayYear = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
		const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
		return `${weekday}, ${monthDayYear}, ${time}`
	}
}

let pingTimeout;
let pingNumber = 0;

async function doPing() {
    
	clearTimeout(pingTimeout);

	if (!document.hidden) {
	    
		const blob = await doRequest('payload=ping');
    	const text = await blob.text();
	    const json = JSON.parse(text);
    	
    	if(json.result === 'success') {
        	
        	if(json.output > pingNumber) {
        	    
        	    if (!document.querySelector('#windows .window[data-id="messenger"]')) {
        	    
            		doBalloon(
            			'You have new messages',
            			"You have unread messages in Windows Messenger.",
            			"doOpen('C:/Program Files/Windows Messenger.exe');this.remove();",
            			"98"
            		);
        		
        	    }
    		
        	}
        	
        	pingNumber = json.output;
    	    
    	}
    	
	}

	pingTimeout = setTimeout(doPing, 10000);
	
}

function doPrint(el) {
  if (!(el instanceof Element)) return;
  const escapeHtml = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const temp = document.createElement('iframe');
  Object.assign(temp.style, { position: 'absolute', left: '-9999px', top: '-9999px', width: '0', height: '0', border: '0' });
  document.body.appendChild(temp);
  const doc = temp.contentWindow.document;
  doc.open();

  const triggerPrint = `
    <script>
      (function(){
        function doIt(){ try{ window.focus(); window.print(); } catch(e){} }
        var printed = false;
        function once(){ if(!printed){ printed=true; doIt(); } }
        if(document.readyState==='complete') once();
        else window.addEventListener('load', once);
        setTimeout(once,1000);
      })();
    <\/script>
  `;

  if (el instanceof HTMLCanvasElement) {
    const dataUrl = el.toDataURL('image/png');
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Print</title></head><body style="margin:0"><img src="${dataUrl}" style="display:block;width:100%;height:auto"></body>${triggerPrint}</html>`);
  } else if (el instanceof HTMLTextAreaElement) {
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Print</title></head><body style="margin:8px"><pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml(el.value)}</pre>${triggerPrint}</body></html>`);
  } else {
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Print</title></head><body style="margin:8px">${el.outerHTML}${triggerPrint}</body></html>`);
  }

  doc.close();
  setTimeout(() => { if (temp.parentNode) temp.parentNode.removeChild(temp); }, 2000);
}

async function doOpen(path) {
    
    if (!path) return;
    
	if (await isProtected(path, 'access', [])) return;

    if (/^(https?:\/\/|www\.)/i.test(path)) {
        return getWindow({ load: 'internet', open: path });
    }

    if (/^[CDA]:\//i.test(path)) {
        
        const ext = path.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
    
        if (!ext) {
            return getWindow({ load: 'explorer', open: path });
        }
        
        if (ext === 'lnk') {
            const node = await getNode(path);
            const text = await node.content.text();
            const json = JSON.parse(text);
            return doOpen(json.open);
        }
        
        if (ext === 'exe') {
            const node = await getNode(path);
            const text = await node.content.text();
            const json = JSON.parse(text);
            return getWindow(json);
        }
        
        if (ext === 'dos') {
            return getWindow({load:'dos', open:path});
        }
        
        if(AccountData.defaults[ext]) {
            return getWindow({ load: AccountData.defaults[ext], open: path });
        }
        
        const program = await getWindow({ load: 'opener', open: path });
        
        if(program) {
            return getWindow({ load: program, open: path });
        }
        
    }

    return getWindow({ load: 'dialog', open: 'error', message: 'An unexpected error occured' });
    
}


function toggleVolume() {
    const vol = document.getElementById('volume');
    vol.style.display = vol.style.display === 'block' ? 'none' : 'block';
}


async function doBalloon(name, text, action, right) {

    const target = document.querySelector('#taskbar .tray');
    if (!target) return;

	document.querySelectorAll('#balloon').forEach(b => b.remove());

    setTimeout(async function() {

        await new Audio('/static/sounds/balloon.wav').play();
        
        const balloon = document.createElement('div');
        balloon.id = 'balloon';
        balloon.style.right = right;
        balloon.innerHTML = `
            <div class="title">
                <img class="balloonicon" src="/static/images/icon/info.png">${name}
            </div>
            <div class="close"><img src="/static/images/interface/balloon/close.png"></div>
            <span class="messagetext">${text}</span>
        `;
    
        target.appendChild(balloon);
    
        if (action) {
            const fn = typeof action === 'function' ? action : (typeof action === 'string' ? new Function(action) : null);
            if (fn) balloon.addEventListener('click', fn);
        }
    
        const closeBtn = balloon.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                balloon.remove();
            });
        }
    
    }, 200);
    
}

function alignDesktopGrid() {
    const container = document.querySelector('#desktop');
    if (!container) return;

    container.style.position = 'relative';

    const items = Array.from(container.querySelectorAll('.item'));
    if (items.length === 0) return;

    const itemWidth = items[0].offsetWidth;
    const itemHeight = items[0].offsetHeight;

    const maxRows = Math.floor(container.clientHeight / itemHeight) || 1;

    let gridIndex = 0;
    
    items.forEach((item) => {
    	if (item.classList.contains('topright')) {
    		item.style.position = 'absolute';
    		item.style.top = '0px';
    		item.style.right = '0px';
    	} else if (item.classList.contains('bottomright')) {
    		item.style.position = 'absolute';
    		item.style.bottom = '0';
    		item.style.right = '0px';
    	} else {
    		const row = gridIndex % maxRows;
    		const col = Math.floor(gridIndex / maxRows);
    
    		item.style.position = 'absolute';
    		item.style.top = `${row * itemHeight}px`;
    		item.style.left = `${col * itemWidth}px`;
    
    		gridIndex++;
    	}
    });
}


async function checkRecycleBin(path) {
	if (!path) return;
	if (!path.startsWith('C:/RECYCLE')) return;
	const recyclebin = document.querySelector('.item[data-open="C:/RECYCLE"] .image img');
	const items = await listDir('C:/RECYCLE');
	const isEmpty = !items || items.length === 0;
	if (recyclebin) {
		recyclebin.src = isEmpty
			? "/static/images/icon/folder/recycle_empty.png"
			: "/static/images/icon/folder/recycle_full.png";
	}
}

async function checkStartupFolder(path) {
	const items = await listDir(path);
	for (const item of items) {
		if (item.path) doOpen(item.path);
	}
}

function getParentPath(path) {
	if (typeof path !== 'string') throw new Error("Invalid path");
	let p = path.replace(/\\/g, '/').replace(/\/+$/, '');
	if (p === '') return null;
	if (/^[a-zA-Z]:$/.test(p) || /^[a-zA-Z]:\/$/.test(p)) return null;
	const parts = p.split('/').filter(Boolean);
	if (parts.length <= 1) return null;
	parts.pop();
	let res = parts.join('/');
	if (/^[a-zA-Z]:$/.test(parts[0])) {
		return res;
	}
	return res;
}

function getNameFromPath(path) {
	if (typeof path !== 'string') return path;
	let p = path.replace(/\\/g, '/').replace(/\/+$/, '');
	if (p === '') return p;
	if (p === '/' || /^[a-zA-Z]:$/.test(p) || /^[a-zA-Z]:\/$/.test(p)) return p;
	const parts = p.split('/').filter(Boolean);
	return parts.pop() || p;
}