import { useMemo, useState } from 'react'
import './QuizSession.css'

const mix = (items) => [...items].sort(() => Math.random() - .5)

export default function QuizSession({ list, onExit, onResult }) {
  const questions = useMemo(() => mix(list.words).slice(0, Math.min(10, list.words.length)).map((word) => ({ word, options: mix([word, ...mix(list.words.filter((item) => item.english !== word.english)).slice(0, 3)]) })), [list])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const question = questions[index]

  function choose(option) {
    if (selected) return
    const correct = option.english === question.word.english
    setSelected(option.english)
    onResult(question.word, correct ? 'known' : 'again')
    if (correct) setScore((value) => value + 1)
  }
  function next() { if (index === questions.length - 1) setIndex(questions.length); else { setIndex((value) => value + 1); setSelected(null) } }

  if (!question) return <main className="quiz-shell"><header className="quiz-top"><button onClick={onExit}>←</button><span>Mini sınav</span><span /></header><section className="quiz-result"><span>⚡</span><p className="eyebrow">MİNİ SINAV TAMAMLANDI</p><h1>{score} / {questions.length}</h1><p>{score === questions.length ? 'Mükemmel tur kral!' : 'Güzel, yanlışlarını Bugünkü tekrar kısmında tekrar görürsün.'}</p><button onClick={onExit}>Listeye dön</button></section></main>
  const isCorrect = selected === question.word.english
  return <main className="quiz-shell"><header className="quiz-top"><button onClick={onExit}>←</button><span>Mini sınav</span><small>{index + 1} / {questions.length}</small></header><section className="quiz-body"><p className="eyebrow">TÜRKÇESİ NEDİR?</p><h1>{question.word.turkish}</h1>{question.word.pronunciation && <small className="quiz-pronunciation">Telaffuz: {question.word.pronunciation}</small>}<div className="quiz-options">{question.options.map((option) => { const chosen = selected === option.english; const correct = option.english === question.word.english; return <button key={option.english} disabled={!!selected} onClick={() => choose(option)} className={`${chosen ? (correct ? 'correct' : 'wrong') : ''} ${selected && correct ? 'reveal' : ''}`}>{option.english}</button> })}</div>{selected && <section className={`quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}><strong>{isCorrect ? '✓ Doğru bildin!' : `Doğrusu: ${question.word.english}`}</strong><button onClick={next}>{index === questions.length - 1 ? 'Sonucu gör →' : 'Sıradaki soru →'}</button></section>}</section></main>
}
