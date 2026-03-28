import { useEffect, useRef } from 'react';

const TASKBAR_HEIGHT = 30;

const PET_LIST = [
  { id: 'sheep', xml: '/esheep/esheep-animations-0.9.2.xml' },
  { id: 'neko', xml: '/esheep/pets/neko.xml' },
  { id: 'pink_neko', xml: '/esheep/pets/pink_neko.xml' },
  { id: 'yellow_neko', xml: '/esheep/pets/yellow_neko.xml' },
  { id: 'fox', xml: '/esheep/pets/fox.xml' },
  { id: 'pink_fox', xml: '/esheep/pets/pink_fox.xml' },
  { id: 'pikachu', xml: '/esheep/pets/pikachu.xml' },
  { id: 'pingus', xml: '/esheep/pets/pingus.xml' },
  { id: 'bbunny', xml: '/esheep/pets/bbunny.xml' },
  { id: 'mareep', xml: '/esheep/pets/mareep.xml' },
  { id: 'blue_ham_ham', xml: '/esheep/pets/blue_ham_ham.xml' },
  { id: 'shiny_sylveon', xml: '/esheep/pets/shiny_sylveon.xml' },
  { id: 'mimiko', xml: '/esheep/pets/mimiko.xml' },
  { id: 'negima', xml: '/esheep/pets/negima.xml' },
  { id: 'ssj_goku', xml: '/esheep/pets/ssj-goku.xml' },
  { id: 'esheep64', xml: '/esheep/pets/esheep64.xml' },
  { id: 'red_sheep', xml: '/esheep/pets/red_sheep.xml' },
  { id: 'orange_sheep', xml: '/esheep/pets/orange_sheep.xml' },
  { id: 'yellow_sheep', xml: '/esheep/pets/yellow_sheep.xml' },
  { id: 'green_sheep', xml: '/esheep/pets/green_sheep.xml' },
  { id: 'blue_sheep', xml: '/esheep/pets/blue_sheep.xml' },
  { id: 'purple_sheep', xml: '/esheep/pets/purple_sheep.xml' },
  { id: 'pink_sheep', xml: '/esheep/pets/pink_sheep.xml' },
];

function patchSheepScreenH(sheep) {
  const realH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  sheep.screenH = realH - TASKBAR_HEIGHT;
  const interval = setInterval(() => {
    if (!sheep.DOMdiv) { clearInterval(interval); return; }
    const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    sheep.screenH = h - TASKBAR_HEIGHT;
  }, 500);
  sheep._patchInterval = interval;
}

function ensureScriptLoaded() {
  return new Promise((resolve) => {
    if (typeof window.eSheep !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = '/esheep/esheep-0.9.2.min.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

function ESheep({ onClose }) {
  const sheepRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await ensureScriptLoaded();
      if (cancelled) return;

      const pet = PET_LIST[Math.floor(Math.random() * PET_LIST.length)];
      const sheep = new window.eSheep({ allowPets: 'none', allowPopup: 'yes' });
      patchSheepScreenH(sheep);
      sheep.Start(pet.xml);
      sheepRef.current = sheep;

      // No window needed — close immediately
      if (onClose) onClose();
    })();

    return () => {
      cancelled = true;
      // Don't remove the sheep on unmount — let it keep roaming!
    };
  }, []);

  return null;
}

export default ESheep;
