importScripts('/workbox/workbox-sw.js');

workbox.setConfig({
    modulePathPrefix: '/workbox/'
});

const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { Strategy } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { RangeRequestsPlugin } = workbox.rangeRequests;

precacheAndRoute([{"revision":"060210979e13e305510de6285e085db1","url":"manifest.json"},{"revision":"32f9f9c2a386a4accf304661865e32f2","url":"index.html"},{"revision":"956e7bdfbd9ef13da863c60ba639c00f","url":"index.css"},{"revision":"d16b293eca457e2fb1e7ef2caca8c904","url":"favicon.svg"},{"revision":"88e1e81c930d8e6c24dfdc7af274e812","url":"favicon.png"},{"revision":"eac041a0b8835bfea706d997b0b7b224","url":"downloader.js"},{"revision":"88e1e81c930d8e6c24dfdc7af274e812","url":"apple-touch-icon.png"},{"revision":"085843c8bb186996bb89d250f023150b","url":"app.js"},{"revision":"c2eba1515364b627c4f3d5eb6a4bee5b","url":"workbox/workbox-sw.js"},{"revision":"d72bef0e706a8b25012dfa8aa1e4dfff","url":"workbox/workbox-strategies.prod.js"},{"revision":"cd6a94e513fac6b1b099262468236661","url":"workbox/workbox-strategies.dev.js"},{"revision":"90d3aeeedbf6f25853c480d92bc51839","url":"workbox/workbox-routing.prod.js"},{"revision":"2f7e077a525008d9115bd0a4008fc657","url":"workbox/workbox-routing.dev.js"},{"revision":"664f92edd987d6d570658369f6ef15aa","url":"workbox/workbox-range-requests.prod.js"},{"revision":"29e4b4bd4f24e0de1d41e271092dc642","url":"workbox/workbox-range-requests.dev.js"},{"revision":"24c50c33b7c66d7152d4ebae0ac8bd31","url":"workbox/workbox-precaching.prod.js"},{"revision":"c5468f40b298e8764446b10845155622","url":"workbox/workbox-precaching.dev.js"},{"revision":"7d66f77f1d0ff9348205a245c75cc6e3","url":"workbox/workbox-core.prod.js"},{"revision":"575871cde94d8448f78a4b01650497dd","url":"workbox/workbox-core.dev.js"},{"revision":"c1164a2c6ee0dbe4099f435a008a7d00","url":"workbox/workbox-cacheable-response.prod.js"},{"revision":"a026a319e89b5de9ad82d1da4e71d016","url":"workbox/workbox-cacheable-response.dev.js"},{"revision":"6d4248f1a08c218943e582673179b7be","url":"pdf/poster.pdf"},{"revision":"d149d5709ac00fd5e2967ab4f3d74886","url":"pdf/comic.pdf"},{"revision":"0118a4aca04c5fb0a525bf00b001844e","url":"images/uninstall_on.webp"},{"revision":"88c1fd032e6fc16814690712a26c1ede","url":"images/uninstall_off.webp"},{"revision":"fe986681f41e96631f39f3288b23e538","url":"images/sysinfo.webp"},{"revision":"0a65c71d9983c9bb1bc6a5f405fd6fd9","url":"images/shark.webp"},{"revision":"4ec902e0b0ce60ffd9dd565c9ddf40a1","url":"images/send.webp"},{"revision":"62a6c4bc030050cdfe2a4e24594a26bb","url":"images/save.webp"},{"revision":"70208e00e9ea641e4c98699f74100db3","url":"images/run_game_on.webp"},{"revision":"766a9e6e6d890f24cef252e81753b29d","url":"images/run_game_off.webp"},{"revision":"f906318cb87e09a819e5916676caab2e","url":"images/register.webp"},{"revision":"aae783d064996b4322e23b092d97ea4a","url":"images/read_me_on.webp"},{"revision":"a6fcac24a24996545c039a1755af33ea","url":"images/read_me_off.webp"},{"revision":"4ea2aac9446188b8a588811bc593919e","url":"images/ogel.webp"},{"revision":"c633a7500e6f30162bf1cf4ec4e95a6d","url":"images/later.webp"},{"revision":"d23ea8243c18eb217ef08fe607097824","url":"images/island.webp"},{"revision":"11247e92082ba3d978a2e3785b0acf51","url":"images/install_on.webp"},{"revision":"05fba4ef1884cbbd6afe09ea3325efc0","url":"images/install_off.webp"},{"revision":"4f0172bc7007d34cebf681cc233ab57f","url":"images/install.webp"},{"revision":"be9a89fb567b632cf8d4661cbf8afd9e","url":"images/getinfo.webp"},{"revision":"cbc6a6779897f932c3a3c8dceb329804","url":"images/free_stuff_on.webp"},{"revision":"d2b9c2e128ef1e5e4265c603b0bc3305","url":"images/free_stuff_off.webp"},{"revision":"81f3c8fc38b876dc2fcfeefaadad1d1b","url":"images/congrats.webp"},{"revision":"e2c0c5e6aa1f7703c385a433a2d2a519","url":"images/configure_on.webp"},{"revision":"3d820bf72b19bd4e437a61e75f317b83","url":"images/configure_off.webp"},{"revision":"d282c260fd35522036936bb6faf8ad21","url":"images/cdspin.gif"},{"revision":"bfc1563be018d82685716c6130529129","url":"images/cancel_on.webp"},{"revision":"013ceb7d67293d532e979dde0347f3af","url":"images/cancel_off.webp"},{"revision":"d11c8c893d5525c8842555dc2861c393","url":"images/callfail.webp"},{"revision":"c57d24598537443c5b8276c8dd5dbdc9","url":"images/bonus.webp"},{"revision":"6a70d35dadf51d2ec6e38a6202d7fb0b","url":"audio/install.mp3"}]);

const gameFiles = [
    "/LEGO/Scripts/CREDITS.SI", "/LEGO/Scripts/INTRO.SI", "/LEGO/Scripts/NOCD.SI", "/LEGO/Scripts/SNDANIM.SI",
    "/LEGO/Scripts/Act2/ACT2MAIN.SI", "/LEGO/Scripts/Act3/ACT3.SI", "/LEGO/Scripts/Build/COPTER.SI",
    "/LEGO/Scripts/Build/DUNECAR.SI", "/LEGO/Scripts/Build/JETSKI.SI", "/LEGO/Scripts/Build/RACECAR.SI",
    "/LEGO/Scripts/Garage/GARAGE.SI", "/LEGO/Scripts/Hospital/HOSPITAL.SI", "/LEGO/Scripts/Infocntr/ELEVBOTT.SI",
    "/LEGO/Scripts/Infocntr/HISTBOOK.SI", "/LEGO/Scripts/Infocntr/INFODOOR.SI", "/LEGO/Scripts/Infocntr/INFOMAIN.SI",
    "/LEGO/Scripts/Infocntr/INFOSCOR.SI", "/LEGO/Scripts/Infocntr/REGBOOK.SI", "/LEGO/Scripts/Isle/ISLE.SI",
    "/LEGO/Scripts/Isle/JUKEBOX.SI", "/LEGO/Scripts/Isle/JUKEBOXW.SI", "/LEGO/Scripts/Police/POLICE.SI",
    "/LEGO/Scripts/Race/CARRACE.SI", "/LEGO/Scripts/Race/CARRACER.SI", "/LEGO/Scripts/Race/JETRACE.SI",
    "/LEGO/Scripts/Race/JETRACER.SI", "/LEGO/data/WORLD.WDB"
];

const textureFiles = [
    "/LEGO/textures/beach.gif.bmp", "/LEGO/textures/doctor.gif.bmp", "/LEGO/textures/infochst.gif.bmp",
    "/LEGO/textures/o.gif.bmp", "/LEGO/textures/relrel01.gif.bmp", "/LEGO/textures/rockx.gif.bmp",
    "/LEGO/textures/water2x.gif.bmp", "/LEGO/textures/bowtie.gif.bmp", "/LEGO/textures/e.gif.bmp",
    "/LEGO/textures/jfrnt.gif.bmp", "/LEGO/textures/papachst.gif.bmp", "/LEGO/textures/road1way.gif.bmp",
    "/LEGO/textures/sandredx.gif.bmp", "/LEGO/textures/w_curve.gif.bmp", "/LEGO/textures/brela_01.gif.bmp",
    "/LEGO/textures/flowers.gif.bmp", "/LEGO/textures/l6.gif.bmp", "/LEGO/textures/pebblesx.gif.bmp",
    "/LEGO/textures/road3wa2.gif.bmp", "/LEGO/textures/se_curve.gif.bmp", "/LEGO/textures/wnbars.gif.bmp",
    "/LEGO/textures/bth1chst.gif.bmp", "/LEGO/textures/fruit.gif.bmp", "/LEGO/textures/l.gif.bmp",
    "/LEGO/textures/pizcurve.gif.bmp", "/LEGO/textures/road3wa3.gif.bmp", "/LEGO/textures/shftchst.gif.bmp",
    "/LEGO/textures/bth2chst.gif.bmp", "/LEGO/textures/gasroad.gif.bmp", "/LEGO/textures/mamachst.gif.bmp",
    "/LEGO/textures/polbar01.gif.bmp", "/LEGO/textures/road3way.gif.bmp", "/LEGO/textures/tightcrv.gif.bmp",
    "/LEGO/textures/cheker01.gif.bmp", "/LEGO/textures/g.gif.bmp", "/LEGO/textures/mech.gif.bmp",
    "/LEGO/textures/polkadot.gif.bmp", "/LEGO/textures/road4way.gif.bmp", "/LEGO/textures/unkchst.gif.bmp",
    "/LEGO/textures/construct.gif.bmp", "/LEGO/textures/grassx.gif.bmp", "/LEGO/textures/nwcurve.gif.bmp",
    "/LEGO/textures/redskul.gif.bmp", "/LEGO/textures/roadstr8.gif.bmp", "/LEGO/textures/vest.gif.bmp"
];

const rangeRequestsPlugin = new RangeRequestsPlugin();
const normalizePathPlugin = {
    cacheKeyWillBeUsed: async ({ request }) => {
        const url = new URL(request.url);
        const normalizedPath = url.pathname.replace(/\/{2,}/g, '/');
        const normalizedUrl = url.origin + normalizedPath;
        if (request.url === normalizedUrl) {
            return request;
        }
        return new Request(normalizedUrl, {
            headers: request.headers, method: request.method,
            credentials: request.credentials, redirect: request.redirect,
            referrer: request.referrer, body: request.body,
        });
    },
};

class LegoCacheStrategy extends Strategy {
    async _handle(request, handler) {
        const cacheKeyRequest = await normalizePathPlugin.cacheKeyWillBeUsed({ request });
        const cachedResponse = await caches.match(cacheKeyRequest);

        if (cachedResponse) {
            return await rangeRequestsPlugin.cachedResponseWillBeUsed({
                request: cacheKeyRequest,
                cachedResponse: cachedResponse,
            });
        }

        return handler.fetch(request);
    }
}

const getLanguageCacheName = (language) => `game-assets-${language}`;

async function uninstallLanguagePack(language, client) {
    const cacheName = getLanguageCacheName(language);
    try {
        const deleted = await caches.delete(cacheName);
        if (deleted) {
            console.log(`Cache ${cacheName} deleted successfully.`);
        }
        client.postMessage({ action: 'uninstall_complete', success: deleted, language: language });
    } catch (error) {
        console.error('Error during language pack uninstallation:', error);
        client.postMessage({ action: 'uninstall_complete', success: false, language: language, error: error.message });
    }
}

async function checkCacheStatus(language, hdTextures, siFiles, client) {
    const cacheName = getLanguageCacheName(language);
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    const cachedUrls = requests.map(req => new URL(req.url).pathname);
    let requiredFiles = gameFiles;
    if (hdTextures) {
        requiredFiles = requiredFiles.concat(textureFiles);
    }
    if (siFiles.length > 0) {
        requiredFiles = requiredFiles.concat(siFiles);
    }
    const missingFiles = requiredFiles.filter(file => !cachedUrls.includes(file));

    client.postMessage({
        action: 'cache_status',
        isInstalled: missingFiles.length === 0,
        missingFiles: missingFiles,
        language: language
    });
}

registerRoute(
    ({ url }) => url.pathname.startsWith('/LEGO/'),
    new LegoCacheStrategy()
);

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    cleanupOutdatedCaches();
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.action) {
        switch (event.data.action) {
            case 'uninstall_language_pack':
                uninstallLanguagePack(event.data.language, event.source);
                break;
            case 'check_cache_status':
                checkCacheStatus(event.data.language, event.data.hdTextures, event.data.siFiles, event.source);
                break;
        }
    }
});
