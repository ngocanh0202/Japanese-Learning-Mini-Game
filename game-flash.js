// ================================================
// GAME 2: FLASHCARD
// ================================================

let flashDeck = [];
let flashIdx = 0;
let flashKnown = 0;
let flashUnknown = 0;


function startFlash() {
  flashDeck = getPrioritizedDeck(questions, 'flash');
  flashIdx = 0;
  flashKnown = 0;
  flashUnknown = 0;
  showScreen('screen-flash');
  renderCard();
}

function renderCard() {
  updateFlashHUD();
  const card = document.getElementById('card-inner');
  card.classList.remove('flipped');
  document.getElementById('flash-actions').classList.add('hidden');

  if (flashIdx >= flashDeck.length) {
    flashComplete();
    return;
  }

  const q = flashDeck[flashIdx];
  document.getElementById('card-word').textContent = q.word;
  document.getElementById('card-reading').textContent = q.a[q.c];
  document.getElementById('card-explanation').textContent = q.ex || '';
}

function flipCard() {
  const card = document.getElementById('card-inner');
  if (card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  document.getElementById('flash-actions').classList.remove('hidden');
}

function markCard(known) {
  if (known) {
    flashKnown++;
    playerEXP += 5;
    updateQuestionStats(flashIdx, 'flash', true);
  } else {
    flashUnknown++;
    updateQuestionStats(flashIdx, 'flash', false);
  }
  flashIdx++;
  renderCard();
}

function flashComplete() {
  saveToStorage();
  showToast(`📚 Complete! ✅${flashKnown}  ❌${flashUnknown}`, 'info');
  setTimeout(() => showScreen('screen-menu'), 1000);
}

function updateFlashHUD() {
  document.getElementById('flash-known').textContent = flashKnown;
  document.getElementById('flash-unknown').textContent = flashUnknown;
  document.getElementById('flash-progress-txt').textContent = `${flashIdx}/${flashDeck.length}`;
  const pct = flashDeck.length ? (flashIdx / flashDeck.length * 100) : 0;
  document.getElementById('flash-bar').style.width = `${pct}%`;
}
