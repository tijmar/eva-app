import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const dilemmaLabels = {
  1: "Geloof is meer gewoonte dan overtuiging",
  2: "Hadden we maar geen kinderen genomen",
  3: "Liever naar de kapper dan de kerk",
  4: "Als mijn man niet meer gelooft...",
  5: "Sommige dingen in de bijbel zijn onzin",
  6: "Ik doe het stiekem beter dan anderen",
  7: "Mijn man weet niet hoe ik me voel",
  8: "Ik vind mijn lichaam niet mooi",
  9: "Ik bid alleen als het slecht gaat",
  10: "Vriendinnen zijn interessanter dan mijn man",
}

const kleuren = {
  1: "#C9A0DC", 2: "#E8A0B4", 3: "#B4A0E8", 4: "#D4A0C8", 5: "#A0C4DC",
  6: "#C8B4DC", 7: "#E8B4C8", 8: "#DCB4A0", 9: "#B4C8A0", 10: "#E8C4DC",
}

export default function Admin() {
  const [votes, setVotes] = useState([])
  const [comments, setComments] = useState([])
  const [submitted, setSubmitted] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overzicht')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [v, c, s] = await Promise.all([
      supabase.from('votes').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
      supabase.from('submitted_dilemmas').select('*').order('created_at', { ascending: false }),
    ])
    if (v.data) setVotes(v.data)
    if (c.data) setComments(c.data)
    if (s.data) setSubmitted(s.data)
    setLoading(false)
  }

  // Verwerk stemmen per dilemma
  const votesByDilemma = {}
  votes.forEach(v => {
    if (!votesByDilemma[v.dilemma_id]) votesByDilemma[v.dilemma_id] = { raak: 0, nope: 0, total: 0 }
    votesByDilemma[v.dilemma_id][v.direction]++
    votesByDilemma[v.dilemma_id].total++
  })

  const commentsByDilemma = {}
  comments.forEach(c => {
    if (!commentsByDilemma[c.dilemma_id]) commentsByDilemma[c.dilemma_id] = []
    commentsByDilemma[c.dilemma_id].push(c)
  })

  // Vandaag
  const today = new Date().toDateString()
  const votesToday = votes.filter(v => new Date(v.created_at).toDateString() === today).length
  const commentsToday = comments.filter(c => new Date(c.created_at).toDateString() === today).length

  const tabs = ['overzicht', 'dilemma\'s', 'reacties', 'ingezonden']

  return (
    <div style={{ minHeight: '100vh', background: '#FAF5FF', fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#3A1A3A', margin: 0 }}>Eva Dashboard</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#B090C0' }}>Live data · vernieuwd bij laden</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={loadAll} style={{ background: 'linear-gradient(135deg, #C084B8, #9B72CF)', border: 'none', borderRadius: 12, padding: '9px 16px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              🔄 Vernieuwen
            </button>
            <a href="/" style={{ background: '#fff', border: '1.5px solid rgba(200,160,210,0.4)', borderRadius: 12, padding: '9px 16px', color: '#9B72CF', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Naar de app →
            </a>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#C4A0C0' }}>Laden... 🌸</div>
        ) : (
          <>
            {/* Totaalcijfers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Stemmen totaal', value: votes.length, emoji: '🗳️', kleur: '#9B72CF' },
                { label: 'Stemmen vandaag', value: votesToday, emoji: '📅', kleur: '#C084B8' },
                { label: 'Reacties totaal', value: comments.length, emoji: '💬', kleur: '#D4789A' },
                { label: 'Ingezonden', value: submitted.length, emoji: '📝', kleur: '#A0C4DC' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 20, padding: '18px 16px', boxShadow: '0 2px 16px rgba(180,100,160,0.08)', borderTop: `4px solid ${s.kleur}` }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.kleur }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#B0A0B8', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', borderRadius: 16, padding: 4, boxShadow: '0 2px 12px rgba(180,100,160,0.06)' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: activeTab === tab ? 'linear-gradient(135deg, #C084B8, #9B72CF)' : 'transparent', color: activeTab === tab ? '#fff' : '#B090C0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif', textTransform: 'capitalize", transition: 'all 0.2s ease' }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Overzicht tab */}
            {activeTab === 'overzicht' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(votesByDilemma).sort((a, b) => b[1].total - a[1].total).map(([id, data]) => {
                  const pct = Math.round((data.raak / data.total) * 100)
                  const kleur = kleuren[id] || '#C9A0DC'
                  return (
                    <div key={id} style={{ background: '#fff', borderRadius: 18, padding: '16px 20px', boxShadow: '0 2px 12px rgba(180,100,160,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <p style={{ margin: 0, fontSize: 14, color: '#3A1A3A', fontWeight: 600, maxWidth: '70%', lineHeight: 1.35 }}>{dilemmaLabels[id]}</p>
                        <span style={{ fontSize: 13, color: '#B0A0B8', fontWeight: 600, flexShrink: 0 }}>{data.total} stemmen</span>
                      </div>
                      <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ width: `${pct}%`, background: `linear-gradient(90deg, #9B72CF, ${kleur})`, transition: 'width 0.8s ease' }} />
                        <div style={{ flex: 1, background: '#F0E4F0' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#9B72CF', fontWeight: 700 }}>✓ Dit ben ik {pct}%</span>
                        <span style={{ fontSize: 12, color: '#D4789A', fontWeight: 700 }}>{100 - pct}% Niet ik ✗</span>
                      </div>
                      {commentsByDilemma[id] && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#C4A0C0' }}>💬 {commentsByDilemma[id].length} reacties</div>
                      )}
                    </div>
                  )
                })}
                {Object.keys(votesByDilemma).length === 0 && <p style={{ textAlign: 'center', color: '#C4A0C0', padding: 40 }}>Nog geen stemmen. Deel de app! 🌸</p>}
              </div>
            )}

            {/* Dilemma's tab */}
            {activeTab === "dilemma's" && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {Object.entries(dilemmaLabels).map(([id, label]) => {
                  const data = votesByDilemma[id] || { raak: 0, nope: 0, total: 0 }
                  const pct = data.total > 0 ? Math.round((data.raak / data.total) * 100) : 0
                  return (
                    <div key={id} style={{ background: '#fff', borderRadius: 18, padding: '14px 16px', boxShadow: '0 2px 12px rgba(180,100,160,0.06)', borderLeft: `4px solid ${kleuren[id]}` }}>
                      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#3A1A3A', fontWeight: 600, lineHeight: 1.3 }}>{label}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#9B72CF', fontWeight: 700 }}>✓ {pct}%</span>
                        <span style={{ fontSize: 11, color: '#B0A0B8' }}>{data.total} stemmen</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Reacties tab */}
            {activeTab === 'reacties' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {comments.length === 0 && <p style={{ textAlign: 'center', color: '#C4A0C0', padding: 40 }}>Nog geen reacties.</p>}
                {comments.map((c, i) => (
                  <div key={c.id} style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', boxShadow: '0 1px 8px rgba(180,100,160,0.06)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ background: `linear-gradient(135deg, ${kleuren[c.dilemma_id] || '#C9A0DC'}66, ${kleuren[c.dilemma_id] || '#C9A0DC'}33)`, borderRadius: 8, padding: '4px 8px', fontSize: 11, color: '#7A52A8', fontWeight: 700, flexShrink: 0 }}>
                      #{c.dilemma_id}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#3A1A3A' }}>{c.text}</p>
                      <span style={{ fontSize: 11, color: '#C4A0C0' }}>{new Date(c.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ingezonden tab */}
            {activeTab === 'ingezonden' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {submitted.length === 0 && <p style={{ textAlign: 'center', color: '#C4A0C0', padding: 40 }}>Nog geen ingezonden dilemma's.</p>}
                {submitted.map((s) => (
                  <div key={s.id} style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 8px rgba(180,100,160,0.06)', borderLeft: '4px solid #C9A0DC' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 15, color: '#3A1A3A', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', lineHeight: 1.4 }}>"{s.text}"</p>
                    <span style={{ fontSize: 11, color: '#C4A0C0' }}>{new Date(s.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
