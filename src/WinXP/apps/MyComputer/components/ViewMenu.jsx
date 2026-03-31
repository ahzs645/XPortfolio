import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { VIEW_MODES } from '../constants';
import { useUserSettings } from '../../../../contexts/UserSettingsContext';
import { getColorDepthFilter } from '../../../../utils/colorDepthEffects';
import { withBaseUrl } from '../../../../utils/baseUrl';
import { toDisplayLayerPoint } from '../../../../utils/displayCoordinates';
import { getXpPortalRoot } from '../../../../utils/portalRoot';

function ViewMenu({ viewMode, onViewChange, onClose, position }) {
  const { colorDepth } = useUserSettings();
  const menuRef = useRef(null);
  const normalizedPosition = toDisplayLayerPoint(position);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = (mode) => {
    onViewChange(mode);
    onClose();
  };

  return ReactDOM.createPortal(
    <Container
      ref={menuRef}
      $colorDepth={colorDepth}
      $top={normalizedPosition?.top}
      $left={normalizedPosition?.left}
    >
      <MenuItem
        $active={viewMode === VIEW_MODES.THUMBNAILS}
        onClick={() => handleSelect(VIEW_MODES.THUMBNAILS)}
      >
        <MenuIcon src={withBaseUrl('/gui/views/thumbnails.png')} alt="" onError={(e) => e.target.style.display = 'none'} />
        Thumbnails
      </MenuItem>
      <MenuItem
        $active={viewMode === VIEW_MODES.TILES}
        onClick={() => handleSelect(VIEW_MODES.TILES)}
      >
        <MenuIcon src={withBaseUrl('/gui/views/tiles.png')} alt="" onError={(e) => e.target.style.display = 'none'} />
        Tiles
      </MenuItem>
      <MenuItem
        $active={viewMode === VIEW_MODES.ICONS}
        onClick={() => handleSelect(VIEW_MODES.ICONS)}
      >
        <MenuIcon src={withBaseUrl('/gui/views/icons.png')} alt="" onError={(e) => e.target.style.display = 'none'} />
        Icons
      </MenuItem>
      <MenuItem
        $active={viewMode === VIEW_MODES.LIST}
        onClick={() => handleSelect(VIEW_MODES.LIST)}
      >
        <MenuIcon src={withBaseUrl('/gui/views/list.png')} alt="" onError={(e) => e.target.style.display = 'none'} />
        List
      </MenuItem>
      <MenuItem
        $active={viewMode === VIEW_MODES.DETAILS}
        onClick={() => handleSelect(VIEW_MODES.DETAILS)}
      >
        <MenuIcon src={withBaseUrl('/gui/views/details.png')} alt="" onError={(e) => e.target.style.display = 'none'} />
        Details
      </MenuItem>
    </Container>,
    getXpPortalRoot()
  );
}

const Container = styled.div`
  position: fixed;
  top: ${({ $top }) => $top != null ? `${$top}px` : '0'};
  left: ${({ $left }) => $left != null ? `${$left}px` : '0'};
  background: white;
  border: 1px solid #808080;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  filter: ${({ $colorDepth }) => getColorDepthFilter($colorDepth) || 'none'};
  z-index: 10001;
  min-width: 100px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  font-size: 11px;
  cursor: pointer;
  background: ${({ $active }) => $active ? '#316ac5' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : 'black'};
  &:hover {
    background: ${({ $active }) => $active ? '#316ac5' : '#e8e8e8'};
  }
`;

const MenuIcon = styled.img`
  width: 16px;
  height: 16px;
`;

export default ViewMenu;
