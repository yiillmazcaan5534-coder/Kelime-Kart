import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './Detail.css'
import './StudyButton.css'
import './QuickEntry.css'
import './StudyMode.css'
import './CreateOptions.css'
import './Dashboard.css'
import './Showcase.css'
import StudySession from './StudySession'
import SpellingSession from './SpellingSession'
import QuizSession from './QuizSession'
import MidtermDetail from './MidtermDetail'
import { a1WordLists } from './a1WordLists'
import { midtermList } from './midtermWords'
import { getMasteredCount, getWordKey, loadProgress, saveProgress, updateWordProgress } from './progress'

const starterLists = [
  { id: 'starter-core', title: 'Temel Kelimeler', accent: 'blue', words: [
    { english: 'question', pronunciation: 'kuesçın', turkish: 'soru' },
    { english: 'answer', pronunciation: 'ensır', turkish: 'cevap' },
    { english: 'problem', pronunciation: 'prablım', turkish: 'sorun / problem' },
    { english: 'idea', pronunciation: 'aydiya', turkish: 'fikir' },
    { english: 'enough', pronunciation: 'inaf', turkish: 'yeterli' },
    { english: 'different', pronunciation: 'difrınt', turkish: 'farklı' },
    { english: 'important', pronunciation: 'importınt', turkish: 'önemli' },
    { english: 'difficult', pronunciation: 'difikılt', turkish: 'zor' },
    { english: 'easy', pronunciation: 'izi', turkish: 'kolay' },
    { english: 'together', pronunciation: 'tıgedır', turkish: 'birlikte' },
  ] },
  ...a1WordLists,
  midtermList,
]

function loadLists() {
  const stored = JSON.parse(localStorage.getItem('kelimekart-lists'))
  if (!stored) return starterLists
  const withoutOldDemos = stored.filter((list) => !['unit-3', 'phrases'].includes(list.id))
  const missingStarterLists = starterLists.filter((starter) => !withoutOldDemos.some((list) => list.id === starter.id))
  return [...withoutOldDemos, ...missingStarterLists]
}

const favoritesKey = 'kelimekart-favorites-v1'
function loadFavorites() { try { return JSON.parse(localStorage.getItem(favoritesKey)) || {} } catch { return {} } }

function App() {
  const [lists, setLists] = useState(loadLists)
  const [activeListId, setActiveListId] = useState(null)
  const [studyMode, setStudyMode] = useState(null)
  const [sessionList, setSessionList] = useState(null)
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [listName, setListName] = useState('')
  const [newListShuffle, setNewListShuffle] = useState(false)
  const [progress, setProgress] = useState(loadProgress)
  const [favorites, setFavorites] = useState(loadFavorites)
  const [english, setEnglish] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [turkish, setTurkish] = useState('')
  const englishInput = useRef(null)
  const turkishInput = useRef(null)
  const reorderTimer = useRef(null)
  const draggingListId = useRef(null)
  const justReordered = useRef(false)
  const [draggingId, setDraggingId] = useState(null)
  useEffect(() => localStorage.setItem('kelimekart-lists', JSON.stringify(lists)), [lists])
  useEffect(() => saveProgress(progress), [progress])
  useEffect(() => localStorage.setItem(favoritesKey, JSON.stringify(favorites)), [favorites])
  const dailyReviewList = useMemo(() => {
    const now = Date.now()
    const words = lists.flatMap((list) => list.words.filter((word) => {
      const item = progress[getWordKey(list.id, word)]
      return item?.nextReviewAt && item.nextReviewAt <= now
    }).map((word) => ({ ...word, reviewListId: list.id })))
    return { id: 'daily-review', title: 'Bugünkü tekrar', accent: 'green', shuffle: true, words }
  }, [lists, progress])
  const favoriteList = useMemo(() => ({ id: 'favorite-words', title: 'Yıldızlı kelimeler', accent: 'violet', shuffle: true, words: lists.flatMap((list) => list.words.filter((word) => favorites[getWordKey(list.id, word)]).map((word) => ({ ...word, reviewListId: list.id }))) }), [lists, favorites])
  const activeList = activeListId === 'daily-review' ? dailyReviewList : activeListId === 'favorite-words' ? favoriteList : lists.find((list) => list.id === activeListId)
  const listForStudy = sessionList || activeList
  const studiedToday = useMemo(() => { const today = new Date().toDateString(); return Object.values(progress).filter((item) => item.lastStudiedAt && new Date(item.lastStudiedAt).toDateString() === today).length }, [progress])

  function addList(event) { event.preventDefault(); const title = listName.trim(); if (!title) return; setLists((current) => [...current, { id: crypto.randomUUID(), title, accent: 'green', shuffle: newListShuffle, words: [] }]); setListName(''); setNewListShuffle(false); setIsCreatingList(false) }
  function addWord(event) { event.preventDefault(); if (!english.trim() || !turkish.trim()) return; setLists((current) => current.map((list) => list.id === activeListId ? { ...list, words: [...list.words, { english: english.trim(), pronunciation: pronunciation.trim(), turkish: turkish.trim() }] } : list)); setEnglish(''); setPronunciation(''); setTurkish(''); requestAnimationFrame(() => englishInput.current?.focus()) }
  function deleteList() { if (!window.confirm(`“${activeList.title}” listesini silmek istediğine emin misin?`)) return; setLists((current) => current.filter((list) => list.id !== activeListId)); setActiveListId(null) }
  function toggleShuffle() { setLists((current) => current.map((list) => list.id === activeListId ? { ...list, shuffle: !list.shuffle } : list)) }
  function recordResult(word, result) { setProgress((current) => updateWordProgress(current, activeList.id, word, result)) }
  function toggleFavorite(word) { const key = getWordKey(word.reviewListId || activeList.id, word); setFavorites((current) => ({ ...current, [key]: !current[key] })) }
  function beginReorder(event, id) { reorderTimer.current = window.setTimeout(() => { justReordered.current = true; draggingListId.current = id; setDraggingId(id); navigator.vibrate?.(18) }, 360) }
  function moveReorder(event) { const movingId = draggingListId.current; if (!movingId) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-list-id]')?.dataset.listId; if (!target || target === movingId) return; setLists((current) => { const from = current.findIndex((item) => item.id === movingId); const to = current.findIndex((item) => item.id === target); if (from < 0 || to < 0) return current; const next = [...current]; next.splice(to, 0, next.splice(from, 1)[0]); return next }) }
  function endReorder() { window.clearTimeout(reorderTimer.current); draggingListId.current = null; setDraggingId(null); window.setTimeout(() => { justReordered.current = false }, 0) }
  function endStudy() { setStudyMode(null); setSessionList(null) }
  function startMidtermStudy(mode, list) { setSessionList(list); setStudyMode(mode) }

  if (studyMode === 'flashcards' && listForStudy) return <StudySession list={listForStudy} onExit={endStudy} onResult={recordResult} isFavorite={(word) => favorites[getWordKey(word.reviewListId || activeList.id, word)]} onToggleFavorite={toggleFavorite} />
  if (studyMode === 'spelling' && listForStudy) return <SpellingSession list={listForStudy} onExit={endStudy} onResult={recordResult} />
  if (studyMode === 'reverse-spelling' && listForStudy) return <SpellingSession list={listForStudy} onExit={endStudy} onResult={recordResult} direction="en-to-tr" />
  if (studyMode === 'quiz' && listForStudy) return <QuizSession list={listForStudy} onExit={endStudy} onResult={recordResult} />
  if (activeList?.isMidterm) return <MidtermDetail list={activeList} progress={progress} onBack={() => setActiveListId(null)} onStart={startMidtermStudy} />
  if (activeList) {
    const isSpecialList = ['daily-review', 'favorite-words'].includes(activeListId)
    return <main className="app-shell detail-shell">
      <header className="topbar detail-topbar"><button className="icon-button" onClick={() => setActiveListId(null)} aria-label="Listelere dön">←</button><span>KelimeKart</span>{isSpecialList ? <span /> : <button className="icon-button danger" onClick={deleteList} aria-label="Listeyi sil">⌫</button>}</header>
      <section className="detail-heading"><p className="eyebrow">{isSpecialList ? 'ÖZEL LİSTE' : 'KELİME LİSTESİ'}</p><h1>{activeList.title}</h1><p className="description">{isSpecialList ? 'Çalışırken yıldızladığın kelimeler burada birikir.' : 'Kelime ve kalıplarını satır satır ekle.'}</p>{!isSpecialList && <button className="text-button" onClick={toggleShuffle}>↻ Karışık sıra: {activeList.shuffle ? 'Açık' : 'Kapalı'}</button>}</section>
      {activeList.words.length > 0 && <button className="study-button top-study-button" onClick={() => setStudyMode('picker')}>Çalışmaya başla <span>→</span></button>}
      <section className="words-area"><div className="words-list editable-list"><div className="word-row word-head"><span>#</span><b>İNGİLİZCE</b><b>TELAFFUZ</b><b>TÜRKÇE</b></div>{activeList.words.map((word, index) => <div className="word-row" key={`${word.english}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{word.english}</strong><small>{word.pronunciation || '—'}</small><em>{word.turkish}</em></div>)}{!isSpecialList && <form className="word-input-row" onSubmit={addWord} onKeyDown={(event) => { if (event.key === 'Enter' && event.target === turkishInput.current) { event.preventDefault(); event.currentTarget.requestSubmit() } }}><span>+</span><input ref={englishInput} value={english} onChange={(event) => setEnglish(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); turkishInput.current?.focus() } }} placeholder="İngilizce" enterKeyHint="next" /><input value={pronunciation} onChange={(event) => setPronunciation(event.target.value)} placeholder="Telaffuz (ops.)" /><input ref={turkishInput} value={turkish} onChange={(event) => setTurkish(event.target.value)} placeholder="Türkçe" enterKeyHint="done" /></form>}</div>{!isSpecialList && <p className="entry-help">İngilizceyi yazıp Enter’a bas. Türkçesini yazıp tekrar Enter’a basınca yeni satıra geçersin. Telaffuz alanı isteğe bağlıdır.</p>}</section>
      {studyMode === 'picker' && <StudyModePicker onSelect={setStudyMode} onClose={() => setStudyMode(null)} />}
    </main>
  }

  return <main className="app-shell">
    <header className="topbar"><div className="brand-mark">K</div><span>KelimeKart</span></header>
    <section className="welcome"><p className="eyebrow">KELİME LİSTELERİM</p><h1>Kelime<br />kartlarım.</h1><p className="description">Bir liste seç, kartlarını çevir ve çalış.</p></section>
    <section className="daily-goal"><span>BUGÜNKÜ HEDEF</span><strong>{Math.min(studiedToday, 15)} <i>/ 15 kelime</i></strong><div><b style={{ width: `${Math.min(studiedToday / 15 * 100, 100)}%` }} /></div><small>{studiedToday >= 15 ? 'Bugünkü hedef tamam, kral! ✦' : `${15 - studiedToday} kelime daha, hedef biter.`}</small></section>
    {dailyReviewList.words.length > 0 && <section className="review-section"><button className="review-card" onClick={() => setActiveListId('daily-review')}><span>BUGÜNÜN TEKRARI</span><strong>{dailyReviewList.words.length} kelime seni bekliyor</strong><b>Başla →</b></button></section>}
    {favoriteList.words.length > 0 && <section className="review-section"><button className="review-card favorite-card" onClick={() => setActiveListId('favorite-words')}><span>★ YILDIZLI KELİMELER</span><strong>{favoriteList.words.length} zor kelimeyi ayırdın</strong><b>Çalış →</b></button></section>}
    <section className="list-section"><div className="section-heading"><span>{lists.length} liste</span><button className="text-button" onClick={() => setIsCreatingList(true)}>Yeni liste</button></div><p className="reorder-help">Bir karta basılı tut, sürükleyip vitrindeki yerini değiştir.</p><div className="list-grid">{lists.map((list) => <button className={`list-card ${list.accent} ${draggingId === list.id ? 'is-dragging' : ''}`} data-list-id={list.id} key={list.id} onClick={() => { if (!justReordered.current) setActiveListId(list.id) }} onPointerDown={(event) => beginReorder(event, list.id)} onPointerMove={moveReorder} onPointerUp={endReorder} onPointerCancel={endReorder}><span className="card-glow" /><span className="list-card-top"><span className="mini-dot" /> Liste <i>↕</i></span><strong>{list.title}</strong><span className="list-subtitle">{getMasteredCount(list, progress)} kelime oturdu</span><span className="word-count">{list.words.length} kart <span>→</span></span></button>)}</div></section>
    <button className="add-button" aria-label="Yeni kelime listesi ekle" onClick={() => setIsCreatingList(true)}>+</button>
    {isCreatingList && <Modal onClose={() => setIsCreatingList(false)}><form className="create-modal" onSubmit={addList}><button type="button" className="close-button" onClick={() => setIsCreatingList(false)}>×</button><p className="eyebrow">YENİ LİSTE</p><h2>Listene bir isim ver.</h2><input autoFocus value={listName} onChange={(event) => setListName(event.target.value)} placeholder="Örn. Unit 4 Kelimeleri" /><label><input type="checkbox" checked={newListShuffle} onChange={(event) => setNewListShuffle(event.target.checked)} /> Kelimeleri karışık sırayla sor</label><button className="save-button" type="submit">Listeyi oluştur</button></form></Modal>}
  </main>
}

function StudyModePicker({ onSelect, onClose }) { return <div className="mode-backdrop" onMouseDown={onClose}><section className="mode-picker" onMouseDown={(event) => event.stopPropagation()}><button className="close-button" onClick={onClose}>×</button><p className="eyebrow">ÇALIŞMA MODU</p><h2>Nasıl çalışmak istersin?</h2><button className="mode-card flash-mode" onClick={() => onSelect('flashcards')}><span className="mode-icon">✦</span><span><strong>Flashcards</strong><small>Kartı çevir, anlamını hatırla.</small></span><b>→</b></button><button className="mode-card spelling-mode" onClick={() => onSelect('spelling')}><span className="mode-icon">⌨</span><span><strong>İngilizce yaz</strong><small>Türkçesini gör, İngilizcesini yaz.</small></span><b>→</b></button><button className="mode-card reverse-mode" onClick={() => onSelect('reverse-spelling')}><span className="mode-icon">↔</span><span><strong>Türkçe yaz</strong><small>İngilizcesini gör, Türkçesini yaz.</small></span><b>→</b></button><button className="mode-card quiz-mode" onClick={() => onSelect('quiz')}><span className="mode-icon">⚡</span><span><strong>Mini sınav</strong><small>10 soruluk hızlı çoktan seçmeli tur.</small></span><b>→</b></button></section></div> }
function Modal({ children, onClose }) { return <div className="modal-backdrop" onMouseDown={onClose}><div onMouseDown={(event) => event.stopPropagation()}>{children}</div></div> }
export default App
