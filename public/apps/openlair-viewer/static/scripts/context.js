document.addEventListener("DOMContentLoaded", function() {
    
    const menu = {
        
        open: { label: 'Open', action: (el) => { doOpen(el.dataset.open); } },
        explore: { label: 'Explore', action: (el) => { getWindow({load:'explorer', open:el.dataset.open, show:'folders'}); } },
        openWith: { label: 'Open With...', action: async (el) => { const program = await getWindow({load:'opener', open:el.dataset.open}); if(program) getWindow({load:program, open:el.dataset.open}); } },
    
        editText: { label: 'Edit', action: (el) => { getWindow({load:'notepad', open:el.dataset.open}); } },
        editHtml: { label: 'Edit', action: (el) => { getWindow({load:'notepad', open:el.dataset.open}); } },
        editRTF: { label: 'Edit', action: (el) => { getWindow({load:'wordpad', open:el.dataset.open}); } },
        editImage: { label: 'Edit', action: (el) => { getWindow({load:'paint', open:el.dataset.open}); } },
        print: { label: 'Print' },
        preview: { label: 'Preview', action: (el) => { getWindow({load:'viewer', open:el.dataset.open}); } },
        play: { label: 'Play', action: (el) => { getWindow({load:'player', open:el.dataset.open}); } },
        playAll: { label: 'Play All' },
        addToPlaylist: { label: 'Add to Playlist' },

        taskClose: { label: 'Close', action: (el) => { closeWindow(el.dataset.id); } },
        taskMinimize: { label: 'Toggle Minimize', action: (el) => { toggleMinimize(el.dataset.id); } },
        taskMaximize: { label: 'Toggle Maximize', action: (el) => { toggleMaximize(el.dataset.id); } },

        cut: { label: 'Cut', action: (el) => { cutItems(el); } },
        copy: { label: 'Copy', action: (el) => { copyItems(el); } },
        paste: { label: 'Paste', action: (el) => { pasteItems(); } },
        pasteShortcut: { label: 'Paste Shortcut', action: (el) => { pasteShortcuts(el.dataset.directory); } },
        createShortcut: { label: 'Create Shortcut' },
        delete: { label: 'Delete', action: (el) => { deleteItems(el); } },
        rename: { label: 'Rename', action: (el) => { renameItem(el); } },
    
        refresh: { label: 'Refresh', action: (el) => { renderContainer(el.dataset.directory); } },
        arrangeIconsBy: { label: 'Arrange Icons By' },
        view: { label: 'View' },
        sortBy: { label: 'Sort By' },
        lineUpIcons: { label: 'Line Up Icons' },
        autoArrange: { label: 'Auto Arrange' },
        alignToGrid: { label: 'Align to Grid' },
        showDesktopIcons: { label: 'Show Desktop Icons' },

        viewLargeIcons: { label: 'Large Icons' },
        viewSmallIcons: { label: 'Small Icons' },
        viewList: { label: 'List' },
        viewDetails: { label: 'Details' },
    
        name: { label: 'Name' },
        size: { label: 'Size' },
        type: { label: 'Type' },
        modified: { label: 'Modified' },
    
        sendto: { label: 'Send To' },
        new: { label: 'New' },
    
        desktopShortcut: { label: 'Desktop (create shortcut)', action: (el) => { createShortcut(el); } },
        myDocuments: { label: 'My Documents' },
        mailRecipient: { label: 'Mail Recipient' },
        compressedFolder: { label: 'Compressed (zipped) Folder' },
        faxRecipient: { label: 'Fax Recipient' },
        floppyA: { label: '3\u00BD  Floppy (A:)' },
        cdDrive: { label: 'CD Drive (D:)' },
        removableDrive: { label: 'Removable Disk' },
        bluetoothDevice: { label: 'Bluetooth Device' },
    
        uploadNew: { label: 'Upload', action: (el) => { createUpload(el); } },
        folderNew: { label: 'Folder', action: (el) => { createFolder(el); } },
        shortcutNew: { label: 'Shortcut' },
        bitmapNew: { label: 'Bitmap Image', action: (el) => { createFile(el, 'bmp', 'image/bmp'); } },
        textNew: { label: 'Text Document', action: (el) => { createFile(el, 'txt', 'text/plain'); } },
        richTextNew: { label: 'Rich Text Document', action: (el) => { createFile(el, 'rtf', 'text/html'); } },
        wordDocNew: { label: 'Microsoft Word Document' },
        excelSheetNew: { label: 'Microsoft Excel Worksheet' },
        powerpointNew: { label: 'Microsoft PowerPoint Presentation' },
        contactNew: { label: 'Contact' },
    
        openWithNotepad: { label: 'Notepad' },
        openWithWordpad: { label: 'WordPad' },
        openWithPaint: { label: 'Paint' },
        openWithIExplore: { label: 'Internet Explorer' },
        openWithAdobeReader: { label: 'Adobe Reader' },
    
        wallpaper: { label: 'Set As Wallpaper', action: (el) => { updateSettings([{ key1: 'background', key2: 'image', value: el.dataset.open }]); } },
        properties: { label: 'Properties', action: (el) => { getWindow({load:'properties', open:el.dataset.open, context:el.dataset.context}); } },
        propertiesDir: { label: 'Properties', action: (el) => { getWindow({load:'properties', open:el.dataset.directory, context:el.dataset.context}); } },
    
        autoplay: { label: 'AutoPlay' },
        eject: { label: 'Eject' },
        format: { label: 'Format...' },
        sharing: { label: 'Sharing and Security...' },
        mapNetworkDrive: { label: 'Map Network Drive...' },
        disconnectNetworkDrive: { label: 'Disconnect Network Drive...' },
    
        sendToCompressed: { label: 'Send to Compressed (zipped) Folder' },
        winrarAddToArchive: { label: 'Add to archive...' },
        winrarExtractHere: { label: 'Extract Here' },
        winzipAdd: { label: 'Add to Zip' },
    
        wmpAddToNowPlaying: { label: 'Add to Now Playing list' },
        winampPlay: { label: 'Play with Winamp' },
        realPlayerPlay: { label: 'Play in RealPlayer' },
        quicktimeOpen: { label: 'Open in QuickTime Player' },
    
        install: { label: 'Install' },
        merge: { label: 'Merge' },
        troubleshootCompatibility: { label: 'Troubleshoot Compatibility' },
        runAs: { label: 'Run as...' },
    
        search: { label: 'Search', action: (el) => { getWindow({load:'explorer', open:el.dataset.open, show:'search'}); } },
        manage: { label: 'Manage' },
        find: { label: 'Find...' },
        publish: { label: 'Publish' },
    
        emptyRecycleBin: { label: 'Empty Recycle Bin', action: (el) => { emptyRecycleBin(); } },
        restoreAll: { label: 'Restore all items', action: (el) => { restoreRecycleBin(); } },
        restoreItem: { label: 'Restore', action: (el) => { restoreItems(el); } },
    
        setAsDefaultPrinter: { label: 'Set as Default Printer' },
        seeWhatsPrinting: { label: "See what's printing" },
        pausePrinting: { label: 'Pause Printing' },
    
        connectNetworkDrive: { label: 'Connect Network Drive...' },
        disconnectNetworkDrive2: { label: 'Disconnect Network Drive...' },

        scanForViruses: { label: 'Scan for Viruses' },
        checkWithAntivirus: { label: 'Check with Antivirus...' },
    
        openContainingFolder: { label: 'Open Containing Folder' },
        extractHere: { label: 'Extract Here' },
    
        separator: { separator: true }
        
    };
    
    const contexts = {
        
        desktop: [ // verified
            ['arrangeIconsBy', ['name', 'size', 'type', 'modified', 'separator', 'autoArrange', 'alignToGrid']],
            'refresh',
            'separator',
            'paste',
            'pasteShortcut',
            'separator',
            ['new', ['folderNew', 'separator', 'textNew', 'richTextNew', 'bitmapNew', 'separator', 'uploadNew']],
            'separator',
            'properties'
        ],
        
        directory: [ // verified
            'refresh',
            'search',
            'separator',
            'paste',
            'pasteShortcut',
            'separator',
            ['new', ['folderNew', 'separator', 'textNew', 'richTextNew', 'bitmapNew', 'separator', 'uploadNew']],
            'separator',
            'sharing',
            'separator',
            'propertiesDir'
        ],
        
        computer: [ // verified
            'open',
            'search',
            'manage',
            'separator',
            'mapNetworkDrive',
            'disconnectNetworkDrive2',
            'separator',
            'properties'
        ],
        
        printer: ['setAsDefaultPrinter','seeWhatsPrinting','pausePrinting','properties','createShortcut'],
    
        recycle: ['open','restoreAll','emptyRecycleBin','separator','properties'],

        deleted: ['open','separator','restoreItem','separator','cut','separator','properties'],
    
        drive: ['open','explore','search','separator','sharing','separator','format','separator','properties'], //verified
    
        networkShare: ['open','connectNetworkDrive','disconnectNetworkDrive2','mapNetworkDrive','properties'],
    
        controlPanelItem: ['open','properties'],
        
        folder: [ // verified
            'open',
            'explore',
            'search',
            'separator',
            'sharing',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'cut',
            'copy',
            'separator',
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        taskbar: [
            'properties'
        ],
            
        task: [
            'taskMinimize',
            'taskMaximize',
            'taskClose'
        ],
            
        exe: [
            'open',
            'separator',
            'runAs',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'cut',
            'copy',
            'delete',
            'rename',
            'separator',
            'properties'
        ],
                    
        dos: [
            'open',
            'separator',
            'runAs',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',            
            'cut',
            'copy',
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        lnk: [
            'open',
            'openContainingFolder',
            'separator',
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        txt: [
            'open',
            'openWith',
            'editText',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',        
            'print',
            'separator',
            'cut',
            'copy',
            'delete',
            'rename',
            'separator',
            'properties'
        ],
                
        htm: [
            'open',
            'openWith',
            'editHtml',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'print',
            'separator',
            'cut',
            'copy',
            
            'delete',
            'rename',
            'separator',
            'properties'
        ],
                
        html: [
            'open',
            'openWith',
            'editHtml',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'print',
            'separator',
            'cut',
            'copy',
            
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        rtf: [
            'open',
            'openWith',
            'editRTF',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'print',
            'separator',
            'cut',
            'copy',
            
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        jpg: [
            'open',
            'openWith',
            'editImage',
            'preview',
            'print',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'cut',
            'copy',
            
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        jpeg: [
            'open',
            'openWith',
            'editImage',
            'preview',
            'print',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'cut',
            'copy',
            
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        bmp: [
            'open',
            'openWith',
            'editImage',
            'preview',
            'print',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'cut',
            'copy',
            
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        png: [
            'open',
            'openWith',
            'editImage',
            'preview',
            'print',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'cut',
            'copy',
            
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
        gif: [
            'open',
            'openWith',
            'editImage',
            'preview',
            'print',
            'separator',
            ['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],
            'separator',
            'cut',
            'copy',
            
            'delete',
            'rename',
            'separator',
            'properties'
        ],
        
    
        mp3: ['open','openWith','play','addToPlaylist','separator',['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']], 'separator','cut','copy','delete','rename','separator','properties'],
        wav: ['open','openWith','play','separator','cut','copy','delete','rename','separator',['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],'separator','properties'],
        wma: ['open','openWith','play','separator','cut','copy','delete','rename','separator',['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],'separator','properties'],
    
        avi: ['open','openWith','play','separator','cut','copy','delete','rename','separator',['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],'separator','properties'],
        mpg: ['open','openWith','play','separator','cut','copy','delete','rename','separator',['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],'separator','properties'],
        mp4: ['open','openWith','play','separator','cut','copy','delete','rename','separator',['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],'separator','properties'],
        wmv: ['open','openWith','play','separator','cut','copy','delete','rename','separator',['sendto', ['desktopShortcut', 'myDocuments', 'floppyA', 'mailRecipient', 'compressedFolder']],'separator','properties'],
    
        doc: ['open','openWith','separator','print','separator','cut','copy','delete','rename','separator','properties'],
        docx: ['open','openWith','separator','print','separator','cut','copy','delete','rename','separator','properties'],
        xls: ['open','openWith','separator','print','separator','cut','copy','delete','rename','separator','properties'],
        xlsx: ['open','openWith','separator','print','separator','cut','copy','delete','rename','separator','properties'],
        ppt: ['open','openWith','separator','print','separator','cut','copy','delete','rename','separator','properties'],
        pdf: ['open','openWith','separator','print','separator','properties'],
    
        url: ['open','openWith','separator','properties'],
    
        zip: ['open','openWith','extractHere','winrarAddToArchive','winrarExtractHere','separator','cut','copy','delete','rename','separator','properties'],
        rar: ['open','openWith','extractHere','winrarAddToArchive','winrarExtractHere','separator','cut','copy','delete','rename','separator','properties'],

        sys: ['open','openWith','properties'],
        dll: ['openWith','properties'],
        reg: ['merge','properties'],
        inf: ['install','properties'],
        msi: ['open','install','properties'],
    
        default: ['open','separator','cut','copy','delete','rename','separator',['sendto',['desktopShortcut','myDocuments','mailRecipient','compressedFolder']],'separator','properties']
        
    };

    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    
        const targetEl = e.target.closest('[data-context]');
        if (!targetEl) {
            const ctx = document.querySelector('#context');
            if (ctx) ctx.style.display = 'none';
            return;
        }
    
        const type = getItemType(targetEl);
        const validStructure = (contexts[type] || []).filter(isValidMenuEntry);
        if (!validStructure.length) {
            const ctx = document.querySelector('#context');
            if (ctx) ctx.style.display = 'none';
            return;
        }
    
        showContextMenu(validStructure, e, targetEl);
    });
    
    document.addEventListener('mouseover', function(e) {
        const li = e.target.closest && e.target.closest('#context li');
        if (!li) return;
        const submenu = li.querySelector('ul');
        if (submenu) {
            positionSubmenu(submenu, li);
        }
    });
    
document.addEventListener('click', function(e) {
	const ctx = document.querySelector('#context')
	if (!ctx) return
	if (!ctx.contains(e.target) || e.target.hasAttribute('onclick')) {
		ctx.style.display = 'none'
	}
})

    function getItemType(el) {
        
        if (el) {

            if (el.dataset.context) {

                if (el.dataset.context === 'desktop') return 'desktop';
                if (el.dataset.context === 'computer') return 'computer';
                if (el.dataset.context === 'directory') return 'directory';
                if (el.dataset.context === 'program') return 'program';
                if (el.dataset.context === 'recycle') return 'recycle';
                if (el.dataset.context === 'deleted') return 'deleted';
                if (el.dataset.context === 'startmenu') return 'startmenu';
                if (el.dataset.context === 'taskbar') return 'taskbar';
                if (el.dataset.context === 'task') return 'task';
    
                if (el.dataset.open) {

                    if (el.dataset.context === 'drive') return 'drive';
                    if (el.dataset.context === 'folder') return 'folder';
                    if (el.dataset.context === 'file' && el.dataset.open.includes('.')) {

                        return el.dataset.open.split('.').pop().toLowerCase();
                        
                    }
                    
                }
            
            }
        
        }
        
        return null;
        
    }
        
    function buildMenuFromContext(entries, targetEl, isSubmenu = false) {
        const ul = document.createElement('ul');
    
        entries.forEach(entry => {
            if (Array.isArray(entry)) {
                const [rootKey, childEntries] = entry;
                const rootItem = menu[rootKey];
                if (!rootItem || !Array.isArray(childEntries) || !childEntries.length) return;
    
                const li = document.createElement('li');
                li.textContent = rootItem.label;
                
                const childUl = buildMenuFromContext(childEntries, targetEl, true);
                li.appendChild(childUl);
                ul.appendChild(li);
                return;
            }
    
            const key = entry;
            const item = menu[key];
            if (!item) return;
            
    
            if (item.separator) {
                const li = document.createElement('li');
                li.classList.add('separator');
                ul.appendChild(li);
                return;
            }
    
            const li = document.createElement('li');
            li.textContent = item.label;
    
            if (typeof item.action === 'function') {
                
                li.addEventListener('click', function(ev) {
                    ev.stopPropagation();
                    item.action(targetEl);
                    const ctx = document.querySelector('#context');
                    if (ctx) ctx.style.display = 'none';
                });
                
                if((key === 'paste' || key === 'pasteShortcut') && (!window.clipboard || window.clipboard.length === 0)) {
                    li.classList.add('disabled');
                }
                
            } else {
                
                li.classList.add('disabled');
                
            }
    
            ul.appendChild(li);
        });
    
        return ul;
    }
    
    function getScale(el) {
        const rect = el.getBoundingClientRect();
        return {
            scaleX: rect.width / el.offsetWidth || 1,
            scaleY: rect.height / el.offsetHeight || 1
        };
    }
    
    function positionMenu(menuEl, event) {
        menuEl.style.display = 'block';
        menuEl.style.visibility = 'hidden';
        menuEl.style.left = '0';
        menuEl.style.top = '0';
    
        const offsetParent = menuEl.offsetParent || document.body;
        const parentRect = offsetParent.getBoundingClientRect();
        const { scaleX, scaleY } = getScale(offsetParent);
    
        const menuRect = menuEl.getBoundingClientRect();
        const menuW = menuRect.width;
        const menuH = menuRect.height;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
    
        const cx = event.clientX;
        const cy = event.clientY;
    
        let leftPx = cx - parentRect.left;
        let topPx  = cy - parentRect.top;
    
        if (cx + menuW > vw) leftPx = cx - parentRect.left - menuW;
        if (cy + menuH > vh) topPx = cy - parentRect.top - menuH;
    
        const maxLeftPx = Math.max(0, parentRect.width - menuW);
        const maxTopPx  = Math.max(0, parentRect.height - menuH);
        leftPx = Math.min(Math.max(0, leftPx), maxLeftPx);
        topPx  = Math.min(Math.max(0, topPx),  maxTopPx);
    
        menuEl.style.left = Math.round(leftPx / scaleX) + 'px';
        menuEl.style.top  = Math.round(topPx / scaleY) + 'px';
        menuEl.style.visibility = 'visible';
    }
    
    function positionSubmenu(submenuEl, parentLi) {
        submenuEl.style.visibility = 'hidden';
        submenuEl.style.left = '0';
        submenuEl.style.top = '0';
    
        const offsetParent = submenuEl.offsetParent || document.body;
        const { scaleX, scaleY } = getScale(offsetParent);
    
        const liRect = parentLi.getBoundingClientRect();
        const submenuRect = submenuEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
    
        let x = liRect.right - offsetParent.getBoundingClientRect().left;
        let y = liRect.top - offsetParent.getBoundingClientRect().top;
    
        if (liRect.right + submenuRect.width > window.innerWidth) {
            x = liRect.left - offsetParent.getBoundingClientRect().left - submenuRect.width;
        }
    
        if (liRect.top + submenuRect.height > viewportHeight) {
            const spaceAbove = liRect.top;
            const spaceBelow = viewportHeight - liRect.bottom;
    
            if (spaceAbove > spaceBelow) {
                y = liRect.bottom - offsetParent.getBoundingClientRect().top - submenuRect.height;
            } else {
                y = y - ((liRect.top + submenuRect.height) - viewportHeight);
                if (y < 0) y = 0;
            }
        }
    
        submenuEl.style.left = Math.round(x / scaleX) + 'px';
        submenuEl.style.top = Math.round(y / scaleY) + 'px';
        submenuEl.style.visibility = '';
    }
    
    function isValidMenuEntry(entry) {
        if (Array.isArray(entry)) {
            const [rootKey, children] = entry;
            return menu[rootKey] && Array.isArray(children) && children.length > 0;
        }
        return !!menu[entry];
    }
        
    function showContextMenu(structure, event, targetEl) {
        const menuEl = document.querySelector('#context');
        if (!menuEl) return;
        menuEl.innerHTML = '';
        menuEl.appendChild(buildMenuFromContext(structure, targetEl));
    
        document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
        if (targetEl.id !== 'desktop') targetEl.classList.add('active');
    
        positionMenu(menuEl, event);
    }

});
