import * as mmTour from './vendor/mmtour-player.js';

globalThis.__QQPET_MMTOUR__ = mmTour;
globalThis.dispatchEvent(new CustomEvent('qqpet-mmtour-ready'));
