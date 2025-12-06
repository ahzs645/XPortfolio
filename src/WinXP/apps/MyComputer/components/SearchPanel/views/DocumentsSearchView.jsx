import React from 'react';
import {
  BalloonTitle,
  CollapsibleRow,
  CollapsibleContent,
  RadioGroup,
  RadioRow,
  InputLabel,
  SearchInput,
  SelectInput,
  CheckboxRow,
  SizeSpecifyRow,
  SizeInput,
  AlsoSection,
  AlsoTitle,
  AlsoItem,
} from '../styles';
import { ChevronIcon, PreferencesIcon } from '../components/Icons';

function DocumentsSearchView({
  inputRef,
  searchQuery,
  onSearchChange,
  onKeyDown,
  dateFilter,
  setDateFilter,
  whenModifiedOpen,
  setWhenModifiedOpen,
  whatSizeOpen,
  setWhatSizeOpen,
  advancedOpen,
  setAdvancedOpen,
  docAdvancedOpen,
  setDocAdvancedOpen,
  phraseQuery,
  setPhraseQuery,
  lookIn,
  setLookIn,
}) {
  return (
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
        onKeyDown={onKeyDown}
      />

      {docAdvancedOpen && (
        <>
          <InputLabel>A word or phrase in the document:</InputLabel>
          <SearchInput
            type="text"
            value={phraseQuery}
            onChange={(e) => setPhraseQuery(e.target.value)}
            onKeyDown={onKeyDown}
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
  );
}

export default DocumentsSearchView;
