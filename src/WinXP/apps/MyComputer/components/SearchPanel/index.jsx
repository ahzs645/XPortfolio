import React, { useState, useRef, useCallback } from 'react';
import {
  Container,
  Content,
  Balloon,
  BalloonInner,
  BalloonContent,
  BalloonTip,
  ButtonRow,
  XPButton,
} from './styles';
import { RoverAnimation } from './components';
import {
  MainMenuView,
  PicturesSearchView,
  DocumentsSearchView,
  AllFilesSearchView,
  ComputersSearchView,
  PreferencesView,
  IndexingServiceView,
  InternetBehaviorView,
  CharacterSelectView,
  CHARACTERS,
} from './views';

function SearchPanel({ searchQuery, onSearchChange, onClose }) {
  const inputRef = useRef(null);
  const characterRef = useRef(null);

  // Active character (the one shown at the bottom)
  const [activeCharacterId, setActiveCharacterId] = useState('rover');
  const [characterHeight, setCharacterHeight] = useState(100);
  const [pendingCharacterId, setPendingCharacterId] = useState(null); // Character to switch to after exit

  // Get the active character object
  const activeCharacter = CHARACTERS.find(c => c.id === activeCharacterId) || CHARACTERS[0];

  // Track if character is visible and if it's currently exiting/entering
  const [characterVisible, setCharacterVisible] = useState(true);
  const [characterExiting, setCharacterExiting] = useState(false);
  const [characterEntering, setCharacterEntering] = useState(false);
  const [characterSwapping, setCharacterSwapping] = useState(false); // Swapping characters (balloon stays visible)
  const [characterKey, setCharacterKey] = useState(0); // Force remount on turn on

  const handleTurnOffCharacter = useCallback(() => {
    setCharacterExiting(true); // Hide balloon while character exits
    characterRef.current?.triggerExit();
  }, []);

  const handleTurnOnCharacter = useCallback(() => {
    setCharacterEntering(true); // Hide balloon while character enters
    setCharacterVisible(true); // Show character (will play Show animation)
    setCharacterKey(k => k + 1); // Force RoverAnimation to remount fresh
    setShowPreferences(false); // Go back to main menu
  }, []);

  const handleToggleCharacter = useCallback(() => {
    if (characterVisible) {
      handleTurnOffCharacter();
    } else {
      handleTurnOnCharacter();
    }
  }, [characterVisible, handleTurnOffCharacter, handleTurnOnCharacter]);

  const handleCharacterExitComplete = useCallback(() => {
    // Check if we're switching to a new character
    if (pendingCharacterId) {
      // Switch to new character and play enter animation
      setActiveCharacterId(pendingCharacterId);
      setPendingCharacterId(null);
      setCharacterExiting(false);
      // Keep swapping true - will be set to false when Show animation completes
      setCharacterKey(k => k + 1); // Force remount with new character
    } else {
      // Just turning off character
      setCharacterVisible(false);
      setCharacterExiting(false);
      setCharacterSwapping(false);
    }
  }, [pendingCharacterId]);

  const handleCharacterShowComplete = useCallback(() => {
    setCharacterEntering(false); // Show balloon again (with tail)
    setCharacterSwapping(false); // Swap complete
  }, []);

  // Main navigation state
  const [searchType, setSearchType] = useState(null);

  // Checkboxes for pictures search
  const [picturesChecked, setPicturesChecked] = useState(false);
  const [musicChecked, setMusicChecked] = useState(false);
  const [videoChecked, setVideoChecked] = useState(false);

  // Radio for documents search - date filter
  const [dateFilter, setDateFilter] = useState('dont-remember');

  // All files search - additional input
  const [phraseQuery, setPhraseQuery] = useState('');
  const [lookIn, setLookIn] = useState('My Pictures');

  // Collapsible sections
  const [whenModifiedOpen, setWhenModifiedOpen] = useState(false);
  const [whatSizeOpen, setWhatSizeOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Documents advanced search toggle
  const [docAdvancedOpen, setDocAdvancedOpen] = useState(false);

  // Computers sub-view
  const [computersSubView, setComputersSubView] = useState(null);
  const [computerName, setComputerName] = useState('');
  const [sampleQuestion, setSampleQuestion] = useState('Buy a book online');

  // Preferences view
  const [showPreferences, setShowPreferences] = useState(false);
  const [autoCompleteOn, setAutoCompleteOn] = useState(true);
  const [showBalloonTips, setShowBalloonTips] = useState(true);

  // Internet search behavior view
  const [showInternetBehavior, setShowInternetBehavior] = useState(false);
  const [searchCompanionMode, setSearchCompanionMode] = useState('companion');
  const [defaultSearchEngine, setDefaultSearchEngine] = useState('MSN');

  // Indexing service view
  const [showIndexingService, setShowIndexingService] = useState(false);
  const [indexingEnabled, setIndexingEnabled] = useState(false);

  // Character select view
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [previewCharacterId, setPreviewCharacterId] = useState('rover'); // For browsing in selection view

  // When was it modified filters
  const [modifiedFilter, setModifiedFilter] = useState('dont-remember');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSearchOptionClick = (option) => {
    const validOptions = ['pictures', 'documents', 'all', 'computers'];
    if (validOptions.includes(option)) {
      setSearchType(option);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (searchType === 'computers' && computersSubView) {
        setComputersSubView(null);
        setComputerName('');
        onSearchChange('');
      } else if (searchType) {
        setSearchType(null);
        setComputersSubView(null);
        onSearchChange('');
      } else {
        onClose();
      }
    }
  };

  const handleInternetKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
    handleKeyDown(e);
  };

  const handleBackToHome = () => {
    setShowPreferences(false);
    setSearchType(null);
    setComputersSubView(null);
  };

  // Render the current view content
  const renderContent = () => {
    if (showIndexingService) {
      return (
        <IndexingServiceView
          indexingEnabled={indexingEnabled}
          setIndexingEnabled={setIndexingEnabled}
        />
      );
    }

    if (showInternetBehavior) {
      return (
        <InternetBehaviorView
          searchCompanionMode={searchCompanionMode}
          setSearchCompanionMode={setSearchCompanionMode}
          defaultSearchEngine={defaultSearchEngine}
          setDefaultSearchEngine={setDefaultSearchEngine}
        />
      );
    }

    if (showCharacterSelect) {
      return (
        <CharacterSelectView
          previewCharacter={previewCharacterId}
          setPreviewCharacter={setPreviewCharacterId}
        />
      );
    }

    if (showPreferences) {
      return (
        <PreferencesView
          onShowIndexingService={() => setShowIndexingService(true)}
          onShowInternetBehavior={() => setShowInternetBehavior(true)}
          onShowCharacterSelect={() => {
            setPreviewCharacterId(activeCharacterId); // Start preview at current active character
            setShowCharacterSelect(true);
          }}
          showBalloonTips={showBalloonTips}
          setShowBalloonTips={setShowBalloonTips}
          autoCompleteOn={autoCompleteOn}
          setAutoCompleteOn={setAutoCompleteOn}
          onBackToHome={handleBackToHome}
          characterVisible={characterVisible}
          onToggleCharacter={handleToggleCharacter}
        />
      );
    }

    if (searchType === 'pictures') {
      return (
        <PicturesSearchView
          inputRef={inputRef}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onKeyDown={handleKeyDown}
          picturesChecked={picturesChecked}
          setPicturesChecked={setPicturesChecked}
          musicChecked={musicChecked}
          setMusicChecked={setMusicChecked}
          videoChecked={videoChecked}
          setVideoChecked={setVideoChecked}
        />
      );
    }

    if (searchType === 'documents') {
      return (
        <DocumentsSearchView
          inputRef={inputRef}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onKeyDown={handleKeyDown}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          whenModifiedOpen={whenModifiedOpen}
          setWhenModifiedOpen={setWhenModifiedOpen}
          whatSizeOpen={whatSizeOpen}
          setWhatSizeOpen={setWhatSizeOpen}
          advancedOpen={advancedOpen}
          setAdvancedOpen={setAdvancedOpen}
          docAdvancedOpen={docAdvancedOpen}
          setDocAdvancedOpen={setDocAdvancedOpen}
          phraseQuery={phraseQuery}
          setPhraseQuery={setPhraseQuery}
          lookIn={lookIn}
          setLookIn={setLookIn}
        />
      );
    }

    if (searchType === 'all') {
      return (
        <AllFilesSearchView
          inputRef={inputRef}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onKeyDown={handleKeyDown}
          phraseQuery={phraseQuery}
          setPhraseQuery={setPhraseQuery}
          lookIn={lookIn}
          setLookIn={setLookIn}
          whenModifiedOpen={whenModifiedOpen}
          setWhenModifiedOpen={setWhenModifiedOpen}
          modifiedFilter={modifiedFilter}
          setModifiedFilter={setModifiedFilter}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          whatSizeOpen={whatSizeOpen}
          setWhatSizeOpen={setWhatSizeOpen}
          advancedOpen={advancedOpen}
          setAdvancedOpen={setAdvancedOpen}
        />
      );
    }

    if (searchType === 'computers') {
      return (
        <ComputersSearchView
          computersSubView={computersSubView}
          inputRef={inputRef}
          computerName={computerName}
          setComputerName={setComputerName}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onKeyDown={handleInternetKeyDown}
          sampleQuestion={sampleQuestion}
          onSelectComputer={() => {
            setComputersSubView('computer');
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          onSelectPeople={() => {}}
          onSearchInternet={() => {
            setComputersSubView('internet');
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          onSearchFiles={() => {
            setSearchType('all');
            setComputersSubView(null);
          }}
          onShowPreferences={() => setShowPreferences(true)}
          onClose={onClose}
          onSampleClick={() => {
            onSearchChange(sampleQuestion);
            setComputersSubView('internet-refine');
          }}
          onStartNewSearch={() => {
            setSampleQuestion('upgrade to windows 10');
            setComputersSubView('internet');
            onSearchChange('');
          }}
        />
      );
    }

    // Default: Main menu
    return (
      <MainMenuView
        onSelectType={handleSearchOptionClick}
        onSearchInternet={() => {
          setSearchType('computers');
          setComputersSubView('internet');
        }}
        onShowPreferences={() => setShowPreferences(true)}
        onTurnOffCharacter={handleTurnOffCharacter}
        characterVisible={characterVisible}
      />
    );
  };

  // Render button row based on current view
  const renderButtons = () => {
    if (searchType === 'pictures' || searchType === 'documents' || searchType === 'all') {
      return (
        <ButtonRow>
          <XPButton onClick={() => { setSearchType(null); onSearchChange(''); setPhraseQuery(''); }}>Back</XPButton>
          <XPButton onClick={() => onSearchChange(searchQuery)}>Search</XPButton>
        </ButtonRow>
      );
    }

    if (searchType === 'computers' && computersSubView === 'computer') {
      return (
        <ButtonRow style={{ justifyContent: 'flex-end' }}>
          <XPButton onClick={() => console.log('Search for:', computerName)}>Search</XPButton>
        </ButtonRow>
      );
    }

    if (searchType === 'computers' && computersSubView === 'internet') {
      return (
        <ButtonRow style={{ justifyContent: 'flex-end' }}>
          <XPButton onClick={() => window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')}>Search</XPButton>
        </ButtonRow>
      );
    }

    if (searchType === 'computers' && computersSubView === 'internet-refine') {
      return (
        <ButtonRow>
          <XPButton onClick={() => setComputersSubView('internet')}>Back</XPButton>
          <XPButton onClick={() => window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')}>Search</XPButton>
        </ButtonRow>
      );
    }

    if (searchType === 'computers' && !computersSubView) {
      return (
        <ButtonRow style={{ justifyContent: 'flex-start' }}>
          <XPButton onClick={() => setSearchType(null)}>Back</XPButton>
        </ButtonRow>
      );
    }

    if (showPreferences && !showIndexingService && !showInternetBehavior && !showCharacterSelect) {
      return (
        <ButtonRow style={{ justifyContent: 'flex-end' }}>
          <XPButton onClick={() => setShowPreferences(false)}>Back</XPButton>
        </ButtonRow>
      );
    }

    if (showCharacterSelect) {
      const handleOK = () => {
        setShowCharacterSelect(false);
        // If a different character was selected, trigger the transition
        if (previewCharacterId !== activeCharacterId) {
          setPendingCharacterId(previewCharacterId);
          setCharacterSwapping(true); // Swapping - balloon stays visible
          setCharacterExiting(true);
          characterRef.current?.triggerExit();
        }
      };

      const handleCancel = () => {
        setShowCharacterSelect(false);
        setPreviewCharacterId(activeCharacterId); // Reset preview
      };

      return (
        <ButtonRow>
          <XPButton onClick={handleOK}>OK</XPButton>
          <XPButton onClick={handleCancel}>Cancel</XPButton>
        </ButtonRow>
      );
    }

    if (showIndexingService) {
      return (
        <ButtonRow>
          <XPButton onClick={() => setShowIndexingService(false)}>OK</XPButton>
          <XPButton onClick={() => setShowIndexingService(false)}>Cancel</XPButton>
        </ButtonRow>
      );
    }

    if (showInternetBehavior) {
      return (
        <ButtonRow>
          <XPButton onClick={() => setShowInternetBehavior(false)}>OK</XPButton>
          <XPButton onClick={() => setShowInternetBehavior(false)}>Cancel</XPButton>
        </ButtonRow>
      );
    }

    return null;
  };

  // Hide balloon while character is entering or exiting (but NOT during swapping)
  const balloonHidden = !characterSwapping && (characterExiting || characterEntering);

  return (
    <Container>
      <Content style={balloonHidden ? { justifyContent: 'flex-end' } : undefined}>
        {/* Hide balloon while character is entering/exiting */}
        {!balloonHidden && (
          <Balloon style={{ maxHeight: `calc(100% - ${characterHeight + 16}px)` }}>
            <BalloonInner>
              <BalloonContent>
                {renderContent()}
              </BalloonContent>
              {renderButtons()}
            </BalloonInner>
            {characterVisible && <BalloonTip />}
          </Balloon>
        )}
        {/* Show character when visible, entering, or exiting */}
        {(characterVisible || characterExiting) && (
          <RoverAnimation
            key={characterKey}
            ref={characterRef}
            character={activeCharacter}
            onExitComplete={handleCharacterExitComplete}
            onShowComplete={handleCharacterShowComplete}
            onHeightChange={setCharacterHeight}
          />
        )}
      </Content>
    </Container>
  );
}

export default SearchPanel;
