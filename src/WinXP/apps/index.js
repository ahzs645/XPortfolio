import About from './About';
import Resume from './Resume';
import Projects from './Projects';
import Contact from './Contact';
import Calculator from './Calculator';
import Notepad from './Notepad';
import Minesweeper from './Minesweeper';
import Solitaire from './Solitaire';
import SpiderSolitaire from './SpiderSolitaire';
import Pinball from './Pinball';

// Default apps open on startup (empty for now - user opens via desktop icons)
export const defaultAppState = [];

// Desktop icons configuration
export const defaultIconState = [
  {
    id: 0,
    icon: '/icons/about.webp',
    title: 'About Me',
    component: About,
    isFocus: false,
  },
  {
    id: 1,
    icon: '/icons/resume.webp',
    title: 'Resume',
    component: Resume,
    isFocus: false,
  },
  {
    id: 2,
    icon: '/icons/projects.webp',
    title: 'Projects',
    component: Projects,
    isFocus: false,
  },
  {
    id: 3,
    icon: '/icons/contact.webp',
    title: 'Contact',
    component: Contact,
    isFocus: false,
  },
  {
    id: 4,
    icon: '/icons/calculator.png',
    title: 'Calculator',
    component: Calculator,
    isFocus: false,
  },
  {
    id: 5,
    icon: '/icons/solitaire.png',
    title: 'Minesweeper',
    component: Minesweeper,
    isFocus: false,
  },
];

// App settings for launching from menu and icons
export const appSettings = {
  'About Me': {
    header: {
      icon: '/icons/about.webp',
      title: 'About Me',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: About,
    defaultSize: {
      width: 776,
      height: 556,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Resume: {
    header: {
      icon: '/icons/resume.webp',
      title: 'Resume',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Resume,
    defaultSize: {
      width: 700,
      height: 550,
    },
    defaultOffset: {
      x: 120,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Projects: {
    header: {
      icon: '/icons/projects.webp',
      title: 'My Projects',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Projects,
    defaultSize: {
      width: 750,
      height: 500,
    },
    defaultOffset: {
      x: 80,
      y: 60,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Contact: {
    header: {
      icon: '/icons/contact.webp',
      title: 'Contact Me',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Contact,
    defaultSize: {
      width: 600,
      height: 500,
    },
    defaultOffset: {
      x: 150,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Calculator: {
    header: {
      icon: '/icons/calculator.png',
      title: 'Calculator',
      buttons: ['minimize', 'close'],
    },
    component: Calculator,
    defaultSize: {
      width: 230,
      height: 300,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Notepad: {
    header: {
      icon: '/icons/notepad.png',
      title: 'Untitled - Notepad',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Notepad,
    defaultSize: {
      width: 500,
      height: 400,
    },
    defaultOffset: {
      x: 180,
      y: 80,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Minesweeper: {
    header: {
      icon: '/icons/minesweeper.png',
      title: 'Minesweeper',
      buttons: ['minimize', 'close'],
    },
    component: Minesweeper,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 150,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Paint: {
    header: {
      icon: '/icons/paint.webp',
      title: 'Paint',
      buttons: ['minimize', 'maximize', 'close'],
    },
    // Paint will use iframe for jspaint.app
    component: () => null,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 50,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Solitaire: {
    header: {
      icon: '/icons/solitaire-icon.png',
      title: 'Solitaire',
      buttons: ['minimize', 'close'],
    },
    component: Solitaire,
    defaultSize: {
      width: 680,
      height: 490,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Spider Solitaire': {
    header: {
      icon: '/icons/spider-solitaire-icon.webp',
      title: 'Spider Solitaire',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: SpiderSolitaire,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 80,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Pinball: {
    header: {
      icon: '/icons/pinball-icon.png',
      title: '3D Pinball for Windows - Space Cadet',
      buttons: ['minimize', 'close'],
    },
    component: Pinball,
    defaultSize: {
      width: 610,
      height: 475,
    },
    defaultOffset: {
      x: 120,
      y: 60,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'My Computer': {
    header: {
      icon: '/icons/my-computer.png',
      title: 'My Computer',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: () => null,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 140,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Help and Support': {
    header: {
      icon: '/icons/help.png',
      title: 'Help and Support',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: () => null,
    defaultSize: {
      width: 600,
      height: 450,
    },
    defaultOffset: {
      x: 120,
      y: 60,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
};

export { About, Resume, Projects, Contact, Calculator, Notepad, Minesweeper, Solitaire, SpiderSolitaire, Pinball };
