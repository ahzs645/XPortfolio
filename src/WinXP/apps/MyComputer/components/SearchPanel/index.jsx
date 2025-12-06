import React, { useState, useRef } from 'react';
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
} from './views';

function SearchPanel({ searchQuery, onSearchChange, onClose }) {
  const inputRef = useRef(null);
  const roverRef = useRef(null);

  const handleTurnOffCharacter = () => {
    roverRef.current?.triggerExit();
  };

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
  const [selectedCharacter, setSelectedCharacter] = useState('rover');

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
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
        />
      );
    }

    if (showPreferences) {
      return (
        <PreferencesView
          onClose={onClose}
          onShowIndexingService={() => setShowIndexingService(true)}
          onShowInternetBehavior={() => setShowInternetBehavior(true)}
          onShowCharacterSelect={() => setShowCharacterSelect(true)}
          showBalloonTips={showBalloonTips}
          setShowBalloonTips={setShowBalloonTips}
          autoCompleteOn={autoCompleteOn}
          setAutoCompleteOn={setAutoCompleteOn}
          onBackToHome={handleBackToHome}
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
        onClose={onClose}
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
      return (
        <ButtonRow>
          <XPButton onClick={() => setShowCharacterSelect(false)}>OK</XPButton>
          <XPButton onClick={() => setShowCharacterSelect(false)}>Cancel</XPButton>
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

  return (
    <Container>
      <Content>
        <Balloon>
          <BalloonInner>
            <BalloonContent>
              {renderContent()}
            </BalloonContent>
            {renderButtons()}
          </BalloonInner>
          <BalloonTip />
        </Balloon>
        <RoverAnimation ref={roverRef} onExitComplete={onClose} />
      </Content>
    </Container>
  );
}

export default SearchPanel;
