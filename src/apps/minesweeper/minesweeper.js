(() => {
  const Config = {
    Beginner: { rows: 9, cols: 9, mines: 10 },
    Intermediate: { rows: 16, cols: 16, mines: 40 },
    Expert: { rows: 16, cols: 30, mines: 99 },
  };

  const $ = sel => document.querySelector(sel);
  const boardEl = $('#board');
  const difficultyEl = $('#difficulty');
  const resetBtn = $('#reset');
  const digitsMines = $('#digits-mines');
  const digitsTimer = $('#digits-timer');
  const flagModeEl = $('#flagMode');
  const faceBtn = document.getElementById('face');

  const ASSET_BASE = '../../../assets/apps/minesweeper/';
  const DIGIT_MAP = {
    '-': ASSET_BASE + 'digit-.png',
    '0': ASSET_BASE + 'digit0.png',
    '1': ASSET_BASE + 'digit1.png',
    '2': ASSET_BASE + 'digit2.png',
    '3': ASSET_BASE + 'digit3.png',
    '4': ASSET_BASE + 'digit4.png',
    '5': ASSET_BASE + 'digit5.png',
    '6': ASSET_BASE + 'digit6.png',
    '7': ASSET_BASE + 'digit7.png',
    '8': ASSET_BASE + 'digit8.png',
    '9': ASSET_BASE + 'digit9.png',
  };
  const FACE = {
    SMILE: ASSET_BASE + 'smile.png',
    OHH: ASSET_BASE + 'ohh.png',
    DEAD: ASSET_BASE + 'dead.png',
    WIN: ASSET_BASE + 'win.png',
  };
  const OPEN_NUM = {
    1: ASSET_BASE + 'open1.png',
    2: ASSET_BASE + 'open2.png',
    3: ASSET_BASE + 'open3.png',
    4: ASSET_BASE + 'open4.png',
    5: ASSET_BASE + 'open5.png',
    6: ASSET_BASE + 'open6.png',
    7: ASSET_BASE + 'open7.png',
    8: ASSET_BASE + 'open8.png'
  };

  let rows, cols, mines, grid, started, timer, seconds, flags, status, mouseDownOnBoard, currentDifficulty = 'Beginner';

  function pad3(n){ n = Math.min(999, n|0); return String(n).padStart(3,'0'); }

  function updateDifficultyChecks() {
    document.getElementById('check-beginner').textContent = currentDifficulty === 'Beginner' ? '✓' : '';
    document.getElementById('check-intermediate').textContent = currentDifficulty === 'Intermediate' ? '✓' : '';
    document.getElementById('check-expert').textContent = currentDifficulty === 'Expert' ? '✓' : '';
  }

  function init(difficulty) {
    if (difficulty) {
      currentDifficulty = difficulty;
      if (difficultyEl) difficultyEl.value = difficulty;
    }
    const d = Config[currentDifficulty];
    rows = d.rows; cols = d.cols; mines = d.mines;
    started = false; status = 'new'; seconds = 0; flags = 0; mouseDownOnBoard = false;
    timer && clearInterval(timer);
    renderDigits(digitsTimer, 0);
    renderDigits(digitsMines, mines);
    setFace(FACE.SMILE);
    grid = Array.from({length: rows*cols}, () => ({state:'cover', mines:0}));
    boardEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
    boardEl.innerHTML = '';
    for (let i=0;i<rows*cols;i++) boardEl.appendChild(cellEl(i));

    // Set scorebar width to match board width
    const scorebarEl = document.querySelector('.scorebar');
    if (scorebarEl && boardEl) {
      requestAnimationFrame(() => {
        const boardWidth = boardEl.offsetWidth;
        scorebarEl.style.width = boardWidth + 'px';
      });
    }

    updateDifficultyChecks();
    queueResize();
  }

  function cellEl(i){
    const el = document.createElement('div');
    el.className = 'cell cover';
    el.dataset.index = i;
    return el;
  }

  function placeMines(firstIndex){
    const idxs = Array.from({length: rows*cols}, (_,i)=>i).filter(i=>i!==firstIndex);
    // Shuffle and pick mines
    for (let m=0; m<mines; m++){
      const r = Math.floor(Math.random()*idxs.length);
      const idx = idxs.splice(r,1)[0];
      grid[idx].mines = -1;
      for (const n of neighbors(idx)) if (grid[n].mines>=0) grid[n].mines++;
    }
  }

  function neighbors(i){
    const r = (i/cols)|0, c = i%cols; const ns=[];
    for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
      if (!dr && !dc) continue; const rr=r+dr, cc=c+dc;
      if (rr>=0 && rr<rows && cc>=0 && cc<cols) ns.push(rr*cols+cc);
    }
    return ns;
  }

  function startTimer(){
    started = true; status = 'started';
    timer = setInterval(()=>{ seconds++; renderDigits(digitsTimer, seconds); }, 1000);
  }

  function reveal(i){
    const cell = grid[i];
    if (cell.state!=='cover') return;
    cell.state='open';
    const el = boardEl.children[i];
    el.className = 'cell open';
    el.innerHTML = '';
    if (cell.mines>0){
      const img = document.createElement('img');
      img.src = OPEN_NUM[cell.mines] || '';
      img.alt = String(cell.mines);
      el.appendChild(img);
    }
    if (cell.mines===0){
      for (const n of neighbors(i)) reveal(n);
    }
    queueResize();
  }

  function checkWin(){
    const unopened = grid.filter(c=>c.state!=='open').length;
    if (unopened===mines){
      clearInterval(timer); started=false; status='won'; setFace(FACE.WIN);
      for (let i=0;i<grid.length;i++) {
        if (grid[i].state==='cover' || grid[i].state==='unknown') setFlag(i,true);
      }
    }
  }

  function gameOver(blowIndex){
    clearInterval(timer); started=false; status='dead'; setFace(FACE.DEAD);
    for (let i=0;i<grid.length;i++){
      const c=grid[i], el=boardEl.children[i];
      if (c.mines<0 && c.state!=='flag') {
        el.className='cell open mine';
      }
      else if (c.mines>=0 && c.state==='flag') {
        el.className='cell open misflagged';
      }
    }
    boardEl.children[blowIndex].classList.add('die');
    queueResize();
  }

  function clickCell(i){
    if (status==='dead' || status==='won') return;
    const cell = grid[i];
    if (cell.state==='flag' || cell.state==='open') return;
    if (!started){ placeMines(i); startTimer(); }
    if (cell.mines<0){ gameOver(i); return; }
    reveal(i); checkWin();
  }

  function setFlag(i, on){
    if (status==='dead' || status==='won') return;
    const cell=grid[i];
    if (cell.state==='open') return;
    const el=boardEl.children[i];
    if (on){
      if (cell.state!=='flag'){
        cell.state='flag';
        el.classList.remove('unknown');
        el.classList.add('flag');
        flags++;
        renderDigits(digitsMines, Math.max(0, mines-flags));
      }
    }
    else {
      if (cell.state==='flag'){
        cell.state='cover';
        el.classList.remove('flag');
        flags--;
        renderDigits(digitsMines, Math.max(0, mines-flags));
      }
    }
  }

  function cycleFlag(i){
    if (status==='dead' || status==='won') return;
    const cell=grid[i];
    if (cell.state==='open') return;
    const el=boardEl.children[i];

    // Cycle: cover -> flag -> unknown -> cover
    if (cell.state === 'cover') {
      cell.state = 'flag';
      el.classList.remove('unknown');
      el.classList.add('flag');
      flags++;
      renderDigits(digitsMines, Math.max(0, mines-flags));
    } else if (cell.state === 'flag') {
      cell.state = 'unknown';
      el.classList.remove('flag');
      el.classList.add('unknown');
      flags--;
      renderDigits(digitsMines, Math.max(0, mines-flags));
    } else if (cell.state === 'unknown') {
      cell.state = 'cover';
      el.classList.remove('unknown');
    }
  }

  // Handle mouse events on board
  boardEl.addEventListener('mousedown', (e)=>{
    if (e.button===0 && (status==='new'||status==='started')) {
      setFace(FACE.OHH);
      mouseDownOnBoard = true;
    }
  });

  document.addEventListener('mouseup', ()=>{
    if (mouseDownOnBoard && (status==='new'||status==='started')) {
      setFace(FACE.SMILE);
    }
    mouseDownOnBoard = false;
  });

  // Handle clicks on cells
  boardEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const i = parseInt(cell.dataset.index);
    clickCell(i);
  });

  // Handle right-click on cells
  boardEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const i = parseInt(cell.dataset.index);
    cycleFlag(i);
  });

  // Handle touch events for mobile
  boardEl.addEventListener('touchstart', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const i = parseInt(cell.dataset.index);
    if (flagModeEl?.checked) {
      cycleFlag(i);
    } else {
      clickCell(i);
    }
  });

  if (difficultyEl) {
    difficultyEl.addEventListener('change', init);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', init);
  }

  faceBtn.addEventListener('mousedown', ()=> setFace(FACE.OHH));
  faceBtn.addEventListener('mouseup', ()=> {
    if(status==='new'||status==='started') setFace(FACE.SMILE);
  });
  faceBtn.addEventListener('click', () => init());

  // Menu bar event handling
  const gameMenu = document.getElementById('game-menu');
  const menuItems = document.querySelectorAll('.menu-item[data-menu]');

  // Handle menu clicks
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (item.classList.contains('disabled')) return;
      const menu = item.dataset.menu;
      if (menu === 'game') {
        const isOpen = gameMenu.style.display !== 'none';
        gameMenu.style.display = isOpen ? 'none' : 'block';
        item.classList.toggle('active', !isOpen);
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-bar-container')) {
      gameMenu.style.display = 'none';
      menuItems.forEach(item => item.classList.remove('active'));
    }
  });

  // Handle menu item actions
  document.addEventListener('click', (e) => {
    const target = e.target;
    const menuItem = target?.closest('.menu-dropdown-item');
    if (!menuItem) return;

    const action = menuItem.dataset.action;
    if (!action) return;

    // Close menu after action
    gameMenu.style.display = 'none';
    menuItems.forEach(item => item.classList.remove('active'));

    if (action === 'new') {
      init();
    } else if (action === 'exit') {
      try {
        window.parent?.postMessage({ type: 'close-window' }, '*');
      } catch(_) {}
    } else if (Config[action]) {
      init(action);
    }
  });

  // Listen for window messages (for menu actions)
  window.addEventListener('message', (e) => {
    try {
      const data = e.data;
      if (data.type === 'menu-action') {
        const action = data.action;
        if (action === 'new') {
          init();
        } else if (action === 'exit') {
          window.parent?.postMessage({ type: 'close-window' }, '*');
        } else if (Config[action]) {
          init(action);
        }
      }
    } catch(err) {}
  });

  init();

  function sendResize(){
    try {
      const content = document.querySelector('.mine-content');
      const menuBar = document.querySelector('.menu-bar-container');
      if (!content || !menuBar) return;

      const boardWidth = boardEl.offsetWidth;
      const menuHeight = menuBar.offsetHeight;
      const contentHeight = content.offsetHeight;

      // Calculate based on actual board size plus borders and padding
      // Board: cols * 16px + 6px borders
      // Content padding: 3px * 2 = 6px
      // Menu height
      const w = boardWidth + 12;
      const h = contentHeight + menuHeight + 6;

      window.parent?.postMessage({ type: 'fit-content-size', width: w, height: h }, '*');
    } catch(_){}
  }

  function queueResize(){
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sendResize();
    }));
  }

  function renderDigits(container, n){
    const s = pad3(n);
    container.innerHTML = '';
    for (const ch of s){
      const img = document.createElement('img');
      img.src = DIGIT_MAP[ch];
      img.alt = ch;
      container.appendChild(img);
    }
  }

  function setFace(src){
    faceBtn.innerHTML = '';
    const img = document.createElement('img');
    img.src = src; img.alt = 'face';
    faceBtn.appendChild(img);
  }
})();
