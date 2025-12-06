HTMLElement.prototype.dblclick = function() {
    this.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
};

document.addEventListener('DOMContentLoaded', () => {
    
    //setTimeout(function() {
	//    fadeOut(document.getElementById('boot').querySelector('img'));
    //    setTimeout(function() {
    //	    document.getElementById('boot').remove();
    //    }, 2000);
    //}, 3000);

    
    setInterval(function() {
        
        if (document.querySelector('#taskbar .clock')) {
            document.querySelector('#taskbar .clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        }
            
    }, 1000);
    
    window.addEventListener('resize', () => {
        alignDesktopGrid();
    });
    

});

