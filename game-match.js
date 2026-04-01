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

function getMatchLabel(item) {
  return item.translation || item.romaji || item.word || item.q || '---';
 

// Overridden: disable original startMatch logic to allow safe removal
function startMatch() { /* removed - no-op to disable */ }

function updateMatchHUD() {
  document.getElementById('match-found').textContent = matchFound;
  document.getElementById('match-attempts').textContent = matchAttempts;
  const timerEl = document.getElementById('match-timer');
  if (timerEl) timerEl.textContent = matchTimeLeft;
 

function startMatchTimer() {
  stopMatchTimer();
  if (matchTimeLeft <= 0) return;
  matchTimerInterval = setInterval(() => {
    matchTimeLeft = Math.max(0, matchTimeLeft - 1);
    updateMatchHUD();
    if (matchTimeLeft <= 0) {
      endMatchByTime();
    }
  }, 1000);
 

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
  showToast('⏱ Time’s up!', settings.disableGameOver ? 'info' : 'err');
  setTimeout(() => {
    if (settings.disableGameOver) {
      showScreen('screen-menu');
    } else {
      gameOver(Math.round((matchFound / matchAttempts) || 0), 0, 'match');
    }
  }, 1500);
}

function renderMatchBoard() {
  const board = document.getElementById('match-board');
  
  board.innerHTML = matchCards.map((card) => {
    let classes = 'tile-card';
    if (card.revealed) classes += ' revealed';
    if (card.matched) classes += ' matched';
    
    const disabled = card.revealed || card.matched || !matchActive ? 'disabled' : '';
    const text = card.revealed || card.matched ? card.text : ' ? ';
    
    return `<button class="${classes}" onclick="handleMatchCard('${card.cardId}')" ${disabled}>${text}</button>`;
  }).join('');
}

function startMatch() {
  // Minimal, safe startup to allow gameplay without full deck setup
  if (!questions || questions.length === 0) return;
  pairCount = Math.min(2, questions.length);
  const q = questions[0];
  matchCards = [
    { cardId: 'word-0', pairId: 0, kind: 'word', text: q.word, revealed: false, matched: false },
    { cardId: 'label-0', pairId: 0, kind: 'label', text: getMatchLabel(q), revealed: false, matched: false }
  ];
  matchSelection = [];
  matchAttempts = 0;
  matchFound = 0;
  matchActive = true;
  matchTimeLeft = settings.matchTimeLimit;
  matchFirstRender = false;
  showScreen('screen-match');
  renderMatchBoard();
  updateMatchHUD();
  // Do not start timer to keep minimal flow
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
      matchFound++;
      matchSelection = [];
      updateQuestionStats(first.pairId, 'match', true);
      renderMatchBoard();
      showToast('✅ Correct match!', 'ok');
      updateMatchHUD();
      if (matchFound === pairCount) {        
        stopMatchTimer();
        matchActive = false;        
        setTimeout(() => showToast('🎉 You completed the game!', 'info'), 300);
      }
    } else {
      updateQuestionStats(first.pairId, 'match', false);
      
      setTimeout(() => {
        first.revealed = false;
        second.revealed = false;
        matchSelection = [];
        renderMatchBoard();
      }, 800);
    }
  }
}
