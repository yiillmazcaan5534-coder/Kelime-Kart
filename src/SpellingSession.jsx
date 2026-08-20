import { useEffect, useRef, useState } from 'react'
import './SpellingSession.css'

const normalize = (value) => value.trim().toLocaleLowerCase('en-US')
const sameLetter = (typed, expected) => normalize(typed) === normalize(expected)

export default function SpellingSession({ list, onExit }) {
  const [queue, setQueue] = useState(() => [...list.words])
  const [retryQueue, setRetryQueue] = useState([])
  const [phase, setPhase] = useState('prompt')
  const [answer, setAnswer] = useState('')
  const [lastAnswer, setLastAnswer] = useState('')
  const answerInput = useRef(null)
  const timer = useRef(null)
  const lastTap = useRef(0)
  const word = queue[0]
  const completed = !word
  const answeredCount = list.words.length - queue.length + 1
  const typedLetters = [...answer]
  const targetLetters = [...(word?.english || '')]
  const hasMistake = typedLetters.some((letter, index) => !sameLetter(letter, targetLetters[index] || ''))
  const isOnTrack = answer.length > 0 && !hasMistake

  function clearTimer() { window.clearTimeout(timer.current) }
  function startAnswer() { clearTimer(); setPhase('answer') }
  useEffect(() => () => clearTimer(), [])
  useEffect(() => {
    clearTimer()
    if (phase === 'prompt') timer.current = window.setTimeout(() => setPhase('preview'), 900)
    if (phase === 'preview') timer.current = window.setTimeout(startAnswer, 2300)
    return clearTimer
  }, [phase, word])
  useEffect(() => { if (phase === 'answer') answerInput.current?.focus() }, [phase])

  function handleCardTap() {
    const now = Date.now()
    if (now - lastTap.current < 300 && (phase === 'prompt' || phase === 'preview')) startAnswer()
    lastTap.current = now
  }
  function moveNext() { setQueue((current) => { const remaining = current.slice(1); if (remaining.length) return remaining; if (retryQueue.length) { setRetryQueue([]); return retryQueue }; return [] }); setAnswer(''); setLastAnswer(''); setPhase('prompt') }
  function submitAnswer(event) { event.preventDefault(); if (!answer.trim()) return; setLastAnswer(answer.trim()); if (normalize(answer) === normalize(word.english)) { setPhase('correct'); clearTimer(); timer.current = window.setTimeout(moveNext, 1050) } else { setRetryQueue((current) => [...current, word]); setPhase('wrong') } }

  if (completed) return <main className="spelling-shell"><header className="study-topbar"><button className="study-back" onClick={onExit}>←</button><span>{list.title}</span><span /></header><section className="spelling-stage"><div className="spelling-card complete-card"><span className="complete-icon">✓</span><p className="eyebrow">TAMAMLANDI</p><h1>Harika iş kral!</h1><p>Bu listedeki bütün kelimeleri doğru yazdın.</p><button onClick={onExit}>Listeye dön</button></div></section></main>
  return <main className="spelling-shell"><header className="study-topbar"><button className="study-back" onClick={onExit}>←</button><span>Yazılış modu</span><span className="progress">{Math.min(answeredCount, list.words.length)} / {list.words.length}</span></header><section className="spelling-stage"><div className={`spelling-card ${phase} ${isOnTrack ? 'live-good' : ''} ${hasMistake ? 'live-bad' : ''}`} onPointerUp={handleCardTap} onDoubleClick={() => { if (phase === 'prompt' || phase === 'preview') startAnswer() }}><p className="eyebrow">TÜRKÇESİ</p><h1>{phase === 'preview' ? word.english : word.turkish}</h1>{phase === 'prompt' && <p className="spelling-hint">Kelime birazdan görünecek.<br />İki kez dokunarak hemen yazabilirsin.</p>}{phase === 'preview' && <div className="word-preview">{word.pronunciation && <small>{word.pronunciation}</small>}<p>Birazdan yazma zamanı.</p></div>}{phase === 'answer' && <form className="answer-form" onSubmit={submitAnswer}><label htmlFor="spelling-answer">İngilizcesini yaz</label><input id="spelling-answer" ref={answerInput} value={answer} onChange={(event) => setAnswer(event.target.value)} autoComplete="off" autoCapitalize="none" spellCheck="false" placeholder="Yazmaya başla" /><div className="letter-track" aria-hidden="true">{targetLetters.map((letter, index) => letter === ' ' ? <span className="letter-space" key={index} /> : <span className={!typedLetters[index] ? 'empty' : sameLetter(typedLetters[index], letter) ? 'right' : 'wrong'} key={index}>{typedLetters[index] || '·'}</span>)}</div><button type="submit">Kontrol et</button></form>}{phase === 'correct' && <div className="feedback correct-feedback"><span>✓</span><strong>Doğru!</strong><p>{word.english}</p></div>}{phase === 'wrong' && <div className="feedback wrong-feedback"><span>×</span><strong>Yaklaştın</strong><div className="answer-diff"><p><small>Senin yazdığın</small>{lastAnswer}</p><b>→</b><p><small>Doğrusu</small>{word.english}</p></div><button onClick={moveNext}>Sıradaki kelime <span>→</span></button><i>Bu kelime birazdan tekrar gelecek.</i></div>}</div></section></main>
}
