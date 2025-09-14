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

  let rows, cols, mines, grid, started, timer, seconds, flags, status;

  function pad3(n){ n = Math.min(999, n|0); return String(n).padStart(3,'0'); }

  function init() {
    const d = Config[difficultyEl.value];
    rows = d.rows; cols = d.cols; mines = d.mines;
    started = false; status = 'new'; seconds = 0; flags = 0; timer && clearInterval(timer);
    renderDigits(digitsTimer, 0);
    renderDigits(digitsMines, mines);
    setFace(FACE.SMILE);
    grid = Array.from({length: rows*cols}, () => ({state:'cover', mines:0}));
    boardEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
    boardEl.innerHTML = '';
    for (let i=0;i<rows*cols;i++) boardEl.appendChild(cellEl(i));
    queueResize();
  }

  function cellEl(i){
    const el = document.createElement('div');
    el.className = 'cell cover';
    el.oncontextmenu = e => { e.preventDefault(); toggleFlag(i); };
    el.onmousedown = e => { if (e.button===0) clickCell(i); };
    el.ontouchstart = e => { if (flagModeEl.checked) toggleFlag(i); else clickCell(i); };
    return el;
  }

  function placeMines(firstIndex){
    const idxs = Array.from({length: rows*cols}, (_,i)=>i).filter(i=>i!==firstIndex);
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
    const cell = grid[i]; if (cell.state!=='cover') return; cell.state='open';
    const el = boardEl.children[i]; el.className = 'cell open';
    el.innerHTML = '';
    if (cell.mines>0){
      const img = document.createElement('img');
      img.src = OPEN_NUM[cell.mines] || '';
      img.alt = String(cell.mines);
      el.appendChild(img);
    }
    if (cell.mines===0){ for (const n of neighbors(i)) reveal(n); }
    queueResize();
  }

  function checkWin(){
    const unopened = grid.filter(c=>c.state!=='open').length;
    if (unopened===mines){
      clearInterval(timer); started=false; status='won'; setFace(FACE.WIN);
      for (let i=0;i<grid.length;i++) if (grid[i].state==='cover') setFlag(i,true);
      // optional toast could be shown here
    }
  }

  function gameOver(blowIndex){
    clearInterval(timer); started=false; status='dead'; setFace(FACE.DEAD);
    for (let i=0;i<grid.length;i++){
      const c=grid[i], el=boardEl.children[i];
      if (c.mines<0 && c.state!=='flag') { el.className='cell open mine'; }
      else if (c.mines>=0 && c.state==='flag') { el.className='cell open misflagged'; }
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
    const cell=grid[i]; if (cell.state==='open') return;
    const el=boardEl.children[i];
    if (on){ if (cell.state!=='flag'){ cell.state='flag'; el.classList.add('flag'); flags++; renderDigits(digitsMines, Math.max(0, mines-flags)); } }
    else { if (cell.state==='flag'){ cell.state='cover'; el.classList.remove('flag'); flags--; renderDigits(digitsMines, Math.max(0, mines-flags)); } }
  }

  function toggleFlag(i){
    const cell=grid[i]; setFlag(i, cell.state!=='flag');
  }

  difficultyEl.addEventListener('change', init);
  resetBtn.addEventListener('click', init);
  faceBtn.addEventListener('mousedown', ()=> setFace(FACE.OHH));
  faceBtn.addEventListener('mouseup', ()=> { if(status==='new'||status==='started') setFace(FACE.SMILE); });
  faceBtn.addEventListener('click', init);
  // Change face while interacting with the board
  boardEl.addEventListener('mousedown', (e)=>{ if(e.button===0 && (status==='new'||status==='started')) setFace(FACE.OHH); });
  document.addEventListener('mouseup', ()=>{ if(status==='new'||status==='started') setFace(FACE.SMILE); });
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
  document.addEventListener('click', (e)=>{
    const target = e.target;
    const a = target?.dataset?.action || target?.closest('.menu-dropdown-item')?.dataset?.action;
    if(!a) return;
    
    // Close menu after action
    gameMenu.style.display = 'none';
    menuItems.forEach(item => item.classList.remove('active'));
    
    if (a==='new') init();
    else if (Config[a]){ difficultyEl.value = a; init(); }
    else if (a==='exit') { try{ window.parent?.postMessage({ type:'close-window' }, '*'); }catch(_){}}
  });
  init();
  setupResizeObserver();
  queueResize();

  function sendResize(){
    try {
      const content = document.querySelector('.mine-content');
      const menuBar = document.querySelector('.menu-bar-container');
      if (!content || !menuBar) return;
      
      const contentRect = content.getBoundingClientRect();
      const menuRect = menuBar.getBoundingClientRect();
      
      // Calculate exact size needed
      const w = Math.ceil(contentRect.width) + 10;
      const h = Math.ceil(contentRect.height) + Math.ceil(menuRect.height) + 6;
      
      // Ask parent to fit the window exactly around our content
      window.parent?.postMessage({ type: 'fit-content-size', width: w, height: h }, '*');
    } catch(_){}
  }

  function queueResize(){
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sendResize();
      setTimeout(sendResize, 50);
    }));
  }

  function setupResizeObserver(){
    try {
      const content = document.querySelector('.mine-content');
      if (!content) return;
      const ro = new ResizeObserver(() => sendResize());
      ro.observe(content);
    } catch(_){}
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
