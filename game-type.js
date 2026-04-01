// ================================================
// GAME 3: FALLING TYPING
// ================================================

let typingLoop = null;
let fallingWords = [];
let typeHP = 100;
let typeScore = 0;
let typeCombo = 0;
let typeInput = '';
let typeDeck = [];
let spawnTimer = 0;
let spawnInterval = 0;
let gameSpeed = 0;
let typeCanvas;
let typeCtx;
let canvasW = 0;
let canvasH = 0;
let isStartGame = false;

function startTyping() {
  showScreen('screen-type');
  isStartGame = true;
  typeHP = 100;
  typeScore = 0;
  typeCombo = 0;
  fallingWords = [];
  typeDeck = getPrioritizedDeck(questions, 'type').map((q, idx) => ({ ...q, originalIndex: questions.indexOf(q) }));
  spawnTimer = 0;
  spawnInterval = getTypeSpawnInterval();
  gameSpeed = getTypeGameSpeed();

  typeCanvas = document.getElementById('type-canvas');
  typeCtx = typeCanvas.getContext('2d');

  const rect = typeCanvas.getBoundingClientRect();
  typeCanvas.width = rect.width || 700;
  typeCanvas.height = rect.height || 380;
  canvasW = typeCanvas.width;
  canvasH = typeCanvas.height;

  document.getElementById('modal-gameover').classList.add('hidden');
  document.getElementById('type-target').textContent = '—';

  const inp = document.getElementById('type-input');
  inp.value = '';
  inp.focus();
  inp.oninput = onTypeInput;

  if (typingLoop) cancelAnimationFrame(typingLoop);
  typingLoop = requestAnimationFrame(typeGameLoop);
  updateTypeHUD();
}

function spawnWord() {
  if (typeDeck.length === 0) typeDeck = getPrioritizedDeck(questions, 'type').map((q, idx) => ({ ...q, originalIndex: questions.indexOf(q) }));
  const q = typeDeck.pop();
  const x = Math.random() * (canvasW - 140) + 20;
  fallingWords.push({
    word: q.word,
    romaji: q.romaji,
    translation: q.translation || '',
    hint: getTypeHint(q),
    x,
    y: -30,
    speed: gameSpeed + Math.random() * 0.4,
    color: pickColor(),
    done: false
  });
}

function pickColor() {
  const colors = ['#ffd60a', '#30d158', '#0a84ff', '#bf5af2', '#ff9f0a', '#64d2ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getTypeSpawnInterval() {
  const map = { slow: 640, medium: 480, fast: 360 };
  return map[settings.typeSpawnInterval] || 480;
}

function getTypeGameSpeed() {
  const map = { slow: 0.18, medium: 0.29, fast: 0.42 };
  return map[settings.typeGameSpeed] || 0.29;
}

function getTypeHint(q) {
  if (!settings.typeHintsEnabled) return '';
  if (q.translation) return q.translation;
  if (q.romaji) return wanakana.toHiragana(q.romaji.trim().toLowerCase());
  return '';
}

function getTypeModeLabel() {
  const map = { slow: 'Slow', medium: 'Medium', fast: 'Fast' };
  return map[settings.typeGameSpeed] || 'Medium';
}

function typeGameLoop() {
  if (typeHP <= 0 && !settings.disableGameOver) {
    gameOverTyping(typeScore, typeCombo);
    return;
  }

  const baseInterval = getTypeSpawnInterval();
  const baseSpeed = getTypeGameSpeed();
  spawnInterval = Math.max(220, baseInterval - Math.floor(typeScore / 50) * 10);
  if(isStartGame == true){
        isStartGame = false;
        spawnInterval = 0;
  }
  
  gameSpeed = baseSpeed + Math.floor(typeScore / 100) * 0.05;

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnWord();
    spawnTimer = 0;
  }

  typeCtx.clearRect(0, 0, canvasW, canvasH);
  drawGrid();

  fallingWords = fallingWords.filter(w => !w.done);
  fallingWords.forEach(w => {
    w.y += w.speed;
    if (w.y > canvasH + 20) {
      if (!settings.disableGameOver) {
        typeHP = Math.max(0, typeHP - 15);
        typeCombo = 0;
        updateTypeHUD();
        shakeScreen();
      }
      w.done = true;
    } else {
      drawWord(w);
    }
  });

  typingLoop = requestAnimationFrame(typeGameLoop);
}

function drawGrid() {
  typeCtx.strokeStyle = 'rgba(42,42,74,.5)';
  typeCtx.lineWidth = 1;
  for (let x = 0; x < canvasW; x += 40) {
    typeCtx.beginPath();
    typeCtx.moveTo(x, 0);
    typeCtx.lineTo(x, canvasH);
    typeCtx.stroke();
  }
  typeCtx.strokeStyle = 'rgba(255,45,85,.35)';
  typeCtx.lineWidth = 2;
  typeCtx.setLineDash([8, 4]);
  typeCtx.beginPath();
  typeCtx.moveTo(0, canvasH - 40);
  typeCtx.lineTo(canvasW, canvasH - 40);
  typeCtx.stroke();
  typeCtx.setLineDash([]);
}

function drawWord(w) {
  typeCtx.save();
  const isTarget = fallingWords.indexOf(w) === 0;

  typeCtx.shadowColor = w.color;
  typeCtx.shadowBlur = isTarget ? 18 : 8;

  typeCtx.font = 'bold 22px "Noto Sans JP", sans-serif';
  typeCtx.fillStyle = w.color;
  typeCtx.fillText(w.word, w.x, w.y);

  typeCtx.shadowBlur = 4;
  if (settings.typeHintsEnabled && w.romaji) {
    typeCtx.font = '11px "Press Start 2P", monospace';
    typeCtx.fillStyle = 'rgba(200,200,255,.5)';
    typeCtx.fillText(w.romaji, w.x, w.y + 18);
  }

  if (w.hint && settings.typeHintsEnabled) {
    typeCtx.font = '9px "Press Start 2P", monospace';
    typeCtx.fillStyle = 'rgba(200,200,255,.3)';
    typeCtx.fillText(w.hint, w.x, w.y + 28);
  }

  typeCtx.restore();

  const target = fallingWords[0];
  if (!target) return;

  document.getElementById('type-target').textContent = (target.hint && settings.typeHintsEnabled)
    ? `${target.word} — ${target.hint}`
    : target.word;
}

function onTypeInput(e) {
  const val = e.target.value.trim().toLowerCase();
  typeInput = val;

  const inp = document.getElementById('type-input');
  if (!val) {
    inp.className = '';
    return;
  }

  const target = fallingWords[0];
  if (!target) return;
  
  if (wanakana.toHiragana(val.trim().toLowerCase()) === wanakana.toHiragana(target.romaji.trim().toLowerCase())) {
    typeCombo++;
    const pts = 10 * Math.max(1, typeCombo);
    typeScore += pts;
    playerEXP += pts;
    target.done = true;
    const originalIndex = target.originalIndex;
    if (typeof originalIndex === 'number') updateQuestionStats(originalIndex, 'type', true);
    inp.value = '';
    inp.className = 'match-ok';
    setTimeout(() => inp.className = '', 300);
    showComboPopup(`+${pts} ⭐${typeCombo > 1 ? ` x${typeCombo}` : ''}`, target.x, target.y);
    if (typeCombo > 1) showToast(`🔥 COMBO x${typeCombo}!`, 'ok');
    updateTypeHUD();
  } else if (wanakana.toHiragana(target.romaji.trim().toLowerCase()).startsWith(wanakana.toHiragana(val.trim().toLowerCase()))) {
    inp.className = '';
  } else {
    inp.className = 'match-err';
  }
}

function updateTypeHUD() {
  document.getElementById('type-hp').textContent = typeHP;
  document.getElementById('type-score').textContent = typeScore;
  document.getElementById('type-combo').textContent = typeCombo;
  const modeEl = document.getElementById('type-mode');
  if (modeEl) modeEl.textContent = getTypeModeLabel();
  document.getElementById('type-hpbar').style.width = `${Math.max(0, typeHP)}%`;
}

function gameOverTyping(score, combo) {
  cancelAnimationFrame(typingLoop);
  typingLoop = null;
  gameOver(score, combo, 'type');
}

function shakeScreen() {
  const el = document.getElementById('screen-type');
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}
