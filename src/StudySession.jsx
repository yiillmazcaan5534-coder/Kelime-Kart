import { useRef, useState } from 'react'
import './StudySession.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function StudySession({ list, onExit }) {
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [motion, setMotion] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 })
  const startPoint = useRef(null)
  const card = list.words[cardIndex]

  function resetCard() { setIsFlipped(false); setMotion({ x: 0, y: 0, glareX: 50, glareY: 50 }) }
  function goToCard(direction) { setCardIndex((current) => (current + direction + list.words.length) % list.words.length); resetCard() }
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
    if (Math.abs(distance) > 60) setIsFlipped((current) => !current)
    else if (Math.abs(distance) < 8) setIsFlipped((current) => !current)
    startPoint.current = null
    setMotion({ x: 0, y: 0, glareX: 50, glareY: 50 })
  }

  return <main className="study-shell">
    <header className="study-topbar"><button className="study-back" onClick={onExit}>←</button><span>{list.title}</span><span className="progress">{cardIndex + 1} / {list.words.length}</span></header>
    <section className="card-stage">
      <div className="flashcard-scene">
        <button className={`flashcard ${isFlipped ? 'is-flipped' : ''}`} style={{ '--tilt-x': `${motion.x}deg`, '--tilt-y': `${motion.y}deg`, '--glare-x': `${motion.glareX}%`, '--glare-y': `${motion.glareY}%` }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} aria-label="Kartı çevirmek için dokun veya sağa sola sürükle">
          <span className="card-face card-front"><small>İNGİLİZCE</small><strong>{card.english}</strong>{card.pronunciation && <b className="pronunciation">{card.pronunciation}</b>}<i>Dokun veya kaydır</i></span>
          <span className="card-face card-back"><small>TÜRKÇE</small><strong>{card.turkish}</strong><i>Tekrar kaydırarak dön</i></span>
          <span className="glare" />
        </button>
      </div>
      <p className="gesture-hint">Parmağını kartın üzerinde gezdir ✦</p>
    </section>
    <nav className="study-controls"><button onClick={() => goToCard(-1)}>← <span>Önceki</span></button><button onClick={() => goToCard(1)}><span>Sıradaki</span> →</button></nav>
  </main>
}
