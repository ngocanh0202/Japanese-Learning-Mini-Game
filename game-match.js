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
  const animationsEnabled = settings.animationEnabled !== false;
  
  board.innerHTML = matchCards.map((card, idx) => {
    let classes = 'tile-card';
    if (card.revealed) classes += ' revealed';
    if (card.matched) classes += ' matched';
    
    if (animationsEnabled && !card.revealed && !card.matched && matchActive) {
      classes += ' entering';
      return `<button class="${classes}" style="animation-delay: ${idx * 0.05}s" onclick="handleMatchCard('${card.cardId}')" ${card.revealed || card.matched || !matchActive ? 'disabled' : ''}>${card.revealed || card.matched ? card.text : ' ? '}</button>`;
    }
    
    return `<button class="${classes}" onclick="handleMatchCard('${card.cardId}')" ${card.revealed || card.matched || !matchActive ? 'disabled' : ''}>${card.revealed || card.matched ? card.text : ' ? '}</button>`;
  }).join('');
}

function startMatch() {
  pairCount = Math.min(6, questions.length);
  const prioritizedItems = getPrioritizedDeck(questions, 'match');
  const items = prioritizedItems.slice(0, pairCount);
  matchCards = shuffle(items.flatMap((item, index) => ([
    { cardId: `word-${index}`, pairId: index, kind: 'word', text: item.word, revealed: false, matched: false },
    { cardId: `label-${index}`, pairId: index, kind: 'label', text: getMatchLabel(item), revealed: false, matched: false }
  ])));
  matchSelection = [];
  matchAttempts = 0;
  matchFound = 0;
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
  
  const animationsEnabled = settings.animationEnabled !== false;
  
  card.revealed = true;
  matchSelection.push(card);
  
  if (animationsEnabled) {
    const cardEl = document.querySelector(`[onclick="handleMatchCard('${cardId}')"]`);
    if (cardEl) cardEl.classList.add('flipping');
  }
  
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
      
      if (animationsEnabled) {
        setTimeout(() => {
          const cardEls = document.querySelectorAll('.tile-card.matched');
          cardEls.forEach(el => el.classList.add('match-success'));
        }, 100);
      }
      
      showToast('✅ Correct match!', 'ok');
      updateMatchHUD();
      if (matchFound === pairCount) {        
        stopMatchTimer();
        matchActive = false;        
        setTimeout(() => showToast('🎉 You completed the game!', 'info'), 300);
      }
    } else {
      updateQuestionStats(first.pairId, 'match', false);
      
      if (animationsEnabled) {
        setTimeout(() => {
          const cardEls = document.querySelectorAll('.tile-card.revealed:not(.matched)');
          cardEls.forEach(el => el.classList.add('match-wrong'));
        }, 300);
      }
      
      setTimeout(() => {
        first.revealed = false;
        second.revealed = false;
        matchSelection = [];
        renderMatchBoard();
      }, 800);
    }
  }
}
