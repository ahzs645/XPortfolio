import React from 'react';
import { MSN_LOGO_PATH } from '../data/constants';

export default function WindowFrame({
  title,
  icon,
  onClose,
  onMinimize,
  onMaximize,
  dragRef,
  width,
  height,
  maxTitleWidth,
  style,
  children,
}) {
  return (
    <div className="xp-window" style={{ width, height, ...style }}>
      <div className="appheader" ref={dragRef}>
        <img className="app-icon" src={icon || MSN_LOGO_PATH} alt="" />
        <span className="title-text" style={maxTitleWidth ? { maxWidth: maxTitleWidth } : undefined}>{title}</span>
      </div>
      <div className="appcontrols">
        <button className="captionbutton min" title="Minimize" type="button" onClick={onMinimize}><div className="btn-icon" /></button>
        <button className="captionbutton max" title="Maximize" type="button" onClick={onMaximize}><div className="btn-icon" /></button>
        <button className="captionbutton closebtn" title="Close" type="button" onClick={onClose}><div className="btn-icon" /></button>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
}
