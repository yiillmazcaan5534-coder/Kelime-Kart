import { useEffect, useRef, useState } from 'react'
import './App.css'
import './Detail.css'
import './StudyButton.css'
import './QuickEntry.css'
import StudySession from './StudySession'

const starterLists = [
  { id: 'unit-3', title: 'Unit 3', accent: 'blue', words: [{ english: 'phone', turkish: 'telefon' }, { english: 'borrow', turkish: 'ödünç almak' }] },
  { id: 'phrases', title: 'Useful Phrases', accent: 'violet', words: [{ english: 'by the way', turkish: 'bu arada' }] },
]

function App() {
  const [lists, setLists] = useState(() => JSON.parse(localStorage.getItem('kelimekart-lists')) || starterLists)
  const [activeListId, setActiveListId] = useState(null)
  const [isStudying, setIsStudying] = useState(false)
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [listName, setListName] = useState('')
  const [english, setEnglish] = useState('')
  const [turkish, setTurkish] = useState('')
  const englishInput = useRef(null)
  const turkishInput = useRef(null)
  useEffect(() => localStorage.setItem('kelimekart-lists', JSON.stringify(lists)), [lists])
  const activeList = lists.find((list) => list.id === activeListId)

  function addList(event) { event.preventDefault(); const title = listName.trim(); if (!title) return; setLists((current) => [...current, { id: crypto.randomUUID(), title, accent: 'green', words: [] }]); setListName(''); setIsCreatingList(false) }
  function addWord(event) { event.preventDefault(); if (!english.trim() || !turkish.trim()) return; setLists((current) => current.map((list) => list.id === activeListId ? { ...list, words: [...list.words, { english: english.trim(), turkish: turkish.trim() }] } : list)); setEnglish(''); setTurkish(''); requestAnimationFrame(() => englishInput.current?.focus()) }
  function deleteList() { if (!window.confirm(`“${activeList.title}” listesini silmek istediğine emin misin?`)) return; setLists((current) => current.filter((list) => list.id !== activeListId)); setActiveListId(null) }

  if (isStudying && activeList) return <StudySession list={activeList} onExit={() => setIsStudying(false)} />
  if (activeList) return <main className="app-shell detail-shell"><header className="topbar detail-topbar"><button className="icon-button" onClick={() => setActiveListId(null)} aria-label="Listelere dön">←</button><span>KelimeKart</span><button className="icon-button danger" onClick={deleteList} aria-label="Listeyi sil">⌫</button></header><section className="detail-heading"><p className="eyebrow">KELİME LİSTESİ</p><h1>{activeList.title}</h1><p className="description">Kelime ve kalıplarını satır satır ekle.</p></section><section className="words-area"><div className="words-list editable-list"><div className="word-row word-head"><span>#</span><b>İNGİLİZCE</b><b>TÜRKÇE</b></div>{activeList.words.map((word, index) => <div className="word-row" key={`${word.english}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{word.english}</strong><em>{word.turkish}</em></div>)}<form className="word-input-row" onSubmit={addWord} onKeyDown={(event) => { if (event.key === 'Enter' && event.target === turkishInput.current) { event.preventDefault(); event.currentTarget.requestSubmit() } }}><span>+</span><input ref={englishInput} value={english} onChange={(event) => setEnglish(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); turkishInput.current?.focus() } }} placeholder="İngilizce" enterKeyHint="next" /><input ref={turkishInput} value={turkish} onChange={(event) => setTurkish(event.target.value)} placeholder="Türkçe" enterKeyHint="done" /></form></div><p className="entry-help">İngilizceyi yazıp Enter’a bas. Türkçesini yazıp tekrar Enter’a basınca yeni satıra geçersin.</p></section>{activeList.words.length > 0 && <button className="study-button" onClick={() => setIsStudying(true)}>Çalışmaya başla <span>→</span></button>}</main>

  return <main className="app-shell"><header className="topbar"><div className="brand-mark">K</div><span>KelimeKart</span></header><section className="welcome"><p className="eyebrow">KELİME LİSTELERİM</p><h1>Kelime<br />kartlarım.</h1><p className="description">Bir liste seç, kartlarını çevir ve çalış.</p></section><section className="list-section"><div className="section-heading"><span>{lists.length} liste</span><button className="text-button" onClick={() => setIsCreatingList(true)}>Yeni liste</button></div><div className="list-grid">{lists.map((list) => <button className={`list-card ${list.accent}`} key={list.id} onClick={() => setActiveListId(list.id)}><span className="card-glow" /><span className="list-card-top"><span className="mini-dot" /> Liste</span><strong>{list.title}</strong><span className="list-subtitle">Kartlarını aç</span><span className="word-count">{list.words.length} kart <span>→</span></span></button>)}</div></section><button className="add-button" aria-label="Yeni kelime listesi ekle" onClick={() => setIsCreatingList(true)}>+</button>{isCreatingList && <Modal onClose={() => setIsCreatingList(false)}><form className="create-modal" onSubmit={addList}><button type="button" className="close-button" onClick={() => setIsCreatingList(false)}>×</button><p className="eyebrow">YENİ LİSTE</p><h2>Listene bir isim ver.</h2><input autoFocus value={listName} onChange={(event) => setListName(event.target.value)} placeholder="Örn. Unit 4 Kelimeleri" /><button className="save-button" type="submit">Listeyi oluştur</button></form></Modal>}</main>
}

function Modal({ children, onClose }) { return <div className="modal-backdrop" onMouseDown={onClose}><div onMouseDown={(event) => event.stopPropagation()}>{children}</div></div> }
export default App
