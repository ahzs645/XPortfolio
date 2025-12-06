import React from 'react';
import {
  BalloonTitle,
  CheckboxGroup,
  CheckboxRow,
  InputLabel,
  SearchInput,
  AlsoSection,
  AlsoTitle,
  AlsoItem,
} from '../styles';
import { PreferencesIcon } from '../components/Icons';

function PicturesSearchView({
  inputRef,
  searchQuery,
  onSearchChange,
  onKeyDown,
  picturesChecked,
  setPicturesChecked,
  musicChecked,
  setMusicChecked,
  videoChecked,
  setVideoChecked,
}) {
  return (
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
        onKeyDown={onKeyDown}
      />

      <AlsoSection>
        <AlsoTitle>You may also want to...</AlsoTitle>
        <AlsoItem>
          <PreferencesIcon />
          <span>Use advanced search options</span>
        </AlsoItem>
      </AlsoSection>
    </>
  );
}

export default PicturesSearchView;
