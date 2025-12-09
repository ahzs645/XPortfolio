import styled, { css } from 'styled-components';

// Theme definitions
export const wmp8Theme = {
  baseColor: '#7190C4',
  metallicEffect: 'linear-gradient(to bottom, #bababa 0%, #bababa 5%, #fff 6%, #fff 20%, #f0f0fa 24%, #939399 70%, #adadb5 88%, #6b6c78 100%)',
  sideMetal: 'linear-gradient(to right, #b2b2b2, #f9f9f9, #dbdce4, #cfd0d9, #c8c8d1, #f0f0f4, #fefeff, #c2c2c9, #7c7c80)',
  visualizerBars: '#00f900',
  visualizerPeaks: '#e6e9e8',
  statusbarText: '#00f900',
};

export const wmp9Theme = {
  baseColor: '#5666ab',
  metallicEffect: '#bfd2ea',
  sideMetal: 'linear-gradient(to right, #b2b2b2, #f9f9f9, #dbdce4, #cfd0d9, #c8c8d1, #f0f0f4, #fefeff, #c2c2c9, #7c7c80)',
  visualizerBars: '#89a4ff',
  visualizerPeaks: '#505f94',
  statusbarText: '#89e116',
};

// Main app container (appcontentholder equivalent)
export const AppContentHolder = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: min-content auto;
  overflow: hidden;
  background: linear-gradient(to bottom, #afafc1, #e1e1ea);
  box-shadow: inset 0 25px 0 #f2f2fdee, inset 2px 0 #81828fee, inset 0 -2px #81828faa, inset -2px 0 #848591;
  position: relative;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  user-select: none;

  --baseColor: ${props => props.$theme === 'wmp9' ? wmp9Theme.baseColor : wmp8Theme.baseColor};
  --metallicEffect: ${props => props.$theme === 'wmp9' ? wmp9Theme.metallicEffect : wmp8Theme.metallicEffect};
  --sideMetal: ${props => props.$theme === 'wmp9' ? wmp9Theme.sideMetal : wmp8Theme.sideMetal};
  --visualizerBars: ${props => props.$theme === 'wmp9' ? wmp9Theme.visualizerBars : wmp8Theme.visualizerBars};
  --visualizerPeaks: ${props => props.$theme === 'wmp9' ? wmp9Theme.visualizerPeaks : wmp8Theme.visualizerPeaks};
  --statusbarText: ${props => props.$theme === 'wmp9' ? wmp9Theme.statusbarText : wmp8Theme.statusbarText};

  ${props => !props.$collapsed && css`
    &:after {
      background: url("/ui/wmp/xplogo_big.png");
      background-size: contain;
      width: 57px;
      height: 49px;
      content: " ";
      position: absolute;
      bottom: 12px;
      left: 20px;
      filter: drop-shadow(0 -1px 1px #636062) drop-shadow(1px 0 1px #afafbf);
    }
  `}

  ${props => props.$collapsed && css`
    &:after {
      display: none;
    }
  `}
`;

// App navigation menu bar
export const AppNavigation = styled.div`
  z-index: 1;
  position: relative;
  background: linear-gradient(to bottom, #f6f6f6, #e8e8ea);
  border-bottom: 1px solid #a0a0a0;
`;

export const AppMenus = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const MenuItem = styled.li`
  padding: 3px 8px;
  cursor: default;
  position: relative;

  &:hover {
    background: linear-gradient(to bottom, #d6e7f9, #a8c8f0);
  }
`;

// Main frame (wmpmainframe equivalent)
export const WMPMainFrame = styled.div`
  visibility: visible;
  width: ${props => props.$collapsed ? 'calc(100% + 80px)' : 'inherit'};
  height: calc(100% - 3px);
  display: block;
  position: relative;
  left: ${props => props.$collapsed ? '-80px' : '0'};
  top: 4px;
  filter: drop-shadow(0 -2px #8d8daacf) drop-shadow(0px -6px 7px #dedeeec2) drop-shadow(-1px 2px #c9c9e373) drop-shadow(-22px 20px 40px #5b5b84);
`;

// Colorifier wrapper
export const WMPColorifier = styled.div`
  width: 100%;
  height: 100%;
  display: block;

  & > * {
    position: absolute;
  }
`;

// Shape shader (for drop shadows)
export const ShapeShader = styled.div`
  display: inline-block;
  position: absolute;

  ${props => props.$id === 'topleft' && props.$theme === 'wmp8' && css`
    width: 91px;
    height: 27px;
    filter: drop-shadow(0 -2px 0px #7998d4) drop-shadow(0 -1px 0px #7fa3df) drop-shadow(0 -1px 0px #87aaea) drop-shadow(0 -1px 0px #95bafd) drop-shadow(0 -3px 0px #9ac2ff);
    margin-top: 8px;
    z-index: 1;
  `}

  ${props => props.$id === 'topleft' && props.$theme === 'wmp9' && css`
    width: 31px;
    height: 19px;
    filter: drop-shadow(0 -2px #dfe9f5) drop-shadow(0 -1px #2b448b);
    margin-top: 2px;
    z-index: 2;
  `}

  ${props => props.$id === 'topright' && props.$theme === 'wmp8' && css`
    width: 231px;
    height: 37px;
    right: 0;
    top: 0;
    filter: drop-shadow(0 -1px #7c9eda) drop-shadow(0 -1px #85a9e9) drop-shadow(0px -1px #90b6f9) drop-shadow(0px -4px #9ac2ff);
    z-index: 1;
  `}

  ${props => props.$id === 'topright' && props.$theme === 'wmp9' && css`
    width: 256px;
    height: 31px;
    right: 0;
    top: 0;
    filter: drop-shadow(-1px 0 #fdfeff) drop-shadow(0 -1px #7f90b5) drop-shadow(1px 0 #7f90b5);
    box-shadow: 0 1px var(--metallicEffect);
    z-index: 3;
  `}

  ${props => props.$id === 'bottomleft' && props.$theme === 'wmp8' && css`
    width: 88px;
    height: 56px;
    bottom: 64px;
    filter: drop-shadow(0 1px #6883b6) drop-shadow(0 1px #607bab) drop-shadow(0 1px #5b74a2) drop-shadow(0 1px #607bab) drop-shadow(0 1px #607bab88);
    margin-bottom: 6px;
    z-index: 1;
  `}

  ${props => props.$id === 'bottomleft' && props.$theme === 'wmp9' && css`
    width: 92px;
    height: 31px;
    bottom: 16px;
    z-index: 1;
  `}

  ${props => props.$id === 'ctrlleft' && props.$theme === 'wmp8' && css`
    width: 69px;
    height: 91px;
    bottom: 0;
    left: 79px;
    filter: drop-shadow(0 3px 0 #516594aa) drop-shadow(2px 1px 0px #747ed3) drop-shadow(2px 2px 0px #9ac1ff33);
    margin-bottom: 6px;
    z-index: 1;
  `}

  ${props => props.$id === 'ctrlleft' && props.$theme === 'wmp9' && css`
    width: 80px;
    height: 76px;
    bottom: 16px;
    left: 5px;
    z-index: 2;
    filter: drop-shadow(0 1px #3f5b9f);
  `}

  ${props => props.$id === 'ctrlmid' && props.$theme === 'wmp8' && css`
    width: 181px;
    height: 92px;
    bottom: 0;
    left: 148px;
    filter: drop-shadow(0 2px #7280c19e) drop-shadow(0 2px 0 #45509f);
    margin-bottom: 5px;
    z-index: 1;
  `}

  ${props => props.$id === 'ctrlmid' && props.$theme === 'wmp9' && css`
    width: 225px;
    height: 86px;
    bottom: 1px;
    left: 84px;
    background: linear-gradient(to bottom, transparent 0, transparent 44%, #fffefb 44%, #98afd6 75%, #d1e7ff 88%, #abb7d6);
    z-index: 2;
    border-radius: 0 0 0 21px;
    box-shadow: inset 0 -1px #798bb0;

    &:before {
      content: " ";
      width: 16px;
      height: 40px;
      position: absolute;
      left: 0;
      bottom: 45px;
      display: block;
      background: linear-gradient(to right, #c4d6ec, #c1d3eb 46%);
      box-shadow: inset 0 -3px #fffef6, inset 0 -4px #fbfbf4, inset 0 -5px #eff0f0, inset 0 -6px #e7ebf2, inset 0 -7px #dbe3f2, inset 0 -8px #d3dbed, inset 0 -9px #cbd3ed;
    }
  `}

  ${props => props.$id === 'ctrlright' && props.$theme === 'wmp8' && css`
    width: 48px;
    height: 91px;
    bottom: 0;
    left: 327px;
    filter: drop-shadow(1px 1px 0 #6379aa70) drop-shadow(0px 1px 0px #5962a8e6) drop-shadow(0px 1px 0px #667bbd);
    margin-bottom: 6px;
    z-index: 1;
  `}

  ${props => props.$id === 'ctrlright' && props.$theme === 'wmp9' && css`
    width: 62px;
    height: 45px;
    bottom: 2px;
    left: 309px;
    z-index: 2;
  `}

  ${props => props.$hideable && props.$collapsed && css`
    display: none;
  `}
`;

// WMP Shape (the actual colored shape)
export const WMPShape = styled.div`
  display: block;
  background: var(--baseColor);
  position: absolute;

  ${props => props.$id === 'topleft' && props.$theme === 'wmp8' && css`
    clip-path: path("M91,0C77,0,66,24,24,24H6a6.45,6.45,0,0,0-6,6H91Z");
    width: 91px;
    height: 30px;
    top: 15px;
  `}

  ${props => props.$id === 'topleft' && props.$theme === 'wmp9' && css`
    clip-path: path("M31,0C16,0,15,14,0,14v5H31Z");
    width: 100%;
    height: 100%;
    top: 31px;
    left: 61px;
    border-radius: 9px 0 0 0;
    background: linear-gradient(to right, #d7e3f2, var(--metallicEffect));
  `}

  ${props => props.$id === 'topright' && props.$theme === 'wmp8' && css`
    clip-path: path("M28,0C20,0,8,15,8,15H0V37H231V7a6.84,6.84,0,0,0-7-7Z");
    width: 231px;
    height: 37px;
    right: 0;
    top: 0;
    margin-top: 7px;
    background: linear-gradient(to left, var(--baseColor) 0, var(--baseColor) 1%, transparent 5%, transparent 100%), linear-gradient(to bottom, #7190c7, #464f8f);
  `}

  ${props => props.$id === 'topright' && props.$theme === 'wmp9' && css`
    clip-path: path("M256,12A12,12,0,0,0,244,0H51C30,0,24,31,0,31H256Z");
    width: 256px;
    height: 31px;
    right: 1px;
    top: 0;
    background: linear-gradient(to bottom, #fff 0, var(--metallicEffect) 87%, var(--metallicEffect) 100%);
    border-radius: 0 12px 0 0;

    &:after {
      width: 14px;
      height: 31px;
      content: " ";
      display: block;
      box-shadow: -2px 0 #fff;
      right: -14px;
      top: 0;
      border-radius: 0 14px 0 0;
      position: absolute;
    }
  `}

  ${props => props.$id === 'bottomleft' && props.$theme === 'wmp8' && css`
    clip-path: path("M79,.21V27.84C63,14.65,45.85,7,17,7H7A6.84,6.84,0,0,1,0,0Z");
    width: 79px;
    height: 28px;
    bottom: 0;
    background: linear-gradient(to right, #6770c7 0, #606bbb 10%, #5c67b1 11%, #6f8cc2 50%);
  `}

  ${props => props.$id === 'bottomleft' && props.$theme === 'wmp9' && css`
    clip-path: path("M0,0A9.61,9.61,0,0,0,7,9L92,31V0Z");
    width: 92px;
    height: 31px;
    bottom: 0;
    background: linear-gradient(to right, #849cd9 0, var(--baseColor) 80%, var(--baseColor) 100%);
  `}

  ${props => props.$id === 'ctrlleft' && props.$theme === 'wmp8' && css`
    clip-path: path("M69,.18V90.76c-15-5-31.8-26.77-45-40C18.73,45.32,13.83,40.25,9,35.66c-3-2.86-6-5.54-9-8V0L9,0Z");
    width: 69px;
    height: 91px;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 50%, #5965aa), var(--baseColor);
  `}

  ${props => props.$id === 'ctrlleft' && props.$theme === 'wmp9' && css`
    clip-path: path("M80,0V76a9.63,9.63,0,0,1-1-4V46c0-11-6-21-16-24L4,6C1,5,0,3,0,0Z");
    width: 80px;
    height: 69px;
    bottom: 7px;
    background: linear-gradient(to right, #fff, var(--metallicEffect));
  `}

  ${props => props.$id === 'ctrlmid' && props.$theme === 'wmp8' && css`
    clip-path: path("M181,.48V91.36a10.81,10.81,0,0,1-2,.25H6a18.38,18.38,0,0,1-6-1V0Z");
    width: 183px;
    height: 92px;
    bottom: 0;
    left: 148px;
    box-shadow: inset 0 -1px #6977c4, inset 0 -3px 3px #485295;
    background: linear-gradient(to bottom, transparent 50%, #5965aa), linear-gradient(45deg, #99c1ff 0, #99c1ff 35%, #6d8abe 3%, transparent 39%, transparent 1000%), var(--baseColor);
  `}

  ${props => props.$id === 'ctrlright' && props.$theme === 'wmp8' && css`
    clip-path: path("M49,0V61C34,61,21,77,21,77,15.79,84.82,5.28,89.62,0,90.75V0Z");
    width: 49px;
    height: 91px;
    bottom: 1px;
    left: 328px;
    box-shadow: inset 0 -1px 0 #4d578a, inset 0 -4px 3px #485295;
    background: linear-gradient(to bottom, transparent 50%, #5965aa), linear-gradient(50deg, #4b569d 0, #a9c3f4 100%), var(--baseColor);
  `}

  ${props => props.$id === 'ctrlright' && props.$theme === 'wmp9' && css`
    clip-path: path("M62,.06c-19-2-39,47-62,45V.06Z");
    width: 62px;
    height: 45px;
    bottom: 1px;
    background: linear-gradient(to bottom, #fffefb 0, #98afd6 53%, #d1e7ff 83%, #abb7d6);
  `}
`;

// Shape holder (positioned version)
export const WMPShapeHolder = styled.div`
  position: ${props => props.$theme === 'wmp9' ? 'absolute' : 'unset'};

  ${props => props.$id === 'ctrlleft' && props.$theme === 'wmp8' && css`
    position: absolute;

    .wmpshape {
      clip-path: path("M69,.18V90.76c-15-5-31.8-26.77-45-40C18.73,45.32,13.83,40.25,9,35.66c-3-2.86-6-5.54-9-8V0L9,0Z");
      width: 69px;
      height: 91px;
      bottom: 1px;
      left: 79px;
      background: linear-gradient(to bottom, transparent 50%, #5965aa), linear-gradient(45deg, #99c1ff 0, #99c1ff 35%, #6d8abe 3%, transparent 39%, transparent 1000%), var(--baseColor);
    }
  `}

  ${props => props.$id === 'ctrlleft' && props.$theme === 'wmp9' && css`
    .wmpshape {
      clip-path: path("M80,0V76a9.63,9.63,0,0,1-1-4V46c0-11-6-21-16-24L4,6C1,5,0,3,0,0Z");
      width: 80px;
      height: 69px;
      bottom: 22px;
      left: 4px;
      background: #2c458b;
      z-index: 1;
    }
  `}

  ${props => props.$id === 'ctrlright' && props.$theme === 'wmp9' && css`
    filter: drop-shadow(1px 0 #a4b6d9) drop-shadow(1px 0 #a9bcde) drop-shadow(1px 0 #a9bcde55);
    bottom: 1px;
    position: absolute;
    z-index: 1;

    .wmpshape {
      clip-path: path("M62,.06c-19-2-39,47-62,45V.06Z");
      width: 62px;
      height: 45px;
      bottom: 0;
      left: 307px;
      background: #a4b6d9;
    }
  `}
`;

// Navigation panel
export const NavPanel = styled.div`
  display: ${props => props.$collapsed ? 'none' : 'flex'};
  flex-direction: column;
  position: absolute;
  z-index: 1;
  overflow: hidden;

  ${props => props.$theme === 'wmp8' && css`
    height: calc(100% - 147px);
    top: 45px;
    width: 73px;
    padding: 13px 9px 0 6px;
    background: linear-gradient(to right, #6770c7 0, #606bbb 10%, #5c67b1 11%, #6f8cc2 50%);
    box-shadow: inset 2px 0 #818ced, inset 0 2px 2px var(--baseColor), inset -2px 0 #90b5f0, inset -3px 0 #90b5f088;
  `}

  ${props => props.$theme === 'wmp9' && css`
    height: calc(100% - 150px);
    top: 44px;
    left: 4px;
    width: 79px;
    padding: 20px 9px 0 0;
    background: linear-gradient(to right, #fff, var(--metallicEffect));
    box-shadow: inset 0 1px #fff, inset 0 -1px #fff;
    border-radius: 7px 0 0 7px;
    border-style: solid;
    border-width: 1px 0 1px 1px;
    border-color: #3f5b9f;
  `}
`;

export const NavItem = styled.div`
  position: relative;
  font-weight: 600;
  cursor: default;

  ${props => props.$theme === 'wmp8' && css`
    padding: 2px 0 6px 2px;
    min-height: 33px;
    height: 33px;
    color: #fff;

    &:after {
      content: ' ';
      position: absolute;
      height: 2px;
      width: 100%;
      background: linear-gradient(to right, #dde5f6, #7392c5);
      display: block;
      bottom: 0;
      left: 0;
    }

    &:hover {
      background: linear-gradient(45deg, #7891e3 0, #7891e3 50%, #8199e800 65%, #8199e800 100%);
    }

    &.selected, &:active {
      background: linear-gradient(30deg, #052989aa 0, #05298900 55%, #05298900 100%), linear-gradient(170deg, #052989aa 0, #05298900 35%, #05298900 100%), linear-gradient(to right, #052989aa 0, transparent 20%, transparent 100%);
    }

    &.selected:after, &:hover:after {
      height: 3px;
      background: linear-gradient(to right, #fba745, #708fc3);
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    padding: 2px 12px 6px 2px;
    min-height: 30px;
    height: 30px;
    border: 1px solid transparent;
    color: #212741;

    &:before {
      content: ' ';
      position: absolute;
      height: 1px;
      width: 100%;
      background: linear-gradient(to right, #fff, #f2f5fb, #c0d2ea);
      display: block;
      top: -2px;
      left: 0;
    }

    &:after {
      content: ' ';
      position: absolute;
      height: 1px;
      width: 100%;
      background: linear-gradient(to right, #fff, #c8d4ea, #b8cae5);
      display: block;
      bottom: 0;
      left: 0;
    }

    &:not(.selected):hover {
      background: linear-gradient(to bottom, #fffffe 0, #b3c6e3 58%, #d1e7ff 85%, #c0cfef 100%);
      box-shadow: inset 1px 0 #fefdf6cc, inset 0 -1px #8c9bcc, inset -1px 0 #a5b5decc;
      border: none;
      padding: 3px 13px 7px 3px;
      z-index: 1;
    }

    &:not(.selected):hover:after, &:not(.selected):hover:before {
      display: none;
    }

    &.selected, &:active {
      background: linear-gradient(to right, #d0e8ff, #c1d4eb);
      border: 1px solid transparent;
      border-color: #96aed8 #afc3e1 #f7f9fc #deeaf9;
      padding: 2px 12px 6px 2px;
      box-shadow: none;
      z-index: 1;
    }

    &.selected:after {
      display: none;
    }
  `}
`;

// Nav collapsed indicator
export const NavCollapsed = styled.div`
  display: ${props => props.$collapsed ? 'block' : 'none'};
  position: absolute;

  ${props => props.$theme === 'wmp8' && css`
    width: 18px;
    height: calc(100% - 82px);
    background: linear-gradient(to left, #6d74e8 0, #6d74e8 11%, #7da2f3 22%, #87b0ff 33%, #6381c2 44%, #5f7cbb 55%, #6280c2 66%, #6787cc 77%, #7ea4ec 88%, #5f7cb1 100%);
    box-shadow: inset 0 4px 2px #88b1fe;
    top: 15px;
    left: 79px;
    border-radius: 9px 0 0 9px;
    z-index: 1;
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 9px;
    height: calc(100% - 92px);
    background: linear-gradient(to right, #c9d9ed, #c1d3eb);
    box-shadow: inset 1px 0 #7f90b5, inset 3px 0 #fff;
    top: 32px;
    left: 83px;
    z-index: 2;

    &:after {
      content: " ";
      width: 3px;
      height: 45px;
      position: absolute;
      bottom: -45px;
      border-radius: 0 0 0 60%;
      box-shadow: inset 1px 0 #7f90b5, inset 3px 0 #fff;
    }
  `}
`;

// Nav toggle button
export const NavToggle = styled.div`
  position: absolute;
  cursor: pointer;

  ${props => props.$theme === 'wmp8' && css`
    height: 72px;
    width: 7px;
    border-radius: 5px 0 0 5px;
    background: linear-gradient(to right, #6783bd, #6783bd, #7190c4);
    box-shadow: inset 0 1px #92b8de, inset 0 -1px #4c6bc4, 0 1px #92b8de, 0 -1px #3152b9, -1px 0 #6f8cc2, inset -2px 0 2px #90b5f0;
    top: calc(50% - 67px);
    left: 81px;
    z-index: 2;

    &:after {
      background: url("/ui/wmp/navtoggle_grip.png");
      width: 7px;
      height: 72px;
      position: absolute;
      display: block;
      content: " ";
    }

    &:hover #arrow {
      background: linear-gradient(to bottom, #91663f 0, #f59331 25%, #fe9833 75%, #f9c89d 100%);
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    height: 48px;
    width: 4px;
    border-radius: 3px;
    background: linear-gradient(to right, #fff 0, #fff 48%, #dde5f3 75%, #bfe6f5 100%);
    box-shadow: inset 0 -1px #8d9fa7, inset 0 2px #fff;
    top: calc(50% - 48px);
    left: 86px;
    z-index: 1;
    border: 1px solid;
    border-color: #8e8e8f #aeaeae #535455 #aeaeae;

    &:hover {
      box-shadow: inset 0 -1px #90a6b1, inset 0 2px #fff;
      background: linear-gradient(to right, #fff 25%, #f6f9f7 48%, #c2dbc5 74%, #c2f4af 100%);
    }
  `}
`;

export const NavArrow = styled.div`
  font-weight: 600;
  position: absolute;

  ${props => props.$theme === 'wmp8' && css`
    color: #fff;
    font-size: 8px;
    line-height: 17px;
    text-shadow: 0 0 #fff;
    width: 5px;
    height: 17px;
    top: 26px;
    right: 0;
    border-radius: 3px;
    border: 1px solid;
    border-color: #607097 #8ba3dd #bccaef #8ba3dd;
    background: linear-gradient(to bottom, #536799 0, #7894de 25%, #7693dc 75%, #aabcec 100%);
  `}

  ${props => props.$theme === 'wmp9' && css`
    color: #182d43;
    font-size: 6px;
    line-height: 17px;
    text-shadow: 0 0 #182d43;
    width: 4px;
    height: 17px;
    top: 14px;
    right: 0;
    text-rendering: optimizeSpeed;
    transform: scale(.7, 1.5);
    font-family: Tahoma, sans-serif;
  `}

  ${props => props.$collapsed && css`
    transform: scaleX(-1) ${props.$theme === 'wmp9' ? 'scale(.7, 1.5)' : ''};
  `}
`;

// Top metal bar
export const TopMetal = styled.div`
  display: block;
  position: absolute;

  ${props => props.$theme === 'wmp8' && css`
    width: calc(100% - 322px);
    height: 22px;
    background: var(--metallicEffect);
    top: 15px;
    left: 91px;
    z-index: 2;
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 100%;
    height: calc(100% - 62px);
    background: var(--baseColor);
    box-shadow: inset 0 1px #9ab7f0, inset 0 2px #9fbdf8, inset 0 3px #a4c3ff, inset 0 4px #92aee8, inset 0 5px #839cd9, inset 0 6px #748aca, inset 0 7px #687bbd, inset 0 8px #5f71b4, inset 0 9px #5b6cb0, inset 0 10px #5768ac;
    top: 17px;
    left: 0;
    border-radius: 10px 0 0 0;

    &:before {
      height: 100%;
      width: 72px;
      background: linear-gradient(to right, #849cd9, var(--baseColor));
      border-radius: 12px 0 0 0;
      content: " ";
      position: absolute;
      display: block;
      box-shadow: inset 1px 0 #7f90b5, inset 2px 0 #849cd9, inset 3px 0 #88a1e0, inset 4px 0 #8da7e9, inset 0 1px #9ab7f0, inset 0 2px #9fbdf8, inset 0 3px #a4c3ff, inset 0 4px #92aee8e6, inset 0 5px #92aee880, inset 0 6px #92aee847, inset 0 7px #92aee830, inset 0 8px #92aee811, inset 0 9px #92aee80d, inset 0 10px #92aee80a;
    }

    &:after {
      width: calc(100% - 100px);
      height: 4px;
      display: block;
      content: " ";
      background: var(--metallicEffect);
      box-shadow: inset 0 1px #dfe9f5, 0 -1px #2b448b;
      top: 14px;
      left: 91px;
      z-index: 2;
      position: absolute;
    }
  `}

  ${props => props.$collapsed && props.$theme === 'wmp9' && css`
    left: 83px;
    width: calc(100% - 83px);

    &:after {
      left: 5px;
      width: calc(100% - 15px);
    }
  `}
`;

// Top button (fnbutton)
export const FnButton = styled.div`
  display: inline-block;
  position: absolute;
  cursor: pointer;
  image-rendering: pixelated;

  ${props => props.$theme === 'wmp8' && css`
    width: 17px;
    height: 16px;
    border-radius: 100%;
    background: url("/ui/wmp/sprite_topbuttons.png"), linear-gradient(to bottom, #b9babb, #8f93a1);
    box-shadow: 0 1px 1px #d1d2d7, 0 -1px 0 #dedede, inset 0 1px 1px #9fa3af, inset 0 -2px 3px #616982;
    margin: 3px 2px 0 2px;
    background-position-x: ${props.$iconOffset || 0}px;

    &:hover {
      background: url("/ui/wmp/sprite_topbuttons.png"), linear-gradient(to bottom, #edc746, #f6c348, #feae40, #f79532, #d7812b);
      box-shadow: 0 1px 1px #d1d2d7, 0 -1px 0 #dedede, inset 0 1px 1px #e2ab38, inset 0 -2px 3px #91581f;
      background-position-x: ${props.$iconOffset || 0}px;
    }

    &.active, &:active {
      background: url("/ui/wmp/sprite_topbuttons.png"), linear-gradient(to bottom, #000095, #000389, #002c9c, #0042b4, #0050ec);
      background-position-y: 32px;
      box-shadow: 0 1px 1px #d1d2d7, 0 -1px 0 #dedede, inset 0 1px 1px #03082e, inset 0 -1px 3px #002c88;
      background-position-x: ${props.$iconOffset || 0}px;
    }

    &.active:hover, &:active:hover {
      background-position-y: 16px;
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 14px;
    height: 14px;
    border-radius: 100%;
    background: radial-gradient(circle at 0 0, #fff 35%, #bfdeee 100%);
    box-shadow: inset -1px -1px #9bb7c488, 0 1px #939da3, 1px 2px 0 #f7f8fc, 0 -1px 1px 1px #929bb6;
    border: 1px solid;
    border-color: #6d748e #566880 #48596f #59597d;

    &:hover {
      background: radial-gradient(circle at 10% 10%, #fff 35%, #d0e6d4 50%, #c0eeb0 100%);
      box-shadow: inset -1px -1px #98c187, 0 1px #939da3, 1px 2px 0 #f7f8fc, 0 -1px 1px 1px #929bb6;
    }

    &.active, &:active {
      background: radial-gradient(circle at 10% 10%, #fff 0, #f1fdf4 35%, #daffcb 50%, #c8ffb0 100%);
      box-shadow: inset 1px 1px 1px #555595dd, inset -1px -1px 1px #80ac7e88, 0 1px #939da3, 1px 2px 0 #f7f8fc, 0 -1px 1px 1px #929bb6;
    }
  `}
`;

// Specific top button positions
export const ToggleUIButton = styled(FnButton)`
  ${props => props.$theme === 'wmp8' && css`
    left: 5px;
    background-position-x: 0px;
  `}

  ${props => props.$theme === 'wmp9' && css`
    left: 5px;
    top: 3px;
    width: 14px;
    height: 13px;
    box-shadow: inset -1px -1px #9bb7c488, 0 1px #939da3, 1px 2px 0 #f7f8fc, 0 -1px 1px 1px #93afe9, -2px -2px #d8feff;

    &:after {
      width: 14px;
      height: 14px;
      display: block;
      content: " ";
      background: url("/ui/wmp/wmp9_buttons.png");
      background-position-x: -28px;
    }
  `}
`;

export const ShuffleButton = styled(FnButton)`
  ${props => props.$theme === 'wmp8' && css`
    right: 47px;
    background-position-x: 51px;
  `}

  ${props => props.$theme === 'wmp9' && css`
    left: 358px;
    bottom: -21px;
    z-index: 2;

    &:after {
      width: 14px;
      height: 14px;
      display: block;
      content: " ";
      background: url("/ui/wmp/wmp9_buttons.png");
    }
  `}

  ${props => props.$collapsed && props.$theme === 'wmp9' && css`
    left: 275px;
  `}
`;

export const PlaylistButton = styled(FnButton)`
  ${props => props.$theme === 'wmp8' && css`
    right: 5px;
    background-position-x: 34px;
  `}

  ${props => props.$theme === 'wmp9' && css`
    z-index: 4;
    width: 16px;
    height: 14px;
    border: 1px solid #545455;
    border-radius: 3px;
    background: ${props.$playlistHidden ? '-98px' : '-48px'} 0 url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #9e9e9c 0, #737375 40%, #68686a 49%, #6d6d6e 100%);
    box-shadow: inset 1px 1px #dadad855, inset -1px -1px #acacac33;
    right: ${props.$playlistHidden ? '38px' : '226px'};
    bottom: 38px;

    &:hover {
      background: ${props.$playlistHidden ? '-98px' : '-48px'} 0 url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #c7c7c6 0, #8d8d8e 35%, #7f7f81 45%, #828384 65%, #959595 75%, #aeaeaf 100%);
      box-shadow: inset 1px 1px #dadad988, inset -1px -1px #63636488;
    }

    &:active {
      background: ${props.$playlistHidden ? '-98px' : '-48px'} 0 url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #747474 0, #707070 35%, #666668 45%, #656566 65%, #6e7175 75%, #8a8a89 100%);
      box-shadow: inset 1px 1px #575758bb, inset -1px -1px #9d9d9d88;
    }
  `}
`;

// Tiny blue strip (WMP8 only)
export const TinyBlue = styled.div`
  display: ${props => props.$theme === 'wmp9' ? 'none' : 'block'};
  width: 9px;
  height: 11px;
  right: 0;
  top: 37px;
  background: #5e7bb8;
  box-shadow: inset -1px 0 var(--baseColor), inset -2px 0 0 #7a9eeb, inset 2px 0 0 #7a9eeb;
  position: absolute;
`;

// Side metal panel
export const SideMetal = styled.div`
  display: block;
  right: 0;
  background: var(--sideMetal);
  position: absolute;

  ${props => props.$theme === 'wmp8' && css`
    width: 9px;
    height: calc(100% - 126px);
    top: 49px;
    box-shadow: inset -1px 0 0 #7c7c80;
    z-index: 2;
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 14px;
    height: calc(100% - 78px);
    top: 30px;
    background: var(--metallicEffect);
    box-shadow: inset -1px 0 0 #7f90b5, inset -3px 0 0 #fff, inset -6px 0 #cbd3ed;
    z-index: 3;
  `}
`;

// Lower metal panel
export const LowerMetal = styled.div`
  position: absolute;

  ${props => props.$theme === 'wmp8' && css`
    width: calc(100% - 405px);
    height: 29px;
    right: 27px;
    bottom: 31px;
    background: linear-gradient(to bottom, #cecece 0, #fff 3%, #fff 14%, #f0f0f9 16%, #cbcbd3 26%, #9b9b9f 75%, #a9a9b2 94%, #9c9da6 96%, #8b8c9c 100%);
    z-index: 3;
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: calc(100% - 337px);
    height: 28px;
    right: 0;
    bottom: 19px;
    background: linear-gradient(to bottom, #c9d3e8 0, #8d9aba 10%, #9aa4c2 22%, #dbe5f7 60%, #dbe5f7 77%, #c3d0ec 100%);
    border-radius: 0 0 14px 0;
    border: 1px solid;
    border-color: transparent #7f90b5 #7f90b5 transparent;
    box-shadow: inset -2px 0 #fff;
  `}
`;

export const LowerMetalButton = styled(FnButton)`
  ${props => props.$theme === 'wmp8' && css`
    width: 18px;
    height: 18px;
    border: 1px solid #7c838f;
    border-radius: 100%;
    background: linear-gradient(to bottom, #c1c2c2, #b3b4b7);
    box-shadow: 0 1px 1px #c6c6c9, 0 -1px 1px #a7a7ad, inset 0 0 2px #7c838f, inset 0 0 5px #8a8b8f;
    top: 4px;
    left: 5px;

    &:hover {
      background: linear-gradient(to bottom, #edc746, #f6c348, #feae40, #f79532, #d7812b);
      box-shadow: 0 1px 1px #c6c6c9, 0 -1px 1px #a7a7ad, inset 0 1px 1px #e2ab38, inset 0 -2px 3px #91581f;
      border-color: #b06f28;
    }

    &:active {
      background: linear-gradient(to bottom, #000095, #000389, #002c9c, #0042b4, #0050ec);
      box-shadow: 0 1px 1px #c6c6c9, 0 -1px 1px #a7a7ad, inset 0 1px 1px #03082e, inset 0 -1px 3px #002c88;
      border-color: #060b24;
    }

    &:before {
      background: url("/ui/wmp/sprite_skinmode.png");
      background-position-x: 0;
      filter: drop-shadow(1px 1px #838b9477);
      width: 18px;
      height: 18px;
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      content: " ";
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 14px;
    height: 14px;
    border: 1px solid;
    border-radius: 100%;
    background: radial-gradient(circle at 0 0, #fff 35%, #bfdeee 100%);
    box-shadow: inset -1px -1px #9bb7c488, 0 1px #939da3, 1px 2px 0 #f7f8fc, 0 -1px 1px 1px #929bb6;
    bottom: 4px;
    right: 19px;
    border-color: #6d748e #566880 #48596f #59597d;

    &:hover {
      background: radial-gradient(circle at 10% 10%, #fff 35%, #d0e6d4 50%, #c0eeb0 100%);
      box-shadow: inset -1px -1px #98c187, 0 1px #939da3, 1px 2px 0 #f7f8fc, 0 -1px 1px 1px #929bb6;
    }

    &.active, &:active {
      background: radial-gradient(circle at 10% 10%, #fff 0, #f1fdf4 35%, #daffcb 50%, #c8ffb0 100%);
      box-shadow: inset 1px 1px 1px #555595dd, inset -1px -1px 1px #80ac7e88, 0 1px #939da3, 1px 2px 0 #f7f8fc, 0 -1px 1px 1px #929bb6;
    }

    &:after {
      background: url("/ui/wmp/wmp9_buttons.png");
      background-position-x: -14px;
      width: 14px;
      height: 14px;
      display: block;
      content: " ";
    }
  `}
`;

// Corner metal with resizer
export const CornerMetal = styled.div`
  position: absolute;

  ${props => props.$theme === 'wmp8' && css`
    width: 27px;
    height: 47px;
    right: 0;
    bottom: 31px;
    background: linear-gradient(to bottom, #cbcbd3 0, #cbcbd3 55%, #9b9b9f 85%, #a9a9b2 94%, #9c9da6 98.5%, #8b8c9c 100%);
    z-index: 2;
    border-radius: 0 0 6px 0;
    box-shadow: inset 0 -1px #8f8f9e, inset 0 -2px #9fa0a9, inset -1px 0 #7c7c80, inset -2px 0 #c0c0c8, inset -3px 0 #f5f5f8, inset -4px 0 #ebebef;
  `}

  ${props => props.$theme === 'wmp9' && css`
    right: 6px;
    bottom: 23px;
  `}
`;

export const WMPResizer = styled.div`
  position: absolute;
  right: 0;
  bottom: ${props => props.$theme === 'wmp9' ? '1px' : '0'};
  width: ${props => props.$theme === 'wmp9' ? '11px' : '15px'};
  height: ${props => props.$theme === 'wmp9' ? '11px' : '15px'};
  background: url("/ui/luna/grabber.png");
  background-repeat: no-repeat;
  filter: ${props => props.$theme === 'wmp9'
    ? 'invert(41%) sepia(12%) saturate(682%) hue-rotate(182deg) brightness(95%) contrast(90%) drop-shadow(1px 1px 0 #fff)'
    : 'invert(56%) drop-shadow(1px 1px 0 #e0e0e2)'};
  cursor: nwse-resize;
`;

// Brand logo
export const BrandLogo = styled.div`
  position: absolute;

  ${props => props.$theme === 'wmp8' && css`
    display: none;
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 18px;
    height: 16px;
    bottom: 46px;
    left: 35px;
    z-index: 2;
    filter: drop-shadow(-1px -1px #4d6298) drop-shadow(1px 1px #8e9fcd);

    img {
      width: 100%;
      height: auto;
    }

    &:hover img {
      filter: brightness(1.1);
    }
  `}
`;

// WMP Content area
export const WMPContent = styled.div`
  display: block;
  position: absolute;
  background-color: #000;
  color: #fff;
  z-index: 1;

  ${props => props.$theme === 'wmp8' && css`
    top: 37px;
    left: 88px;
    width: calc(100% - 97px);
    height: calc(100% - 97px);
    border-radius: 3px 3px 13px 13px;
    box-shadow: 0 5px 5px #99c0fd, -2px 0 2px #90b5f0, 0 -2px 3px #353b6f;
  `}

  ${props => props.$theme === 'wmp9' && css`
    top: 35px;
    left: 91px;
    width: calc(100% - 101px);
    height: calc(100% - 100px);
    border-radius: 0 0 7px 7px;
    z-index: 3;
    border: 1px solid;
    border-color: #7f90b5 #98a7c6 #eef3fa #96a4c3;
    box-shadow: 0 1px #bfd2ea;
  `}
`;

// Playback container
export const PlaybackContainer = styled.div`
  width: ${props => props.$playlistHidden ? '100%' : (props.$theme === 'wmp9' ? 'calc(100% - 188px)' : 'calc(100% - 197px)')};
  height: calc(100% - 21px);
  position: relative;

  span {
    position: absolute;
    width: calc(100% - 20px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const ArtistName = styled.span`
  font-size: 14px;
  font-weight: 400;
  margin: 6px 0 0 8px;
  font-family: Tahoma, sans-serif;
`;

export const SongName = styled.span`
  font-size: ${props => props.$theme === 'wmp9' ? '22px' : '16px'};
  font-weight: ${props => props.$theme === 'wmp9' ? '500' : '600'};
  margin: 22px 0 0 8px;
  font-family: ${props => props.$theme === 'wmp9' ? '"MS Sans Serif", sans-serif' : 'Tahoma, sans-serif'};
`;

export const Visualizer = styled.canvas`
  width: calc(100% - ${props => props.$theme === 'wmp9' ? '8px' : '6px'});
  height: calc(100% - ${props => props.$theme === 'wmp9' ? '65px' : '70px'});
  left: ${props => props.$theme === 'wmp9' ? '4px' : '3px'};
  ${props => props.$theme === 'wmp9' ? 'bottom: 20px;' : 'top: 46px;'}
  position: absolute;
  pointer-events: none;
  image-rendering: pixelated;
`;

// Visualizer controls
export const VisControls = styled.div`
  width: ${props => props.$playlistHidden
    ? 'calc(100% - 6px)'
    : (props.$theme === 'wmp9' ? 'calc(100% + 191px)' : 'calc(100% - 8px)')};
  height: ${props => props.$theme === 'wmp9' ? '16px' : '17px'};
  position: absolute;
  bottom: ${props => props.$theme === 'wmp9' ? '-4px' : '-1px'};
  padding: ${props => props.$theme === 'wmp9' ? '2px 3px' : '4px'};
  background: ${props => props.$theme === 'wmp9' ? '#1e2337' : 'transparent'};
`;

export const VisButton = styled.div`
  display: inline-block;
  position: relative;
  cursor: pointer;

  ${props => props.$theme === 'wmp8' && css`
    width: 18px;
    height: 18px;
    background-image: url("/ui/wmp/wmp8_sprites.png");
    background-position-y: ${props.$posY || 0}px;

    &:hover {
      background-position-x: -18px;
    }

    &:active {
      background-position-x: -36px;
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 16px;
    height: 14px;
    border: 1px solid #545455;
    border-radius: 3px;
    background: url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #9e9e9c 0, #737375 40%, #68686a 49%, #6d6d6e 100%);
    box-shadow: inset 1px 1px #dadad855, inset -1px -1px #acacac33;

    &:hover {
      background: url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #c7c7c6 0, #8d8d8e 35%, #7f7f81 45%, #828384 65%, #959595 75%, #aeaeaf 100%);
      box-shadow: inset 1px 1px #dadad988, inset -1px -1px #63636488;
    }

    &:active {
      background: url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #747474 0, #707070 35%, #666668 45%, #656566 65%, #6e7175 75%, #8a8a89 100%);
      box-shadow: inset 1px 1px #575758bb, inset -1px -1px #9d9d9d88;
    }
  `}
`;

export const VisPrevButton = styled(VisButton)`
  ${props => props.$theme === 'wmp8' && css`
    background-position-y: 0px;
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 13px;
    height: 13px;
    border-radius: 100%;
    margin-bottom: 1px;
    background: -17px -1px url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #9e9e9c 0, #737375 40%, #68686a 49%, #6d6d6e 100%);

    &:hover {
      background: -17px -1px url("/ui/wmp/wmp9_glyphs.png"), radial-gradient(circle at 20% 20%, #6ae974 0, #6ae974 10%, #2fd33d 25%, #09d319 40%, #14cc24 49%, #56da61 60%, #5ddf69 75%, #4bcc56 100%);
    }

    &:active {
      background: -17px -1px url("/ui/wmp/wmp9_glyphs.png"), radial-gradient(circle at 20% 20%, #94d699 0, #57c860 10%, #35bc40 25%, #37ad41 40%, #30a239 49%, #56b25f 60%, #60b668 75%, #68bd6f 100%);
    }
  `}
`;

export const VisNextButton = styled(VisButton)`
  ${props => props.$theme === 'wmp8' && css`
    background-position-y: -18px;
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 13px;
    height: 13px;
    border-radius: 100%;
    margin-bottom: 1px;
    background: -32px -1px url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #9e9e9c 0, #737375 40%, #68686a 49%, #6d6d6e 100%);

    &:hover {
      background: -32px -1px url("/ui/wmp/wmp9_glyphs.png"), radial-gradient(circle at 20% 20%, #6ae974 0, #6ae974 10%, #2fd33d 25%, #09d319 40%, #14cc24 49%, #56da61 60%, #5ddf69 75%, #4bcc56 100%);
    }

    &:active {
      background: -32px -1px url("/ui/wmp/wmp9_glyphs.png"), radial-gradient(circle at 20% 20%, #94d699 0, #57c860 10%, #35bc40 25%, #37ad41 40%, #30a239 49%, #56b25f 60%, #60b668 75%, #68bd6f 100%);
    }
  `}
`;

export const VisFullscreenButton = styled(VisButton)`
  ${props => props.$theme === 'wmp8' && css`
    background-position-y: -54px;
    float: right;
  `}

  ${props => props.$theme === 'wmp9' && css`
    background: -64px 0 url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #9e9e9c 0, #737375 40%, #68686a 49%, #6d6d6e 100%);
    right: ${props.$playlistHidden ? '7px' : '195px'};
    position: absolute;

    &:hover {
      background: -64px 0 url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #c7c7c6 0, #8d8d8e 35%, #7f7f81 45%, #828384 65%, #959595 75%, #aeaeaf 100%);
    }

    &:active {
      background: -64px 0 url("/ui/wmp/wmp9_glyphs.png"), linear-gradient(150deg, #747474 0, #707070 35%, #666668 45%, #656566 65%, #6e7175 75%, #8a8a89 100%);
    }
  `}
`;

export const VisName = styled.span`
  padding: 0 8px;
  line-height: 16px;
  width: ${props => props.$theme === 'wmp9' ? 'calc(100% - 310px)' : 'calc(100% - 100px)'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Playlist container
export const PlaylistContainer = styled.div`
  width: ${props => props.$theme === 'wmp9' ? '188px' : '197px'};
  right: 0;
  height: calc(100% - ${props => props.$theme === 'wmp9' ? '37px' : '21px'});
  overflow: hidden;
  position: absolute;
  top: 0;
  display: ${props => props.$hidden ? 'none' : 'block'};

  ${props => props.$theme === 'wmp8' && css`
    box-shadow: inset 1px 0 #4c4c51, inset 2px 0 #73737d, inset 3px 0 #4c4c51;
  `}

  ${props => props.$theme === 'wmp9' && css`
    box-shadow: inset 2px 0 #71717b;
    background: #282f4a;
    display: ${props.$hidden ? 'none' : 'grid'};
    grid-template-rows: 146px auto;
    grid-template-columns: auto;

    &:before {
      width: calc(100% + 26px);
      height: 144px;
      box-shadow: 0 2px #71717b;
      display: block;
      content: " ";
      background: 50% 0/contain no-repeat url("/ui/wmp/wmp9_mediagraphic.png");
      margin-left: -12px;
      margin-bottom: 2px;
    }
  `}
`;

export const PlaylistItems = styled.ul`
  width: calc(100% - ${props => props.$theme === 'wmp9' ? '6px' : '28px'});
  height: ${props => props.$theme === 'wmp9' ? '100%' : 'calc(100% - 4px)'};
  overflow-y: auto;
  margin: 0;
  padding: ${props => props.$theme === 'wmp9' ? '0 0 0 6px' : '2px 14px'};
  overflow-x: hidden;
  list-style: none;
  ${props => props.$theme === 'wmp9' && 'grid-row: 2;'}
`;

export const PlaylistItem = styled.li`
  position: relative;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;

  ${props => props.$theme === 'wmp9' && css`
    height: 14px;
    line-height: 11px;
    padding: 0 2px;
    letter-spacing: 0;
  `}

  ${props => props.$selected && css`
    color: ${props.$theme === 'wmp9' ? '#89e116' : '#00f900'};
    ${props.$theme === 'wmp9' && 'background: #141725;'}
  `}
`;

// Status bar
export const StatusBar = styled.div`
  width: 100%;
  height: ${props => props.$theme === 'wmp9' ? '13px' : '16px'};
  bottom: 0;
  padding: 2px 0;
  position: absolute;
  box-shadow: ${props => props.$theme === 'wmp9' ? 'inset 0 1px #60647f' : 'inset 0 1px #cdcdd3, inset 0 2px #aeaeb6'};
  color: var(--statusbarText);
  font-weight: ${props => props.$theme === 'wmp9' ? '500' : '600'};
`;

export const StatusInfo = styled.span`
  left: ${props => props.$theme === 'wmp9' ? '52px' : '56px'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: calc(100% - 110px);
  line-height: ${props => props.$theme === 'wmp9' ? '14px' : '18px'};
  position: absolute;
`;

// Progress time display
export const ProgressDisplay = styled.div`
  right: ${props => props.$theme === 'wmp9' ? '6px' : '9px'};
  bottom: ${props => props.$theme === 'wmp9' ? '63px' : '60px'};
  height: ${props => props.$theme === 'wmp9' ? '13px' : '18px'};
  width: auto;
  display: block;
  padding: ${props => props.$theme === 'wmp9' ? '2px 9px' : '0 9px'};
  font-weight: 600;
  background: #000;
  color: var(--statusbarText);
  ${props => props.$theme === 'wmp8' && css`
    box-shadow: 1px 5px 1px #fff, 2px 0 #fff;
    border-radius: 0 0 13px 0;
  `}
  z-index: ${props => props.$theme === 'wmp9' ? '3' : '2'};
  line-height: ${props => props.$theme === 'wmp9' ? '14px' : '18px'};
  position: absolute;
`;

// Playback controls container
export const PlaybackControls = styled.div`
  bottom: ${props => props.$theme === 'wmp9' ? '8px' : '9px'};
  left: ${props => props.$theme === 'wmp9' ? '93px' : '130px'};
  z-index: ${props => props.$theme === 'wmp9' ? '3' : '1'};
  position: absolute;
  width: ${props => props.$theme === 'wmp9' ? 'calc(100% - 93px)' : 'auto'};
`;

// Rewind/FastForward buttons
export const RewindButton = styled.div`
  display: block;
  position: absolute;
  cursor: pointer;

  ${props => props.$theme === 'wmp8' && css`
    width: 19px;
    height: 12px;
    background: url("/ui/wmp/sprite_rewind.png");
    bottom: 28px;
    opacity: 0.5;
    left: ${props.$next ? '223px' : '67px'};
    ${props.$next && 'transform: scaleX(-1);'}
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 28px;
    height: 9px;
    background: 9px 2px no-repeat url("/ui/wmp/wmp9_sprite_rewind_disabled.png"), linear-gradient(#fff 0, #fff 45%, #c7e0f1 55%, #c7e0f1 100%);
    box-shadow: inset 0 1px #f5f5f3, inset 0 -1px #b5cfde, inset 0 -2px #c7e0f1, inset 3px 0 1px #fff, inset 0 2px #fff, inset -3px 0 1px #c7ddef;
    bottom: 42px;
    border: 1px solid;
    border-color: #dbdbdb #77828f #77828f #9398a2;
    border-radius: 6px;
    z-index: 1;
    left: ${props.$next ? 'auto' : '2px'};
    right: ${props.$next ? '11px' : 'auto'};
    ${props.$next && 'transform: scaleX(-1);'}
  `}
`;

// Seek bar
export const SeekBar = styled.div`
  position: absolute;
  cursor: pointer;

  ${props => props.$theme === 'wmp8' && css`
    background: linear-gradient(to bottom, #5066ae, #8a9ddf);
    border-radius: 3px;
    width: 127px;
    padding-right: 8px;
    height: 7px;
    bottom: 31px;
    left: 87px;
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: calc(100% - 96px);
    height: 13px;
    bottom: 41px;
    left: 37px;
  `}
`;

export const SeekBackground = styled.div`
  ${props => props.$theme === 'wmp8' && css`
    margin: 1px 2px;
    background: linear-gradient(to bottom, #aae7b2, #30d741, #aae7b2);
    border-radius: 2px;
    width: calc(100% - 4px);
    height: 5px;
  `}

  ${props => props.$theme === 'wmp9' && css`
    background: linear-gradient(to bottom, #8e9aba, #e7eaee);
    border-radius: 7px;
    width: calc(100% + 85px);
    height: 13px;
    margin-left: -36px;
    box-shadow: inset 0 -1px #fffef6, inset 0 1px #6882b0, 3px 2px 2px 1px #fff;
  `}
`;

export const SeekFill = styled.div`
  display: ${props => props.$theme === 'wmp8' ? 'none' : 'block'};
  background: #94c793;
  height: 9px;
  margin-top: 2px;
  margin-left: -7px;
  padding-right: 3px;
  box-shadow: inset 0 -1px #8a8a8a, inset 0 1px #c3f5c1, inset 0 2px #a8daa6;
  width: ${props => props.$progress || 0}%;
`;

export const SeekPointer = styled.div`
  position: absolute;
  left: ${props => props.$progress || 0}%;

  ${props => props.$theme === 'wmp8' && css`
    width: 8px;
    height: 10px;
    background: radial-gradient(circle at 33% 25%, #fff 0, #fff 20%, #b4bccf);
    border-radius: 3px 3px 0 0;
    box-shadow: inset 0 1px 1px #a5b4d1, inset -1px 0 #8c98b4aa, inset 1px 0 #b0bbd0;
    margin-top: -3px;
    filter: drop-shadow(0 1px 1px #2b3648);
    margin-right: 8px;

    &:after {
      content: " ";
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 4px 0 4px;
      border-color: #b2bace transparent transparent transparent;
      position: absolute;
      top: 10px;
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 13px;
    height: 11px;
    background: #cbd7e7;
    box-shadow: inset 0 1px #747474, inset 1px 2px #fff, inset -1px -1px #9ba7b7, inset 0 2px #e4ebf5, inset -2px 0 #d0dbe9;
    top: 1px;

    &:after, &:before {
      width: 5px;
      height: 11px;
      display: inline-block;
      content: " ";
      background: #1ab919;
      box-shadow: inset 1px 1px #22811eaa, inset 2px 2px #87dc8699;
      border-radius: 3px 0 0 3px;
      position: absolute;
      margin-left: -5px;
    }

    &:after {
      transform: scaleX(-1);
      margin-left: 13px;
    }

    &:hover:after, &:hover:before {
      background: #fc0;
      box-shadow: inset 1px 1px #c48e2a, inset 2px 2px #f6b234;
    }

    &:active:after, &:active:before {
      background: #229512;
      box-shadow: inset 1px 1px #23871e, inset 2px 2px #66b65b;
    }
  `}
`;

// Play/Pause button
export const PlayPauseButton = styled.div`
  position: absolute;
  cursor: pointer;
  transition: box-shadow 0.3s ease;

  ${props => props.$theme === 'wmp8' && css`
    width: 43px;
    height: 43px;
    border-radius: 100%;
    bottom: 0;
    left: 0;
    background: linear-gradient(to bottom, #5066ae, #8a9ddf);
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 60px;
    height: 36px;
    bottom: -1px;
    left: 0;
    clip-path: path("M59,17A12,12,0,0,1,47,29c-20.34,0-19.15,4.65-29,5h0C8.06,34,0,26.94,0,17S8.06,0,18,0c.34,0-.32,0,0,0,9.85.35,8.66,5,29,5A12,12,0,0,1,59,17Z");
  `}
`;

export const ButtonBody = styled.div`
  border-radius: 100%;

  ${props => props.$theme === 'wmp8' && css`
    width: calc(100% - 6px);
    height: calc(100% - 6px);
    margin: 3px;
    background: ${props.$playing
      ? 'url("/ui/wmp/sprite_pause.png"), radial-gradient(circle at 50% 15%, #fff 0, #fff 7%, #7789a8 100%)'
      : 'url("/ui/wmp/sprite_play.png"), radial-gradient(circle at 50% 15%, #fff 0, #fff 7%, #7789a8 100%)'};
    box-shadow: inset 0 -1px 2px 1px #030a46, inset 0 -2px 1px #235aff, inset 3px -3px 2px #dfe3ec, inset 0 -1px 1px #081e81, inset 0 -5px 3px #7083ad, 0 0 1px 0 #222a7a;

    &:hover {
      background: ${props.$playing
        ? 'url("/ui/wmp/sprite_pause.png"), radial-gradient(circle at 50% 15%, #fff 0, #fff 30%, #658ad5 100%)'
        : 'url("/ui/wmp/sprite_play.png"), radial-gradient(circle at 50% 15%, #fff 0, #fff 30%, #658ad5 100%)'};
      background-position: ${props.$playing ? '-37px 0' : '-36px 0'};
      box-shadow: inset 0 -1px 2px 1px #000795, inset 3px -4px 1px #90e5ff, inset 0 -4px 2px #4a72bb, 0 -1px 1px #27647999, inset 0 2px 2px #feffff, 0 -1px 1px 1px #1ebfffa8;
    }

    &:active {
      background: ${props.$playing
        ? 'url("/ui/wmp/sprite_pause.png"), radial-gradient(circle at 50% 20%, #f6fdfd 0, #f6fdfd 13%, #495b92 100%)'
        : 'url("/ui/wmp/sprite_play.png"), radial-gradient(circle at 50% 20%, #f6fdfd 0, #f6fdfd 13%, #495b92 100%)'};
      background-position: ${props.$playing ? '-73px 0' : '-72px 0'};
      box-shadow: inset 0 0 1px 1px #000f42d6, inset 0 -2px 2px #002877, inset 4px -3px 1px #94b4d7, inset 0 -5px 1px #4e659f, inset 0 0 2px 2px #9da9bf;
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 30px;
    height: 30px;
    margin: 2px;
    background: radial-gradient(circle at 10% 10%, #fff 0, #fff 32%, #f6f7fb 35%, #d3dbee 50%, #c5def1 65%, #cdecfb 75%);
    box-shadow: inset -1px -1px #8a909c, inset -1px 1px #5a6b7782, inset 1px -1px #6f7983b5, inset 1px 1px #3441461c, inset 1px 1px #e9ebf6, inset -2px -2px 1px #a3cfe1, 0 0 1px #a4b2c5;

    &:before {
      content: " ";
      display: block;
      width: 60px;
      height: 36px;
      position: absolute;
      background: linear-gradient(190deg, #a4adcc 20%, #a4adcc00 35%), linear-gradient(150deg, #a4adcc 20%, #a4adcc00 30%), linear-gradient(-10deg, #fcfdfe 25%, #fcfdfe00 35%), linear-gradient(to bottom, #dde1f1 10%, #c5d3ec 50%);
      z-index: -1;
      top: -3px;
      left: -3px;
    }

    &:after {
      width: 10px;
      height: 10px;
      content: " ";
      position: relative;
      display: block;
      background: url(${props.$playing ? '"/ui/wmp/wmp9_sprite_pause.png"' : '"/ui/wmp/wmp9_sprite_play.png"'});
      filter: drop-shadow(0 0 1px #fff);
      margin: ${props.$playing ? '10px' : '10px 11px'};
    }

    &:hover {
      background: radial-gradient(circle at 10% 10%, #fff 0, #fff 32%, #eaf8ed 35%, #c8dcce 50%, #bee5b2 65%, #c1f0b0 75%, #c0f2ae 100%);
      box-shadow: inset -1px -1px #5b7451, inset -1px 1px #8b998d, inset 1px -1px #79956f90, inset 1px 1px #a0a5a720, inset 1px 1px #b3c9b4, inset -2px -2px 1px #c0f2ae, 0 0 1px #a4b2c5;
    }

    &:active {
      background: radial-gradient(circle at 10% 10%, #fff 0, #effaf1 32%, #e2f2e5 35%, #cfe6d2 50%, #b1dcb7 70%, #a3e795 75%, #a5f386 100%);
      box-shadow: inset 1px 1px #5d6392, inset -1px -1px #88b780, inset -1px 1px #6f8c86, inset 1px -1px #6f8c86, inset 2px 2px #a6b1ce88, 0 0 1px #a4b2c5;
    }
  `}
`;

// Stop button
export const StopButton = styled.div`
  position: absolute;
  cursor: pointer;

  ${props => props.$theme === 'wmp8' && css`
    bottom: 0;
    left: 41px;
    width: 24px;
    height: 33px;
    transform: rotate(-26deg);
    border-radius: 100%;
    background: linear-gradient(to bottom, #5066ae, #8a9ddf);
  `}

  ${props => props.$theme === 'wmp9' && css`
    left: 35px;
    bottom: 6px;
    width: 24px;
    height: 24px;
  `}
`;

export const StopButtonBody = styled.div`
  ${props => props.$theme === 'wmp8' && css`
    width: calc(100% - 5px);
    height: calc(100% - 5px);
    margin: 3px;
    border-radius: 100%;
    background: radial-gradient(circle at 75% 15%, #fff 0, #fff 20%, #9dacc7 100%);
    box-shadow: inset 0 -1px 2px 1px #030a46, inset 0 -2px 1px #235aff, inset 3px -3px 2px #dfe3ec, inset 0 -1px 1px #081e81, inset 0 -5px 3px #7083ad, 0 0 1px 0 #222a7a;

    &:before {
      transform: rotate(26deg) translateX(1px);
      background: url("/ui/wmp/sprite_stop.png");
      content: " ";
      width: 16px;
      height: 25px;
      display: block;
    }

    &:hover {
      background: radial-gradient(circle at 50% 15%, #fff 0, #fff 30%, #658ad5 100%);
      box-shadow: inset 0 -1px 2px 1px #000795, inset 3px -4px 1px #90e5ff, inset 0 -4px 2px #4a72bb, 0 -1px 1px #27647999, inset 0 2px 2px #feffff, 0 -1px 1px 1px #1ebfffa8;

      &:before {
        background-position-x: -16px;
      }
    }

    &:active {
      background: radial-gradient(circle at 50% 20%, #f6fdfd 0, #f6fdfd 13%, #495b92 100%);
      box-shadow: inset 0 0 1px 1px #000f42d6, inset 0 -2px 2px #002877, inset 4px -3px 1px #94b4d7, inset 0 -5px 1px #4e659f, inset 0 0 2px 2px #9da9bf;

      &:before {
        background-position-x: -32px;
      }
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    margin: 2px;
    border-radius: 100%;
    background: radial-gradient(circle at 10% 10%, #fff 0, #fff 32%, #f6f7fb 35%, #d3dbee 50%, #c5def1 65%, #cdecfb 75%);
    box-shadow: inset -1px -1px #8a909c, inset -1px 1px #5a6b7782, inset 1px -1px #6f7983b5, inset 1px 1px #3441461c, inset 1px 1px #e9ebf6, inset -2px -2px 1px #a3cfe1, 0 0 1px #a4b2c5;

    &:after {
      background: url("/ui/wmp/wmp9_sprite_stop.png");
      filter: drop-shadow(0 0 1px #fff);
      content: " ";
      width: 6px;
      height: 6px;
      display: block;
      position: relative;
      margin: 7px;
    }

    &:hover {
      background: radial-gradient(circle at 10% 10%, #fff 0, #fff 32%, #eaf8ed 35%, #c8dcce 50%, #bee5b2 65%, #c1f0b0 75%, #c0f2ae 100%);
      box-shadow: inset -1px -1px #5b7451, inset -1px 1px #8b998d, inset 1px -1px #79956f90, inset 1px 1px #a0a5a720, inset 1px 1px #b3c9b4, inset -2px -2px 1px #c0f2ae, 0 0 1px #a4b2c5;
    }

    &:active {
      background: radial-gradient(circle at 10% 10%, #fff 0, #effaf1 32%, #e2f2e5 35%, #cfe6d2 50%, #b1dcb7 70%, #a3e795 75%, #a5f386 100%);
      box-shadow: inset 1px 1px #5d6392, inset -1px -1px #88b780, inset -1px 1px #6f8c86, inset 1px -1px #6f8c86, inset 2px 2px #a6b1ce88, 0 0 1px #a4b2c5;

      &:after {
        transform: translate(1px, 1px);
      }
    }
  `}
`;

// Track buttons (prev/next)
export const TrackButton = styled.div`
  position: absolute;
  cursor: pointer;

  ${props => props.$theme === 'wmp8' && css`
    width: 26px;
    height: 19px;
    border-radius: 7px;
    bottom: 1px;
    left: ${props.$next ? '95px' : '66px'};
    background: linear-gradient(to bottom, #5066ae, #8a9ddf);
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 49px;
    height: 24px;
    bottom: 6px;
    left: ${props.$next ? '98px' : '73px'};
    clip-path: path("M49,12A12,12,0,0,1,37,24h-.46c-4.61-.11-5.74-2-12-2s-7.43,1.88-12,2H12A12,12,0,0,1,12,0h.46c4.61.11,5.74,2,12,2,7.27,0,7.49-1.88,12-2H37A12,12,0,0,1,49,12Z");

    &:before {
      width: 49px;
      height: 24px;
      content: " ";
      display: block;
      position: absolute;
      background: linear-gradient(to bottom, #a4adcc 10%, #a4adcc00 25%), linear-gradient(to top, #fcfdfe 10%, #fcfdfe00 25%), linear-gradient(to bottom, #d2d9ec 20%, #cdd7ec 50%, #c8d3e9 52%);
    }

    &:after {
      width: 8px;
      height: 8px;
      content: " ";
      display: block;
      background: url(${props.$next ? '"/ui/wmp/wmp9_sprite_tracknext.png"' : '"/ui/wmp/wmp9_sprite_trackback.png"'});
      filter: drop-shadow(0 0 1px #fff);
      position: relative;
      margin: 8px ${props.$next ? '9px' : '7px'};
    }
  `}
`;

export const TrackButtonBody = styled.div`
  ${props => props.$theme === 'wmp8' && css`
    border-radius: 7px;
    margin: 3px 1px 2px;
    width: 24px;
    height: 14px;
    background: url("/ui/wmp/sprite_changetrack.png"), linear-gradient(to bottom, #f3f9ff 0, #f9fdff 30%, #7a8fb5 100%);
    box-shadow: inset 0 -1px 1px #000839, inset 0 -2px 1px #003077, 0 -1px 3px #4763a0;
    ${props.$next && 'transform: scaleX(-1);'}

    &:hover {
      background-position-x: -24px;
    }

    &:active {
      background-position-x: -48px;
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 100%;
    background: radial-gradient(circle at 10% 10%, #fff 0, #fff 32%, #f6f7fb 35%, #d3dbee 50%, #c5def1 65%, #cdecfb 75%);
    box-shadow: inset -1px -1px #8a909c, inset -1px 1px #5a6b7782, inset 1px -1px #6f7983b5, inset 1px 1px #3441461c, inset 1px 1px #e9ebf6, inset -2px -2px 1px #a3cfe1, 0 0 1px #a4b2c5;

    &:hover {
      background: radial-gradient(circle at 10% 10%, #fff 0, #fff 32%, #eaf8ed 35%, #c8dcce 50%, #bee5b2 65%, #c1f0b0 75%, #c0f2ae 100%);
    }

    &:active {
      background: radial-gradient(circle at 10% 10%, #fff 0, #effaf1 32%, #e2f2e5 35%, #cfe6d2 50%, #b1dcb7 70%, #a3e795 75%, #a5f386 100%);
    }
  `}
`;

// Mute button
export const MuteButton = styled.div`
  position: absolute;
  cursor: pointer;

  ${props => props.$theme === 'wmp8' && css`
    width: 26px;
    height: 19px;
    border-radius: 7px;
    bottom: 1px;
    left: 129px;
    background: linear-gradient(to bottom, #5066ae, #8a9ddf);
  `}

  ${props => props.$theme === 'wmp9' && css`
    left: 136px;
    bottom: 6px;
    width: 24px;
    height: 24px;

    &:after {
      width: 10px;
      height: 8px;
      content: " ";
      display: block;
      background: url("/ui/wmp/wmp9_sprite_mute.png");
      filter: drop-shadow(0 0 1px #fff);
      position: relative;
      margin: 8px 7px;
    }
  `}
`;

export const MuteButtonBody = styled.div`
  ${props => props.$theme === 'wmp8' && css`
    border-radius: 7px;
    margin: 3px 1px 2px;
    width: 24px;
    height: 14px;
    background: url("/ui/wmp/sprite_mute.png"), linear-gradient(to bottom, #f3f9ff 0, #f9fdff 30%, #7a8fb5 100%);
    box-shadow: inset 0 -1px 1px #000839, inset 0 -2px 1px #003077, 0 -1px 3px #4763a0;

    &:hover {
      background-position-x: -24px;
    }

    ${props.$muted && css`
      background-position-x: -48px;
    `}
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    margin: 2px;
    border-radius: 100%;
    background: radial-gradient(circle at 10% 10%, #fff 0, #fff 32%, #f6f7fb 35%, #d3dbee 50%, #c5def1 65%, #cdecfb 75%);
    box-shadow: inset -1px -1px #8a909c, inset -1px 1px #5a6b7782, inset 1px -1px #6f7983b5, inset 1px 1px #3441461c, inset 1px 1px #e9ebf6, inset -2px -2px 1px #a3cfe1, 0 0 1px #a4b2c5;

    &:before {
      width: 24px;
      height: 24px;
      border-radius: 100%;
      display: block;
      position: absolute;
      content: " ";
      background: linear-gradient(135deg, #9ca6c6, #f1f4fa);
      z-index: -1;
      top: -2px;
      left: -2px;
    }

    &:hover {
      background: radial-gradient(circle at 10% 10%, #fff 0, #fff 32%, #eaf8ed 35%, #c8dcce 50%, #bee5b2 65%, #c1f0b0 75%, #c0f2ae 100%);
    }

    ${props.$muted && css`
      background: radial-gradient(circle at 10% 10%, #fff 0, #effaf1 32%, #e2f2e5 35%, #cfe6d2 50%, #b1dcb7 70%, #a3e795 75%, #a5f386 100%);
      box-shadow: inset 1px 1px #5d6392, inset -1px -1px #88b780, inset -1px 1px #6f8c86, inset 1px -1px #6f8c86, inset 2px 2px #a6b1ce88, 0 0 1px #a4b2c5;
    `}
  `}
`;

// Volume bar
export const VolumeBar = styled.div`
  position: absolute;
  cursor: pointer;

  ${props => props.$theme === 'wmp8' && css`
    left: 157px;
    bottom: 4px;
    width: 42px;
    height: 10px;
    padding-right: 12px;
  `}

  ${props => props.$theme === 'wmp9' && css`
    left: 166px;
    bottom: 14px;
    width: 59px;
    height: 9px;
    padding-right: 2px;
  `}
`;

export const VolumeBackground = styled.div`
  ${props => props.$theme === 'wmp8' && css`
    width: 54px;
    height: 10px;
    clip-path: path("M54,0,3.4,2.81A3.6,3.6,0,0,0,0,6.4H0A3.6,3.6,0,0,0,3.6,10H43Z");
    background: linear-gradient(179deg, #202c7b, #364690, #4a5c9e, #566aaa, #6377b5, #6b81be, #768bc8, #7f95d4, #8aa0e2);
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 67px;
    height: 9px;
    clip-path: polygon(0 55%, 0 66.67%, 100% 0, 100% 33%, 88% 100%, 0 100%);
    background: linear-gradient(175deg, #96a2c6 40%, #afbedc 60%, #f5f6fb);
  `}
`;

export const VolumeFill = styled.div`
  ${props => props.$theme === 'wmp8' && css`
    width: ${props.$volume || 100}%;
    max-width: 45px;
    height: 7px;
    margin: 2px 0 1px 4px;
    clip-path: path("M45,0,2.44,1.89A2.56,2.56,0,0,0,0,4.44H0A2.55,2.55,0,0,0,2.56,7H37Z");
    background: linear-gradient(to bottom, #a0eaa1, #84e586, #67df69, #4ad94c, #31d334, #3cd63f, #5eae8e);
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: ${props.$volume || 100}%;
    max-width: 61px;
    height: 8px;
    margin: 2px 0 1px 4px;
    clip-path: polygon(0 55%, 100% 0, 88.5% 66.67%, 0 66.67%, 0 55%);
    background: linear-gradient(175deg, #5e936e 30%, #8eff79);
  `}
`;

export const VolumePointer = styled.div`
  position: absolute;
  left: ${props => props.$volume || 100}%;

  ${props => props.$theme === 'wmp8' && css`
    width: 8px;
    height: 10px;
    background: radial-gradient(circle at 33% 25%, #fff 0, #fff 20%, #b4bccf);
    border-radius: 3px 3px 0 0;
    box-shadow: inset 0 1px 1px #a5b4d1, inset -1px 0 #8c98b4aa, inset 1px 0 #b0bbd0;
    margin-top: -1px;
    filter: drop-shadow(0 1px 1px #2b3648);
    margin-right: 8px;

    &:after {
      content: " ";
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 4px 0 4px;
      border-color: #b2bace transparent transparent transparent;
      position: absolute;
      top: 10px;
    }
  `}

  ${props => props.$theme === 'wmp9' && css`
    width: 7px;
    height: 9px;
    background: #cbd7e7;
    box-shadow: inset 1px 0 #bbbec0, inset -1px 0 #c8d0d9, inset 0 1px #e4ebf5, inset 0 -1px #e4ebf5, inset 2px 0 #fafbfd;
    margin-right: 8px;
    border-style: solid;
    border-width: 0 1px 0 1px;
    border-color: transparent #58736f transparent #646f7e;

    &:after, &:before {
      content: " ";
      width: 7px;
      height: 3px;
      background: #1ab919;
      position: absolute;
      border-style: solid;
      left: -1px;
    }

    &:before {
      box-shadow: inset 0 1px 1px #ace1aa;
      border-radius: 3px 3px 0 0;
      top: -3px;
      border-width: 1px 1px 0 1px;
      border-color: #646f7e #6c817b transparent #737986;
    }

    &:after {
      box-shadow: inset 1px 0 1px #94d392;
      border-radius: 0 0 3px 3px;
      top: 9px;
      border-width: 0 1px 1px 1px;
      border-color: #536d71 #5e6c7e #556478;
    }

    &:hover {
      border-color: transparent #72706c transparent #6a717f;

      &:after, &:before {
        background: #fc0;
      }

      &:before {
        box-shadow: inset 0 1px 1px #f4dbab;
      }

      &:after {
        box-shadow: inset 1px 0 1px #f9bb21;
      }
    }

    &:active {
      border-color: transparent #57716d transparent #66717f;

      &:after, &:before {
        background: #229512;
      }

      &:before {
        box-shadow: inset 0 1px 1px #9ed299;
      }

      &:after {
        box-shadow: inset 1px 0 1px #48a73c;
      }
    }
  `}
`;
