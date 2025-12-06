import React from 'react';
import {
  BalloonTitle,
  InputLabel,
  RadioGroup,
  RadioRow,
  SearchEngineList,
} from '../styles';

function InternetBehaviorView({
  searchCompanionMode,
  setSearchCompanionMode,
  defaultSearchEngine,
  setDefaultSearchEngine,
}) {
  return (
    <>
      <BalloonTitle>Internet Search Behavior</BalloonTitle>
      <InputLabel>How do you want to search the Internet?</InputLabel>

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

      <InputLabel>Select the default search engine:</InputLabel>
      <SearchEngineList size={5} value={defaultSearchEngine} onChange={(e) => setDefaultSearchEngine(e.target.value)}>
        <option value="MSN">MSN</option>
        <option value="AltaVista">AltaVista</option>
        <option value="Google">Google</option>
        <option value="Ask Jeeves">Ask Jeeves</option>
        <option value="AlltheWeb">AlltheWeb</option>
      </SearchEngineList>
    </>
  );
}

export default InternetBehaviorView;
