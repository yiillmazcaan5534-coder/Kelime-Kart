import { useMemo, useState } from 'react'
import { getWordKey } from './progress'
import './MidtermDetail.css'

const sources = ['Tümü', 'Empower', 'Main Course Pack', 'Prism Reading', 'Prism Listening']
const shuffle = (words) => [...words].sort(() => Math.random() - .5)

export default function MidtermDetail({ list, progress, onBack, onStart }) {
  const [query, setQuery] = useState('')
  const [week, setWeek] = useState('Tümü')
  const [source, setSource] = useState('Tümü')
  const [sort, setSort] = useState('source')
  const [onlyMistakes, setOnlyMistakes] = useState(false)
  const [isPicking, setIsPicking] = useState(false)
  const words = useMemo(() => {
    const searched = query.trim().toLocaleLowerCase('tr-TR')
    const filtered = list.words.filter((word) => {
      const item = progress[getWordKey(list.id, word)]
      const textMatch = !searched || `${word.english} ${word.turkish}`.toLocaleLowerCase('tr-TR').includes(searched)
      const weekMatch = week === 'Tümü' || String(word.week) === week
      const sourceMatch = source === 'Tümü' || word.source === source
      const mistakeMatch = !onlyMistakes || (item?.wrong || 0) > (item?.correct || 0)
      return textMatch && weekMatch && sourceMatch && mistakeMatch
    })
    return sort === 'alpha' ? [...filtered].sort((a, b) => a.english.localeCompare(b.english, 'en')) : filtered
  }, [list, progress, query, source, sort, week, onlyMistakes])
  function start(mode, count) {
    const selected = count ? shuffle(words).slice(0, Math.min(count, words.length)) : words
    if (!selected.length) return
    onStart(mode, { ...list, title: count ? `${list.title} · ${selected.length} soru` : list.title, words: selected, shuffle: false })
    setIsPicking(false)
  }

  return <main className="app-shell detail-shell midterm-shell"><header className="topbar detail-topbar"><button className="icon-button" onClick={onBack}>←</button><span>KelimeKart</span><span /></header><section className="detail-heading"><p className="eyebrow">SINAV HAZIRLIĞI</p><h1>{list.title}</h1><p className="description">Resmî kapsam havuzu · {list.words.length} benzersiz kelime</p></section><section className="midterm-filters"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kelime ara" /><div className="filter-row"><select value={week} onChange={(event) => setWeek(event.target.value)}><option>Tümü</option><option value="1">Week 1</option><option value="2">Week 2</option><option value="3">Week 3</option><option value="4">Week 4</option></select><select value={source} onChange={(event) => setSource(event.target.value)}>{sources.map((item) => <option key={item}>{item}</option>)}</select></div><div className="filter-row"><button className={onlyMistakes ? 'active-filter' : ''} onClick={() => setOnlyMistakes((value) => !value)}>Yanlışlarım</button><button className={sort === 'alpha' ? 'active-filter' : ''} onClick={() => setSort((value) => value === 'alpha' ? 'source' : 'alpha')}>A→Z</button><span>{words.length} kart</span></div></section><section className="words-area midterm-words"><div className="words-list editable-list"><div className="word-row word-head"><span>#</span><b>İNGİLİZCE</b><b>IPA</b><b>TÜRKÇE</b></div>{words.map((word, index) => <div className="word-row" key={`${word.english}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{word.english}<small className="word-meta">W{word.week} · {word.source}</small></strong><small>{word.pronunciation || '—'}</small><em>{word.turkish}</em></div>)}</div></section>{words.length > 0 && <button className="study-button" onClick={() => setIsPicking(true)}>Çalışmaya başla <span>→</span></button>}{isPicking && <div className="mode-backdrop" onMouseDown={() => setIsPicking(false)}><section className="mode-picker" onMouseDown={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setIsPicking(false)}>×</button><p className="eyebrow">MİDTERM ÇALIŞMASI</p><h2>Nasıl çalışalım?</h2><div className="quick-grid">{[5, 10, 20].map((count) => <button key={count} onClick={() => start('spelling', count)}>{count}<small>soruluk hızlı tur</small></button>)}</div><button className="mode-card flash-mode" onClick={() => start('flashcards')}><span className="mode-icon">✦</span><span><strong>Tümünü kartlarla çalış</strong><small>Seçtiğin filtreye göre ilerle.</small></span><b>→</b></button><button className="mode-card spelling-mode" onClick={() => start('spelling')}><span className="mode-icon">⌨</span><span><strong>İngilizce yaz</strong><small>Türkçesini gör, İngilizcesini yaz.</small></span><b>→</b></button><button className="mode-card reverse-mode" onClick={() => start('reverse-spelling')}><span className="mode-icon">↔</span><span><strong>Türkçe yaz</strong><small>İngilizcesini gör, Türkçesini yaz.</small></span><b>→</b></button><button className="mode-card quiz-mode" onClick={() => start('quiz')}><span className="mode-icon">⚡</span><span><strong>Mini sınav</strong><small>10 soruluk çoktan seçmeli tur.</small></span><b>→</b></button></section></div>}</main>
}
