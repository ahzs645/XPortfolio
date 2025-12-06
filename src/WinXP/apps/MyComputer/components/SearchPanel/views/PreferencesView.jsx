import React from 'react';
import { BalloonTitle, OptionsList, OptionItem } from '../styles';
import { ArrowIcon } from '../components/Icons';

function PreferencesView({
  onShowIndexingService,
  onShowInternetBehavior,
  onShowCharacterSelect,
  showBalloonTips,
  setShowBalloonTips,
  autoCompleteOn,
  setAutoCompleteOn,
  onBackToHome,
  characterVisible,
  onToggleCharacter,
}) {
  const handleToggleBalloonTips = () => {
    setShowBalloonTips(!showBalloonTips);
    onBackToHome();
  };

  const handleToggleAutoComplete = () => {
    setAutoCompleteOn(!autoCompleteOn);
    onBackToHome();
  };

  return (
    <>
      <BalloonTitle>How do you want to use Search Companion?</BalloonTitle>

      <OptionsList>
        <OptionItem onClick={onToggleCharacter}>
          <ArrowIcon />
          <span>{characterVisible ? 'Without an animated screen character' : 'With an animated screen character'}</span>
        </OptionItem>
        {characterVisible && (
          <OptionItem onClick={onShowCharacterSelect}>
            <ArrowIcon />
            <span>With a different character</span>
          </OptionItem>
        )}
        <OptionItem onClick={onShowIndexingService}>
          <ArrowIcon />
          <span>With Indexing Service (for faster local searches)</span>
        </OptionItem>
        <OptionItem onClick={onShowIndexingService}>
          <ArrowIcon />
          <span>Change files and folders search behavior</span>
        </OptionItem>
        <OptionItem onClick={onShowInternetBehavior}>
          <ArrowIcon />
          <span>Change Internet search behavior</span>
        </OptionItem>
        <OptionItem onClick={handleToggleBalloonTips}>
          <ArrowIcon />
          <span>{showBalloonTips ? "Don't show balloon tips" : "Show balloon tips"}</span>
        </OptionItem>
        <OptionItem onClick={handleToggleAutoComplete}>
          <ArrowIcon />
          <span>{autoCompleteOn ? 'Turn AutoComplete off' : 'Turn AutoComplete on'}</span>
        </OptionItem>
      </OptionsList>
    </>
  );
}

export default PreferencesView;
