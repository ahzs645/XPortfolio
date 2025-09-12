(function() {
    const useEnhanced = true;
    
    if (useEnhanced) {
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
            import('./cmd-enhanced.js').catch(error => {
                console.error('Failed to load enhanced terminal:', error);
                const fallbackScript = document.createElement('script');
                fallbackScript.src = './cmd.js';
                document.body.appendChild(fallbackScript);
            });
        `;
        document.body.appendChild(script);
    } else {
        const script = document.createElement('script');
        script.src = './cmd.js';
        document.body.appendChild(script);
    }
})();