import { useState } from 'react';
import './WindowControls.css';

function WindowControls() {
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isMinHovered, setIsMinHovered] = useState(false);

  const handleClose = () => {
    // In a real app, this would close the window
    alert('Close button clicked!');
  };

  const handleMinimize = () => {
    // In a real app, this would minimize the window
    alert('Minimize button clicked!');
  };

  return (
    <div className="window-controls">
      <button
        className="window-btn btn-minimize"
        onClick={handleMinimize}
        onMouseEnter={() => setIsMinHovered(true)}
        onMouseLeave={() => setIsMinHovered(false)}
        title="Minimize"
        style={{
          backgroundImage: `url('/apps/wizard101/images/skin/${isMinHovered ? '004_IEND' : '002_image_2'}.png')`
        }}
      />
      <button
        className="window-btn btn-close"
        onClick={handleClose}
        onMouseEnter={() => setIsCloseHovered(true)}
        onMouseLeave={() => setIsCloseHovered(false)}
        title="Close"
        style={{
          backgroundImage: `url('/apps/wizard101/images/skin/${isCloseHovered ? '005_IEND' : '003_IEND'}.png')`
        }}
      />
    </div>
  );
}

export default WindowControls;
