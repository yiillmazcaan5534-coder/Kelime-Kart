import { useRef, useState } from 'react'
import './StudySession.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function StudySession({ list, onExit, onResult }) {
  const [cards, setCards] = useState(() => list.shuffle ? [...list.words].sort(() => Math.random() - .5) : [...list.words])
  const [cardIndex, setCardIndex] = useState(0)
  const [retryCards, setRetryCards] = useState([])
  const [round, setRound] = useState(1)
  const [isFlipped, setIsFlipped] = useState(false)
  const [motion, setMotion] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 })
  const startPoint = useRef(null)
  const card = cards[cardIndex]

  function resetCard() { setIsFlipped(false); setMotion({ x: 0, y: 0, glareX: 50, glareY: 50 }) }
  function goToCard(direction) { setCardIndex((current) => (current + direction + cards.length) % cards.length); resetCard() }
  function answer(result) {
    onResult(card, result)
    const nextRetries = result === 'again' ? [...retryCards, card] : retryCards
    if (cardIndex < cards.length - 1) { setRetryCards(nextRetries); goToCard(1); return }
    if (nextRetries.length) { setCards(nextRetries); setRetryCards([]); setCardIndex(0); setRound((current) => current + 1); resetCard(); return }
    setCards([])
  }
  function onPointerDown(event) { event.currentTarget.setPointerCapture(event.pointerId); startPoint.current = { x: event.clientX, y: event.clientY } }
  function onPointerMove(event) {
    if (!startPoint.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - startPoint.current.x
    const y = event.clientY - startPoint.current.y
    setMotion({ x: clamp(-y / 11, -13, 13), y: clamp(x / 11, -18, 18), glareX: clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100), glareY: clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100) })
  }
  function onPointerUp(event) {
    if (!startPoint.current) return
    const distance = event.clientX - startPoint.current.x
    if (Math.abs(distance) > 60 || Math.abs(distance) < 8) setIsFlipped((current) => !current)
    startPoint.current = null
    setMotion({ x: 0, y: 0, glareX: 50, glareY: 50 })
  }

  if (!card) return <main className="study-shell"><header className="study-topbar"><button className="study-back" onClick={onExit}>←</button><span>{list.title}</span><span /></header><section className="card-stage"><div className="study-complete"><span>✓</span><p className="eyebrow">TAMAMLANDI</p><h1>Güzel çalıştın kral!</h1><p>Bu turdaki kelimeleri bitirdin.</p><button onClick={onExit}>Listeye dön</button></div></section></main>

  return <main className="study-shell">
    <header className="study-topbar"><button className="study-back" onClick={onExit}>←</button><span>{list.title}{round > 1 ? ` · Tekrar ${round}` : ''}</span><span className="progress">{cardIndex + 1} / {cards.length}</span></header>
    <section className="card-stage">
      <div className="flashcard-scene">
        <button className={`flashcard ${isFlipped ? 'is-flipped' : ''}`} style={{ '--tilt-x': `${motion.x}deg`, '--tilt-y': `${motion.y}deg`, '--glare-x': `${motion.glareX}%`, '--glare-y': `${motion.glareY}%` }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} aria-label="Kartı çevirmek için dokun veya sağa sola sürükle">
          <span className="card-face card-front"><small>İNGİLİZCE</small><strong>{card.english}</strong>{card.pronunciation && <b className="pronunciation">{card.pronunciation}</b>}<i>Dokun veya kaydır</i></span>
          <span className="card-face card-back"><small>TÜRKÇE</small><strong>{card.turkish}</strong><i>Tekrar kaydırarak dön</i></span>
          <span className="glare" />
        </button>
      </div>
      <p className="gesture-hint">Parmağını kartın üzerinde gezdir ✦</p>
      <div className="memory-controls"><button className="again-button" onClick={() => answer('again')}>↻ Tekrar sor</button><button className="know-button" onClick={() => answer('known')}>Biliyorum ✓</button></div>
    </section>
    <nav className="study-controls"><button onClick={() => goToCard(-1)}>← <span>Önceki</span></button><button onClick={() => goToCard(1)}><span>Sıradaki</span> →</button></nav>
  </main>
}
