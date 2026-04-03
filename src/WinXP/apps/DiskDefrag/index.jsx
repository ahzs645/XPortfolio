import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';

const EMPTY = 0;
const FRAGMENTED = 1;
const CONTIGUOUS = 2;
const UNMOVABLE = 3;

const COLORS = {
  [EMPTY]: '#ffffff',
  [FRAGMENTED]: '#cc0000',
  [CONTIGUOUS]: '#0000dd',
  [UNMOVABLE]: '#00aa00',
};

const NUM_CLUSTERS = 600;

function generateDiskClusters() {
  const clusters = new Array(NUM_CLUSTERS);

  for (let i = 0; i < NUM_CLUSTERS; i++) {
    const r = Math.random();
    if (r < 0.15) clusters[i] = EMPTY;
    else if (r < 0.40) clusters[i] = FRAGMENTED;
    else if (r < 0.47) clusters[i] = UNMOVABLE;
    else clusters[i] = CONTIGUOUS;
  }

  for (let c = 0; c < 80; c++) {
    const start = Math.floor(Math.random() * (NUM_CLUSTERS - 6));
    const type = [CONTIGUOUS, FRAGMENTED, EMPTY, CONTIGUOUS][Math.floor(Math.random() * 4)];
    const len = 2 + Math.floor(Math.random() * 5);
    for (let j = 0; j < len && start + j < NUM_CLUSTERS; j++) {
      clusters[start + j] = type;
    }
  }

  for (let c = 0; c < 5; c++) {
    const start = Math.floor(Math.random() * (NUM_CLUSTERS - 40));
    const len = 10 + Math.floor(Math.random() * 30);
    for (let j = 0; j < len && start + j < NUM_CLUSTERS; j++) {
      clusters[start + j] = CONTIGUOUS;
    }
  }

  for (let c = 0; c < 3; c++) {
    const start = Math.floor(Math.random() * (NUM_CLUSTERS - 25));
    const len = 8 + Math.floor(Math.random() * 18);
    for (let j = 0; j < len && start + j < NUM_CLUSTERS; j++) {
      clusters[start + j] = UNMOVABLE;
    }
  }

  for (let c = 0; c < 4; c++) {
    const start = Math.floor(Math.random() * (NUM_CLUSTERS - 30));
    const len = 10 + Math.floor(Math.random() * 25);
    for (let j = 0; j < len && start + j < NUM_CLUSTERS; j++) {
      clusters[start + j] = EMPTY;
    }
  }

  return clusters;
}

function defragStep(clusters, swapsPerTick) {
  for (let s = 0; s < swapsPerTick; s++) {
    const fragIndices = [];
    const emptyIndices = [];
    for (let i = 0; i < clusters.length; i++) {
      if (clusters[i] === FRAGMENTED) fragIndices.push(i);
      if (clusters[i] === EMPTY) emptyIndices.push(i);
    }

    if (fragIndices.length === 0) break;

    const fi = fragIndices[Math.floor(Math.random() * fragIndices.length)];
    clusters[fi] = CONTIGUOUS;

    if (emptyIndices.length > 0 && Math.random() > 0.3) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const ei = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        for (let j = ei + 1; j < Math.min(ei + 20, clusters.length); j++) {
          if (clusters[j] === CONTIGUOUS || clusters[j] === FRAGMENTED) {
            clusters[ei] = clusters[j];
            clusters[j] = EMPTY;
            break;
          }
        }
      }
    }
  }
}

function clustersToSegments(clusters) {
  if (!clusters || clusters.length === 0) return [{ type: EMPTY, width: 100 }];

  const segments = [];
  let currentType = clusters[0];
  let count = 1;

  for (let i = 1; i < clusters.length; i++) {
    if (clusters[i] === currentType) {
      count++;
    } else {
      segments.push({ type: currentType, width: (count / clusters.length) * 100 });
      currentType = clusters[i];
      count = 1;
    }
  }
  segments.push({ type: currentType, width: (count / clusters.length) * 100 });

  return segments;
}

function getPartialClusters(targetClusters, percent) {
  const revealCount = Math.floor((percent / 100) * targetClusters.length);
  const result = new Array(targetClusters.length);
  for (let i = 0; i < targetClusters.length; i++) {
    result[i] = i < revealCount ? targetClusters[i] : EMPTY;
  }
  return result;
}

const VOLUMES = [
  { name: 'IBM_PRELO...', fs: 'NTFS', capacity: '33.32 GB', free: '8.72 GB', pctFree: '26 %' },
  { name: '(D:)', fs: 'NTFS', capacity: '120.00 GB', free: '45.20 GB', pctFree: '37 %' },
];

function DiskBar({ segments }) {
  return (
    <DiskBarContainer>
      {segments.map((seg, i) => (
        <DiskSegment
          key={i}
          style={{
            width: `${seg.width}%`,
            backgroundColor: COLORS[seg.type],
          }}
        />
      ))}
    </DiskBarContainer>
  );
}

function DiskDefrag() {
  const [selectedVolume, setSelectedVolume] = useState(0);
  const [beforeClusters, setBeforeClusters] = useState(() => new Array(NUM_CLUSTERS).fill(EMPTY));
  const [afterClusters, setAfterClusters] = useState(() => new Array(NUM_CLUSTERS).fill(EMPTY));
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const timerRef = useRef(null);
  const dataRef = useRef({ beforeClusters: [], defragTarget: [] });

  const beforeSegments = useMemo(() => clustersToSegments(beforeClusters), [beforeClusters]);
  const afterSegments = useMemo(() => clustersToSegments(afterClusters), [afterClusters]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const analyze = useCallback(() => {
    clearTimer();
    setState('analyzing');
    setAfterClusters(new Array(NUM_CLUSTERS).fill(EMPTY));
    setProgress(0);

    const targetClusters = generateDiskClusters();
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const pct = Math.min(Math.floor((step / 40) * 100), 100);
      setProgress(pct);
      setStatusText(`Analyzing... ${pct}%`);
      setBeforeClusters(getPartialClusters(targetClusters, pct));

      if (step >= 40) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setBeforeClusters([...targetClusters]);
        dataRef.current.beforeClusters = targetClusters;
        setState('analyzed');
        setStatusText('Analysis complete.');
        setProgress(0);
      }
    }, 60);
  }, [clearTimer]);

  const startDefragLoop = useCallback(() => {
    const phases = ['Compacting Files', 'Moving Files', 'Compacting Files', 'Optimizing'];
    const working = dataRef.current.workingClusters;

    const initialFragCount = working.filter(c => c === FRAGMENTED).length;
    if (initialFragCount === 0) return;

    timerRef.current = setInterval(() => {
      defragStep(working, 4);

      const remainingFrag = working.filter(c => c === FRAGMENTED).length;
      const pct = Math.min(Math.floor(((initialFragCount - remainingFrag) / initialFragCount) * 100), 100);

      setAfterClusters([...working]);
      setProgress(pct);

      const phase = phases[Math.min(Math.floor((pct / 100) * phases.length), phases.length - 1)];
      setStatusText(`(C:) Defragmenting... ${pct}%  ${phase}`);

      if (remainingFrag === 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setAfterClusters([...working]);
        setState('done');
        setProgress(100);
        setStatusText('Defragmentation Complete');
        setShowComplete(true);
      }
    }, 50);
  }, []);

  const defragment = useCallback(() => {
    clearTimer();
    const source = dataRef.current.beforeClusters;
    dataRef.current.workingClusters = [...source];
    setAfterClusters([...source]);
    setProgress(0);
    setState('defragging');
    startDefragLoop();
  }, [clearTimer, startDefragLoop]);

  const pause = useCallback(() => {
    if (state === 'paused') {
      setState('defragging');
      startDefragLoop();
    } else {
      clearTimer();
      setState('paused');
    }
  }, [state, clearTimer, startDefragLoop]);

  const stop = useCallback(() => {
    clearTimer();
    setState('analyzed');
    setProgress(0);
    setStatusText('Stopped.');
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progressBarFill = Math.floor(progress / 5);

  return (
    <Container>
      {/* Menu Bar */}
      <MenuBar>
        <MenuItem><u>F</u>ile</MenuItem>
        <MenuItem><u>A</u>ction</MenuItem>
        <MenuItem><u>V</u>iew</MenuItem>
        <MenuItem><u>H</u>elp</MenuItem>
      </MenuBar>

      {/* Toolbar */}
      <Toolbar>
        <ToolbarBtn>&#9664;</ToolbarBtn>
        <ToolbarBtn>&#9654;</ToolbarBtn>
      </Toolbar>

      {/* Volume Table */}
      <VolumeTable className="sunken-panel">
        <VolHeader>
          <VolCell $width="95px">Volume</VolCell>
          <VolCell $width="100px">Session Status</VolCell>
          <VolCell $width="75px">File System</VolCell>
          <VolCell $width="80px" $align="right">Capacity</VolCell>
          <VolCell $width="80px" $align="right">Free Space</VolCell>
          <VolCell $width="85px" $align="right">% Free Space</VolCell>
        </VolHeader>
        {VOLUMES.map((v, i) => (
          <VolRow
            key={i}
            $selected={selectedVolume === i}
            onClick={() => setSelectedVolume(i)}
          >
            <VolCell $width="95px" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <DriveIcon />
              {v.name}
            </VolCell>
            <VolCell $width="100px">
              {i === 0 && state === 'defragging' ? 'Defragmenting...' :
               i === 0 && state === 'analyzed' ? 'Analyzed' :
               i === 0 && state === 'analyzing' ? 'Analyzing...' :
               i === 0 && state === 'done' ? 'Defragmented' : ''}
            </VolCell>
            <VolCell $width="75px">{v.fs}</VolCell>
            <VolCell $width="80px" $align="right">{v.capacity}</VolCell>
            <VolCell $width="80px" $align="right">{v.free}</VolCell>
            <VolCell $width="85px" $align="right">{v.pctFree}</VolCell>
          </VolRow>
        ))}
      </VolumeTable>

      <ContentArea>
        {/* Before */}
        <DiskSection>
          <DiskLabel>Estimated disk usage before defragmentation:</DiskLabel>
          <DiskDisplay className="sunken-panel">
            <DiskBar segments={beforeSegments} />
          </DiskDisplay>
        </DiskSection>

        {/* After */}
        <DiskSection>
          <DiskLabel>Estimated disk usage after defragmentation:</DiskLabel>
          <DiskDisplay className="sunken-panel">
            <DiskBar segments={afterSegments} />
          </DiskDisplay>
        </DiskSection>

        {/* Buttons */}
        <ActionButtons>
          <button onClick={analyze} disabled={state === 'analyzing' || state === 'defragging'}>
            Analyze
          </button>
          <button onClick={defragment} disabled={state !== 'analyzed'}>
            Defragment
          </button>
          <button onClick={pause} disabled={state !== 'defragging' && state !== 'paused'}>
            {state === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button onClick={stop} disabled={state !== 'defragging' && state !== 'paused'}>
            Stop
          </button>
          <button disabled={state === 'defragging' || state === 'analyzing'}>
            View Report
          </button>
        </ActionButtons>

        {/* Legend */}
        <Legend>
          <LegendItem>
            <LegendBlock $color="#cc0000" />
            <span>Fragmented files</span>
          </LegendItem>
          <LegendItem>
            <LegendBlock $color="#0000dd" />
            <span>Contiguous files</span>
          </LegendItem>
          <LegendItem>
            <LegendBlock $color="#00aa00" />
            <span>Unmovable files</span>
          </LegendItem>
          <LegendItem>
            <LegendBlock $color="#ffffff" />
            <span>Free space</span>
          </LegendItem>
        </Legend>
      </ContentArea>

      {/* Status Bar */}
      <StatusBar className="status-bar">
        <StatusBarField className="status-bar-field" style={{ flex: 1 }}>
          {statusText}
        </StatusBarField>
        {(state === 'defragging' || state === 'done' || progress > 0) && (
          <StatusBarField className="status-bar-field">
            <ProgressBar>
              {Array.from({ length: 20 }, (_, i) => (
                <ProgBlock key={i} $filled={i < progressBarFill} />
              ))}
            </ProgressBar>
          </StatusBarField>
        )}
      </StatusBar>

      {/* Completion Dialog */}
      {showComplete && (
        <DialogOverlay>
          <DialogBox className="window">
            <div className="title-bar">
              <div className="title-bar-text">Disk Defragmenter</div>
              <div className="title-bar-controls">
                <button aria-label="Help" />
                <button aria-label="Close" onClick={() => setShowComplete(false)} />
              </div>
            </div>
            <div className="window-body">
              <p>Defragmentation is complete for:</p>
              <p style={{ paddingLeft: 16 }}>(C:)</p>
              <hr />
              <DialogButtons>
                <button>View Report</button>
                <button onClick={() => setShowComplete(false)}>Close</button>
              </DialogButtons>
            </div>
          </DialogBox>
        </DialogOverlay>
      )}
    </Container>
  );
}

export default DiskDefrag;

// Styled Components

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
  font-family: 'Pixelated MS Sans Serif', 'Tahoma', sans-serif;
  font-size: 11px;
`;

const MenuBar = styled.div`
  display: flex;
  gap: 2px;
  padding: 2px 6px;
  border-bottom: 1px solid #aca899;
`;

const MenuItem = styled.span`
  padding: 2px 6px;
  cursor: pointer;
  font-size: 11px;
  color: #000;

  &:hover {
    background: #316ac5;
    color: white;
  }

  u {
    text-decoration: underline;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1px;
  padding: 2px 4px;
  border-bottom: 1px solid #aca899;
`;

const ToolbarBtn = styled.button`
  && {
    width: 24px;
    height: 22px;
    min-width: 24px;
    min-height: 22px;
    padding: 0;
    font-size: 10px;
    color: #444;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const VolumeTable = styled.div`
  margin: 4px 6px;
  background: white;
`;

const VolHeader = styled.div`
  display: flex;
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
  font-size: 11px;
`;

const VolCell = styled.span`
  width: ${p => p.$width};
  min-width: ${p => p.$width};
  padding: 2px 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: ${p => p.$align || 'left'};
  ${p => p.$header && 'border-right: 1px solid #aca899;'}
`;

const VolRow = styled.div`
  display: flex;
  cursor: pointer;
  font-size: 11px;
  height: 18px;
  align-items: center;
  background: ${p => p.$selected ? '#316ac5' : 'transparent'};
  color: ${p => p.$selected ? 'white' : 'inherit'};

  &:hover {
    background: ${p => p.$selected ? '#316ac5' : '#e8e8e8'};
  }
`;

const DriveIcon = styled.span`
  display: inline-block;
  width: 14px;
  height: 12px;
  background: linear-gradient(180deg, #b8b8b8 0%, #888 100%);
  border: 1px solid #666;
  border-radius: 1px;
  position: relative;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 2px;
    width: 8px;
    height: 2px;
    background: #2a2;
    border-radius: 1px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 6px 8px 8px;
  overflow: auto;
`;

const DiskSection = styled.div`
  margin-bottom: 8px;
`;

const DiskLabel = styled.div`
  font-size: 11px;
  margin-bottom: 4px;
  color: #000;
`;

const DiskDisplay = styled.div`
  padding: 0;
`;

const DiskBarContainer = styled.div`
  display: flex;
  height: 36px;
  width: 100%;
  overflow: hidden;
`;

const DiskSegment = styled.div`
  height: 100%;
  min-width: 0;
  flex-shrink: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;

  button {
    min-width: 75px;
  }
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 4px 0 2px;
  border-top: 1px solid #aca899;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #000;
`;

const LegendBlock = styled.div`
  width: 12px;
  height: 12px;
  border: 1px solid #808080;
  background: ${p => p.$color};
`;

const StatusBar = styled.div`
  && {
    padding: 2px 6px;
    font-size: 11px;
    gap: 4px;
  }
`;

const StatusBarField = styled.div`
  && {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 1px;
  padding: 2px;
  background: #d4d0c8;
  border: 1px inset #d4d0c8;
  height: 12px;
  align-items: center;
`;

const ProgBlock = styled.div`
  width: 6px;
  height: 10px;
  background: ${p => p.$filled ? '#00aa00' : '#d4d0c8'};
`;

const DialogOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const DialogBox = styled.div`
  && {
    min-width: 280px;
  }

  .window-body {
    padding: 16px 20px;
    font-size: 11px;

    p {
      margin: 0 0 4px;
    }

    hr {
      border: none;
      border-top: 1px solid #aca899;
      margin: 12px 0;
    }
  }
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
