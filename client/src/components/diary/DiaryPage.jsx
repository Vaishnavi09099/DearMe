import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import { Save, BookOpen } from 'lucide-react'

const today = () => new Date().toISOString().split('T')[0]
const moods  = ['😴','😔','😐','🙂','😄']
const moodLabels = ['Exhausted','Sad','Neutral','Good','Excellent!']

export default function DiaryPage() {
  const [date,    setDate]    = useState(today())
  const [content, setContent] = useState('')
  const [mood,    setMood]    = useState(null)
  const [saved,   setSaved]   = useState(true)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const { data } = await api.get('/diary')
        setEntries(Array.isArray(data) ? data : [])
      } catch(e) { console.error(e) }
    }
    loadEntries()
  }, [])

  useEffect(() => {
    const loadDay = async () => {
      try {
        const { data } = await api.get(`/diary?date=${date}`)
        setContent(data?.content || '')
        setMood(data?.mood ?? null)
      } catch(e) {
        setContent(''); setMood(null)
      }
      setSaved(true)
    }
    loadDay()
  }, [date])

  const save = useCallback(async () => {
    try {
      await api.post('/diary', { date, content, mood })
      setSaved(true)
      // refresh entries list
      const { data } = await api.get('/diary')
      setEntries(Array.isArray(data) ? data : [])
    } catch(e) { console.error(e) }
  }, [date, content, mood])

  // Auto-save after 2s of no typing
  useEffect(() => {
    setSaved(false)
    const timer = setTimeout(save, 2000)
    return () => clearTimeout(timer)
  }, [content, mood])

  return (
    <div style={{ padding:'28px', animation:'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:'#9d8fff', background:'rgba(124,106,247,0.15)', border:'1px solid rgba(124,106,247,0.25)', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'8px' }}>Personal Journal</div>
          <div style={{ fontSize:'26px', fontWeight:'700', letterSpacing:'-0.8px' }}>My Diary</div>
          <div style={{ fontSize:'13px', color:'#9898b0', marginTop:'3px' }}>A private space for thoughts and reflections</div>
        </div>
        <button className="btn-primary" onClick={save} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <Save size={15}/> Save Entry
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'16px' }}>
        {/* Editor */}
        <div>
          {/* Date picker + mood row */}
          <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px 20px', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <BookOpen size={16} color="#7c6af7"/>
              <input type="date" className="input-dark" value={date} onChange={e=>setDate(e.target.value)} style={{ maxWidth:'160px' }}/>
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <span style={{ fontSize:'12px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>Mood:</span>
              {moods.map((m,i)=>(
                <button key={i} onClick={()=>setMood(i)} title={moodLabels[i]} style={{
                  fontSize:'18px', cursor:'pointer', borderRadius:'50%',
                  width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center',
                  background: mood===i ? 'rgba(124,106,247,0.2)' : 'transparent',
                  border:`1.5px solid ${mood===i ? '#7c6af7':'rgba(255,255,255,0.07)'}`,
                  transform: mood===i ? 'scale(1.15)':'scale(1)', transition:'all 0.15s'
                }}>{m}</button>
              ))}
            </div>
            <div style={{ fontSize:'10px', fontFamily:'JetBrains Mono', color: saved ? '#4ade80' : '#fbbf24' }}>
              {saved ? '● saved' : '● saving...'}
            </div>
          </div>

          {/* Textarea */}
          <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', overflow:'hidden' }}>
            <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'13px', fontWeight:'600' }}>
                {date === today() ? "Today's Entry" : new Date(date+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
              </span>
              {mood !== null && <span style={{ fontSize:'18px' }}>{moods[mood]}</span>}
            </div>
            <textarea
              value={content}
              onChange={e => { setContent(e.target.value); setSaved(false) }}
              placeholder={`Start writing your thoughts for ${date === today() ? 'today' : 'this day'}...

What did you accomplish?
What are you grateful for?
What could you improve tomorrow?
Goals for next session...`}
              style={{
                width:'100%', minHeight:'360px', background:'transparent',
                border:'none', padding:'20px', color:'#e8e8f0',
                fontFamily:'Space Grotesk, sans-serif', fontSize:'14px',
                lineHeight:'1.8', resize:'vertical', outline:'none',
              }}
            />
          </div>
        </div>

        {/* Sidebar — past entries */}
        <div>
          <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', fontSize:'13px', fontWeight:'600' }}>Past Entries</div>
            <div style={{ maxHeight:'560px', overflowY:'auto' }}>
              {entries.length === 0 ? (
                <div style={{ padding:'24px', textAlign:'center', color:'#5a5a72', fontSize:'12px', fontFamily:'JetBrains Mono' }}>No past entries yet</div>
              ) : entries.map(e => (
                <div key={e._id} onClick={()=>setDate(e.date)} style={{
                  padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)',
                  cursor:'pointer', transition:'background 0.15s',
                  background: date===e.date ? 'rgba(124,106,247,0.08)' : 'transparent',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                    <span style={{ fontSize:'11px', fontFamily:'JetBrains Mono', color: date===e.date?'#9d8fff':'#7c6af7' }}>
                      {new Date(e.date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                    </span>
                    <span style={{ fontSize:'16px' }}>{e.mood !== null && e.mood !== undefined ? moods[e.mood] : ''}</span>
                  </div>
                  <div style={{ fontSize:'12px', color:'#9898b0', lineHeight:'1.5', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {e.content || 'No content'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
