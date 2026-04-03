// ================================================
// 日本語 QUEST — Game Utilities Module
// ================================================

const SLOW_RESPONSE_THRESHOLD = 8000;
const LEVEL_XP_CURVE = 1.2;
const BASE_XP_REWARD = 5;

/* ── PRIORITY SYSTEM ── */
const MAX_DAYS = 30;
const MAX_TIME_BONUS = 50;

function getPriorityScore(questionIndex, gameType, weights) {
  const id = `q-${questionIndex}`;
  const stats = questionStats[id]?.[gameType];
  
  const incorrect = stats?.incorrect || 0;
  const correctStreak = stats?.correctStreak || 0;
  const slowCorrectCount = stats?.slowCorrectCount || 0;
  const lastSeen = stats?.lastSeen ? new Date(stats.lastSeen) : null;
  
  let daysSinceLastSeen = MAX_DAYS;
  if (lastSeen) {
    const now = new Date();
    daysSinceLastSeen = Math.floor((now - lastSeen) / (1000 * 60 * 60 * 24));
    if (daysSinceLastSeen < 0) daysSinceLastSeen = 0;
    if (daysSinceLastSeen > MAX_DAYS) daysSinceLastSeen = MAX_DAYS;
  }
  
  const timeBonus = Math.min(daysSinceLastSeen * weights.timeSinceSeen, MAX_TIME_BONUS);
  const learningPenalty = correctStreak * weights.learning;
  const slowBonus = Math.min(slowCorrectCount * (weights.slowResponse || 0), 30);
  
  return (incorrect * weights.incorrect) + timeBonus - learningPenalty + slowBonus;
}

function getWeights(gameType) {
  if (!settings.priority?.enabled) {
    return { incorrect: 0, timeSinceSeen: 0, learning: 0, slowResponse: 0 };
  }
  
  const perGame = settings.priority.perGame?.[gameType];
  if (perGame?.enabled === true || perGame?.enabled === 1) {
    return perGame;
  }
  
  return settings.priority.global || { incorrect: 5, timeSinceSeen: 3, learning: 2, slowResponse: 3 };
}

function getPrioritizedDeck(questionsArr, gameType) {
  const weights = getWeights(gameType);
  
  if (!weights.incorrect && !weights.timeSinceSeen && !weights.learning && !weights.slowResponse) {
    return shuffle([...questionsArr]);
  }
  
  const scored = questionsArr.map((q, index) => ({
    question: q,
    index: index,
    score: getPriorityScore(index, gameType, weights)
  }));
  
  const totalWeight = scored.reduce((sum, item) => sum + Math.max(0, item.score) + 1, 0);
  
  const result = [];
  const tempIndices = [...Array(questionsArr.length).keys()];
  
  while (tempIndices.length > 0 && result.length < questionsArr.length) {
    let rand = Math.random() * totalWeight;
    let selectedIdx = -1;
    
    for (let i = 0; i < scored.length; i++) {
      const item = scored[i];
      if (!tempIndices.includes(item.index)) continue;
      
      rand -= (Math.max(0, item.score) + 1);
      if (rand <= 0) {
        selectedIdx = item.index;
        break;
      }
    }
    
    if (selectedIdx === -1) {
      const available = tempIndices.filter(idx => 
        scored.find(s => s.index === idx && Math.max(0, s.score) + 1 > 0)
      );
      if (available.length > 0) {
        selectedIdx = available[Math.floor(Math.random() * available.length)];
      } else {
        selectedIdx = tempIndices[Math.floor(Math.random() * tempIndices.length)];
      }
    }
    
    result.push(questionsArr[selectedIdx]);
    tempIndices.splice(tempIndices.indexOf(selectedIdx), 1);
  }
  
  if (result.length === 0) {
    return shuffle([...questionsArr]);
  }
  
  return result;
}

function updateQuestionStats(questionIndex, gameType, isCorrect, responseTime) {
  const id = `q-${questionIndex}`;
  if (!questionStats[id]) {
    questionStats[id] = {};
  }
  if (!questionStats[id][gameType]) {
    questionStats[id][gameType] = { incorrect: 0, correctCount: 0, totalAttempts: 0, lastSeen: null, correctStreak: 0, avgResponseTime: 0, slowCorrectCount: 0 };
  }
  
  const stats = questionStats[id][gameType];
  stats.lastSeen = new Date().toISOString();
  stats.totalAttempts = (stats.totalAttempts || 0) + 1;
  
  if (responseTime !== undefined) {
    const oldAvg = stats.avgResponseTime || 0;
    stats.avgResponseTime = oldAvg + (responseTime - oldAvg) / stats.totalAttempts;
  }
  
  if (isCorrect) {
    stats.correctStreak = (stats.correctStreak || 0) + 1;
    stats.correctCount = (stats.correctCount || 0) + 1;
    if (responseTime !== undefined && responseTime >= SLOW_RESPONSE_THRESHOLD) {
      stats.slowCorrectCount = (stats.slowCorrectCount || 0) + 1;
    }
  } else {
    stats.incorrect = (stats.incorrect || 0) + 1;
    stats.correctStreak = 0;
  }
  
  saveQuestionStats();
}

/* ── SHUFFLE ANSWER OPTIONS ── */
function shuffleAnswerOptions(q) {
  if (!settings.shuffleAnswers) {
    return { options: [...q.a], correctIndex: q.c };
  }
  
  const indexed = q.a.map((ans, i) => ({ text: ans, wasCorrect: i === q.c }));
  const shuffled = shuffle(indexed);
  const options = shuffled.map(item => item.text);
  const correctIndex = shuffled.findIndex(item => item.wasCorrect);
  
  return { options, correctIndex };
}

/* ── LEVEL SYSTEM ── */
function getXpForLevel(level) {
  return Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_XP_CURVE, level - 1));
}

function normalizePlayerProgress() {
  if (playerLevel < 1) playerLevel = 1;
  if (playerHP < 0) playerHP = 0;
  if (playerEXP < 0) playerEXP = 0;

  let leveledUp = false;
  while (playerEXP >= getXpForLevel(playerLevel)) {
    playerEXP -= getXpForLevel(playerLevel);
    playerLevel++;
    leveledUp = true;
  }

  if (leveledUp) {
    showToast(`🎉 Level ${playerLevel}!`, 'ok');
  }

  if (playerHP <= 0) {
    if (playerLevel > 1) {
      playerLevel -= 1;
      playerHP = 100;
    } else {
      playerHP = 0;
    }
  }
}

/* ── SESSION HISTORY ── */
function recordSession(type, score, correct, wrong) {
  const session = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    score: score,
    correct: correct,
    wrong: wrong,
    timestamp: new Date().toISOString()
  };
  sessionHistory.unshift(session);
  if (sessionHistory.length > 20) {
    sessionHistory.pop();
  }
  saveSessionHistory();
}

/* ── DAILY STREAK ── */
let dailyStreak = {
  currentStreak: 0,
  lastPlayDate: null,
  longestStreak: 0,
  playDates: {}
};

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadDailyStreak() {
  const stored = localStorage.getItem('jq_daily_streak');
  if (stored) {
    try {
      dailyStreak = { ...dailyStreak, ...JSON.parse(stored) };
    } catch (e) {
      dailyStreak = { currentStreak: 0, lastPlayDate: null, longestStreak: 0, playDates: {} };
    }
  }
}

function saveDailyStreak() {
  localStorage.setItem('jq_daily_streak', JSON.stringify(dailyStreak));
}

function recordPlayTime(minutes) {
  const today = getTodayDate();
  if (!dailyStreak.playDates[today]) {
    dailyStreak.playDates[today] = { minutes: 0, games: [] };
  }
  dailyStreak.playDates[today].minutes += minutes;
  saveDailyStreak();
  checkDailyStreak();
}

function checkDailyStreak() {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const todayData = dailyStreak.playDates[today];
  
  if (dailyStreak.lastPlayDate === today) return;
  
  if (todayData && todayData.minutes >= 5) {
    if (dailyStreak.lastPlayDate === yesterday) {
      dailyStreak.currentStreak++;
    } else if (dailyStreak.lastPlayDate !== today) {
      dailyStreak.currentStreak = 1;
    }
    dailyStreak.longestStreak = Math.max(dailyStreak.longestStreak, dailyStreak.currentStreak);
    dailyStreak.lastPlayDate = today;
    saveDailyStreak();
  }
}

/* ── STATS COMPUTATION ── */
function computeGameTypeStats() {
  const gameTypes = ['quiz', 'listen', 'flash', 'match', 'type', 'write'];
  const result = {};
  for (const t of gameTypes) {
    result[t] = { correct: 0, wrong: 0 };
  }
  
  questions.forEach((q, index) => {
    const id = `q-${index}`;
    const stats = questionStats[id];
    if (!stats) return;
    
    for (const gameType of gameTypes) {
      const typeStats = stats[gameType];
      if (!typeStats) continue;
      result[gameType].correct += typeStats.correctCount || 0;
      result[gameType].wrong += typeStats.incorrect || 0;
    }
  });
  
  return result;
}

function computeTotalStats() {
  const gameTypeStats = computeGameTypeStats();
  let totalCorrect = 0;
  let totalWrong = 0;
  
  for (const t of Object.values(gameTypeStats)) {
    totalCorrect += t.correct;
    totalWrong += t.wrong;
  }
  
  return { totalCorrect, totalWrong, gameTypeStats };
}
