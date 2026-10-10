import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Check, Coffee, Droplets, Eye, Leaf, Lightbulb,
  Moon, Music2, RefreshCw, Sparkles, Sun, Wind, Cloud, Smile, Puzzle,
} from 'lucide-react'
import {
  breakActivities, funFacts, goodVibes, lightQuestions, Page, reminders, smallWins, tinyBreaks,
} from './content'

type Pools = {
  reminders: number[]
  vibes: number[]
  facts: number[]
  questions: number[]
  breaks: number[]
}

const emptyPools: Pools = { reminders: [], vibes: [], facts: [], questions: [], breaks: [] }
const pages = [
  { id: 'break', label: 'Take a break', icon: Coffee },
  { id: 'boost', label: 'Mood booster', icon: Sun },
  { id: 'wins', label: 'Small wins', icon: Leaf },
] as const

function drawFromPool(items: string[], currentPool: number[], previous: number | null) {
  let pool = currentPool
  if (pool.length === 0) {
    pool = items.map((_, index) => index)
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
      ;[pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]]
    }
    if (pool.length > 1 && pool[0] === previous) [pool[0], pool[1]] = [pool[1], pool[0]]
  }
  const [selected, ...remaining] = pool
  return { value: items[selected], index: selected, pool: remaining }
}

function App() {
  const [page, setPage] = useState<Page>('welcome')
  const [pools, setPools] = useState<Pools>(emptyPools)
  const [lastShown, setLastShown] = useState<Record<keyof Pools, number | null>>({
    reminders: null, vibes: null, facts: null, questions: null, breaks: null,
  })
  const [reminder, setReminder] = useState<string | null>(null)
  const [vibe, setVibe] = useState<string | null>(null)
  const [fact, setFact] = useState<string | null>(null)
  const [question, setQuestion] = useState<string | null>(null)
  const [breakTip, setBreakTip] = useState<string | null>(null)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [gameAnswer, setGameAnswer] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()

  const reveal = (key: keyof Pools, items: string[], update: (value: string) => void) => {
    const result = drawFromPool(items, pools[key], lastShown[key])
    update(result.value)
    setPools((current) => ({ ...current, [key]: result.pool }))
    setLastShown((current) => ({ ...current, [key]: result.index }))
  }

  const goTo = (next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const restart = () => {
    setPage('welcome')
    setPools(emptyPools)
    setLastShown({ reminders: null, vibes: null, facts: null, questions: null, breaks: null })
    setReminder(null)
    setVibe(null)
    setFact(null)
    setQuestion(null)
    setBreakTip(null)
    setSelectedActivities([])
    setGameAnswer(null)
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const toggleActivity = (id: string) => {
    setSelectedActivities((selected) => selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id])
  }

  const goBackFrom = page === 'goodbye' ? 'welcome' : page === 'wins' ? 'boost' : 'welcome'

  return (
    <main className="app-shell min-h-screen">
      <div className="sky-wash" aria-hidden="true"><span /><span /><span /></div>
      <header className="topbar">
        <button className="brand" type="button" onClick={restart} aria-label="Mission: Make You Happy — start over">
          <span className="brand-icon"><Sun size={17} strokeWidth={1.7} /></span>
          <span>MISSION: MAKE YOU HAPPY</span>
        </button>
        {page !== 'welcome' && page !== 'goodbye' && (
          <nav className="top-nav" aria-label="Main navigation">
            {pages.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" className={`nav-link ${page === id ? 'nav-active' : ''}`} onClick={() => goTo(id)}>
                <Icon size={14} strokeWidth={1.8} /><span>{label}</span>
              </button>
            ))}
          </nav>
        )}
        <span className="quiet-badge"><span /> NO PRESSURE</span>
      </header>

      <div className="page-content">
        <motion.div key={page} className="page-transition" {...pageMotion(Boolean(reduceMotion))}>
          {page === 'welcome' && <Welcome onBreak={() => goTo('break')} onBoost={() => goTo('boost')} reduceMotion={Boolean(reduceMotion)} />}
          {page === 'break' && (
            <TakeABreak reminder={reminder} breakTip={breakTip}
              selectedActivities={selectedActivities}
              onReminder={() => reveal('reminders', reminders, setReminder)}
              onBreakTip={() => reveal('breaks', tinyBreaks, setBreakTip)}
              onToggleActivity={toggleActivity} onNext={() => goTo('boost')} onFinish={() => goTo('goodbye')}
              reduceMotion={Boolean(reduceMotion)} />
          )}
          {page === 'boost' && (
            <MoodBooster vibe={vibe} fact={fact} question={question} gameAnswer={gameAnswer}
              onVibe={() => reveal('vibes', goodVibes, setVibe)}
              onFact={() => reveal('facts', funFacts, setFact)}
              onQuestion={() => reveal('questions', lightQuestions, setQuestion)}
              onGameAnswer={setGameAnswer} onNext={() => goTo('wins')} onFinish={() => goTo('goodbye')}
              reduceMotion={Boolean(reduceMotion)} />
          )}
          {page === 'wins' && <SmallWins onBack={() => goTo('boost')} onFinish={() => goTo('goodbye')} reduceMotion={Boolean(reduceMotion)} />}
          {page === 'goodbye' && <BeforeYouGo onRestart={restart} />}
        </motion.div>
      </div>

      <footer className="site-footer">
        <span>A SMALL PLACE TO PAUSE</span>
        <span>TAKE WHAT YOU NEED, LEAVE THE REST</span>
      </footer>
      {page !== 'welcome' && page !== 'goodbye' && (
        <button className="back-link" type="button" onClick={() => goTo(goBackFrom)}><ArrowLeft size={14} /> Back</button>
      )}
    </main>
  )
}

function Welcome({ onBreak, onBoost, reduceMotion }: { onBreak: () => void; onBoost: () => void; reduceMotion: boolean }) {
  return (
    <section className="welcome-page" aria-labelledby="welcome-title">
      <div className="welcome-art" aria-hidden="true">
        <div className="sun-disc"><Sun size={42} strokeWidth={1.15} /></div>
        <motion.div className="small-cloud cloud-one" animate={reduceMotion ? undefined : { x: [0, 7, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}><Cloud size={36} strokeWidth={1.15} /></motion.div>
        <motion.div className="small-cloud cloud-two" animate={reduceMotion ? undefined : { x: [0, -6, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}><Cloud size={26} strokeWidth={1.15} /></motion.div>
        <span className="tiny-sparkle sparkle-one">✳</span><span className="tiny-sparkle sparkle-two">·</span>
      </div>
      <span className="welcome-kicker">A SMALL PLACE TO PAUSE</span>
      <h1 id="welcome-title">MISSION: MAKE<br /><span>YOU HAPPY</span></h1>
      <p className="welcome-question">Hey, how's your day going?</p>
      <p className="welcome-thai">ถ้าวันนี้เหนื่อยหน่อย ลองแวะพักตรงนี้ก่อนได้นะ</p>
      <p className="welcome-description">No pressure. No expectations. Just a little something<br className="desktop-break" /> to make your day better.</p>
      <div className="welcome-actions">
        <button className="button button-primary" type="button" onClick={onBreak}>Let's take a break <Coffee size={16} /></button>
        <button className="button button-secondary" type="button" onClick={onBoost}>I need a little boost <Sun size={16} /></button>
      </div>
      <p className="soft-note"><Leaf size={14} /> You don't have to explain anything.</p>
    </section>
  )
}

function TakeABreak({ reminder, breakTip, selectedActivities, onReminder, onBreakTip, onToggleActivity, onNext, onFinish, reduceMotion }: {
  reminder: string | null
  breakTip: string | null
  selectedActivities: string[]
  onReminder: () => void
  onBreakTip: () => void
  onToggleActivity: (id: string) => void
  onNext: () => void
  onFinish: () => void
  reduceMotion: boolean
}) {
  return (
    <section className="content-page break-page" aria-labelledby="break-title">
      <PageIntro eyebrow="TAKE A BREATH" title="Let's take a little break." subtitle="No need to fix everything right now. Just be here for a moment." id="break-title" />
      <div className="reminder-panel">
        <div className="panel-icon"><Cloud size={20} /></div>
        <span className="panel-label">A GENTLE REMINDER</span>
        <motion.p key={reminder ?? 'first'} className="reminder-text" initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {reminder ?? 'วันนี้เหนื่อยมากแล้ว พักบ้างก็ได้นะ'}
        </motion.p>
        <button className="text-action" type="button" onClick={onReminder}><RefreshCw size={14} /> Another reminder</button>
      </div>
      <section className="activity-section" aria-labelledby="activity-title">
        <div className="activity-heading">
          <div><span className="section-label">A FEW EASY OPTIONS</span><h3 id="activity-title">Maybe one of these?</h3></div>
          <p>Only if it feels helpful.</p>
        </div>
        <div className="activity-list">
          {breakActivities.map((activity) => {
            const Icon = activity.icon === 'wind' ? Wind : activity.icon === 'eye' ? Eye : activity.icon === 'water' ? Droplets : activity.icon === 'music' ? Music2 : Moon
            const selected = selectedActivities.includes(activity.id)
            return (
              <button key={activity.id} className={`activity-card ${selected ? 'activity-selected' : ''}`} type="button" aria-pressed={selected} onClick={() => onToggleActivity(activity.id)}>
                <span className="activity-icon"><Icon size={17} strokeWidth={1.7} /></span>
                <span className="activity-copy"><strong>{activity.label}</strong><small>{activity.hint}</small></span>
                <span className="activity-check" aria-hidden="true">{selected && <Check size={14} />}</span>
              </button>
            )
          })}
        </div>
        <p className="activity-footnote">{selectedActivities.length > 0 ? 'Nice. Take as long as you need.' : 'You can pick one, a few, or none at all.'}</p>
      </section>
      <RandomTip tip={breakTip} onNewTip={onBreakTip} />
      <PageActions onBack={onNext} backLabel="A little boost" onFinish={onFinish} />
    </section>
  )
}

function MoodBooster({ vibe, fact, question, gameAnswer, onVibe, onFact, onQuestion, onGameAnswer, onNext, onFinish, reduceMotion }: {
  vibe: string | null
  fact: string | null
  question: string | null
  gameAnswer: string | null
  onVibe: () => void
  onFact: () => void
  onQuestion: () => void
  onGameAnswer: (answer: string) => void
  onNext: () => void
  onFinish: () => void
  reduceMotion: boolean
}) {
  return (
    <section className="content-page boost-page" aria-labelledby="boost-title">
      <PageIntro eyebrow="A LITTLE BOOST" title="A tiny change of scene." subtitle="Nothing major. Just a small, gentle distraction." id="boost-title" />
      <div className="vibe-panel">
        <span className="panel-icon sun-icon"><Sun size={21} /></span>
        <span className="panel-label">RANDOM GOOD VIBES</span>
        <motion.p key={vibe ?? 'empty'} className="vibe-text" initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {vibe ?? 'A kind thought is waiting whenever you want one.'}
        </motion.p>
        <button className="button button-primary vibe-button" type="button" onClick={onVibe}><Sparkles size={15} /> Give me something good</button>
      </div>
      <div className="distraction-heading"><span className="section-label">TINY DISTRACTIONS</span><h3>Pick a small detour.</h3></div>
      <div className="distraction-grid">
        <DistractionCard icon={<Lightbulb size={17} />} title="A curious fact" action="Tell me a fact" value={fact} onClick={onFact} empty="A little bit of harmless trivia." />
        <DistractionCard icon={<Smile size={17} />} title="A silly question" action="Ask me something" value={question} onClick={onQuestion} empty="No right answer. Just a thought." />
        <article className="distraction-card choice-card">
          <span className="distraction-icon"><Puzzle size={17} /></span>
          <h4>This or that?</h4>
          <p className="choice-question">A cozy rainy day or a sunny picnic?</p>
          <div className="choice-buttons">
            <button type="button" className={gameAnswer === 'rain' ? 'choice-selected' : ''} onClick={() => onGameAnswer('rain')}>Rainy day</button>
            <button type="button" className={gameAnswer === 'sun' ? 'choice-selected' : ''} onClick={() => onGameAnswer('sun')}>Sunny picnic</button>
          </div>
          {gameAnswer && <p className="choice-reply">{gameAnswer === 'rain' ? 'Excellent blanket-and-snack weather.' : 'Fresh air and a good snack. Lovely choice.'}</p>}
        </article>
      </div>
      <PageActions onBack={onNext} backLabel="Small wins" onFinish={onFinish} />
    </section>
  )
}

function DistractionCard({ icon, title, action, value, onClick, empty }: { icon: React.ReactNode; title: string; action: string; value: string | null; onClick: () => void; empty: string }) {
  return (
    <article className="distraction-card">
      <span className="distraction-icon">{icon}</span>
      <h4>{title}</h4>
      <p className={`distraction-value ${value ? 'value-visible' : ''}`}>{value ?? empty}</p>
      <button className="text-action" type="button" onClick={onClick}>{value ? 'Another one' : action} <ArrowRight size={13} /></button>
    </article>
  )
}

function SmallWins({ onBack, onFinish, reduceMotion }: { onBack: () => void; onFinish: () => void; reduceMotion: boolean }) {
  return (
    <section className="content-page wins-page" aria-labelledby="wins-title">
      <PageIntro eyebrow="A GENTLE REMINDER" title="Small wins still count." subtitle="And a quiet day doesn't need to prove anything." id="wins-title" />
      <div className="wins-grid">
        {smallWins.map((win, index) => {
          const Icon = win.icon === 'sun' ? Sun : win.icon === 'coffee' ? Coffee : win.icon === 'cloud' ? Cloud : win.icon === 'leaf' ? Leaf : win.icon === 'moon' ? Moon : Sparkles
          return (
            <motion.article key={win.text} className="win-card" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.055, duration: 0.35 }}>
              <span className="win-icon"><Icon size={17} strokeWidth={1.7} /></span>
              <h3>{win.text}</h3>
              <p>{win.note}</p>
            </motion.article>
          )
        })}
      </div>
      <div className="wins-note"><Coffee size={17} /><p>You don't have to earn your rest.</p></div>
      <PageActions onBack={onBack} backLabel="Mood booster" nextPrefix="Back to" onFinish={onFinish} />
    </section>
  )
}

function BeforeYouGo({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="goodbye-page" aria-labelledby="goodbye-title">
      <div className="goodbye-art" aria-hidden="true"><div><Sun size={33} strokeWidth={1.3} /></div><span /><span /></div>
      <span className="welcome-kicker">BEFORE YOU GO</span>
      <h1 id="goodbye-title">That's your little<br />break for today.</h1>
      <p className="goodbye-thai">ขอให้หลังจากนี้มีเรื่องให้ยิ้มได้บ้างนะ</p>
      <p className="goodbye-last">Take care of yourself. And don't forget to rest.</p>
      <button className="button button-primary" type="button" onClick={onRestart}>Back to the beginning <ArrowLeft size={15} /></button>
      <p className="goodbye-footnote">No need to reply. Just take it easy.</p>
    </section>
  )
}

function RandomTip({ tip, onNewTip }: { tip: string | null; onNewTip: () => void }) {
  return (
    <div className="tiny-tip">
      <span className="tip-icon"><Lightbulb size={16} /></span>
      <div><span className="section-label">A TINY BREAK IDEA</span><p>{tip ?? 'Maybe change your posture or look out the window for a moment.'}</p></div>
      <button type="button" onClick={onNewTip} aria-label="Show another break idea"><RefreshCw size={14} /></button>
    </div>
  )
}

function PageIntro({ eyebrow, title, subtitle, id }: { eyebrow: string; title: string; subtitle: string; id: string }) {
  return (
    <div className="page-intro">
      <span className="welcome-kicker">{eyebrow}</span>
      <h1 id={id}>{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}

function PageActions({ onBack, backLabel, nextPrefix = 'Next:', onFinish }: { onBack: () => void; backLabel: string; nextPrefix?: string; onFinish: () => void }) {
  return (
    <div className="page-actions">
      <button className="button button-secondary" type="button" onClick={onBack}>{nextPrefix} {backLabel} <ArrowRight size={15} /></button>
      <button className="finish-link" type="button" onClick={onFinish}>That's enough for now</button>
    </div>
  )
}

function pageMotion(reduceMotion: boolean) {
  return reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.36, ease: 'easeOut' as const } }
}

export default App
