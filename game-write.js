// ================================================
// GAME 6: WRITING PRACTICE (Canvas-based)
// ================================================

let writeDeck = [];
let writeIdx = 0;
let writeHP = 100;
let writeScore = 0;
let writeCombo = 0;
let writeCorrect = 0;
let writeWrong = 0;
let writeQuestionStartTime = 0;
let writeUseFallback = false;

const BASE_XP_WRITE = 8;

function startWrite() {
  showScreen('screen-write');
  writeHP = 100;
  writeScore = 0;
  writeCombo = 0;
  writeCorrect = 0;
  writeWrong = 0;
  writeDeck = getPrioritizedDeck(questions, 'write');
  if (settings.questionLimitEnabled) {
    writeDeck = writeDeck.slice(0, settings.questionLimit);
  }
  writeIdx = 0;
  writeUseFallback = false;
  document.getElementById('modal-gameover').classList.add('hidden');
  
  KanjiCanvas.init('writeCanvas');
  renderWrite();
}

function renderWrite() {
  updateWriteHUD();
  
  if (writeIdx >= writeDeck.length) {
    writeComplete();
    return;
  }
  
  const q = writeDeck[writeIdx];
  writeQuestionStartTime = Date.now();
  
  document.getElementById('write-progress').textContent = `${writeIdx + 1} / ${writeDeck.length}`;
  document.getElementById('write-target-char').textContent = q.word || '?';
  document.getElementById('write-hint-translation').textContent = q.translation || '---';
  document.getElementById('write-hint-romaji').textContent = q.romaji || '---';
  
  KanjiCanvas.erase('writeCanvas');
  
  document.getElementById('write-feedback').classList.add('hidden');
  document.getElementById('write-next').classList.add('hidden');
  document.getElementById('write-fallback').classList.add('hidden');
  document.getElementById('write-candidates').classList.add('hidden');
  writeUseFallback = false;
  
  const inp = document.getElementById('write-input');
  inp.value = '';
  inp.disabled = false;
}

function checkWriteAnswer() {
  if (writeIdx >= writeDeck.length) return;
  
  if (writeUseFallback) {
    checkWriteFallbackAnswer();
    return;
  }
  
  const q = writeDeck[writeIdx];
  const canvas = document.getElementById('writeCanvas');
  const candidates = document.getElementById('write-candidates');
  
  const hasStrokes = KanjiCanvas['recordedPattern_writeCanvas'] && 
                      KanjiCanvas['recordedPattern_writeCanvas'].length > 0;
  
  if (!hasStrokes) {
    showToast('Please draw something first!', 'err');
    return;
  }
  
  const result = KanjiCanvas.recognize('writeCanvas');
  const candidatesText = result || '';
  candidates.textContent = candidatesText;
  candidates.classList.remove('hidden');
  
  if (!candidatesText || candidatesText.trim() === '') {
    showWriteFallback();
    return;
  }
  
  const topCandidates = candidatesText.split('').slice(0, 3);
  const targetChar = q.word.trim();
  
  const matchIndex = topCandidates.findIndex(c => c === targetChar);
  const isCorrect = matchIndex !== -1;
  
  const responseTime = Date.now() - writeQuestionStartTime;
  const feedback = document.getElementById('write-feedback');
  feedback.classList.remove('hidden');
  
  if (isCorrect) {
    writeCombo++;
    writeCorrect++;
    const pts = Math.floor(BASE_XP_WRITE * Math.max(1, writeCombo) * 1.5);
    writeScore += pts;
    playerEXP += pts;
    updateQuestionStats(writeIdx, 'write', true, responseTime);
    
    let msg = `<span style="color: #30d158">✅ Correct! +${pts} EXP</span>`;
    if (matchIndex > 0) msg += ` <span style="color: #ffd60a">(#${matchIndex + 1} match)</span>`;
    if (writeCombo > 1) msg += ` <span style="color: #ffd60a">🔥 x${writeCombo}</span>`;
    feedback.innerHTML = msg;
  } else {
    writeCombo = 0;
    writeWrong++;
    if (!settings.disableGameOver) {
      writeHP = Math.max(0, writeHP - 20);
    }
    updateQuestionStats(writeIdx, 'write', false, responseTime);
    
    feedback.innerHTML = `<span style="color: #ff2d55">❌ Not quite!</span><br>
      <span style="color: #30d158">Draw: ${escapeHtml(targetChar)}</span>
      <br><button class="canvas-btn" onclick="showWriteFallback()">Try typing instead</button>`;
    
    document.getElementById('screen-write').classList.add('shake');
    setTimeout(() => document.getElementById('screen-write').classList.remove('shake'), 400);
  }
  
  document.getElementById('write-next').classList.remove('hidden');
  updateWriteHUD();
  
  if (!settings.disableGameOver && writeHP <= 0) {
    showToast('💀 Out of health!', 'err');
    gameOver(writeScore, writeCombo, 'write', writeCorrect, writeWrong, false);
  }
}

function showWriteFallback() {
  writeUseFallback = true;
  document.getElementById('write-fallback').classList.remove('hidden');
  document.getElementById('write-candidates').classList.add('hidden');
  document.getElementById('write-feedback').classList.add('hidden');
  document.getElementById('write-next').classList.add('hidden');
  
  const inp = document.getElementById('write-input');
  inp.value = '';
  inp.focus();
}

function showWriteCanvas() {
  writeUseFallback = false;
  document.getElementById('write-fallback').classList.add('hidden');
  KanjiCanvas.erase('writeCanvas');
}

function checkWriteFallbackAnswer() {
  if (writeIdx >= writeDeck.length) return;
  
  const q = writeDeck[writeIdx];
  const inp = document.getElementById('write-input');
  const val = inp.value.trim();
  
  if (!val) return;
  
  const responseTime = Date.now() - writeQuestionStartTime;
  let isCorrect = false;
  
  if (settings.typeCompareMode === 'romaji') {
    isCorrect = wanakana.toHiragana(val.toLowerCase()) === wanakana.toHiragana(q.romaji.trim().toLowerCase());
  } else {
    isCorrect = val === q.word.trim();
  }
  
  const feedback = document.getElementById('write-feedback');
  feedback.classList.remove('hidden');
  
  if (isCorrect) {
    writeCombo++;
    writeCorrect++;
    const pts = Math.floor(BASE_XP_WRITE * Math.max(1, writeCombo) * 1.5);
    writeScore += pts;
    playerEXP += pts;
    updateQuestionStats(writeIdx, 'write', true, responseTime);
    feedback.innerHTML = `<span style="color: #30d158">✅ Correct! +${pts} EXP</span>`;
    if (writeCombo > 1) feedback.innerHTML += ` <span style="color: #ffd60a">🔥 x${writeCombo}</span>`;
  } else {
    writeCombo = 0;
    writeWrong++;
    if (!settings.disableGameOver) {
      writeHP = Math.max(0, writeHP - 20);
    }
    updateQuestionStats(writeIdx, 'write', false, responseTime);
    feedback.innerHTML = `<span style="color: #ff2d55">❌ Wrong!</span><br><span style="color: #30d158">Answer: ${escapeHtml(q.word)}</span>`;
    document.getElementById('screen-write').classList.add('shake');
    setTimeout(() => document.getElementById('screen-write').classList.remove('shake'), 400);
  }
  
  inp.disabled = true;
  document.getElementById('write-next').classList.remove('hidden');
  updateWriteHUD();
  
  if (!settings.disableGameOver && writeHP <= 0) {
    showToast('💀 Out of health!', 'err');
    gameOver(writeScore, writeCombo, 'write', writeCorrect, writeWrong, false);
  }
}

function nextWrite() {
  writeIdx++;
  renderWrite();
}

function writeComplete() {
  gameOver(writeScore, writeCombo, 'write', writeCorrect, writeWrong, true);
  saveToStorage();
  showToast(`✍️ Complete! Score: ${writeScore}`, 'ok');
  if (gameStartTime) {
    const elapsed = (Date.now() - gameStartTime) / 60000;
    recordPlayTime(elapsed);
  }
  setTimeout(() => showScreen('screen-menu'), 800);
}

function updateWriteHUD() {
  document.getElementById('write-hp').textContent = writeHP;
  document.getElementById('write-score').textContent = writeScore;
  document.getElementById('write-combo').textContent = writeCombo;
  document.getElementById('write-hpbar').style.width = `${Math.max(0, writeHP)}%`;
}

// ================================================
// PRACTICE MODAL (Canvas-based)
// ================================================

let practiceWriteWord = '';
let practiceWriteRomaji = '';
let practiceUseFallback = false;

function showWritePracticeModal(word, romaji, translation) {
  practiceWriteWord = word;
  practiceWriteRomaji = romaji;
  practiceUseFallback = false;
  
  document.getElementById('practice-target-char').textContent = word || '?';
  document.getElementById('practice-hint-translation').textContent = translation || '---';
  document.getElementById('practice-hint-romaji').textContent = romaji || '---';
  
  KanjiCanvas.init('practiceCanvas');
  KanjiCanvas.erase('practiceCanvas');
  
  document.getElementById('practice-fallback').classList.add('hidden');
  document.getElementById('practice-candidates').classList.add('hidden');
  document.getElementById('practice-feedback').classList.add('hidden');
  
  const inp = document.getElementById('practice-write-input');
  inp.value = '';
  inp.disabled = false;
  
  document.getElementById('write-practice-modal').classList.remove('hidden');
}

function closeWritePracticeModal() {
  document.getElementById('write-practice-modal').classList.add('hidden');
}

function checkWritePracticeAnswer() {
  const q = { word: practiceWriteWord, romaji: practiceWriteRomaji };
  
  if (practiceUseFallback) {
    checkWritePracticeFallback();
    return;
  }
  
  const canvas = document.getElementById('practiceCanvas');
  const candidates = document.getElementById('practice-candidates');
  
  const hasStrokes = KanjiCanvas['recordedPattern_practiceCanvas'] && 
                      KanjiCanvas['recordedPattern_practiceCanvas'].length > 0;
  
  if (!hasStrokes) {
    showToast('Please draw something first!', 'err');
    return;
  }
  
  const result = KanjiCanvas.recognize('practiceCanvas');
  const candidatesText = result || '';
  candidates.textContent = candidatesText;
  candidates.classList.remove('hidden');
  
  if (!candidatesText || candidatesText.trim() === '') {
    showPracticeFallback();
    return;
  }
  
  const topCandidates = candidatesText.split('').slice(0, 3);
  const targetChar = q.word.trim();
  
  const matchIndex = topCandidates.findIndex(c => c === targetChar);
  const isCorrect = matchIndex !== -1;
  
  const feedback = document.getElementById('practice-feedback');
  feedback.classList.remove('hidden');
  
  if (isCorrect) {
    let msg = `<span style="color: #30d158">✅ Great job!</span>`;
    if (matchIndex > 0) msg += ` (Match #${matchIndex + 1})`;
    feedback.innerHTML = msg;
    setTimeout(() => closeWritePracticeModal(), 1500);
  } else {
    feedback.innerHTML = `<span style="color: #ff2d55">❌ Not quite!</span>
      <br><button class="canvas-btn" onclick="showPracticeFallback()">Try typing</button>`;
  }
}

function showPracticeFallback() {
  practiceUseFallback = true;
  document.getElementById('practice-fallback').classList.remove('hidden');
  document.getElementById('practice-candidates').classList.add('hidden');
  document.getElementById('practice-feedback').classList.add('hidden');
  
  const inp = document.getElementById('practice-write-input');
  inp.value = '';
  inp.focus();
}

function showPracticeCanvas() {
  practiceUseFallback = false;
  document.getElementById('practice-fallback').classList.add('hidden');
  KanjiCanvas.erase('practiceCanvas');
}

function checkWritePracticeFallback() {
  const inp = document.getElementById('practice-write-input');
  const val = inp.value.trim();
  const feedback = document.getElementById('practice-feedback');
  
  if (!val) return;
  
  let isCorrect = false;
  if (settings.typeCompareMode === 'romaji') {
    isCorrect = wanakana.toHiragana(val.toLowerCase()) === wanakana.toHiragana(practiceWriteRomaji.trim().toLowerCase());
  } else {
    isCorrect = val === practiceWriteWord.trim();
  }
  
  feedback.classList.remove('hidden');
  if (isCorrect) {
    feedback.innerHTML = `<span style="color: #30d158">✅ Correct! Well done!</span>`;
    setTimeout(() => closeWritePracticeModal(), 1500);
  } else {
    feedback.innerHTML = `<span style="color: #ff2d55">❌ Try again!</span><br><span style="color: #30d158">Answer: ${escapeHtml(practiceWriteWord)}</span>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const writeInput = document.getElementById('write-input');
  if (writeInput) {
    writeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && writeUseFallback && !writeInput.disabled) {
        checkWriteFallbackAnswer();
      }
    });
  }
  
  const practiceInput = document.getElementById('practice-write-input');
  if (practiceInput) {
    practiceInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && practiceUseFallback) {
        checkWritePracticeFallback();
      }
    });
  }
});
