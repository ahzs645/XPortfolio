/**
 * Official Xbox WindowBlinds theme definition.
 * Assets pre-converted from the .wba BMP sprites to transparent PNGs.
 * Sprite coordinates and 9-slice values derived from the INI config files.
 */

const BASE = '/themes/xbox';

export const XBOX_THEME = {
  id: 'xbox',
  name: 'Official Xbox WindowBlinds',
  source: 'builtin',

  taskbar: {
    background: `url(${BASE}/xbox_xp_tb_taskbar_h.png)`,
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto 100%',
  },

  tray: {
    background: `url(${BASE}/xbox_xp_systray_h.png)`,
    backgroundSize: 'auto 100%',
    backgroundRepeat: 'repeat-x',
    borderLeft: 'none',
    boxShadow: 'none',
    textColor: '#000',
    // 9-slice from INI: left=20, top=26, right=10, bottom=4
    nineSlice: { top: 26, right: 10, bottom: 4, left: 20 },
    padding: '0 10px 0 21px',
  },

  taskButton: {
    type: 'sprite',
    spriteSheet: `${BASE}/xbox_xp_tb_tasks_h.png`,
    // Sprite is 342x30 with 6 states side by side: each 57px wide
    // States: normal, normalHover, pressed, focused, focusedHover, focusedPressed
    stateWidth: 57,
    stateHeight: 30,
    nineSlice: { top: 7, right: 5, bottom: 6, left: 5 },
    states: {
      normal: 0,
      normalHover: 1,
      pressed: 2,
      focused: 3,
      focusedHover: 4,
      focusedPressed: 5,
    },
    textColor: '#ddd',
    focusTextColor: '#fff',
    showTopHighlight: false,
    // Fallback flat colors for hover states
    cover: {
      background: `url(${BASE}/xbox_xp_tb_tasks_h.png) 0px 0px / auto 100% no-repeat`,
      boxShadow: 'none',
    },
    coverHover: {
      background: `url(${BASE}/xbox_xp_tb_tasks_h.png) -57px 0px / auto 100% no-repeat`,
      boxShadow: 'none',
    },
    coverActive: {
      background: `url(${BASE}/xbox_xp_tb_tasks_h.png) -114px 0px / auto 100% no-repeat`,
      boxShadow: 'none',
    },
    focus: {
      background: `url(${BASE}/xbox_xp_tb_tasks_h.png) -171px 0px / auto 100% no-repeat`,
      boxShadow: 'none',
    },
    focusHover: {
      background: `url(${BASE}/xbox_xp_tb_tasks_h.png) -228px 0px / auto 100% no-repeat`,
      boxShadow: 'none',
    },
    focusActive: {
      background: `url(${BASE}/xbox_xp_tb_tasks_h.png) -285px 0px / auto 100% no-repeat`,
    },
  },

  startButton: {
    type: 'sprite',
    spriteSheet: `${BASE}/xbox_xp_tb_startbutton.png`,
    // 375x30, 5 states: each 75px wide
    stateWidth: 75,
    stateHeight: 30,
    states: {
      normal: 0,
      hover: 1,
      pressed: 2,
      focusNormal: 3,
      focusPressed: 4,
    },
  },

  titleBar: {
    type: 'image',
    // UIS1 style: xbox_uis1_frame_h.bmp is 360x66, 2 frames (active + inactive)
    // Each frame: 180px wide x 66px tall
    frameImage: `${BASE}/xbox_uis1_frame_h.png`,
    frameWidth: 180,
    frameHeight: 66,
    frameCount: 2,
    // 9-slice: top section 88-124px from INI
    nineSlice: {
      topTop: 88,
      topBottom: 124,
      leftTop: 32,
      leftBottom: 4,
      rightTop: 32,
      rightBottom: 4,
    },
    height: 28,
    textColor: 'rgb(220, 220, 220)',
    inactiveTextColor: 'rgb(180, 180, 180)',
    textShadow: 'none',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '13px',
    fontWeight: 'normal',
    textLeftShift: 100,
    textRightClip: 162,
  },

  windowControls: {
    type: 'sprite',
    close: {
      spriteSheet: `${BASE}/xbox_iconuis1_close.png`,
      // 57x17, 3 states: normal (19px each), hover, pressed
      stateWidth: 19,
      stateHeight: 17,
    },
    minimize: {
      spriteSheet: `${BASE}/xbox_iconuis1_min.png`,
      stateWidth: 19,
      stateHeight: 17,
    },
    maximize: {
      spriteSheet: `${BASE}/xbox_iconuis1_max1.png`,
      stateWidth: 19,
      stateHeight: 17,
    },
    restore: {
      spriteSheet: `${BASE}/xbox_iconuis1_max2.png`,
      stateWidth: 19,
      stateHeight: 17,
    },
    // Button positions from INI (Align=1 means right-aligned)
    closeOffset: { x: 21, y: 6 },
    minimizeOffset: { x: 69, y: 6 },
    maximizeOffset: { x: 45, y: 6 },
  },

  windowFrame: {
    type: 'image',
    sideImage: `${BASE}/xbox_uis1_frame_v.png`,
    sideWidth: 8,
    bodyBackground: '#b4b4b4',
    borderColor: '#646464',
  },

  startMenu: {
    type: 'image',
    top: {
      image: `${BASE}/xbox_xp_start_top.png`,
      nineSlice: { top: 1, right: 50, bottom: 69, left: 10 },
    },
    left: {
      image: `${BASE}/xbox_xp_start_left.png`,
      nineSlice: { top: 13, right: 8, bottom: 0, left: 17 },
    },
    right: {
      image: `${BASE}/xbox_xp_start_right.png`,
      nineSlice: { top: 12, right: 13, bottom: 0, left: 0 },
    },
    bottom: {
      image: `${BASE}/xbox_xp_start_bottom.png`,
      nineSlice: { top: 0, right: 12, bottom: 0, left: 12 },
    },
    userPic: {
      image: `${BASE}/xbox_xp_start_userpic.png`,
    },
    morePrograms: {
      image: `${BASE}/xbox_xp_start_moreprogs.png`,
    },
    logonButtons: {
      image: `${BASE}/xbox_xp_start_logicons.png`,
    },
  },

  colors: {
    highlight: 'rgb(112, 188, 31)',    // #70BC1F
    highlightText: '#000',
    activeTitle: 'rgb(181, 226, 77)',   // #B5E24D
    inactiveTitle: 'rgb(100, 100, 100)',
    surface: 'rgb(180, 180, 180)',
    windowText: 'rgb(51, 51, 51)',
    buttonFace: 'rgb(180, 180, 180)',
    buttonShadow: 'rgb(90, 90, 90)',
    buttonHighlight: 'rgb(210, 210, 210)',
    menuBackground: 'rgb(180, 180, 180)',
    menuText: '#000',
    scrollbar: 'rgb(102, 102, 102)',
    infoWindow: 'rgb(112, 188, 31)',
    infoText: '#000',
  },

  wallpaper: `${BASE}/xbox_wallpaper.webp`,
};
