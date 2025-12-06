let AccountHash;
let AccountName;
let AccountPicture;
let AccountData;

async function doLogin(hash = false, password = false, userDiv) {
    
	const container = document.getElementById('loginContainer');
	const extraDiv = userDiv.querySelector('.ExtraDiv');

	container.querySelectorAll('.login').forEach(div => {
		div.classList.toggle('selected', div === userDiv);
		div.querySelector('.ExtraDiv').classList.toggle('hidden', div !== userDiv);
	});
    
	const account = await new Promise(resolve => {
	    
		let passInput;
		let goBtn;

		const submit = async (hash, password) => {
		    
			try {
			    
				const blob = await doRequest('payload=process', { task: 'account_login', hash, password });
				const text = await blob.text();
				
				if (!text.trim()) return;
				
				const response = JSON.parse(text);
				
				if (response.result !== 'success') {
				    
					if (passInput) {
						passInput.value = '';
						passInput.placeholder = response.output || 'Incorrect password';
						passInput.focus();
					}
					
					return;
					
				}
				
				resolve(response.output);
				
			} catch {
			    
				if (passInput) {
					passInput.placeholder = 'Network error';
					passInput.focus();
				}
				
			}

		};

		if (password) {
		    
			extraDiv.innerHTML = `
				<div style="display:flex;align-items:stretch;gap:10px;">
					<input type="password" style="border-radius:5px;font-size:14px;width:150px;outline:none" placeholder="Type your password...">
					<img src="/static/images/interface/explorer/go.png" style="width:auto;height:28px;border:1px solid #FFFFFF;border-radius:5px;box-sizing:border-box;">
				</div>
			`;
			
			passInput = extraDiv.querySelector('input');
			goBtn = extraDiv.querySelector('img');

			passInput.focus();

			const submitPassword = () => submit(hash, passInput.value);

			passInput.addEventListener('keydown', e => {
				if (e.key === 'Enter') submitPassword();
			});
			
			goBtn.addEventListener('click', e => {
				e.stopPropagation();
				submitPassword();
			});
			
		} else {
		    
			submit(hash, false);
			
		}
		
	});

	if (account === false) {
		return;
	}

	document.querySelector('#login .left').innerHTML = '<div class="welcome">welcome</div>';

	userDiv.classList.remove('selected');
	userDiv.classList.add('active');

	extraDiv.innerHTML = '<div style="font-size:12px;font-family:sans-serif;font-weight:bold;color:rgb(0,48,156);">Loading your personal settings...</div>';

	container.querySelectorAll('.login').forEach(div => {
		div.style.pointerEvents = 'none';
		if (div !== userDiv) Object.assign(div.style, {
			transition: 'opacity 0.5s ease',
			opacity: '0'
		});
	});

	const { height: ch, top: ct } = container.getBoundingClientRect();
	const { top: ut, height: uh } = userDiv.getBoundingClientRect();
	const offsetY = ch / 2 - (ut - ct + uh / 2);

	Object.assign(userDiv.style, {
		transition: 'transform 0.5s ease, opacity 0.5s ease',
		transform: `translateY(${offsetY}px)`
	});

	AccountHash = account.hash;
	AccountName = account.name;
	AccountPicture = account.picture;
	AccountData = account.data;
    
	Object.entries(account.data).forEach(([type, group]) => {
		Object.entries(group).forEach(([key, value]) => {
			doSetting(type, key, value);
		});
	});

	await ensureVFSReady();

    await renderInterface();
    await renderStartMenu();
	await renderDesktop();
	
	await checkRecycleBin('C:/RECYCLE');
	await checkStartupFolder('C:/Documents and Settings/Start Menu/Programs/Startup');
	
	doPing();
	
    await new Audio('/static/sounds/startup.wav').play();
    
    fadeOut(document.getElementById('login'));

	setTimeout(() => {
		doBalloon(
			'Take a tour of Windows XP',
			"To learn about the fun features Windows XP has to offer, click here. To find this info later, click Help and About on the Start menu.",
			"doOpen('C:/WINDOWS/Tour Windows XP.exe');this.remove();",
			"75"
		);
	}, 10000);
	
}


async function doLogoff() {
    
    const confirm = await getWindow({ load: 'dialog', open: 'confirm', message: 'Are you sure you want to log off? Unsaved work will be lost.' });
    if(!confirm) return;
    
    closeWindows();
    
    try { new Audio('/static/sounds/shutdown.wav').play(); } catch (e) { }

    const logoffEl = document.getElementById('logoff');
    
    fadeIn(logoffEl);

    setTimeout(function() {
        __cpLocation.reload();
    }, 3000);
    
}


async function doStart(el) {
    
    const parent = el.closest('.login');
	const input = parent.querySelector('input');
	const msgdiv = document.querySelector('#login .left .msg');
	
	const process = await createAccount(input.value);
	
	if(process.result === 'success') {
	    
	    parent.querySelector('.UserName').textContent = process.output.name;
	    parent.querySelector('.UserPicture').src = '/static/images/user/' + process.output.picture + '.png';
	    
	    return doLogin(process.output.hash, '', parent);
	    
	} else {
	    
        msgdiv.innerHTML = process.output;
	    
	}
	
}

async function createAccount(name) {
    
	const blob = await doRequest('payload=process', { task: 'account_new', name });
	const text = await blob.text();
	
	if (text.trim()) {

	    return JSON.parse(text);
	
	}
	
}

async function deleteAccount() {
    
	const blob = await doRequest('payload=process', { task: 'account_delete' });
	const text = await blob.text();
	
	if (text.trim()) {

	    return JSON.parse(text);
	
	}
	
}

async function updateName(name) {
    
	const blob = await doRequest('payload=process', { task: 'account_name', name });
	const text = await blob.text();
	
	if (text.trim()) {

	    return JSON.parse(text);
	
	}
	
}

async function updatePicture(picture) {
    
	const blob = await doRequest('payload=process', { task: 'account_picture', picture });
	const text = await blob.text();
	
	if (text.trim()) {

	    return JSON.parse(text);
	
	}
	
}

async function updatePassword(newpassword, oldpassword) {
    
	const blob = await doRequest('payload=process', { task: 'account_password', oldpassword, newpassword });
	const text = await blob.text();
	
	if (text.trim()) {

	    return JSON.parse(text);
	
	}
	
}

async function updateSettings(settings) {
    
	const blob = await doRequest('payload=process', { task: 'account_settings', settings: JSON.stringify(settings) });
	const text = await blob.text();
	
	if (text.trim()) {
    
        for (const { key1, key2, value } of settings) {
        	AccountData[key1][key2] = value;
        	doSetting(key1, key2, value);
        }
        
	    return JSON.parse(text);
	
	}
	
}