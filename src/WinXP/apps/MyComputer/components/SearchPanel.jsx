import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// Rover sprite sheet is 2160x2160, each frame is 80x80
// Show animation - Rover appears/digs up from ground
const ROVER_SHOW_FRAMES = [
  [1440, 1440], [1520, 1440], [1600, 1440], [1680, 1440], [1760, 1440],
  [1840, 1440], [1920, 1440], [2000, 1440], [2080, 1440], [0, 1520],
  [80, 1520], [160, 1520], [240, 1520], [320, 1520], [400, 1520],
  [480, 1520], [560, 1520], [640, 1520], [720, 1520], [800, 1520],
  [0, 0], // End on idle pose
];

// Idle animation frames
const ROVER_IDLE_FRAMES = [
  [0, 0], [0, 0], [960, 800], [1040, 800], [0, 0],
  [1120, 800], [1200, 800], [1280, 800], [1360, 800],
];

function SearchPanel({ searchQuery, onSearchChange, onClose }) {
  const inputRef = useRef(null);
  const [animationState, setAnimationState] = useState('show');
  const [frameIndex, setFrameIndex] = useState(0);
  const [roverPosition, setRoverPosition] = useState(ROVER_SHOW_FRAMES[0]);
  const [searchType, setSearchType] = useState(null); // null = menu, string = search view

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

  // Computers sub-view (null = menu, 'computer' = network computer, 'internet' = search internet, 'internet-refine' = refine search)
  const [computersSubView, setComputersSubView] = useState(null);
  const [computerName, setComputerName] = useState('');
  const [sampleQuestion, setSampleQuestion] = useState('Buy a book online');

  // Preferences view
  const [showPreferences, setShowPreferences] = useState(false);
  const [autoCompleteOn, setAutoCompleteOn] = useState(true);
  const [showBalloonTips, setShowBalloonTips] = useState(true);

  // Internet search behavior modal
  const [showInternetBehavior, setShowInternetBehavior] = useState(false);
  const [searchCompanionMode, setSearchCompanionMode] = useState('companion');
  const [defaultSearchEngine, setDefaultSearchEngine] = useState('MSN');

  // When was it modified filters
  const [modifiedFilter, setModifiedFilter] = useState('dont-remember');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Animation controller
  useEffect(() => {
    const duration = animationState === 'show' ? 100 : 300;

    const interval = setInterval(() => {
      setFrameIndex(prev => {
        const next = prev + 1;

        if (animationState === 'show') {
          if (next >= ROVER_SHOW_FRAMES.length) {
            setAnimationState('idle');
            setRoverPosition([0, 0]);
            return 0;
          }
          setRoverPosition(ROVER_SHOW_FRAMES[next]);
          return next;
        } else {
          const loopIndex = next % ROVER_IDLE_FRAMES.length;
          setRoverPosition(ROVER_IDLE_FRAMES[loopIndex]);
          return loopIndex;
        }
      });
    }, duration);

    return () => clearInterval(interval);
  }, [animationState]);

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

  return (
    <Container>
      <Content>
        {/* Speech Balloon */}
        <Balloon>
          <BalloonInner>
          <BalloonContent>
            {showPreferences ? (
              <>
                <BalloonTitle>How do you want to use Search Companion?</BalloonTitle>

                <OptionsList>
                  <OptionItem onClick={onClose}>
                    <ArrowIcon />
                    <span>Without an animated screen character</span>
                  </OptionItem>
                  <OptionItem>
                    <ArrowIcon />
                    <span>With a different character</span>
                  </OptionItem>
                  <OptionItem>
                    <ArrowIcon />
                    <span>With Indexing Service (for faster local searches)</span>
                  </OptionItem>
                  <OptionItem>
                    <ArrowIcon />
                    <span>Change files and folders search behavior</span>
                  </OptionItem>
                  <OptionItem onClick={() => setShowInternetBehavior(true)}>
                    <ArrowIcon />
                    <span>Change Internet search behavior</span>
                  </OptionItem>
                  <OptionItem onClick={() => { setShowBalloonTips(!showBalloonTips); setShowPreferences(false); setSearchType(null); setComputersSubView(null); }}>
                    <ArrowIcon />
                    <span>{showBalloonTips ? "Don't show balloon tips" : "Show balloon tips"}</span>
                  </OptionItem>
                  <OptionItem onClick={() => { setAutoCompleteOn(!autoCompleteOn); setShowPreferences(false); setSearchType(null); setComputersSubView(null); }}>
                    <ArrowIcon />
                    <span>{autoCompleteOn ? 'Turn AutoComplete off' : 'Turn AutoComplete on'}</span>
                  </OptionItem>
                </OptionsList>
              </>
            ) : searchType === 'pictures' ? (
              <>
                <BalloonTitle>Search for all files of a certain type, or search by type and name.</BalloonTitle>

                <CheckboxGroup>
                  <CheckboxRow>
                    <input
                      type="checkbox"
                      id="search-pictures"
                      checked={picturesChecked}
                      onChange={(e) => setPicturesChecked(e.target.checked)}
                    />
                    <label htmlFor="search-pictures">Pictures and Photos</label>
                  </CheckboxRow>
                  <CheckboxRow>
                    <input
                      type="checkbox"
                      id="search-music"
                      checked={musicChecked}
                      onChange={(e) => setMusicChecked(e.target.checked)}
                    />
                    <label htmlFor="search-music">Music</label>
                  </CheckboxRow>
                  <CheckboxRow>
                    <input
                      type="checkbox"
                      id="search-video"
                      checked={videoChecked}
                      onChange={(e) => setVideoChecked(e.target.checked)}
                    />
                    <label htmlFor="search-video">Video</label>
                  </CheckboxRow>
                </CheckboxGroup>

                <InputLabel>All or part of the file name:</InputLabel>
                <SearchInput
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <AlsoSection>
                  <AlsoTitle>You may also want to...</AlsoTitle>
                  <AlsoItem>
                    <PreferencesIcon />
                    <span>Use advanced search options</span>
                  </AlsoItem>
                </AlsoSection>
              </>
            ) : searchType === 'documents' ? (
              <>
                <BalloonTitle>Search by any or all of the criteria below.</BalloonTitle>

                <CollapsibleRow onClick={() => setWhenModifiedOpen(!whenModifiedOpen)}>
                  <span>Last time it was modified:</span>
                  <ChevronIcon $open={whenModifiedOpen} />
                </CollapsibleRow>
                {whenModifiedOpen && (
                  <CollapsibleContent>
                    <RadioGroup>
                      <RadioRow>
                        <input
                          type="radio"
                          id="doc-date-dont-remember"
                          name="docDateFilter"
                          value="dont-remember"
                          checked={dateFilter === 'dont-remember'}
                          onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <label htmlFor="doc-date-dont-remember">Don't remember</label>
                      </RadioRow>
                      <RadioRow>
                        <input
                          type="radio"
                          id="doc-date-last-week"
                          name="docDateFilter"
                          value="last-week"
                          checked={dateFilter === 'last-week'}
                          onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <label htmlFor="doc-date-last-week">Within the last week</label>
                      </RadioRow>
                      <RadioRow>
                        <input
                          type="radio"
                          id="doc-date-past-month"
                          name="docDateFilter"
                          value="past-month"
                          checked={dateFilter === 'past-month'}
                          onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <label htmlFor="doc-date-past-month">Past month</label>
                      </RadioRow>
                      <RadioRow>
                        <input
                          type="radio"
                          id="doc-date-past-year"
                          name="docDateFilter"
                          value="past-year"
                          checked={dateFilter === 'past-year'}
                          onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <label htmlFor="doc-date-past-year">Within the past year</label>
                      </RadioRow>
                    </RadioGroup>
                  </CollapsibleContent>
                )}

                <InputLabel>All or part of the document name:</InputLabel>
                <SearchInput
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {docAdvancedOpen && (
                  <>
                    <InputLabel>A word or phrase in the document:</InputLabel>
                    <SearchInput
                      type="text"
                      value={phraseQuery}
                      onChange={(e) => setPhraseQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />

                    <InputLabel>Look in:</InputLabel>
                    <SelectInput value={lookIn} onChange={(e) => setLookIn(e.target.value)}>
                      <option value="Shared Documents">Shared Documents</option>
                      <option value="My Documents">My Documents</option>
                      <option value="My Computer">My Computer</option>
                      <option value="Local Disk (C:)">Local Disk (C:)</option>
                    </SelectInput>

                    <CollapsibleRow onClick={() => setWhatSizeOpen(!whatSizeOpen)}>
                      <span>What size is it?</span>
                      <ChevronIcon $open={whatSizeOpen} />
                    </CollapsibleRow>
                    {whatSizeOpen && (
                      <CollapsibleContent>
                        <RadioGroup>
                          <RadioRow>
                            <input type="radio" id="doc-size-any" name="docSizeFilter" defaultChecked />
                            <label htmlFor="doc-size-any">Don't remember</label>
                          </RadioRow>
                          <RadioRow>
                            <input type="radio" id="doc-size-small" name="docSizeFilter" />
                            <label htmlFor="doc-size-small">Small (less than 100 KB)</label>
                          </RadioRow>
                          <RadioRow>
                            <input type="radio" id="doc-size-medium" name="docSizeFilter" />
                            <label htmlFor="doc-size-medium">Medium (less than 1 MB)</label>
                          </RadioRow>
                          <RadioRow>
                            <input type="radio" id="doc-size-large" name="docSizeFilter" />
                            <label htmlFor="doc-size-large">Large (more than 1 MB)</label>
                          </RadioRow>
                          <RadioRow>
                            <input type="radio" id="doc-size-specify" name="docSizeFilter" />
                            <label htmlFor="doc-size-specify">Specify size (in KB)</label>
                          </RadioRow>
                        </RadioGroup>
                        <SizeSpecifyRow>
                          <SelectInput style={{ width: '80px', marginBottom: 0 }}>
                            <option>at least</option>
                            <option>at most</option>
                          </SelectInput>
                          <SizeInput type="text" placeholder="0" />
                        </SizeSpecifyRow>
                      </CollapsibleContent>
                    )}

                    <CollapsibleRow onClick={() => setAdvancedOpen(!advancedOpen)}>
                      <span>More advanced options</span>
                      <ChevronIcon $open={advancedOpen} />
                    </CollapsibleRow>
                    {advancedOpen && (
                      <CollapsibleContent>
                        <CheckboxRow>
                          <input type="checkbox" id="doc-adv-system" />
                          <label htmlFor="doc-adv-system">Search system folders</label>
                        </CheckboxRow>
                        <CheckboxRow>
                          <input type="checkbox" id="doc-adv-hidden" />
                          <label htmlFor="doc-adv-hidden">Search hidden files and folders</label>
                        </CheckboxRow>
                        <CheckboxRow>
                          <input type="checkbox" id="doc-adv-subfolders" defaultChecked />
                          <label htmlFor="doc-adv-subfolders">Search subfolders</label>
                        </CheckboxRow>
                        <CheckboxRow>
                          <input type="checkbox" id="doc-adv-case" />
                          <label htmlFor="doc-adv-case">Case sensitive</label>
                        </CheckboxRow>
                        <CheckboxRow>
                          <input type="checkbox" id="doc-adv-tape" />
                          <label htmlFor="doc-adv-tape">Search tape backup</label>
                        </CheckboxRow>
                      </CollapsibleContent>
                    )}
                  </>
                )}

                {!docAdvancedOpen && (
                  <AlsoSection>
                    <AlsoTitle>You may also want to...</AlsoTitle>
                    <AlsoItem onClick={() => setDocAdvancedOpen(true)}>
                      <PreferencesIcon />
                      <span>Use advanced search options</span>
                    </AlsoItem>
                  </AlsoSection>
                )}
              </>
            ) : searchType === 'all' ? (
              <>
                <BalloonTitle>Search by any or all of the criteria below.</BalloonTitle>

                <InputLabel>All or part of the file name:</InputLabel>
                <SearchInput
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <InputLabel>A word or phrase in the file:</InputLabel>
                <SearchInput
                  type="text"
                  value={phraseQuery}
                  onChange={(e) => setPhraseQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <InputLabel>Look in:</InputLabel>
                <SelectInput value={lookIn} onChange={(e) => setLookIn(e.target.value)}>
                  <option value="My Pictures">My Pictures</option>
                  <option value="My Documents">My Documents</option>
                  <option value="My Computer">My Computer</option>
                  <option value="Local Disk (C:)">Local Disk (C:)</option>
                </SelectInput>

                <CollapsibleRow onClick={() => setWhenModifiedOpen(!whenModifiedOpen)}>
                  <span>When was it modified?</span>
                  <ChevronIcon $open={whenModifiedOpen} />
                </CollapsibleRow>
                {whenModifiedOpen && (
                  <CollapsibleContent>
                    <RadioGroup>
                      <RadioRow>
                        <input
                          type="radio"
                          id="mod-dont-remember"
                          name="modifiedFilter"
                          value="dont-remember"
                          checked={modifiedFilter === 'dont-remember'}
                          onChange={(e) => setModifiedFilter(e.target.value)}
                        />
                        <label htmlFor="mod-dont-remember">Don't remember</label>
                      </RadioRow>
                      <RadioRow>
                        <input
                          type="radio"
                          id="mod-last-week"
                          name="modifiedFilter"
                          value="last-week"
                          checked={modifiedFilter === 'last-week'}
                          onChange={(e) => setModifiedFilter(e.target.value)}
                        />
                        <label htmlFor="mod-last-week">Within the last week</label>
                      </RadioRow>
                      <RadioRow>
                        <input
                          type="radio"
                          id="mod-past-month"
                          name="modifiedFilter"
                          value="past-month"
                          checked={modifiedFilter === 'past-month'}
                          onChange={(e) => setModifiedFilter(e.target.value)}
                        />
                        <label htmlFor="mod-past-month">Past month</label>
                      </RadioRow>
                      <RadioRow>
                        <input
                          type="radio"
                          id="mod-past-year"
                          name="modifiedFilter"
                          value="past-year"
                          checked={modifiedFilter === 'past-year'}
                          onChange={(e) => setModifiedFilter(e.target.value)}
                        />
                        <label htmlFor="mod-past-year">Within the past year</label>
                      </RadioRow>
                      <RadioRow>
                        <input
                          type="radio"
                          id="mod-specify"
                          name="modifiedFilter"
                          value="specify"
                          checked={modifiedFilter === 'specify'}
                          onChange={(e) => setModifiedFilter(e.target.value)}
                        />
                        <label htmlFor="mod-specify">Specify dates</label>
                      </RadioRow>
                    </RadioGroup>
                    <SelectInput disabled={modifiedFilter !== 'specify'}>
                      <option>Modified Date</option>
                    </SelectInput>
                    <DateRow>
                      <span>from</span>
                      <DateInput
                        type="text"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="12/ 6/2025"
                        disabled={modifiedFilter !== 'specify'}
                      />
                    </DateRow>
                    <DateRow>
                      <span>to</span>
                      <DateInput
                        type="text"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="12/ 6/2025"
                        disabled={modifiedFilter !== 'specify'}
                      />
                    </DateRow>
                  </CollapsibleContent>
                )}

                <CollapsibleRow onClick={() => setWhatSizeOpen(!whatSizeOpen)}>
                  <span>What size is it?</span>
                  <ChevronIcon $open={whatSizeOpen} />
                </CollapsibleRow>
                {whatSizeOpen && (
                  <CollapsibleContent>
                    <RadioGroup>
                      <RadioRow>
                        <input type="radio" id="size-any" name="sizeFilter" defaultChecked />
                        <label htmlFor="size-any">Don't remember</label>
                      </RadioRow>
                      <RadioRow>
                        <input type="radio" id="size-small" name="sizeFilter" />
                        <label htmlFor="size-small">Small (less than 100 KB)</label>
                      </RadioRow>
                      <RadioRow>
                        <input type="radio" id="size-medium" name="sizeFilter" />
                        <label htmlFor="size-medium">Medium (less than 1 MB)</label>
                      </RadioRow>
                      <RadioRow>
                        <input type="radio" id="size-large" name="sizeFilter" />
                        <label htmlFor="size-large">Large (more than 1 MB)</label>
                      </RadioRow>
                      <RadioRow>
                        <input type="radio" id="size-specify" name="sizeFilter" />
                        <label htmlFor="size-specify">Specify size (in KB)</label>
                      </RadioRow>
                    </RadioGroup>
                    <SizeSpecifyRow>
                      <SelectInput style={{ width: '80px', marginBottom: 0 }}>
                        <option>at least</option>
                        <option>at most</option>
                      </SelectInput>
                      <SizeInput type="text" placeholder="0" />
                    </SizeSpecifyRow>
                  </CollapsibleContent>
                )}

                <CollapsibleRow onClick={() => setAdvancedOpen(!advancedOpen)}>
                  <span>More advanced options</span>
                  <ChevronIcon $open={advancedOpen} />
                </CollapsibleRow>
                {advancedOpen && (
                  <CollapsibleContent>
                    <InputLabel>Type of file:</InputLabel>
                    <SelectInput>
                      <option>(All Files and Folders)</option>
                      <option>Documents</option>
                      <option>Pictures</option>
                      <option>Music</option>
                      <option>Video</option>
                    </SelectInput>
                    <CheckboxRow>
                      <input type="checkbox" id="adv-system" defaultChecked />
                      <label htmlFor="adv-system">Search system folders</label>
                    </CheckboxRow>
                    <CheckboxRow>
                      <input type="checkbox" id="adv-hidden" />
                      <label htmlFor="adv-hidden">Search hidden files and folders</label>
                    </CheckboxRow>
                    <CheckboxRow>
                      <input type="checkbox" id="adv-subfolders" defaultChecked />
                      <label htmlFor="adv-subfolders">Search subfolders</label>
                    </CheckboxRow>
                    <CheckboxRow>
                      <input type="checkbox" id="adv-case" />
                      <label htmlFor="adv-case">Case sensitive</label>
                    </CheckboxRow>
                    <CheckboxRow>
                      <input type="checkbox" id="adv-tape" />
                      <label htmlFor="adv-tape">Search tape backup</label>
                    </CheckboxRow>
                  </CollapsibleContent>
                )}
              </>
            ) : searchType === 'computers' ? (
              computersSubView === 'computer' ? (
                <>
                  <BalloonTitle>Which computer are you looking for?</BalloonTitle>

                  <InputLabel>Computer name:</InputLabel>
                  <SearchInput
                    ref={inputRef}
                    type="text"
                    value={computerName}
                    onChange={(e) => setComputerName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <AlsoSection>
                    <AlsoTitle>You may also want to...</AlsoTitle>
                    <AlsoItem onClick={() => { setSearchType('all'); setComputersSubView(null); }}>
                      <SearchComputerIcon />
                      <span>Search this computer for files</span>
                    </AlsoItem>
                    <AlsoItem onClick={() => setComputersSubView('internet')}>
                      <SearchComputerIcon />
                      <span>Search the Internet</span>
                    </AlsoItem>
                  </AlsoSection>
                </>
              ) : computersSubView === 'internet-refine' ? (
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                      }
                      handleKeyDown(e);
                    }}
                  />

                  <OptionItem onClick={() => { setSampleQuestion('upgrade to windows 10'); setComputersSubView('internet'); onSearchChange(''); }}>
                    <NewSearchIcon />
                    <span>Start a new search</span>
                  </OptionItem>
                </>
              ) : computersSubView === 'internet' ? (
                <>
                  <BalloonTitle>What are you looking for?</BalloonTitle>

                  <InputLabel>Type your question below. For best results, use complete sentences.</InputLabel>
                  <SearchTextarea
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                      }
                      handleKeyDown(e);
                    }}
                    placeholder="Please type your query here, then press <Enter>."
                  />

                  <SampleSection>
                    <SampleTitle>Sample question:</SampleTitle>
                    <OptionItem onClick={() => { onSearchChange(sampleQuestion); setComputersSubView('internet-refine'); }}>
                      <ArrowIcon />
                      <span>{sampleQuestion}</span>
                    </OptionItem>
                  </SampleSection>

                  <AlsoSection>
                    <AlsoTitle>You may also want to...</AlsoTitle>
                    <AlsoItem onClick={() => { setSearchType('all'); setComputersSubView(null); }}>
                      <SearchComputerIcon />
                      <span>Search this computer for files</span>
                    </AlsoItem>
                    <AlsoItem onClick={() => setShowPreferences(true)}>
                      <PreferencesIcon />
                      <span>Change preferences</span>
                    </AlsoItem>
                    <AlsoItem onClick={onClose}>
                      <DogIcon />
                      <span>Turn off animated character</span>
                    </AlsoItem>
                  </AlsoSection>
                </>
              ) : (
                <>
                  <BalloonTitle>What are you looking for?</BalloonTitle>

                  <OptionsList>
                    <OptionItem onClick={() => { setComputersSubView('computer'); setTimeout(() => inputRef.current?.focus(), 100); }}>
                      <ArrowIcon />
                      <span>A computer on the network</span>
                    </OptionItem>
                    <OptionItem>
                      <ArrowIcon />
                      <span>People in your address book</span>
                    </OptionItem>
                  </OptionsList>

                  <AlsoSection>
                    <AlsoTitle>You may also want to...</AlsoTitle>
                    <AlsoItem onClick={() => { setComputersSubView('internet'); setTimeout(() => inputRef.current?.focus(), 100); }}>
                      <SearchComputerIcon />
                      <span>Search the Internet</span>
                    </AlsoItem>
                  </AlsoSection>
                </>
              )
            ) : (
              <>
                <BalloonTitle>What do you want to search for?</BalloonTitle>

                <OptionsList>
                  <OptionItem onClick={() => handleSearchOptionClick('pictures')}>
                    <ArrowIcon />
                    <span>Pictures, music, or video</span>
                  </OptionItem>
                  <OptionItem onClick={() => handleSearchOptionClick('documents')}>
                    <ArrowIcon />
                    <span>Documents (word processing, spreadsheet, etc.)</span>
                  </OptionItem>
                  <OptionItem onClick={() => handleSearchOptionClick('all')}>
                    <ArrowIcon />
                    <span>All files and folders</span>
                  </OptionItem>
                  <OptionItem onClick={() => handleSearchOptionClick('computers')}>
                    <ArrowIcon />
                    <span>Computers or people</span>
                  </OptionItem>
                  <OptionItem onClick={() => handleSearchOptionClick('help')}>
                    <HelpIcon />
                    <span>Information in Help and Support Center</span>
                  </OptionItem>
                </OptionsList>

                <AlsoSection>
                  <AlsoTitle>You may also want to...</AlsoTitle>
                  <AlsoItem onClick={() => { setSearchType('computers'); setComputersSubView('internet'); }}>
                    <SearchComputerIcon />
                    <span>Search the Internet</span>
                  </AlsoItem>
                  <AlsoItem onClick={() => setShowPreferences(true)}>
                    <PreferencesIcon />
                    <span>Change preferences</span>
                  </AlsoItem>
                  <AlsoItem onClick={onClose}>
                    <DogIcon />
                    <span>Turn off animated character</span>
                  </AlsoItem>
                </AlsoSection>
              </>
            )}
          </BalloonContent>
          {(searchType === 'pictures' || searchType === 'documents' || searchType === 'all') && (
            <ButtonRow>
              <XPButton onClick={() => { setSearchType(null); onSearchChange(''); setPhraseQuery(''); }}>Back</XPButton>
              <XPButton onClick={() => onSearchChange(searchQuery)}>Search</XPButton>
            </ButtonRow>
          )}
          {searchType === 'computers' && computersSubView === 'computer' && (
            <ButtonRow style={{ justifyContent: 'flex-end' }}>
              <XPButton onClick={() => console.log('Search for:', computerName)}>Search</XPButton>
            </ButtonRow>
          )}
          {searchType === 'computers' && computersSubView === 'internet' && (
            <ButtonRow style={{ justifyContent: 'flex-end' }}>
              <XPButton onClick={() => window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')}>Search</XPButton>
            </ButtonRow>
          )}
          {searchType === 'computers' && computersSubView === 'internet-refine' && (
            <ButtonRow>
              <XPButton onClick={() => { setComputersSubView('internet'); }}>Back</XPButton>
              <XPButton onClick={() => window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')}>Search</XPButton>
            </ButtonRow>
          )}
          {searchType === 'computers' && !computersSubView && (
            <ButtonRow style={{ justifyContent: 'flex-start' }}>
              <XPButton onClick={() => { setSearchType(null); }}>Back</XPButton>
            </ButtonRow>
          )}
          {showPreferences && (
            <ButtonRow style={{ justifyContent: 'flex-end' }}>
              <XPButton onClick={() => setShowPreferences(false)}>Back</XPButton>
            </ButtonRow>
          )}
          </BalloonInner>
          <BalloonTip />
        </Balloon>

        {/* Rover at the bottom */}
        <RoverArea>
          <RoverSprite
            style={{
              backgroundPosition: `-${roverPosition[0]}px -${roverPosition[1]}px`,
            }}
          />
        </RoverArea>
      </Content>

      {/* Internet Search Behavior Modal */}
      {showInternetBehavior && (
        <ModalOverlay>
          <ModalWindow>
            <ModalTitleBar>
              <ModalTitle>Search Companion</ModalTitle>
              <ModalCloseButton onClick={() => setShowInternetBehavior(false)}>×</ModalCloseButton>
            </ModalTitleBar>
            <ModalContent>
              <ModalSectionTitle>Internet Search Behavior</ModalSectionTitle>
              <ModalText>How do you want to search the Internet?</ModalText>

              <RadioGroup>
                <RadioRow>
                  <input
                    type="radio"
                    id="search-companion-mode"
                    name="searchMode"
                    value="companion"
                    checked={searchCompanionMode === 'companion'}
                    onChange={(e) => setSearchCompanionMode(e.target.value)}
                  />
                  <label htmlFor="search-companion-mode">With Search Companion - provides task suggestions and automatically sends your search to other search engines</label>
                </RadioRow>
                <RadioRow>
                  <input
                    type="radio"
                    id="classic-mode"
                    name="searchMode"
                    value="classic"
                    checked={searchCompanionMode === 'classic'}
                    onChange={(e) => setSearchCompanionMode(e.target.value)}
                  />
                  <label htmlFor="classic-mode">With Classic Internet search</label>
                </RadioRow>
              </RadioGroup>

              <ModalText>Select the default search engine:</ModalText>
              <SearchEngineList size={5} value={defaultSearchEngine} onChange={(e) => setDefaultSearchEngine(e.target.value)}>
                <option value="MSN">MSN</option>
                <option value="AltaVista">AltaVista</option>
                <option value="Google">Google</option>
                <option value="Ask Jeeves">Ask Jeeves</option>
                <option value="AlltheWeb">AlltheWeb</option>
              </SearchEngineList>

              <ModalButtonRow>
                <ModalButton onClick={() => setShowInternetBehavior(false)}>OK</ModalButton>
                <ModalButton onClick={() => setShowInternetBehavior(false)}>Cancel</ModalButton>
              </ModalButtonRow>
            </ModalContent>
          </ModalWindow>
        </ModalOverlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 210px;
  min-width: 210px;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* Match TaskPanel gradient */
  background: linear-gradient(180deg, #748aff 0%, #4057d3 100%);
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, #fff 0%, transparent 70%);
    transform: scaleX(0.8);
    transform-origin: right;
    pointer-events: none;
    z-index: 2;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 8px 8px 8px;
  min-height: 0;
  overflow: hidden;
  height: 100%;
`;

const Balloon = styled.div`
  position: relative;
  background: linear-gradient(180deg, #E8F0F8 0%, #D8E8F0 100%);
  border: 1px solid #FFFFFF;
  border-radius: 12px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  margin-bottom: 8px;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
  padding: 12px 10px 0 0;
`;

const BalloonInner = styled.div`
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
`;

const BalloonContent = styled.div`
  padding: 0 4px 12px 12px;
  overflow-y: auto;
  flex: 1 1 0;
  min-height: 0;
`;

const BalloonTip = styled.div`
  position: absolute;
  bottom: -16px;
  left: 30px;
  width: 0;
  height: 0;
  border-top: 16px solid #D8E8F0;
  border-left: 16px solid transparent;
`;

const BalloonTitle = styled.div`
  font-size: 11px;
  font-weight: bold;
  color: #000;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  margin-bottom: 10px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  box-sizing: border-box;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const BackLink = styled.div`
  font-size: 11px;
  color: #0066CC;
  cursor: pointer;
  font-family: Tahoma, 'Noto Sans', sans-serif;

  &:hover {
    text-decoration: underline;
  }
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  line-height: 1.3;

  &:hover span {
    text-decoration: underline;
    color: #0066CC;
  }
`;

const ArrowIcon = styled.img.attrs({
  src: '/gui/toolbar/go.webp',
  alt: 'go',
  draggable: false,
})`
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const HelpIcon = styled.img.attrs({
  src: '/icons/help.png',
  alt: 'Help',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

const AlsoSection = styled.div`
  margin-top: 8px;
`;

const AlsoTitle = styled.div`
  font-size: 11px;
  color: #666;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  margin-bottom: 8px;
`;

const AlsoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 4px;

  &:hover span {
    text-decoration: underline;
    color: #0066CC;
  }
`;

const GlobeIcon = styled.div`
  width: 14px;
  height: 14px;
  min-width: 14px;
  background: linear-gradient(180deg, #66AAFF 0%, #3388DD 100%);
  border-radius: 50%;
  border: 1px solid #2266AA;
`;

const CheckIcon = styled.div`
  width: 14px;
  height: 14px;
  min-width: 14px;
  background: white;
  border: 1px solid #888;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 4px;
    width: 4px;
    height: 7px;
    border: solid #00AA00;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const PreferencesIcon = styled.img.attrs({
  src: '/icons/search/preferences.ico',
  alt: 'preferences',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

const DogIcon = styled.img.attrs({
  src: '/icons/search/turn-off-character.png',
  alt: 'turn off',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 4px;

  label {
    cursor: pointer;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
  margin-left: 4px;
`;

const RadioRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;

  label {
    cursor: pointer;
  }

  input:checked + label {
    font-weight: bold;
  }
`;

const InputLabel = styled.div`
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 4px;
`;

const SelectInput = styled.select`
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8px;
  font-size: 11px;
`;

const CollapsibleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  cursor: pointer;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  font-weight: bold;
  color: #000;

  &:hover {
    color: #0066CC;
  }
`;

const ChevronIcon = styled.img.attrs({
  src: '/apps/about/pulldown.webp',
  alt: '',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.15s ease;
`;

const SizeSpecifyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const SizeInput = styled.input`
  width: 50px;
  padding: 2px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const CollapsibleContent = styled.div`
  padding: 4px 0 8px 8px;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;

  span {
    width: 30px;
  }
`;

const DateInput = styled.input`
  flex: 1;
  padding: 2px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;

  &:disabled {
    background: #f0f0f0;
    color: #888;
  }

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const SearchTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 4px 6px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  box-sizing: border-box;
  margin-bottom: 8px;
  resize: none;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }

  &::placeholder {
    color: #888;
  }
`;

const SampleSection = styled.div`
  margin-bottom: 8px;
`;

const SampleTitle = styled.div`
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 4px;
`;

const SearchIcon = styled.div`
  width: 16px;
  height: 16px;
  min-width: 16px;
  background: radial-gradient(circle at 40% 40%, #a8d4ff 0%, #4a90d9 60%, #2a5a9a 100%);
  border-radius: 50%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 6px;
    height: 2px;
    background: #666;
    transform: rotate(45deg);
    transform-origin: top left;
  }
`;

const HighlightIcon = styled.img.attrs({
  src: '/icons/search/highlight.ico',
  alt: 'highlight',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

const NewSearchIcon = styled.img.attrs({
  src: '/icons/search/new-search.ico',
  alt: 'new search',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

const SearchComputerIcon = styled.img.attrs({
  src: '/icons/search/search-computer.ico',
  alt: 'search computer',
  draggable: false,
})`
  width: 16px;
  height: 16px;
  min-width: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 12px 12px 12px;
  justify-content: center;
  flex-shrink: 0;
`;

const XPButton = styled.button`
  min-width: 70px;
  padding: 4px 12px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  background: linear-gradient(180deg, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #d8d8d8 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;
  color: #000;

  &:hover {
    background: linear-gradient(180deg, #fff 0%, #e5f4fc 50%, #c4e5f6 51%, #d8e8f0 100%);
  }

  &:active {
    background: linear-gradient(180deg, #c4e5f6 0%, #98d1ef 50%, #68b8e3 51%, #8ccded 100%);
  }
`;

const RoverArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 8px;
  height: 100px;
  flex-shrink: 0;
`;

const RoverSprite = styled.div`
  width: 80px;
  height: 80px;
  background-image: url('/agents/Rover/map.png');
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalWindow = styled.div`
  background: #ece9d8;
  border: 2px solid #0054e3;
  border-radius: 6px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  min-width: 280px;
  max-width: 320px;
`;

const ModalTitleBar = styled.div`
  background: linear-gradient(180deg, #0a246a 0%, #a6caf0 8%, #0a246a 92%, #0a246a 100%);
  background: linear-gradient(180deg, #0054e3 0%, #0054e3 100%);
  color: white;
  padding: 4px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px 4px 0 0;
`;

const ModalTitle = styled.span`
  font-size: 12px;
  font-weight: bold;
  font-family: Tahoma, 'Noto Sans', sans-serif;
`;

const ModalCloseButton = styled.button`
  background: linear-gradient(180deg, #c00 0%, #900 100%);
  border: 1px solid #600;
  color: white;
  font-size: 14px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 3px;
  line-height: 1;
  padding: 0;

  &:hover {
    background: linear-gradient(180deg, #e00 0%, #a00 100%);
  }
`;

const ModalContent = styled.div`
  padding: 12px;
  background: linear-gradient(180deg, #E8F0F8 0%, #D8E8F0 100%);
`;

const ModalSectionTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 8px;
`;

const ModalText = styled.div`
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 8px;
`;

const SearchEngineList = styled.select`
  width: 100%;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  margin-bottom: 12px;
`;

const ModalButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
`;

const ModalButton = styled.button`
  min-width: 70px;
  padding: 4px 16px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  background: linear-gradient(180deg, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #d8d8d8 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;
  color: #000;

  &:hover {
    background: linear-gradient(180deg, #fff 0%, #e5f4fc 50%, #c4e5f6 51%, #d8e8f0 100%);
  }

  &:active {
    background: linear-gradient(180deg, #c4e5f6 0%, #98d1ef 50%, #68b8e3 51%, #8ccded 100%);
  }
`;

export default SearchPanel;
