class AppLoader {
    constructor(appName, addressBarElement, onComplete = null) {
        this['appName'] = appName;
        this['addressBar'] = addressBarElement;
        this['onComplete'] = onComplete;
        this['progress'] = 0x0;
        this['isLoading'] = ![];
        this['progressBar'] = this['addressBar']?.['querySelector']('.address-bar-progress');
        !this['progressBar'] && this['addressBar'] && (this['progressBar'] = this['createProgressBar'](), this['addressBar']['appendChild'](this['progressBar']));
        this['loadedAssets'] = new Set();
    }
    ['createProgressBar']() {
        const progressBar = document['createElement']('div');
        return progressBar['className'] = 'address-bar-progress', progressBar['setAttribute']('aria-hidden', 'true'), progressBar;
    }
    ['startLoading'](initialProgress = 0x0) {
        if (!this['progressBar']) return;
        this['isLoading'] = !![];
        this['progress'] = Math['max'](0x0, Math['min'](0x64, initialProgress));
        this['progressBar']['classList']['add']('loading');
        this['progressBar']['classList']['remove']('complete');
        this['updateProgressBar']();
    }
    ['setProgress'](progress, animate = !![]) {
        if (!this['isLoading']) return;
        const clampedProgress = Math['max'](this['progress'], Math['min'](0x64, progress));
        this['progress'] = clampedProgress;
        !animate && this['progressBar']?.['style']['setProperty']('transition', 'none');
        this['updateProgressBar']();
        !animate && requestAnimationFrame(() => {
            this['progressBar']?.['style']['removeProperty']('transition');
        });
        this['progress'] >= 0x64 && setTimeout(() => this['complete'](), 0xc8);
    }
    ['incrementProgress'](amount) {
        this['setProgress'](this['progress'] + amount);
    }
    ['updateProgressBar']() {
        this['progressBar'] && (this['progressBar']['style']['width'] = this['progress'] + '%');
    }
    ['complete']() {
        if (!this['isLoading']) return;
        this['progress'] = 0x64;
        this['isLoading'] = ![];
        this['progressBar'] && (this['progressBar']['style']['width'] = '100%', this['progressBar']['classList']['remove']('loading'), this['progressBar']['classList']['add']('complete'));
        this['onComplete'] && this['onComplete']();
    }
    async ['loadAssets'](assets, startPercent = 0x0, endPercent = 0x64) {
        if (!assets['length']) return [];
        const percentRange = endPercent - startPercent, results = [];
        for (let index = 0x0; index < assets['length']; index++) {
            const asset = assets[index];
            const assetUrl = typeof asset === 'string' ? asset : asset['url'];
            if (this['loadedAssets']['has'](assetUrl)) {
                const cachedResult = {};
                cachedResult['url'] = assetUrl;
                cachedResult['cached'] = !![];
                results['push'](cachedResult);
                continue;
            }
            try {
                const loadedAsset = await this['loadSingleAsset'](asset);
                results['push'](loadedAsset);
                this['loadedAssets']['add'](assetUrl);
            } catch (err) {
                const errorInfo = {};
                errorInfo['url'] = assetUrl;
                errorInfo['error'] = err['message'];
                results['push'](errorInfo);
            }
            const progress = startPercent + (index + 0x1) / assets['length'] * percentRange;
            this['setProgress'](progress);
        }
        return results;
    }
    async ['loadSingleAsset'](asset) {
        const assetUrl = typeof asset === 'string' ? asset : asset['url'];
        const assetType = typeof asset === 'object' ? asset['type'] : this['detectAssetType'](assetUrl);
        switch (assetType) {
            case 'json': {
                const response = await fetch(assetUrl);
                if (!response['ok']) throw new Error('HTTP\x20' + response['status']);
                const data = await response['json']();
                const jsonResult = {};
                return jsonResult['url'] = assetUrl, jsonResult['data'] = data, jsonResult['type'] = 'json', jsonResult;
            }
            case 'image':
            default:
                return new Promise((resolve, reject) => {
                    const imgElement = new Image();
                    imgElement['onload'] = () => resolve({
                        'url': assetUrl,
                        'element': imgElement,
                        'type': 'image'
                    });
                    imgElement['onerror'] = () => reject(new Error('Image\x20load\x20failed'));
                    imgElement['src'] = assetUrl;
                });
        }
    }
    ['detectAssetType'](url) {
        const extension = url['split']('.')['pop']()?.['toLowerCase']();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']['includes'](extension)) return 'image';
        if (extension === 'json') return 'json';
        return 'unknown';
    }
    async ['simulateLoading'](duration = 0x7d0, progressCallback = null) {
        this['startLoading']();
        const steps = 0x14, stepDuration = duration / steps;
        for (let step = 0x1; step <= steps; step++) {
            await new Promise(res => setTimeout(res, stepDuration));
            const progress = step / steps * 0x64;
            this['setProgress'](progress);
            if (progressCallback) progressCallback(progress);
        }
    }
    ['reset']() {
        this['progress'] = 0x0;
        this['isLoading'] = ![];
        this['loadedAssets']['clear']();
        this['progressBar'] && (this['progressBar']['style']['transition'] = 'none', this['progressBar']['classList']['remove']('loading', 'complete'), this['progressBar']['style']['width'] = '0%', this['progressBar']['style']['removeProperty']('opacity'), requestAnimationFrame(() => {
            this['progressBar'] && this['progressBar']['style']['removeProperty']('transition');
        }));
    }
    ['getState']() {
        return {
            'appName': this['appName'],
            'progress': this['progress'],
            'isLoading': this['isLoading'],
            'loadedAssets': Array['from'](this['loadedAssets'])
        };
    }
}
export default AppLoader;
