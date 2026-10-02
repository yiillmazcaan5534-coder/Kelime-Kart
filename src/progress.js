const progressKey = 'kelimekart-progress-v1'

export function getWordKey(listId, word) {
  return `${listId}::${word.english}::${word.turkish}`.toLocaleLowerCase('tr-TR')
}

export function loadProgress() {
  try { return JSON.parse(localStorage.getItem(progressKey)) || {} } catch { return {} }
}

export function saveProgress(progress) {
  localStorage.setItem(progressKey, JSON.stringify(progress))
}

export function updateWordProgress(current, listId, word, result) {
  const key = getWordKey(word.reviewListId || listId, word)
  const previous = current[key] || { streak: 0, correct: 0, wrong: 0, nextReviewAt: null }
  const now = Date.now()
  if (result === 'again') return { ...current, [key]: { ...previous, streak: 0, wrong: previous.wrong + 1, nextReviewAt: now + 86400000 } }

  const streak = previous.streak + 1
  const days = streak === 1 ? 1 : streak === 2 ? 3 : streak === 3 ? 7 : 14
  return { ...current, [key]: { ...previous, streak, correct: previous.correct + 1, nextReviewAt: now + days * 86400000 } }
}

export function getMasteredCount(list, progress) {
  return list.words.filter((word) => (progress[getWordKey(list.id, word)]?.streak || 0) >= 3).length
}
