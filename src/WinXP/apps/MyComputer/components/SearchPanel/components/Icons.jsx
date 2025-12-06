import styled from 'styled-components';

export const ArrowIcon = styled.img.attrs({
  src: '/gui/toolbar/go.webp',
  alt: 'go',
  draggable: false,
})`
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

export const HelpIcon = styled.img.attrs({
  src: '/icons/help.png',
  alt: 'Help',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

export const PreferencesIcon = styled.img.attrs({
  src: '/icons/search/preferences.ico',
  alt: 'preferences',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

export const DogIcon = styled.img.attrs({
  src: '/icons/search/turn-off-character.png',
  alt: 'turn off',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

export const HighlightIcon = styled.img.attrs({
  src: '/icons/search/highlight.ico',
  alt: 'highlight',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

export const NewSearchIcon = styled.img.attrs({
  src: '/icons/search/new-search.ico',
  alt: 'new search',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

export const SearchComputerIcon = styled.img.attrs({
  src: '/icons/search/search-computer.ico',
  alt: 'search computer',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

export const ChevronIcon = styled.img.attrs({
  src: '/apps/about/pulldown.webp',
  alt: '',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.15s ease;
`;

export const IndexingSettingsIcon = styled.img.attrs({
  src: '/icons/search/indexing-settings.ico',
  alt: 'indexing settings',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;
