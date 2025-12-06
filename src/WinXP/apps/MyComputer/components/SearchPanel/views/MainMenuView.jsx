import React from 'react';
import { BalloonTitle, OptionsList, OptionItem, AlsoSection, AlsoTitle, AlsoItem } from '../styles';
import { ArrowIcon, HelpIcon, SearchComputerIcon, PreferencesIcon, DogIcon } from '../components/Icons';

function MainMenuView({ onSelectType, onSearchInternet, onShowPreferences, onClose }) {
  return (
    <>
      <BalloonTitle>What do you want to search for?</BalloonTitle>

      <OptionsList>
        <OptionItem onClick={() => onSelectType('pictures')}>
          <ArrowIcon />
          <span>Pictures, music, or video</span>
        </OptionItem>
        <OptionItem onClick={() => onSelectType('documents')}>
          <ArrowIcon />
          <span>Documents (word processing, spreadsheet, etc.)</span>
        </OptionItem>
        <OptionItem onClick={() => onSelectType('all')}>
          <ArrowIcon />
          <span>All files and folders</span>
        </OptionItem>
        <OptionItem onClick={() => onSelectType('computers')}>
          <ArrowIcon />
          <span>Computers or people</span>
        </OptionItem>
        <OptionItem onClick={() => onSelectType('help')}>
          <HelpIcon />
          <span>Information in Help and Support Center</span>
        </OptionItem>
      </OptionsList>

      <AlsoSection>
        <AlsoTitle>You may also want to...</AlsoTitle>
        <AlsoItem onClick={onSearchInternet}>
          <SearchComputerIcon />
          <span>Search the Internet</span>
        </AlsoItem>
        <AlsoItem onClick={onShowPreferences}>
          <PreferencesIcon />
          <span>Change preferences</span>
        </AlsoItem>
        <AlsoItem onClick={onClose}>
          <DogIcon />
          <span>Turn off animated character</span>
        </AlsoItem>
      </AlsoSection>
    </>
  );
}

export default MainMenuView;
