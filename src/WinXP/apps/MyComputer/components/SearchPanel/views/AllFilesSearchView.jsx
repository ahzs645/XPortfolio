import React from 'react';
import {
  BalloonTitle,
  InputLabel,
  SearchInput,
  SelectInput,
  CollapsibleRow,
  CollapsibleContent,
  RadioGroup,
  RadioRow,
  DateRow,
  DateInput,
  SizeSpecifyRow,
  SizeInput,
  CheckboxRow,
} from '../styles';
import { ChevronIcon } from '../components/Icons';

function AllFilesSearchView({
  inputRef,
  searchQuery,
  onSearchChange,
  onKeyDown,
  phraseQuery,
  setPhraseQuery,
  lookIn,
  setLookIn,
  whenModifiedOpen,
  setWhenModifiedOpen,
  modifiedFilter,
  setModifiedFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  whatSizeOpen,
  setWhatSizeOpen,
  advancedOpen,
  setAdvancedOpen,
}) {
  return (
    <>
      <BalloonTitle>Search by any or all of the criteria below.</BalloonTitle>

      <InputLabel>All or part of the file name:</InputLabel>
      <SearchInput
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <InputLabel>A word or phrase in the file:</InputLabel>
      <SearchInput
        type="text"
        value={phraseQuery}
        onChange={(e) => setPhraseQuery(e.target.value)}
        onKeyDown={onKeyDown}
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
  );
}

export default AllFilesSearchView;
