import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import TaskItem from '../tasks/TaskItem'
import { Plus, Loader2 } from 'lucide-react'

const today = () => new Date().toISOString().split('T')[0]
const todayLabel = () => new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
const moods = ['😴','😔','😐','🙂','😄']
const moodLabels = ['Exhausted','Sad','Neutral','Good','Excellent!']
const quotes = [
  "Small steps every day lead to big results. 💪",
  "Your future self is watching — make them proud. 🚀",
  "Focus on progress, not perfection. ✨",
  "Every expert was once a beginner. Keep going! 🎯",
  "The secret of getting ahead is getting started. 📚",
  "Discipline is choosing what you want most. 🔥",
]

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks,     setTasks]     = useState([])
  const [diary,     setDiary]     = useState({ content:'', mood: null })
  const [timelog,   setTimelog]   = useState({ productiveHours:0, wastedHours:0 })
  const [newTask,   setNewTask]   = useState('')
  const [newTag,    setNewTag]    = useState('study')
  const [newPri,    setNewPri]    = useState('med')
  const [analytics, setAnalytics] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [adding,    setAdding]    = useState(false)
  const [addError,  setAddError]  = useState('')
  const [quote]                   = useState(quotes[Math.floor(Math.random() * quotes.length)])

  useEffect(() => {
    const load = async () => {
      try {
        const [t, d, tl, a] = await Promise.all([
          api.get(`/tasks?date=${today()}`),
          api.get(`/diary?date=${today()}`),
          api.get(`/timelog?date=${today()}`),
          api.get('/analytics/weekly'),
        ])
        setTasks(t.data)
        if (d.data) setDiary(d.data)
        setTimelog(tl.data)
        setAnalytics(a.data)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const addTask = async () => {
    if (!newTask.trim()) {
      setAddError('Please write a task first!')
      setTimeout(() => setAddError(''), 2000)
      return
    }
    setAdding(true)
    setAddError('')
    try {
      const { data } = await api.post('/tasks', {
        text: newTask.trim(),
        date: today(),
        tag: newTag,
        priority: newPri
      })
      setTasks(prev => [data, ...prev])
      setNewTask('')
    } catch(e) {
      console.error(e)
      setAddError('Failed to add task. Try again!')
    } finally {
      setAdding(false)
    }
  }

  const toggleTask = async (id, done) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { done: !done })
      setTasks(prev => prev.map(t => t._id === id ? data : t))
    } catch(e) { console.error(e) }
  }

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      setTasks(prev => prev.filter(t => t._id !== id))
    } catch(e) { console.error(e) }
  }

  const saveMood = async (mood) => {
    setDiary(d => ({...d, mood}))
    try { await api.post('/diary', { date: today(), content: diary.content, mood }) }
    catch(e) { console.error(e) }
  }

  const done   = tasks.filter(t => t.done).length
  const total  = tasks.length
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0
  const stroke = 314
  const offset = stroke - (stroke * pct / 100)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:'12px' }}>
      <div style={{ fontSize:'32px' }}>📓</div>
      <div style={{ color:'#9898b0', fontFamily:'JetBrains Mono', fontSize:'13px' }}>Loading your dashboard...</div>
    </div>
  )

  return (
    <div style={{ padding:'0 0 40px', animation:'fadeIn 0.3s ease' }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* Header */}
      <div style={{ padding:'28px 28px 24px', background:'linear-gradient(180deg,rgba(124,106,247,0.06) 0%,transparent 100%)', borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:'24px' }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:'#9d8fff', background:'rgba(124,106,247,0.15)', border:'1px solid rgba(124,106,247,0.25)', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'10px' }}>{todayLabel()}</div>
        <div style={{ fontSize:'30px', fontWeight:'700', letterSpacing:'-1px', marginBottom:'4px' }}>{greeting()}, {user?.name?.split(' ')[0]} 👋</div>
        <div style={{ fontSize:'13px', color:'#9898b0', fontStyle:'italic' }}>{quote}</div>
      </div>

      <div style={{ padding:'0 28px' }}>

        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
          {[
            { label:'Completed',    value:done,                       color:'#4ade80', icon:'✅', sub:`of ${total} tasks` },
            { label:'Pending',      value:total-done,                 color:'#fbbf24', icon:'⏳', sub:'tasks remaining' },
            { label:'Study Streak', value:`${user?.streak||0}🔥`,    color:'#9d8fff', icon:'🔥', sub:'days in a row' },
            { label:'Focus Hours',  value:`${timelog.productiveHours}h`, color:'#2dd4bf', icon:'⏱️', sub:`${timelog.wastedHours}h wasted` },
          ].map(({ label, value, color, icon, sub }) => (
            <div key={label} style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px', position:'relative', overflow:'hidden', transition:'transform 0.2s,border-color 0.2s', cursor:'default' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:color, borderRadius:'16px 16px 0 0' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                <div style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.8px' }}>{label}</div>
                <span style={{ fontSize:'18px' }}>{icon}</span>
              </div>
              <div style={{ fontSize:'30px', fontWeight:'700', letterSpacing:'-1px', color, marginBottom:'4px' }}>{value}</div>
              <div style={{ fontSize:'11px', color:'#5a5a72' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'20px' }}>

          {/* Left Col */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            {/* Quick Add Task */}
            <div style={{ background:'#111118', border:'1px solid rgba(124,106,247,0.3)', borderRadius:'16px', padding:'20px', boxShadow:'0 0 30px rgba(124,106,247,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <span style={{ fontSize:'16px' }}>⚡</span>
                <span style={{ fontSize:'14px', fontWeight:'600' }}>Quick Add Task</span>
              </div>

              <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
                <input
                  className="input-dark"
                  placeholder="What do you need to do today?"
                  value={newTask}
                  onChange={e => { setNewTask(e.target.value); setAddError('') }}
                  onKeyDown={e => e.key === 'Enter' && !adding && addTask()}
                  style={{ flex:1, fontSize:'14px' }}
                  disabled={adding}
                />
                <button onClick={addTask} disabled={adding} style={{
                  background: adding ? '#3a3a4a' : 'linear-gradient(135deg,#7c6af7,#9d8fff)',
                  color:'white', border:'none', borderRadius:'10px', padding:'10px 18px',
                  fontFamily:'Space Grotesk', fontSize:'14px', fontWeight:'600',
                  cursor: adding ? 'not-allowed':'pointer',
                  display:'flex', alignItems:'center', gap:'6px',
                  transition:'all 0.2s', whiteSpace:'nowrap', minWidth:'110px', justifyContent:'center'
                }}>
                  {adding
                    ? <><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> Adding...</>
                    : <><Plus size={15}/> Add Task</>}
                </button>
              </div>

              <div style={{ display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>Tag:</span>
                {['study','project','personal','exam'].map(t => (
                  <button key={t} onClick={() => setNewTag(t)} style={{
                    padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'500',
                    cursor:'pointer', border:'1px solid transparent', fontFamily:'JetBrains Mono',
                    background: newTag===t ? 'rgba(124,106,247,0.2)':'#1a1a24',
                    color:      newTag===t ? '#9d8fff':'#5a5a72',
                    borderColor:newTag===t ? 'rgba(124,106,247,0.4)':'rgba(255,255,255,0.07)',
                    transition:'all 0.15s'
                  }}>{t}</button>
                ))}
                <span style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono', marginLeft:'4px' }}>Priority:</span>
                {[['high','🔴'],['med','🟡'],['low','🟢']].map(([p,icon]) => (
                  <button key={p} onClick={() => setNewPri(p)} style={{
                    padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'500',
                    cursor:'pointer', border:'1px solid transparent', fontFamily:'JetBrains Mono',
                    background: newPri===p ? 'rgba(124,106,247,0.2)':'#1a1a24',
                    color:      newPri===p ? '#9d8fff':'#5a5a72',
                    borderColor:newPri===p ? 'rgba(124,106,247,0.4)':'rgba(255,255,255,0.07)',
                    transition:'all 0.15s'
                  }}>{icon} {p}</button>
                ))}
              </div>

              {addError && (
                <div style={{ marginTop:'10px', padding:'8px 12px', borderRadius:'8px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', color:'#f87171', fontSize:'12px', fontFamily:'JetBrains Mono' }}>
                  ⚠️ {addError}
                </div>
              )}
            </div>

            {/* Today Tasks */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.01)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ fontSize:'16px' }}>📋</span>
                  <span style={{ fontSize:'14px', fontWeight:'600' }}>Today's Tasks</span>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', background:'rgba(124,106,247,0.15)', color:'#9d8fff', padding:'2px 8px', borderRadius:'4px' }}>{total} tasks</span>
                </div>
                <span style={{ fontSize:'12px', color: pct===100 ? '#4ade80':'#9898b0', fontWeight:'500' }}>
                  {pct===100 ? '🎉 All done!' : `${pct}% done`}
                </span>
              </div>
              <div style={{ padding:'16px 20px' }}>
                <div style={{ height:'5px', background:'rgba(255,255,255,0.05)', borderRadius:'3px', marginBottom:'16px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background: pct===100 ? 'linear-gradient(90deg,#4ade80,#22d3ee)':'linear-gradient(90deg,#7c6af7,#9d8fff)', borderRadius:'3px', transition:'width 0.6s ease' }}/>
                </div>
                {tasks.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px 20px', color:'#5a5a72', fontFamily:'JetBrains Mono', fontSize:'12px', lineHeight:'1.8' }}>
                    <div style={{ fontSize:'32px', marginBottom:'8px' }}>✨</div>
                    No tasks yet!<br/>Add your first task above ↑
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                    {tasks.map(task => <TaskItem key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Chart */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
                <span style={{ fontSize:'16px' }}>📊</span>
                <span style={{ fontSize:'14px', fontWeight:'600' }}>This Week</span>
              </div>
              <div style={{ display:'flex', gap:'6px', alignItems:'flex-end', height:'80px' }}>
                {analytics.map((day, i) => {
                  const maxT = Math.max(...analytics.map(d => d.total), 1)
                  const h = Math.round((day.total / maxT) * 65)
                  const dLabel = new Date(day.date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}).slice(0,3)
                  const isToday = day.date === today()
                  return (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'5px' }}>
                      <div style={{ fontSize:'10px', color: isToday?'#9d8fff':'#4ade80', fontFamily:'JetBrains Mono', fontWeight:'500' }}>{day.done>0?day.done:''}</div>
                      <div style={{ width:'100%', height:`${Math.max(h,4)}px`, borderRadius:'5px 5px 0 0', background: isToday ? 'linear-gradient(180deg,#7c6af7,#9d8fff)' : day.done>0 ? 'rgba(74,222,128,0.3)':'rgba(255,255,255,0.05)', border:`1px solid ${isToday?'rgba(124,106,247,0.6)':day.done>0?'rgba(74,222,128,0.2)':'rgba(255,255,255,0.05)'}`, transition:'all 0.3s' }} title={`${day.done}/${day.total} tasks`}/>
                      <span style={{ fontSize:'10px', color: isToday?'#9d8fff':'#5a5a72', fontFamily:'JetBrains Mono', fontWeight: isToday?'600':'400' }}>{dLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Col */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Progress Ring */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ fontSize:'10px', color:'#9898b0', marginBottom:'14px', fontWeight:'600', letterSpacing:'0.5px', textTransform:'uppercase', fontFamily:'JetBrains Mono' }}>Today's Progress</div>
              <div style={{ position:'relative', width:'120px', height:'120px', marginBottom:'16px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke={pct===100?'url(#rg2)':'url(#rg1)'} strokeWidth="10" strokeLinecap="round" strokeDasharray={stroke} strokeDashoffset={offset} transform="rotate(-90 60 60)" style={{transition:'stroke-dashoffset 0.8s ease'}}/>
                  <defs>
                    <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#7c6af7"/><stop offset="100%" stopColor="#9d8fff"/></linearGradient>
                    <linearGradient id="rg2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient>
                  </defs>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'700', letterSpacing:'-1px', color:pct===100?'#4ade80':'#9d8fff' }}>{pct}%</div>
                  <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>done</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', width:'100%' }}>
                {[{label:'Done',val:done,color:'#4ade80'},{label:'Pending',val:total-done,color:'#fbbf24'}].map(s=>(
                  <div key={s.label} style={{ textAlign:'center', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'10px' }}>
                    <div style={{ fontSize:'20px', fontWeight:'700', color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                <span style={{ fontSize:'16px' }}>💭</span>
                <span style={{ fontSize:'13px', fontWeight:'600' }}>Today's Mood</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-around' }}>
                {moods.map((m,i) => (
                  <button key={i} onClick={()=>saveMood(i)} title={moodLabels[i]} style={{ width:'38px', height:'38px', borderRadius:'50%', cursor:'pointer', fontSize:'20px', display:'flex', alignItems:'center', justifyContent:'center', background:diary.mood===i?'rgba(124,106,247,0.2)':'#1a1a24', border:`1.5px solid ${diary.mood===i?'#7c6af7':'rgba(255,255,255,0.07)'}`, transform:diary.mood===i?'scale(1.2)':'scale(1)', transition:'all 0.2s', outline:'none' }}>{m}</button>
                ))}
              </div>
              {diary.mood !== null && diary.mood !== undefined && (
                <div style={{ textAlign:'center', marginTop:'10px', fontSize:'12px', color:'#9d8fff', fontFamily:'JetBrains Mono', background:'rgba(124,106,247,0.08)', padding:'6px', borderRadius:'8px' }}>
                  Feeling: {moodLabels[diary.mood]} {moods[diary.mood]}
                </div>
              )}
            </div>

            {/* Time Split */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <span style={{ fontSize:'16px' }}>⏱️</span>
                <span style={{ fontSize:'13px', fontWeight:'600' }}>Time Split</span>
              </div>
              {[
                { label:'Productive', hours:timelog.productiveHours, max:8, color:'linear-gradient(90deg,#4ade80,#22d3ee)', textColor:'#4ade80' },
                { label:'Wasted',     hours:timelog.wastedHours,     max:8, color:'linear-gradient(90deg,#f87171,#f472b6)', textColor:'#f87171' },
              ].map(bar=>(
                <div key={bar.label} style={{ marginBottom:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'5px' }}>
                    <span style={{ color:'#9898b0', fontFamily:'JetBrains Mono' }}>{bar.label}</span>
                    <span style={{ color:bar.textColor, fontWeight:'600', fontFamily:'JetBrains Mono' }}>{bar.hours}h</span>
                  </div>
                  <div style={{ height:'7px', background:'rgba(255,255,255,0.05)', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.min((bar.hours/bar.max)*100,100)}%`, background:bar.color, borderRadius:'4px', transition:'width 0.8s ease' }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Streak */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'16px' }}>🔥</span>
                  <span style={{ fontSize:'13px', fontWeight:'600' }}>Streak</span>
                </div>
                <div style={{ fontSize:'24px', fontWeight:'700', color:'#fbbf24', letterSpacing:'-1px' }}>{user?.streak||0}</div>
              </div>
              <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono', marginBottom:'10px' }}>days in a row 💪</div>
              <div style={{ display:'flex', gap:'4px' }}>
                {['M','T','W','T','F','S','S'].map((d,i) => {
                  const dayData = analytics[i]
                  const todayIdx = new Date().getDay()===0 ? 6 : new Date().getDay()-1
                  const isToday = i===todayIdx
                  const isDone  = dayData && dayData.completionRate>50
                  return (
                    <div key={i} style={{ flex:1, height:'28px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontFamily:'JetBrains Mono', fontWeight:'600', background:isToday?'rgba(124,106,247,0.2)':isDone?'rgba(74,222,128,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${isToday?'rgba(124,106,247,0.5)':isDone?'rgba(74,222,128,0.3)':'rgba(255,255,255,0.06)'}`, color:isToday?'#9d8fff':isDone?'#4ade80':'#5a5a72' }}>
                      {isDone && !isToday ? '✓' : d}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
