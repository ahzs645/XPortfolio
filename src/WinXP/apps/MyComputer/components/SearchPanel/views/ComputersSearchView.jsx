import React from 'react';
import {
  BalloonTitle,
  OptionsList,
  OptionItem,
  InputLabel,
  SearchInput,
  SearchTextarea,
  AlsoSection,
  AlsoTitle,
  AlsoItem,
  SampleSection,
  SampleTitle,
} from '../styles';
import {
  ArrowIcon,
  SearchComputerIcon,
  PreferencesIcon,
  DogIcon,
  HighlightIcon,
  NewSearchIcon,
} from '../components/Icons';

// Sub-views for computers search
function ComputerNetworkView({ inputRef, computerName, setComputerName, onKeyDown, onSearchFiles, onSearchInternet }) {
  return (
    <>
      <BalloonTitle>Which computer are you looking for?</BalloonTitle>

      <InputLabel>Computer name:</InputLabel>
      <SearchInput
        ref={inputRef}
        type="text"
        value={computerName}
        onChange={(e) => setComputerName(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <AlsoSection>
        <AlsoTitle>You may also want to...</AlsoTitle>
        <AlsoItem onClick={onSearchFiles}>
          <SearchComputerIcon />
          <span>Search this computer for files</span>
        </AlsoItem>
        <AlsoItem onClick={onSearchInternet}>
          <SearchComputerIcon />
          <span>Search the Internet</span>
        </AlsoItem>
      </AlsoSection>
    </>
  );
}

function InternetSearchView({
  inputRef,
  searchQuery,
  onSearchChange,
  onKeyDown,
  sampleQuestion,
  onSampleClick,
  onSearchFiles,
  onShowPreferences,
  onClose,
}) {
  return (
    <>
      <BalloonTitle>What are you looking for?</BalloonTitle>

      <InputLabel>Type your question below. For best results, use complete sentences.</InputLabel>
      <SearchTextarea
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Please type your query here, then press <Enter>."
      />

      <SampleSection>
        <SampleTitle>Sample question:</SampleTitle>
        <OptionItem onClick={onSampleClick}>
          <ArrowIcon />
          <span>{sampleQuestion}</span>
        </OptionItem>
      </SampleSection>

      <AlsoSection>
        <AlsoTitle>You may also want to...</AlsoTitle>
        <AlsoItem onClick={onSearchFiles}>
          <SearchComputerIcon />
          <span>Search this computer for files</span>
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

function InternetRefineView({ inputRef, searchQuery, onSearchChange, onKeyDown, onStartNewSearch }) {
  return (
    <>
      <BalloonTitle>What would you like to do?</BalloonTitle>

      <OptionsList>
        <OptionItem>
          <ArrowIcon />
          <span>Find a legal document about Buy</span>
        </OptionItem>
        <OptionItem>
          <ArrowIcon />
          <span>Find a legal document</span>
        </OptionItem>
        <OptionItem>
          <ArrowIcon />
          <span>Find software reviews, instructions, etc.</span>
        </OptionItem>
        <OptionItem>
          <ArrowIcon />
          <span>Automatically send your search to other search engines</span>
        </OptionItem>
        <OptionItem>
          <HighlightIcon />
          <span>Highlight words on the results page</span>
        </OptionItem>
      </OptionsList>

      <InputLabel>Change current search:</InputLabel>
      <SearchTextarea
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <OptionItem onClick={onStartNewSearch}>
        <NewSearchIcon />
        <span>Start a new search</span>
      </OptionItem>
    </>
  );
}

function ComputersMenuView({ onSelectComputer, onSelectPeople, onSearchInternet }) {
  return (
    <>
      <BalloonTitle>What are you looking for?</BalloonTitle>

      <OptionsList>
        <OptionItem onClick={onSelectComputer}>
          <ArrowIcon />
          <span>A computer on the network</span>
        </OptionItem>
        <OptionItem onClick={onSelectPeople}>
          <ArrowIcon />
          <span>People in your address book</span>
        </OptionItem>
      </OptionsList>

      <AlsoSection>
        <AlsoTitle>You may also want to...</AlsoTitle>
        <AlsoItem onClick={onSearchInternet}>
          <SearchComputerIcon />
          <span>Search the Internet</span>
        </AlsoItem>
      </AlsoSection>
    </>
  );
}

function ComputersSearchView({
  computersSubView,
  inputRef,
  computerName,
  setComputerName,
  searchQuery,
  onSearchChange,
  onKeyDown,
  sampleQuestion,
  onSelectComputer,
  onSelectPeople,
  onSearchInternet,
  onSearchFiles,
  onShowPreferences,
  onClose,
  onSampleClick,
  onStartNewSearch,
}) {
  if (computersSubView === 'computer') {
    return (
      <ComputerNetworkView
        inputRef={inputRef}
        computerName={computerName}
        setComputerName={setComputerName}
        onKeyDown={onKeyDown}
        onSearchFiles={onSearchFiles}
        onSearchInternet={onSearchInternet}
      />
    );
  }

  if (computersSubView === 'internet-refine') {
    return (
      <InternetRefineView
        inputRef={inputRef}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onKeyDown={onKeyDown}
        onStartNewSearch={onStartNewSearch}
      />
    );
  }

  if (computersSubView === 'internet') {
    return (
      <InternetSearchView
        inputRef={inputRef}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onKeyDown={onKeyDown}
        sampleQuestion={sampleQuestion}
        onSampleClick={onSampleClick}
        onSearchFiles={onSearchFiles}
        onShowPreferences={onShowPreferences}
        onClose={onClose}
      />
    );
  }

  return (
    <ComputersMenuView
      onSelectComputer={onSelectComputer}
      onSelectPeople={onSelectPeople}
      onSearchInternet={onSearchInternet}
    />
  );
}

export default ComputersSearchView;
