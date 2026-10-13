import { useMemo, useState } from 'react'
import { sentenceExamples } from './sentenceExamples'
import './SentenceSession.css'

const normalize = (value) => value.trim().toLocaleLowerCase('en-GB').replace(/[.,;!?]/g, '')

export default function SentenceSession({ list, onExit, onResult }) {
  const cards = useMemo(() => list.words.filter((word) => sentenceExamples[word.english.toLocaleLowerCase('en-GB')]), [list])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const card = cards[index]
  const example = card && sentenceExamples[card.english.toLocaleLowerCase('en-GB')]
  function check(event) { event.preventDefault(); if (!answer.trim()) return; const correct = normalize(answer) === normalize(card.english); setResult(correct); onResult(card, correct ? 'known' : 'again') }
  function next() { setIndex((value) => value + 1); setAnswer(''); setResult(null) }
  if (!card) return <main className="sentence-shell"><header className="quiz-top"><button onClick={onExit}>←</button><span>Cümle tamamla</span><span /></header><section className="sentence-result"><span>✦</span><h1>{cards.length ? 'Tur bitti!' : 'Bu listede hazır cümle yok.'}</h1><p>{cards.length ? 'Örnek cümleleri tamamladın kral.' : 'Bu mod için örnek cümle eklememiz gereken kelimeler var.'}</p><button onClick={onExit}>Listeye dön</button></section></main>
  const sentence = example.replace(new RegExp(card.english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '____')
  return <main className="sentence-shell"><header className="quiz-top"><button onClick={onExit}>←</button><span>Cümle tamamla</span><small>{index + 1} / {cards.length}</small></header><section className="sentence-body"><p className="eyebrow">BOŞLUĞU DOLDUR</p><h1>{sentence}</h1><p className="sentence-meaning">İpucu: <b>{card.turkish}</b></p>{!result && <form onSubmit={check}><input autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Eksik kelimeyi yaz" autoCapitalize="none" spellCheck="false" /><button type="submit">Kontrol et</button></form>}{result !== null && <section className={`sentence-feedback ${result ? 'ok' : 'nope'}`}><strong>{result ? '✓ Doğru!' : `Doğrusu: ${card.english}`}</strong><button onClick={next}>Sıradaki →</button></section>}</section></main>
}
