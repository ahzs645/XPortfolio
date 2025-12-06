document.addEventListener("DOMContentLoaded", function() {
    
    const menu = {
    	new: { label: 'New', action: (el) => { getWindow({load:el.dataset.id}); } },
    	open: { label: 'Open', action: (el) => { fileOpen(el.dataset.id); } },
    	close: { label: 'Close', action: (el) => { closeWindow(el.dataset.id); } },
    	
    	save: { label: 'Save' },
    	saveAs: { label: 'Save As...' },
    	print: { label: 'Print' },
    	
    	
    	
    	
    	printNotepad: { label: 'Print', action: (el) => { doPrint(el.querySelector('#editor_notepad')); } },
    	printWordpad: { label: 'Print', action: (el) => { doPrint(el.querySelector('#editor_wordpad'));  } },
    	printInternet: { label: 'Print', action: (el) => { el.querySelector('#browser').contentWindow.print(); } },
    	printPaint: { label: 'Print', action: (el) => { doPrint(el.querySelector('#paint-canvas'));  } },
    	
    	saveNotepad: { label: 'Save', action: (el) => { fileSave(el.dataset.id, el.dataset.path, el.querySelector('#editor_notepad').value); } },
    	saveWordpad: { label: 'Save', action: (el) => { fileSave(el.dataset.id, el.dataset.path, el.querySelector('#editor_wordpad').innerHTML); } },
        savePaint: { label: 'Save', action: async el => { fileSave(el.dataset.id, el.dataset.path, await new Promise(r => el.querySelector('#paint-canvas').toBlob(r))); } },
    	saveCoder: { label: 'Save', action: (el) => { fileSave(el.dataset.id, el.dataset.path, editor.getValue()); } },

    	saveAsNotepad: { label: 'Save As...', action: (el) => { fileSave(el.dataset.id, '', el.querySelector('#editor_notepad').value); } },
    	saveAsWordpad: { label: 'Save As...', action: (el) => { fileSave(el.dataset.id, '', el.querySelector('#editor_wordpad').innerHTML); } },
        saveAsPaint: { label: 'Save As...', action: async el => fileSave(el.dataset.id, '', await new Promise(r => el.querySelector('#paint-canvas').toBlob(r))) },
    	saveAsCoder: { label: 'Save As...', action: (el) => { fileSave(el.dataset.id, '', editor.getValue()); } },

    	
    	
    	
    	saveAttachments: { label: 'Save Attachments...' },
    	saveAsStationery: { label: 'Save as Stationery...' },
    	
    	printPreview: { label: 'Print Preview...' },
    	delete: { label: 'Delete' },
    	rename: { label: 'Rename' },
    	properties: { label: 'Properties' },
    	createShortcut: { label: 'Create Shortcut' },
    	folder: { label: 'Folder' },
    	import: { label: 'Import' },
    	export: { label: 'Export' },
    	switchIdentity: { label: 'Switch Identity...' },
    	identities: { label: 'Identities' },
    	workOffline: { label: 'Work Offline' },
    	exitLogOff: { label: 'Exit and Log Off Identity' },
    	edit: { label: 'Edit' },
    	undo: { label: 'Undo' },
    	redo: { label: 'Redo' },
    	cut: { label: 'Cut' },
    	copy: { label: 'Copy' },
    	paste: { label: 'Paste' },
    	pasteSpecial: { label: 'Paste Special...' },
    	pasteShortcut: { label: 'Paste Shortcut' },
    	clear: { label: 'Clear' },
    	selectAll: { label: 'Select All' },
    	find: { label: 'Find...' },
    	findNext: { label: 'Find Next' },
    	replace: { label: 'Replace...' },
    	links: { label: 'Links...' },
    	objectProperties: { label: 'Object Properties' },
    	object: { label: 'Object' },
    	invertSelection: { label: 'Invert Selection' },
    	findOnPage: { label: 'Find (on This Page)...' },
    	markRead: { label: 'Mark as Read' },
    	markUnread: { label: 'Mark as Unread' },
    	markConversationRead: { label: 'Mark Conversation as Read' },
    	markAllRead: { label: 'Mark All Read' },
    	toolbar: { label: 'Toolbar' },
    	toolbars: { label: 'Toolbars' },
    	formatBar: { label: 'Format Bar' },
    	ruler: { label: 'Ruler' },
    	statusBar: { label: 'Status Bar' },
    	options: { label: 'Options...' },
    	explorerBar: { label: 'Explorer Bar' },
    	
    	thumb: { label: 'Thumbnails' },    // no need for action
    	tile: { label: 'Tiles' },          // no need for action
    	icon: { label: 'Icons' },          // no need for action
    	list: { label: 'List' },           // no need for action
    	details: { label: 'Details' },     // no need for action
    	
    	arrangeIcons: { label: 'Arrange Icons by...' },
    	chooseDetails: { label: 'Choose Details...' },
    	goTo: { label: 'Go To...' },
    	refresh: { label: 'Refresh' },
    	currentView: { label: 'Current View' },
    	sortBy: { label: 'Sort By' },
    	columns: { label: 'Columns...' },
    	layout: { label: 'Layout' },
    	blockedImages: { label: 'Blocked Images' },
    	messageHTML: { label: 'Message in HTML' },
    	textSize: { label: 'Text Size' },
    	encoding: { label: 'Encoding' },
    	prevMessage: { label: 'Previous Message' },
    	nextMessage: { label: 'Next' },
    	expand: { label: 'Expand' },
    	collapse: { label: 'Collapse' },
    	stop: { label: 'Stop' },
    	fullScreen: { label: 'Full Screen' },
    	privacyReport: { label: 'Privacy Report...' },
    	source: { label: 'Source' },
    	dateTime: { label: 'Date and Time...' },
    	font: { label: 'Font...' },
    	bulletStyle: { label: 'Bullet Style' },
    	paragraphs: { label: 'Paragraphs...' },
    	tabs: { label: 'Tabs...' },
    	helpSupport: { label: 'Help and Support Center', action: (el) => { doOpen('C:/WINDOWS/Help Center.exe'); } },
    	aboutWindows: { label: 'About Windows', action: (el) => { doOpen('C:/WINDOWS/About.exe'); } },
    	copyLegal: { label: 'Is this copy of Windows legal?' },
    	contentsIndex: { label: 'Contents and Index' },
    	readMe: { label: 'Read Me' },
    	microsoftWeb: { label: 'Microsoft on the Web' },
    	tipOfDay: { label: 'Tip of the Day' },
    	netscapeUsers: { label: 'For Netscape Users' },
    	onlineSupport: { label: 'Online Support' },
    	sendFeedback: { label: 'Send Feedback' },
    	addToFavorites: { label: 'Add to Favorites...' },
    	organizeFavorites: { label: 'Organize Favorites...' },
    	mapNetworkDrive: { label: 'Map Network Drive...' },
    	disconnectNetworkDrive: { label: 'Disconnect Network Drive...' },
    	synchronize: { label: 'Synchronize...' },
    	folderOptions: { label: 'Folder Options...' },
    	mailNews: { label: 'Mail and News' },
    	popupBlocker: { label: 'Popup Blocker' },
    	manageAddons: { label: 'Manage Add-ons...' },
    	systemUpdate: { label: 'System Update' },
    	windowsMessenger: { label: 'Windows Messenger', action: (el) => { doOpen('C:/Program Files/Windows Messenger.exe'); } },
    	internetOptions: { label: 'Internet Options...' },
    	sendReceive: { label: 'Send and Receive' },
    	synchronizeAll: { label: 'Synchronize All' },
    	synchronizeFolder: { label: 'Synchronize Folder' },
    	markOffline: { label: 'Mark for Offline' },
    	addressBook: { label: 'Address Book...' },
    	addSenderAddressBook: { label: 'Add Sender to Address Book' },
    	add: { label: 'Add' },
    	messageRules: { label: 'Message Rules' },
    	newMessage: { label: 'New Message' },
    	newMessageUsing: { label: 'New Message Using' },
    	replySender: { label: 'Reply to Sender' },
    	replyAll: { label: 'Reply to All' },
    	forward: { label: 'Forward' },
    	forwardAttachment: { label: 'Forward as Attachment' },
    	createRuleMessage: { label: 'Create Rule From Message...' },
    	blockSender: { label: 'Block Sender...' },
    	flagMessage: { label: 'Flag Message' },
    	watchConversation: { label: 'Watch Conversation' },
    	ignoreConversation: { label: 'Ignore Conversation' },
    	combineDecode: { label: 'Combine and Decode...' },
    
    	separator: { separator: true }
    };

const contexts = {

	coder: [
		['File', ['new','open','saveCoder','saveAsCoder','delete','rename','properties','separator','close']],
		['Edit', ['undo','redo','separator','cut','copy','paste','pasteShortcut','separator','selectAll','invertSelection']],
		['View', ['toolbars','statusBar','explorerBar','separator','thumb','tile','icon','list','details','separator','arrangeIcons','separator','chooseDetails','goTo','refresh']],
		['Favorites', ['addToFavorites','organizeFavorites']],
		['Tools', ['mapNetworkDrive','disconnectNetworkDrive','synchronize','separator','folderOptions']],
		['Help', ['helpSupport','separator','copyLegal','aboutWindows']]
	],

	explorer: [
		['File', ['createShortcut','delete','rename','properties','separator','close']],
		['Edit', ['undo','redo','separator','cut','copy','paste','pasteShortcut','separator','selectAll','invertSelection']],
		['View', ['toolbars','statusBar','explorerBar','separator','thumb','tile','icon','list','details','separator','arrangeIcons','separator','chooseDetails','goTo','refresh']],
		['Favorites', ['addToFavorites','organizeFavorites']],
		['Tools', ['mapNetworkDrive','disconnectNetworkDrive','synchronize','separator','folderOptions']],
		['Help', ['helpSupport','separator','copyLegal','aboutWindows']]
	],

	internet: [
		['File', ['new','open','edit','save','saveAs','separator','pageSetup','printInternet','printPreview','separator','properties','workOffline','close']],
		['Edit', ['cut','copy','paste','separator','selectAll','separator','findOnPage']],
		['View', ['toolbars','statusBar','explorerBar','separator','goTo','stop','refresh','separator','textSize','encoding','separator','source','privacyReport','fullScreen']],
		['Favorites', ['addToFavorites','organizeFavorites']],
		['Tools', ['mailNews','popupBlocker','manageAddons','synchronize','systemUpdate','separator','windowsMessenger','separator','internetOptions']],
		['Help', ['contentsIndex','tipOfDay','netscapeUsers','onlineSupport','sendFeedback','separator','aboutWindows']]
	],

	notepad: [
		['File', ['new','open','saveNotepad','saveAsNotepad','printNotepad','delete','rename','properties','separator','close']],
		['Edit', ['undo','redo','separator','cut','copy','paste','pasteShortcut','separator','selectAll','invertSelection']],
		['View', ['toolbars','statusBar','explorerBar','separator','thumb','tile','icon','list','details','separator','arrangeIcons','separator','chooseDetails','goTo','refresh']],
		['Favorites', ['addToFavorites','organizeFavorites']],
		['Tools', ['mapNetworkDrive','disconnectNetworkDrive','synchronize','separator','folderOptions']],
		['Help', ['helpSupport','separator','copyLegal','aboutWindows']]
	],

	outlook: [
		['File', ['new','open','saveAs','saveAttachments','saveAsStationery','separator','folder','separator','import','export','separator','print','separator','switchIdentity','identities','separator','properties','separator','workOffline','exitLogOff','close']],
		['Edit', ['copy','selectAll','separator','find','separator','moveToFolder','copyToFolder','separator','delete','emptyDeleted','separator','markRead','markUnread','markConversationRead','markAllRead']],
		['View', ['currentView','sortBy','columns','separator','layout','separator','blockedImages','messageHTML','separator','textSize','encoding','separator','prevMessage','nextMessage','goTo','separator','expand','collapse','separator','stop','refresh']],
		['Tools', ['sendReceive','separator','synchronizeAll','synchronizeFolder','markOffline','separator','addressBook','addSenderAddressBook','add','separator','messageRules','separator','windowsMessenger','myOnlineStatus','accounts','options']],
		['Message', ['newMessage','newMessageUsing','separator','replySender','replyAll','forward','forwardAttachment','separator','createRuleMessage','blockSender','separator','flagMessage','watchConversation','ignoreConversation','separator','combineDecode']],
		['Help', ['contentsIndex','readMe','separator','microsoftWeb','separator','aboutWindows']]
	],

	paint: [
		['File', ['new','open','savePaint','saveAsPaint','printPaint','createShortcut','delete','rename','properties','separator','close']],
		['Edit', ['undo','redo','separator','cut','copy','paste','pasteShortcut','separator','selectAll','invertSelection']],
		['View', ['toolbars','statusBar','explorerBar','separator','thumb','tile','icon','list','details','separator','arrangeIcons','separator','chooseDetails','goTo','refresh']],
		['Favorites', ['addToFavorites','organizeFavorites']],
		['Tools', ['mapNetworkDrive','disconnectNetworkDrive','synchronize','separator','folderOptions']],
		['Help', ['helpSupport','separator','copyLegal','aboutWindows']]
	],

	wordpad: [
		['File', ['new','open','saveWordpad','saveAsWordpad','printWordpad','delete','rename','properties','separator','close']],
		['Edit', ['undo','redo','separator','cut','copy','paste','pasteSpecial','clear','selectAll','separator','find','findNext','replace','separator','links','objectProperties','object']],
		['View', ['toolbar','formatBar','ruler','statusBar','separator','options']],
		['Insert', ['dateTime','object']],
		['Format', ['font','bulletStyle','paragraphs','tabs']],
		['Help', ['helpSupport','separator','aboutWindows']]
	]

};

	function buildMenuBarFromStructure(win) {
		if (!win) return null;
		const head = win.querySelector('.head');
		if (!head) return null;

		// Remove existing MenuBar if present
		const existing = head.querySelector('.MenuBar');
		if (existing) existing.remove();

		// Determine context key
		const key = win.dataset.id;
		if(!key) return;
		let structure = contexts[key];
		if(!structure) return;
		
		if (structure.length && !Array.isArray(structure[0])) structure = [['Menu', structure]];

		const wrapper = document.createElement('div');
		wrapper.classList.add('MenuBar','headermenu');

		// Add logo
        const keys = ['explorer', 'internet', 'outlook'];
                        
        if (keys.includes(key)) {
    		const logo = document.createElement('div');
    		logo.setAttribute('style','padding:0 10px;border:none;float:right;background:#FFFFFF;height:24px;');
    		const img = document.createElement('img');
    		img.src = '/static/images/logo/flag.png';
    		img.style.height = '100%';
    		logo.appendChild(img);
    		wrapper.appendChild(logo);
        }

		// Build each menu
		structure.forEach(menuDef => {
			const [label, items] = menuDef;
			const listDiv = document.createElement('div');
			listDiv.classList.add('list');

			const buttonDiv = document.createElement('div');
			buttonDiv.classList.add('button');
			buttonDiv.textContent = label;

			const dropdownUl = document.createElement('ul');
			dropdownUl.classList.add('dropdown');

			items.forEach(key => {
				const item = menu[key];
				if (!item) return;
				const li = document.createElement('li');
				if (item.separator) {
					li.classList.add('separator');
				} else {
					li.textContent = item.label || '';
					if (item.open) li.dataset.open = item.open;
					
					if (typeof item.action === 'function') {

                        li.addEventListener('click', function(ev) {
                        	ev.stopPropagation();
                        	const win = li.closest('.window');
                        	if (typeof item.action === 'function') item.action(win);
                        });

						if ((key === 'paste' || key === 'pasteShortcut') && (!window.clipboard || window.clipboard.length === 0)) {
							li.classList.add('disabled');
						}
					} else {
                            					    
                        const views = ['thumb', 'tile', 'icon', 'list', 'details'];
                        
                        if (views.includes(key)) {
                        	li.dataset.view = key;
                        } else {
                        	li.classList.add('disabled');
                        }

					}
				}
				dropdownUl.appendChild(li);
			});

			listDiv.appendChild(buttonDiv);
			listDiv.appendChild(dropdownUl);
			wrapper.appendChild(listDiv);
		});

		head.prepend(wrapper);
		return wrapper;
	}

	// Expose globally
	window.buildMenuBarFromStructure = buildMenuBarFromStructure;

});
