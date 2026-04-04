// ================================================
// GAME 4: MATCH
// ================================================

let matchCards = [];
let matchSelection = [];
let matchAttempts = 0;
let matchFound = 0;
let pairCount = 0;
let matchTimeLeft = 0;
let matchTimerInterval = null;
let matchActive = false;
let matchCorrect = 0;
let matchWrong = 0;

function getMatchLabel(item) {
  return item.translation || item.romaji || item.word || item.q || '---';
}

function updateMatchHUD() {
  document.getElementById('match-found').textContent = matchFound;
  document.getElementById('match-attempts').textContent = matchAttempts;
  const timerEl = document.getElementById('match-timer');
  if (timerEl) timerEl.textContent = matchTimeLeft;
}

function startMatchTimer() {
  stopMatchTimer();
  if (matchTimeLeft <= 0) return;
  matchTimerInterval = setInterval(() => {
    if (!matchActive) {
      stopMatchTimer();
      return;
    }
    matchTimeLeft = Math.max(0, matchTimeLeft - 1);
    updateMatchHUD();
    if (matchTimeLeft <= 0) {
      endMatchByTime();
    }
  }, 1000);
}

function stopMatchTimer() {
  if (matchTimerInterval) {
    clearInterval(matchTimerInterval);
    matchTimerInterval = null;
  }
}

function endMatchByTime() {
  stopMatchTimer();
  matchActive = false;
  matchTimeLeft = 0;
  matchCards = matchCards.map(card => ({ ...card, revealed: true }));
  updateMatchHUD();
  renderMatchBoard();
  
  if (settings.disableGameOver) {
    showScreen('screen-menu');
  } else {
    showToast("⏱ Time's up!", 'err');
    setTimeout(() => {
      gameOver(Math.round((matchFound / matchAttempts) || 0), 0, 'match', matchCorrect, matchWrong);
    }, 1500);
  }
}

function renderMatchBoard() {
  const board = document.getElementById('match-board');
  board.innerHTML = matchCards.map(card => `
    <button class="tile-card ${card.revealed ? 'revealed ' : ''}${card.matched ? 'matched' : ''}${card.animating ? ' match-animation' : ''}"
      onclick="handleMatchCard('${card.cardId}')"
      ${card.revealed || card.matched || !matchActive ? 'disabled' : ''}>
      ${card.revealed || card.matched ? card.text : ' ? '}
    </button>`).join('');
}

function startMatch() {
  const prioritizedItems = getPrioritizedDeck(questions, 'quiz');
  let items = prioritizedItems;
  if (settings.questionLimitEnabled) {
    items = items.slice(0, settings.questionLimit);
  }
  pairCount = Math.min(settings.matchPairCount || 6, items.length);
  const matchItems = items.slice(0, pairCount);
  matchCards = shuffle(matchItems.flatMap((item, index) => ([
    { cardId: `word-${index}`, pairId: index, kind: 'word', text: item.word, revealed: false, matched: false, animating: false, questionId: generateQuestionId(item) },
    { cardId: `label-${index}`, pairId: index, kind: 'label', text: getMatchLabel(item), revealed: false, matched: false, animating: false, questionId: generateQuestionId(item) }
  ])));
  matchSelection = [];
  matchAttempts = 0;
  matchFound = 0;
  matchCorrect = 0;
  matchWrong = 0;
  matchActive = true;
  matchTimeLeft = settings.matchTimeLimit;
  showScreen('screen-match');
  renderMatchBoard();
  updateMatchHUD();
  startMatchTimer();
}

function handleMatchCard(cardId) {
  const card = matchCards.find(c => c.cardId === cardId);
  if (!card || card.matched || card.revealed || matchSelection.length === 2 || !matchActive) return;
  card.revealed = true;
  matchSelection.push(card);
  renderMatchBoard();

  if (matchSelection.length === 2) {
    matchAttempts++;
    updateMatchHUD();
    const [first, second] = matchSelection;
    if (first.pairId === second.pairId && first.kind !== second.kind) {
      first.matched = second.matched = true;
      first.animating = second.animating = true;
      renderMatchBoard();
      matchFound++;
      matchCorrect++;
      matchSelection = [];
      showToast('✅ Correct match!', 'ok');
      updateMatchHUD();
      setTimeout(() => {
        first.animating = false;
        second.animating = false;
        renderMatchBoard();
      }, 600);
      if (matchFound === pairCount) {        
        stopMatchTimer();
        matchActive = false;
        gameOver(Math.round((matchFound / matchAttempts) || 0), 0, 'match', matchCorrect, matchWrong, true);
        setTimeout(() => showToast('🎉 Complete!', 'ok'), 300);
        saveToStorage();
        if (gameStartTime) {
          const elapsed = (Date.now() - gameStartTime) / 60000;
          recordPlayTime(elapsed);
        }
      }
    } else {
      matchWrong++;
      setTimeout(() => {
        first.revealed = false;
        second.revealed = false;
        matchSelection = [];
        renderMatchBoard();
      }, 800);
    }
  }
}