import React from 'react';
import {
  BalloonTitle,
  ModalText,
  InputLabel,
  RadioGroup,
  RadioRow,
  AlsoSection,
  AlsoTitle,
  AlsoItem,
} from '../styles';
import { IndexingSettingsIcon, HelpIcon } from '../components/Icons';

function IndexingServiceView({ indexingEnabled, setIndexingEnabled }) {
  return (
    <>
      <BalloonTitle>Indexing Service</BalloonTitle>
      <ModalText>
        When Indexing Service is enabled, the files on your computer are indexed and maintained while your computer is idle so you can perform faster searches.
      </ModalText>

      <BalloonTitle style={{ marginTop: '12px' }}>
        Indexing Service is currently {indexingEnabled ? 'enabled' : 'disabled'}.
      </BalloonTitle>

      <InputLabel>Do you want to enable Indexing Service?</InputLabel>

      <RadioGroup>
        <RadioRow>
          <input
            type="radio"
            id="indexing-yes"
            name="indexingService"
            value="yes"
            checked={indexingEnabled}
            onChange={() => setIndexingEnabled(true)}
          />
          <label htmlFor="indexing-yes">Yes, enable Indexing Service.</label>
        </RadioRow>
        <RadioRow>
          <input
            type="radio"
            id="indexing-no"
            name="indexingService"
            value="no"
            checked={!indexingEnabled}
            onChange={() => setIndexingEnabled(false)}
          />
          <label htmlFor="indexing-no">No, do not enable Indexing Service.</label>
        </RadioRow>
      </RadioGroup>

      <AlsoSection>
        <AlsoTitle>You may also want to...</AlsoTitle>
        <AlsoItem>
          <IndexingSettingsIcon />
          <span>Change Indexing Service settings (Advanced)</span>
        </AlsoItem>
        <AlsoItem>
          <HelpIcon />
          <span>Learn more about Indexing Service</span>
        </AlsoItem>
      </AlsoSection>
    </>
  );
}

export default IndexingServiceView;
