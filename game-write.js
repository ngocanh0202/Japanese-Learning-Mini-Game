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

let writeKanjiQueue = [];
let writeCurrentKanjiIdx = 0;

function getKanjiChars(word) {
  return word.split('').filter(c => /[\u4e00-\u9faf]/.test(c));
}

function startWrite() {
  showScreen('screen-write');
  writeHP = 100;
  writeScore = 0;
  writeCombo = 0;
  writeCorrect = 0;
  writeWrong = 0;
  const rawDeck = getPrioritizedDeck(questions, 'write');
  if (settings.questionLimitEnabled) {
    writeDeck = rawDeck.slice(0, settings.questionLimit);
  } else {
    writeDeck = rawDeck;
  }
  
  writeKanjiQueue = [];
  writeDeck.forEach(q => {
    const kanjis = getKanjiChars(q.word);
    kanjis.forEach(k => {
      writeKanjiQueue.push({
        kanji: k,
        word: q.word,
        romaji: q.romaji,
        translation: q.translation
      });
    });
  });
  
  writeIdx = 0;
  writeCurrentKanjiIdx = 0;
  writeUseFallback = false;
  document.getElementById('modal-gameover').classList.add('hidden');
  
  KanjiCanvas.init('writeCanvas');
  renderWrite();
}

function renderWrite() {
  updateWriteHUD();
  
  if (writeKanjiQueue.length === 0) {
    writeComplete();
    return;
  }
  
  const current = writeKanjiQueue[writeCurrentKanjiIdx];
  writeQuestionStartTime = Date.now();
  
  document.getElementById('write-progress').textContent = `${writeCurrentKanjiIdx + 1} / ${writeKanjiQueue.length}`;
  document.getElementById('write-target-char').textContent = current.kanji || '?';
  document.getElementById('write-hint-translation').textContent = current.translation || '---';
  document.getElementById('write-hint-romaji').textContent = current.romaji || '---';
  
  KanjiCanvas.erase('writeCanvas');
  
  const feedback = document.getElementById('write-feedback');
  if (feedback) feedback.classList.add('hidden');
  const canvasControls = document.getElementById('write-canvas-controls');
  if (canvasControls) canvasControls.classList.remove('hidden');
  const postCheckControls = document.getElementById('write-post-check-controls');
  if (postCheckControls) postCheckControls.classList.add('hidden');
}

function checkWriteAnswer() {
  const current = writeKanjiQueue[writeCurrentKanjiIdx];
  const canvas = document.getElementById('writeCanvas');
  
  const hasStrokes = KanjiCanvas['recordedPattern_writeCanvas'] && 
                      KanjiCanvas['recordedPattern_writeCanvas'].length > 0;
  
  if (!hasStrokes) {
    showToast('Please draw something first!', 'err');
    return;
  }
  
  const i = KanjiCanvas.momentNormalize('writeCanvas');
  const e = KanjiCanvas.extractFeatures(i, 20);
  const s = KanjiCanvas.coarseClassification(e);
  const result = KanjiCanvas.fineClassification(e, s);
  
  const targetChar = current.kanji.trim();
  const matchIndex = result.split('').findIndex(c => c === targetChar);
  const matchPercent = matchIndex >= 0 ? Math.max(10, 100 - (matchIndex * 10)) : 0;
  
  const responseTime = Date.now() - writeQuestionStartTime;
  
  if (matchPercent >= 10) {
    writeCombo++;
    writeCorrect++;
    const pts = Math.floor(BASE_XP_WRITE * Math.max(1, writeCombo) * 1.5 * (matchPercent / 100));
    writeScore += pts;
    playerEXP += pts;
    updateQuestionStats(writeIdx, 'write', true, responseTime);
    
    let msg = `✓ ${matchPercent}% Match! +${pts} EXP`;
    if (matchIndex > 0) msg += ` (#${matchIndex + 1})`;
    if (writeCombo > 1) msg += ` 🔥 x${writeCombo}`;
    showToast(msg, 'ok');
  } else {
    writeCombo = 0;
    writeWrong++;
    if (!settings.disableGameOver) {
      writeHP = Math.max(0, writeHP - 20);
    }
    updateQuestionStats(writeIdx, 'write', false, responseTime);
    
    showToast('✗ Not recognized', 'err');
    
    const screenWrite = document.getElementById('screen-write');
    if (screenWrite) {
      screenWrite.classList.add('shake');
      setTimeout(() => screenWrite.classList.remove('shake'), 400);
    }
  }
  
  const canvasControls = document.getElementById('write-canvas-controls');
  if (canvasControls) canvasControls.classList.add('hidden');
  const postCheckControls = document.getElementById('write-post-check-controls');
  if (postCheckControls) postCheckControls.classList.remove('hidden');
  updateWriteHUD();
  
  if (!settings.disableGameOver && writeHP <= 0) {
    showToast('💀 Out of health!', 'err');
    gameOver(writeScore, writeCombo, 'write', writeCorrect, writeWrong, false);
  }
}

function retryWrite() {
  const feedback = document.getElementById('write-feedback');
  if (feedback) feedback.classList.add('hidden');
  
  const canvasControls = document.getElementById('write-canvas-controls');
  if (canvasControls) canvasControls.classList.remove('hidden');
  const postCheckControls = document.getElementById('write-post-check-controls');
  if (postCheckControls) postCheckControls.classList.add('hidden');
  
  KanjiCanvas.erase('writeCanvas');
}

function nextWrite() {
  writeCurrentKanjiIdx++;
  if (writeCurrentKanjiIdx < writeKanjiQueue.length) {
    renderWrite();
  } else {
    writeIdx++;
    renderWrite();
  }
  
  const canvasControls = document.getElementById('write-canvas-controls');
  if (canvasControls) canvasControls.classList.remove('hidden');
  const postCheckControls = document.getElementById('write-post-check-controls');
  if (postCheckControls) postCheckControls.classList.add('hidden');
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

function skipWrite() {
  if (writeKanjiQueue.length === 0) return;
  
  writeCombo = 0;
  writeWrong++;
  if (!settings.disableGameOver) {
    writeHP = Math.max(0, writeHP - 20);
  }
  
  updateQuestionStats(writeIdx, 'write', false, 0);
  
  const current = writeKanjiQueue[writeCurrentKanjiIdx];
  showToast(`⏭️ Skipped: ${current.kanji}`, 'err');
  
  const screenWrite = document.getElementById('screen-write');
  if (screenWrite) {
    screenWrite.classList.add('shake');
    setTimeout(() => screenWrite.classList.remove('shake'), 400);
  }
  
  writeCurrentKanjiIdx++;
  if (writeCurrentKanjiIdx >= writeKanjiQueue.length) {
    writeIdx++;
  }
  
  if (!settings.disableGameOver && writeHP <= 0) {
    showToast('💀 Out of health!', 'err');
    gameOver(writeScore, writeCombo, 'write', writeCorrect, writeWrong, false);
  } else {
    const canvasControls = document.getElementById('write-canvas-controls');
    if (canvasControls) canvasControls.classList.remove('hidden');
    const postCheckControls = document.getElementById('write-post-check-controls');
    if (postCheckControls) postCheckControls.classList.add('hidden');
    renderWrite();
  }
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
  
  // Use fineClassification directly for practice canvas
  const i = KanjiCanvas.momentNormalize('practiceCanvas');
  const e = KanjiCanvas.extractFeatures(i, 20);
  const s = KanjiCanvas.coarseClassification(e);
  const result = KanjiCanvas.fineClassification(e, s);
  
  const candidatesText = result || '';
  candidates.textContent = candidatesText;
  candidates.classList.remove('hidden');
  
  const targetChar = q.word.trim();
  const matchIndex = candidatesText.split('').findIndex(c => c === targetChar);
  const matchPercent = matchIndex >= 0 ? Math.max(10, 100 - (matchIndex * 10)) : 0;
  
  if (matchPercent >= 10) {
    let msg = `✓ ${matchPercent}% Match!`;
    if (matchIndex > 0) msg += ` (#${matchIndex + 1})`;
    showToast(msg, 'ok');
    setTimeout(() => closeWritePracticeModal(), 1500);
  } else {
    showToast('✗ Not recognized', 'err');
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
