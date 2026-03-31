import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const dilemmas = [
  { id: 1, stelling: "Mijn geloof is meer gewoonte dan overtuiging.", kleur: "#C9A0DC", artikel: { titel: "Is geloof zonder twijfel eigenlijk wel geloof?", tijd: "6 min" }, summary: "Veel theologen zeggen: twijfel is geen tegenstelling van geloof, het is er onderdeel van. Luther twijfelde. Moeder Teresa twijfelde decennialang. Jij bent in goed gezelschap." },
  { id: 2, stelling: "Ik denk weleens: hadden we maar geen kinderen genomen.", kleur: "#E8A0B4", artikel: { titel: "'Ik hield van mijn kind maar miste mezelf'", tijd: "8 min" }, summary: "Moederspijt is een taboe maar het bestaat. Onderzoeker Orna Donath sprak honderden moeders. Spijt zeggen is niet hetzelfde als je kind niet liefhebben." },
  { id: 3, stelling: "Ik ga liever naar de kapper dan naar de kerk.", kleur: "#B4A0E8", artikel: { titel: "Waarom de kapper doet wat de kerk soms vergeet", tijd: "5 min" }, summary: "De kapper luistert, oordeelt niet, en je gaat eruit voelen dat iemand voor jou heeft gezorgd. Dat is niet niks. En het zegt iets over wat we zoeken op zondag." },
  { id: 4, stelling: "Als mijn man zou zeggen 'ik geloof niet meer', weet ik niet wat ik moet doen.", kleur: "#D4A0C8", artikel: { titel: "'Ik geloof, mijn man niet — hoe houd je het samen?'", tijd: "7 min" }, summary: "Gemengde huwelijken in geloofsopzicht komen vaker voor dan je denkt. De vraag is niet of het kan — maar hoe je eerlijk blijft naar jezelf én de ander." },
  { id: 5, stelling: "Ik vind sommige dingen in de bijbel gewoon onzin.", kleur: "#A0C4DC", artikel: { titel: "Mag je de Bijbel moeilijk vinden?", tijd: "5 min" }, summary: "Bijbelwetenschappers worstelen er ook mee. De Bijbel was nooit bedoeld als instructieboek — het is een bibliotheek van menselijke ervaringen met God. Kritisch lezen hoort erbij." },
  { id: 6, stelling: "Ik vergelijk mijn opvoeding met die van anderen en denk stiekem dat ik het beter doe.", kleur: "#C8B4DC", artikel: { titel: "Waarom we opvoeding vergelijken en wanneer het ziekmakend wordt", tijd: "4 min" }, summary: "Vergelijken is menselijk en soms nuttig. Maar als je jezelf constant meet aan anderen, verlies je contact met je eigen kind. En dat is wat telt." },
  { id: 7, stelling: "Mijn man weet niet hoe ik me écht voel. En ik vertel het hem ook niet.", kleur: "#E8B4C8", artikel: { titel: "De stilte in een huwelijk — bescherming of afstand?", tijd: "7 min" }, summary: "Veel vrouwen dragen dingen alleen om hun partner te ontzien. Dat is liefde. Maar na jaren kan die stilte ook een muur worden. Het begint met één eerlijke zin." },
  { id: 8, stelling: "Ik vind mijn lichaam op dit moment niet mooi. En ik zeg dat nooit hardop.", kleur: "#DCB4A0", artikel: { titel: "79% denkt dit. Over lichaam, schaamte en genade.", tijd: "6 min" }, summary: "Je lichaam heeft je door alles heen gedragen. Kinderen gebaard, nachten doorgewerkt, verdriet gedragen. Het is geen decorstuk — het is het instrument waarmee je leeft." },
  { id: 9, stelling: "Ik bid alleen als het echt slecht gaat.", kleur: "#B4C8A0", artikel: { titel: "Is noodgebed eigenlijk genoeg?", tijd: "4 min" }, summary: "Veel gelovigen bidden het meest als ze het minst verwachten dat het helpt. Een theoloog zegt: God hoort noodkreten het allerbest. Misschien is eerlijkheid wél de beste gebedshouding." },
  { id: 10, stelling: "Soms vind ik mijn vriendinnen interessanter dan mijn man.", kleur: "#E8C4DC", artikel: { titel: "Wat vriendinnen geven wat een huwelijk niet kan", tijd: "5 min" }, summary: "Vriendinnen praten anders, luisteren anders, en begrijpen bepaalde dingen moeiteloos. Dat is geen aanklacht tegen je huwelijk. Het is gewoon hoe mensen werken." },
]

const MAX_CHARS = 60

function FloralDeco({ color, size = 120, opacity = 0.12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ opacity }} fill="none">
      {[0,60,120,180,240,300].map((deg, i) => (
        <ellipse key={i} cx="60" cy="60" rx="18" ry="36" fill={color}
          transform={`rotate(${deg} 60 60) translate(0 -18)`}
          style={{ transformOrigin: '60px 60px' }} />
      ))}
      <circle cx="60" cy="60" r="10" fill={color} />
    </svg>
  )
}

function Card({ dilemma, onSwipe, zIndex, offset }) {
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(null)

  function onStart(clientX) { startX.current = clientX; setDragging(true) }
  function onMove(clientX) { if (!startX.current) return; setDrag(clientX - startX.current) }
  function onEnd() {
    if (Math.abs(drag) > 90) onSwipe(drag > 0 ? 'raak' : 'nope')
    else setDrag(0)
    setDragging(false)
    startX.current = null
  }

  const rotate = drag * 0.07
  const raakOpacity = Math.max(0, Math.min(1, drag / 100))
  const nopeOpacity = Math.max(0, Math.min(1, -drag / 100))

  return (
    <div
      onMouseDown={e => onStart(e.clientX)} onMouseMove={e => dragging && onMove(e.clientX)}
      onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)} onTouchMove={e => onMove(e.touches[0].clientX)} onTouchEnd={onEnd}
      style={{
        position: 'absolute', width: '100%',
        cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none',
        transform: `translateX(${drag + offset}px) rotate(${rotate + offset * 0.015}deg) translateY(${Math.abs(offset) * 1.5}px)`,
        transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.2,0.64,1)',
        opacity: zIndex === 0 ? 1 : 0.75 - zIndex * 0.18, zIndex: 10 - zIndex,
      }}>
      <div style={{
        background: 'linear-gradient(145deg, #FFFAF8 0%, #FDF5FB 100%)', borderRadius: 32,
        padding: '0 0 28px', boxShadow: '0 16px 60px rgba(180,100,160,0.15), 0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative', overflow: 'hidden', minHeight: 280,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        border: '1.5px solid rgba(220,180,210,0.4)',
      }}>
        <div style={{ background: `linear-gradient(135deg, ${dilemma.kleur}CC, ${dilemma.kleur}66)`, padding: '18px 24px 14px', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, pointerEvents: 'none' }}><FloralDeco color="#fff" size={100} opacity={0.2} /></div>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)' }}>DILEMMA VAN EEN EVA</span>
        </div>
        <div style={{ padding: '0 26px', flex: 1 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, lineHeight: 1.45, color: '#3A1A3A', margin: 0, fontWeight: 600, fontStyle: 'italic' }}>"{dilemma.stelling}"</p>
        </div>
        <div style={{ padding: '18px 26px 0', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#DCA0C0', fontWeight: 600 }}>← niet ik</span>
          <span style={{ fontSize: 12, color: '#A090C8', fontWeight: 600 }}>dit ben ik →</span>
        </div>
        <div style={{ position: 'absolute', top: 70, left: 18, border: '3.5px solid #9B6BB5', borderRadius: 10, padding: '5px 14px', transform: 'rotate(-14deg)', opacity: raakOpacity, pointerEvents: 'none', background: 'rgba(255,255,255,0.92)' }}>
          <span style={{ color: '#9B6BB5', fontWeight: 900, fontSize: 18, fontFamily: "'DM Sans', sans-serif" }}>DIT BEN IK</span>
        </div>
        <div style={{ position: 'absolute', top: 70, right: 18, border: '3.5px solid #D4789A', borderRadius: 10, padding: '5px 14px', transform: 'rotate(14deg)', opacity: nopeOpacity, pointerEvents: 'none', background: 'rgba(255,255,255,0.92)' }}>
          <span style={{ color: '#D4789A', fontWeight: 900, fontSize: 18, fontFamily: "'DM Sans', sans-serif" }}>NIET IK</span>
        </div>
      </div>
    </div>
  )
}

function CommentsSection({ dilemmaId, accentKleur }) {
  const [comments, setComments] = useState([])
  const [input, setInput] = useState('')
  const [posted, setPosted] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const remaining = MAX_CHARS - input.length
  const emojis = ['🌸','💜','🌿','✨','🕊️','💫','🌷','🍃']

  useEffect(() => {
    loadComments()
  }, [dilemmaId])

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('dilemma_id', dilemmaId)
      .order('created_at', { ascending: false })
    if (data) setComments(data)
  }

  async function post() {
    if (!input.trim() || input.length > MAX_CHARS) return
    const { data } = await supabase.from('comments').insert([{ dilemma_id: dilemmaId, text: input.trim() }]).select()
    if (data) {
      setComments(c => [data[0], ...c])
      setInput('')
      setPosted(true)
      setTimeout(() => setPosted(false), 2000)
    }
  }

  const visible = showAll ? comments : comments.slice(0, 3)

  return (
    <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 2px 16px rgba(180,100,160,0.07)' }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(220,180,210,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#C4A0C0', fontWeight: 800, letterSpacing: '0.14em' }}>💬 WAT ANDERE EVA'S ZEGGEN</span>
        <span style={{ fontSize: 11, color: '#D0B0D8', fontWeight: 600 }}>{comments.length} reacties</span>
      </div>
      <div style={{ padding: '10px 0' }}>
        {visible.length === 0 && <p style={{ padding: '10px 20px', fontSize: 13, color: '#CCC', fontStyle: 'italic' }}>Nog geen reacties. Wees de eerste. 🌸</p>}
        {visible.map((c, i) => (
          <div key={c.id} style={{ padding: '10px 20px', borderBottom: i < visible.length - 1 ? '1px solid rgba(240,220,240,0.5)' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${accentKleur}88, ${accentKleur}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
              {emojis[i % 8]}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, color: '#3A1A3A', lineHeight: 1.4 }}>{c.text}</p>
              <span style={{ fontSize: 10, color: '#D0B8D8' }}>anoniem · Eva</span>
            </div>
          </div>
        ))}
        {comments.length > 3 && (
          <button onClick={() => setShowAll(!showAll)} style={{ width: '100%', padding: '10px 0', background: 'none', border: 'none', color: '#B090C8', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            {showAll ? 'Minder tonen ↑' : `Nog ${comments.length - 3} reacties tonen ↓`}
          </button>
        )}
      </div>
      <div style={{ padding: '12px 16px 14px', borderTop: '1px solid rgba(220,180,210,0.2)', background: 'linear-gradient(135deg, #FDF8FF, #FFF5F9)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <input
              placeholder="Reageer anoniem... (max 60 tekens)"
              value={input} onChange={e => e.target.value.length <= MAX_CHARS && setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && post()}
              style={{ width: '100%', border: `1.5px solid ${input ? accentKleur + '88' : 'rgba(220,180,210,0.4)'}`, borderRadius: 20, padding: '10px 14px', fontSize: 13, color: '#3A1A3A', fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: remaining < 10 ? '#D4789A' : '#D0B8D8' }}>{remaining} tekens</span>
            </div>
          </div>
          <button onClick={post} disabled={!input.trim() || posted} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: input.trim() && !posted ? `linear-gradient(135deg, ${accentKleur}, #9B72CF)` : 'rgba(220,200,230,0.4)', color: '#fff', fontSize: 16, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0, marginBottom: 20 }}>
            {posted ? '✓' : '↑'}
          </button>
        </div>
        {posted && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#B090C8', textAlign: 'center' }}>✓ Anoniem geplaatst 🌸</p>}
      </div>
    </div>
  )
}

export default function EvaTinder() {
  const [stack, setStack] = useState([...dilemmas])
  const [lastSwipe, setLastSwipe] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showInstuur, setShowInstuur] = useState(false)
  const [inputText, setInputText] = useState('')
  const [verstuurd, setVerstuurd] = useState(false)
  const [votes, setVotes] = useState({})

  useEffect(() => { loadVotes() }, [])

  async function loadVotes() {
    const { data } = await supabase.from('votes').select('dilemma_id, direction')
    if (!data) return
    const counts = {}
    data.forEach(v => {
      if (!counts[v.dilemma_id]) counts[v.dilemma_id] = { raak: 0, nope: 0 }
      counts[v.dilemma_id][v.direction]++
    })
    setVotes(counts)
  }

  async function handleSwipe(dir) {
    const dilemma = stack[0]
    await supabase.from('votes').insert([{ dilemma_id: dilemma.id, direction: dir }])
    await loadVotes()
    setLastSwipe({ dilemma, dir })
    setStack(s => s.slice(1))
    setShowResult(true)
    setShowSummary(false)
  }

  async function instuur() {
    if (!inputText.trim()) return
    await supabase.from('submitted_dilemmas').insert([{ text: inputText.trim() }])
    setVerstuurd(true)
    setTimeout(() => { setVerstuurd(false); setInputText(''); setShowInstuur(false) }, 2500)
  }

  function volgende() { setShowResult(false); setLastSwipe(null) }

  const accentKleur = lastSwipe?.dilemma.kleur || '#C9A0DC'
  const dilemmaVotes = lastSwipe ? (votes[lastSwipe.dilemma.id] || { raak: 0, nope: 0 }) : { raak: 0, nope: 0 }
  const totalVotes = dilemmaVotes.raak + dilemmaVotes.nope
  const pctRaak = totalVotes > 0 ? Math.round((dilemmaVotes.raak / totalVotes) * 100) : 50
  const jijRaak = lastSwipe?.dir === 'raak'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5EEF8 0%, #FDE8F0 50%, #EEF0FA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ width: '100%', maxWidth: 375, background: 'linear-gradient(180deg, #FFF8FC 0%, #FAF5FF 100%)', borderRadius: 48, boxShadow: '0 40px 100px rgba(180,100,180,0.2), 0 0 0 1px rgba(210,170,220,0.4)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '95vh', overflowY: 'auto' }}>

        <div style={{ background: 'linear-gradient(135deg, #C084B8 0%, #9B72CF 100%)', padding: '20px 26px 18px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: -30, right: -30, pointerEvents: 'none' }}><FloralDeco color="#fff" size={130} opacity={0.15} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Eva</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 700, letterSpacing: '0.18em', marginLeft: 10, verticalAlign: 'middle' }}>DILEMMA'S</span>
            </div>
            <button onClick={() => { setShowInstuur(!showInstuur); setShowResult(false) }} style={{ background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '7px 16px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ Insturen</button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Herken jij dit? Swipe eerlijk. 🌸</p>
        </div>

        {showInstuur && (
          <div style={{ background: 'linear-gradient(135deg, #F8EEF8, #F0EAF8)', padding: '18px 24px 20px', borderBottom: '1px solid rgba(200,160,210,0.2)', flexShrink: 0 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: '#B080C0', fontWeight: 700, letterSpacing: '0.12em' }}>JOUW ANONIEME DILEMMA</p>
            <textarea placeholder="Schrijf hier iets wat je nooit hardop zegt..." value={inputText} onChange={e => setInputText(e.target.value)} style={{ width: '100%', minHeight: 80, background: '#fff', border: '1.5px solid rgba(200,160,210,0.4)', borderRadius: 16, padding: '12px 14px', color: '#3A1A3A', fontSize: 14, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif", resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            <button onClick={instuur} style={{ marginTop: 10, width: '100%', padding: '13px', borderRadius: 16, border: 'none', background: verstuurd ? 'linear-gradient(135deg, #A8D8A8, #80C8A0)' : 'linear-gradient(135deg, #C084B8, #9B72CF)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {verstuurd ? '✓ Anoniem verstuurd — dank je lief' : 'Anoniem insturen →'}
            </button>
          </div>
        )}

        <div style={{ flex: 1, padding: '24px 20px 20px', display: 'flex', flexDirection: 'column' }}>
          {!showResult ? (
            stack.length > 0 ? (
              <>
                <div style={{ position: 'relative', height: 300, marginBottom: 24 }}>
                  {stack.slice(0, 3).reverse().map((d, i, arr) => (
                    <Card key={d.id} dilemma={d} zIndex={arr.length - 1 - i} offset={(arr.length - 1 - i) * -5} onSwipe={handleSwipe} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 16 }}>
                  <button onClick={() => handleSwipe('nope')} style={{ width: 64, height: 64, borderRadius: '50%', border: '2.5px solid #E8A0B8', background: 'linear-gradient(135deg, #FFF0F5, #FFE4EE)', fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,120,154,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4789A', fontWeight: 800 }}>✗</button>
                  <button onClick={() => handleSwipe('raak')} style={{ width: 64, height: 64, borderRadius: '50%', border: '2.5px solid #C4A8DC', background: 'linear-gradient(135deg, #F8F0FF, #F0E4FF)', fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 20px rgba(160,120,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B72CF', fontWeight: 800 }}>✓</button>
                </div>
                <p style={{ textAlign: 'center', margin: 0, fontSize: 12, color: '#C4A0C0' }}>
                  <span style={{ color: '#D4789A', fontWeight: 700 }}>✗ niet ik</span>{' · '}
                  <span style={{ color: '#9B72CF', fontWeight: 700 }}>✓ dit ben ik</span>{' · '}{stack.length} over
                </p>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 0' }}>
                <FloralDeco color="#C084B8" size={80} opacity={0.3} />
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: '#7A4A8A', margin: '16px 0 8px' }}>Dat waren ze voor vandaag.</p>
                <p style={{ fontSize: 14, color: '#B090C0' }}>Morgen nieuwe dilemma's. 🌸</p>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#fff', borderRadius: 22, padding: '18px 22px', borderLeft: `4px solid ${accentKleur}`, boxShadow: '0 2px 16px rgba(180,100,160,0.08)' }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, color: '#C4A0C0', fontWeight: 700, letterSpacing: '0.14em' }}>JOUW DILEMMA</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#3A1A3A', margin: 0, lineHeight: 1.45, fontStyle: 'italic' }}>"{lastSwipe.dilemma.stelling}"</p>
              </div>
              <div style={{ background: jijRaak ? 'linear-gradient(135deg, #F4EEFF, #EEE4FF)' : 'linear-gradient(135deg, #FFF0F5, #FFE8F0)', borderRadius: 18, padding: '14px 20px', border: `2px solid ${jijRaak ? '#C4A8DC' : '#E8B0C8'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: jijRaak ? '#7A52A8' : '#C0607A' }}>Jij: {jijRaak ? '✓ dit ben ik' : '✗ niet ik'}</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: jijRaak ? '#9B72CF' : '#D4789A' }}>{jijRaak ? pctRaak : 100 - pctRaak}%</span>
              </div>
              <div style={{ background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(180,100,160,0.06)' }}>
                <p style={{ margin: '0 0 6px', fontSize: 10, color: '#C4A0C0', fontWeight: 700, letterSpacing: '0.14em' }}>HOE ANDERE EVA'S STEMDEN {totalVotes > 0 && `(${totalVotes} stemmen)`}</p>
                <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: `${pctRaak}%`, background: 'linear-gradient(90deg, #9B72CF, #C084B8)', transition: 'width 1s ease' }} />
                  <div style={{ flex: 1, background: 'linear-gradient(90deg, #E8A0B8, #F0C0D0)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#9B72CF', fontWeight: 700 }}>✓ Dit ben ik — {pctRaak}%</span>
                  <span style={{ fontSize: 13, color: '#D4789A', fontWeight: 700 }}>{100 - pctRaak}% — Niet ik ✗</span>
                </div>
              </div>

              <CommentsSection dilemmaId={lastSwipe.dilemma.id} accentKleur={accentKleur} />

              <div style={{ background: 'linear-gradient(135deg, #9B72CF, #C084B8)', borderRadius: 22, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, pointerEvents: 'none' }}><FloralDeco color="#fff" size={100} opacity={0.12} /></div>
                <p style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '0.14em' }}>HIER GAAT EEN ARTIKEL OVER</p>
                <p style={{ margin: '0 0 16px', fontSize: 15, color: '#fff', lineHeight: 1.4, fontWeight: 600 }}>{lastSwipe.dilemma.artikel.titel}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: 'none', background: '#fff', color: '#7A52A8', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Lees ({lastSwipe.dilemma.artikel.tijd})</button>
                  <button onClick={() => setShowSummary(!showSummary)} style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: '2px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>⚡ 60 sec versie</button>
                </div>
                {showSummary && <div style={{ marginTop: 12, padding: '14px', background: 'rgba(255,255,255,0.15)', borderRadius: 14 }}><p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>{lastSwipe.dilemma.summary}</p></div>}
              </div>

              <button onClick={volgende} style={{ width: '100%', padding: '15px', borderRadius: 18, border: 'none', background: 'linear-gradient(135deg, #C084B8, #9B72CF)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 24px rgba(160,100,200,0.3)' }}>
                Volgend dilemma 🌸
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
