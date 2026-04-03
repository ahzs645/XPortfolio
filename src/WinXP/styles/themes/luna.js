/**
 * Luna (Windows XP default) theme definition.
 * Wraps the original shellTheme.js gradient values into the theme object structure.
 */

const XP_TASKBAR_BACKGROUND = `linear-gradient(
  to bottom,
  #1f2f86 0,
  #3165c4 3%,
  #3682e5 6%,
  #4490e6 10%,
  #3883e5 12%,
  #2b71e0 15%,
  #2663da 18%,
  #235bd6 20%,
  #2258d5 23%,
  #2157d6 38%,
  #245ddb 54%,
  #2562df 86%,
  #245fdc 89%,
  #2158d4 92%,
  #1d4ec0 95%,
  #1941a5 98%
)`;

const XP_TRAY_BACKGROUND = `linear-gradient(
  to bottom,
  #0c59b9 1%,
  #139ee9 6%,
  #18b5f2 10%,
  #139beb 14%,
  #1290e8 19%,
  #0d8dea 63%,
  #0d9ff1 81%,
  #0f9eed 88%,
  #119be9 91%,
  #1392e2 94%,
  #137ed7 97%,
  #095bc9 100%
)`;

const XP_TASK_BUTTON_COVER_BACKGROUND = `linear-gradient(
  to bottom,
  #4e9ef8 0%,
  #4295f3 5%,
  #3d8fee 10%,
  #3888e8 20%,
  #3482e3 40%,
  #3180e1 60%,
  #2e7dde 80%,
  #2a79da 100%
)`;

const XP_TASK_BUTTON_FOCUS_BACKGROUND = `linear-gradient(
  to bottom,
  #1a4aad 0%,
  #1847a8 5%,
  #1644a3 15%,
  #14419e 30%,
  #123e99 50%,
  #103b94 70%,
  #0e388f 85%,
  #0c358a 100%
)`;

const XP_TASK_BUTTON_COVER_BOX_SHADOW = `
  inset 1px 1px 1px rgba(255, 255, 255, 0.4),
  inset -1px -1px 1px rgba(0, 0, 0, 0.2)
`;

const XP_TASK_BUTTON_FOCUS_BOX_SHADOW = `
  inset 1px 1px 2px rgba(0, 0, 0, 0.5),
  inset -1px -1px 1px rgba(255, 255, 255, 0.1)
`;

export const LUNA_THEME = {
  id: 'luna',
  name: 'Windows XP',
  source: 'builtin',

  taskbar: {
    background: XP_TASKBAR_BACKGROUND,
  },

  tray: {
    background: XP_TRAY_BACKGROUND,
    borderLeft: '1px solid #1042af',
    boxShadow: 'inset 1px 0 1px #18bbff',
    textColor: '#fff',
  },

  taskButton: {
    cover: {
      background: XP_TASK_BUTTON_COVER_BACKGROUND,
      boxShadow: XP_TASK_BUTTON_COVER_BOX_SHADOW,
    },
    coverHover: {
      background: `linear-gradient(
        to bottom,
        #5ca8ff 0%,
        #53a1fa 10%,
        #4a9af5 30%,
        #4293f0 60%,
        #3c8dec 100%
      )`,
    },
    coverActive: {
      background: '#1e52b7',
      boxShadow: 'inset 0 0 2px 1px rgba(0, 0, 0, 0.4), inset 1px 1px 2px rgba(0, 0, 0, 0.5)',
    },
    focus: {
      background: XP_TASK_BUTTON_FOCUS_BACKGROUND,
      boxShadow: XP_TASK_BUTTON_FOCUS_BOX_SHADOW,
    },
    focusHover: {
      background: `linear-gradient(
        to bottom,
        #1f4fb2 0%,
        #1c4cad 15%,
        #1948a7 40%,
        #1644a1 70%,
        #14419c 100%
      )`,
    },
    focusActive: {
      background: '#0c358a',
    },
    textColor: '#fff',
    showTopHighlight: true,
  },

  startButton: {
    type: 'default',
  },

  titleBar: {
    type: 'css',
  },

  windowControls: {
    type: 'css',
  },

  windowFrame: {
    type: 'css',
  },

  startMenu: {
    type: 'css',
  },

  colors: {
    highlight: '#316ac5',
    highlightText: '#fff',
    activeTitle: 'rgb(0, 84, 227)',
    inactiveTitle: 'rgb(118, 149, 212)',
    surface: '#ece9d8',
    windowText: '#000',
    buttonFace: '#ece9d8',
    menuBackground: '#fff',
    menuText: '#000',
  },
};
