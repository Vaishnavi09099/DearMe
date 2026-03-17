import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import TaskItem from '../tasks/TaskItem'
import { Plus } from 'lucide-react'

const today = () => new Date().toISOString().split('T')[0]
const todayLabel = () => new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

const moods = ['😴','😔','😐','🙂','😄']
const moodLabels = ['Exhausted','Sad','Neutral','Good','Excellent!']

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks,    setTasks]    = useState([])
  const [diary,    setDiary]    = useState({ content:'', mood: null })
  const [timelog,  setTimelog]  = useState({ productiveHours:0, wastedHours:0 })
  const [newTask,  setNewTask]  = useState('')
  const [analytics,setAnalytics]= useState([])
  const [loading,  setLoading]  = useState(true)

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
    if (!newTask.trim()) return
    const { data } = await api.post('/tasks', { text: newTask, date: today(), tag:'study', priority:'med' })
    setTasks(prev => [data, ...prev])
    setNewTask('')
  }

  const toggleTask = async (id, done) => {
    const { data } = await api.put(`/tasks/${id}`, { done: !done })
    setTasks(prev => prev.map(t => t._id === id ? data : t))
  }

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  const saveMood = async (mood) => {
    setDiary(d => ({...d, mood}))
    await api.post('/diary', { date: today(), content: diary.content, mood })
  }

  const done    = tasks.filter(t => t.done).length
  const total   = tasks.length
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0
  const stroke  = 314
  const offset  = stroke - (stroke * pct / 100)
  const streak  = user?.streak || 0
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'U'

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#5a5a72', fontFamily:'JetBrains Mono', fontSize:'13px' }}>
      Loading your dashboard...
    </div>
  )

  return (
    <div style={{ padding:'0 0 40px', animation:'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ padding:'28px 28px 0', display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:'#9d8fff', background:'rgba(124,106,247,0.15)', border:'1px solid rgba(124,106,247,0.25)', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'8px' }}>
            {todayLabel()}
          </div>
          <div style={{ fontSize:'28px', fontWeight:'700', letterSpacing:'-1px' }}>{greeting()}, {user?.name?.split(' ')[0]} 👋</div>
          <div style={{ fontSize:'13px', color:'#9898b0', marginTop:'4px' }}>
            {tasks.filter(t=>!t.done).length > 0 ? `You have ${tasks.filter(t=>!t.done).length} pending tasks today.` : 'All tasks done! Great work 🎉'}
          </div>
        </div>
      </div>

      <div style={{ padding:'0 28px' }}>
        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px' }}>
          {[
            { label:'Completed',   value: done,  color:'#4ade80', change:`${total} total today` },
            { label:'Pending',     value: total-done, color:'#fbbf24', change:'tasks left' },
            { label:'Study Streak',value:`${streak}🔥`, color:'#9d8fff', change:'days in a row' },
            { label:'Focus Hours', value:`${timelog.productiveHours}h`, color:'#2dd4bf', change:`${timelog.wastedHours}h wasted` },
          ].map(({ label, value, color, change }) => (
            <div key={label} style={{
              background:'#111118', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:'14px', padding:'18px', position:'relative', overflow:'hidden'
            }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:color, borderRadius:'14px 14px 0 0' }} />
              <div style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'10px' }}>{label}</div>
              <div style={{ fontSize:'28px', fontWeight:'700', letterSpacing:'-1px', color }}>{value}</div>
              <div style={{ fontSize:'11px', color:'#4ade80', marginTop:'4px' }}>{change}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'16px' }}>
          {/* Left col */}
          <div>
            {/* Quick Add Task */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px', marginBottom:'16px' }}>
              <div style={{ fontSize:'14px', fontWeight:'600', marginBottom:'14px' }}>Quick Add Task</div>
              <div style={{ display:'flex', gap:'8px' }}>
                <input
                  className="input-dark" placeholder="Add a task for today..."
                  value={newTask} onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  style={{ flex:1 }}
                />
                <button className="btn-primary" onClick={addTask} style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:'4px' }}>
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Today Tasks */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'14px', fontWeight:'600' }}>Today's Tasks</span>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', background:'rgba(124,106,247,0.15)', color:'#9d8fff', padding:'2px 8px', borderRadius:'4px' }}>{total} tasks</span>
                </div>
                <div style={{ fontSize:'12px', color:'#9898b0' }}>{pct}% done</div>
              </div>
              <div style={{ padding:'14px 20px' }}>
                {/* Progress bar */}
                <div style={{ height:'4px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', marginBottom:'14px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg, #7c6af7, #4ade80)', borderRadius:'2px', transition:'width 0.5s ease' }} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {tasks.length === 0 ? (
                    <div style={{ textAlign:'center', color:'#5a5a72', padding:'24px', fontFamily:'JetBrains Mono', fontSize:'12px' }}>No tasks yet — add one above ↑</div>
                  ) : tasks.map(task => (
                    <TaskItem key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly mini chart */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px', marginTop:'16px' }}>
              <div style={{ fontSize:'14px', fontWeight:'600', marginBottom:'14px' }}>This Week</div>
              <div style={{ display:'flex', gap:'6px', alignItems:'flex-end', height:'70px' }}>
                {analytics.map((day, i) => {
                  const maxTasks = Math.max(...analytics.map(d => d.total), 1)
                  const h = Math.round((day.total / maxTasks) * 60)
                  const dLabel = new Date(day.date).toLocaleDateString('en-US',{weekday:'short'}).slice(0,1)
                  const isToday = day.date === today()
                  return (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                      <div style={{
                        width:'100%', height:`${Math.max(h,4)}px`, borderRadius:'4px 4px 0 0',
                        background: isToday ? '#7c6af7' : 'rgba(124,106,247,0.25)',
                        border: `1px solid ${isToday ? 'rgba(124,106,247,0.6)' : 'rgba(124,106,247,0.15)'}`,
                        transition:'all 0.3s'
                      }} title={`${day.done}/${day.total} tasks`} />
                      <span style={{ fontSize:'9px', color: isToday ? '#9d8fff' : '#5a5a72', fontFamily:'JetBrains Mono' }}>{dLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {/* Progress Ring */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ fontSize:'12px', color:'#9898b0', marginBottom:'14px', fontWeight:'500' }}>Today's Progress</div>
              <div style={{ position:'relative', width:'110px', height:'110px', marginBottom:'14px' }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9"/>
                  <circle cx="55" cy="55" r="45" fill="none" stroke="url(#rg)" strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={stroke} strokeDashoffset={offset}
                    transform="rotate(-90 55 55)" style={{ transition:'stroke-dashoffset 0.8s ease' }}/>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c6af7"/>
                      <stop offset="100%" stopColor="#4ade80"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:'700', letterSpacing:'-1px', color:'#9d8fff' }}>{pct}%</div>
                  <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>done</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', width:'100%' }}>
                {[{label:'Done',val:done,color:'#4ade80'},{label:'Pending',val:total-done,color:'#fbbf24'}].map(s=>(
                  <div key={s.label} style={{ textAlign:'center', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'10px' }}>
                    <div style={{ fontSize:'18px', fontWeight:'700', color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ fontSize:'13px', fontWeight:'600', marginBottom:'10px' }}>Today's Mood</div>
              <div style={{ display:'flex', justifyContent:'space-around' }}>
                {moods.map((m,i) => (
                  <button key={i} onClick={()=>saveMood(i)} style={{
                    width:'36px', height:'36px', borderRadius:'50%', cursor:'pointer',
                    fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center',
                    background: diary.mood === i ? 'rgba(124,106,247,0.2)' : '#1a1a24',
                    border: `1.5px solid ${diary.mood === i ? '#7c6af7' : 'rgba(255,255,255,0.07)'}`,
                    transform: diary.mood === i ? 'scale(1.15)' : 'scale(1)',
                    transition:'all 0.15s'
                  }} title={moodLabels[i]}>{m}</button>
                ))}
              </div>
              {diary.mood !== null && (
                <div style={{ textAlign:'center', marginTop:'8px', fontSize:'11px', color:'#9898b0', fontFamily:'JetBrains Mono' }}>
                  Feeling: {moodLabels[diary.mood]}
                </div>
              )}
            </div>

            {/* Time tracker */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ fontSize:'13px', fontWeight:'600', marginBottom:'4px' }}>Time Split</div>
              <div style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono', marginBottom:'12px' }}>
                {timelog.productiveHours}h productive · {timelog.wastedHours}h wasted
              </div>
              {[
                { label:'Productive', hours: timelog.productiveHours, max:8, color:'linear-gradient(90deg,#4ade80,#22d3ee)' },
                { label:'Wasted',     hours: timelog.wastedHours,     max:8, color:'linear-gradient(90deg,#f87171,#f472b6)' },
              ].map(bar => (
                <div key={bar.label} style={{ marginBottom:'10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono', marginBottom:'4px' }}>
                    <span>{bar.label}</span><span>{bar.hours}h</span>
                  </div>
                  <div style={{ height:'7px', background:'rgba(255,255,255,0.05)', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.min((bar.hours/bar.max)*100,100)}%`, background:bar.color, borderRadius:'4px', transition:'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Streak */}
            <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2px' }}>
                <div style={{ fontSize:'13px', fontWeight:'600' }}>Streak 🔥</div>
                <div style={{ fontSize:'22px', fontWeight:'700', color:'#fbbf24' }}>{streak}</div>
              </div>
              <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono', marginBottom:'10px' }}>days in a row</div>
              <div style={{ display:'flex', gap:'4px' }}>
                {['M','T','W','T','F','S','S'].map((d,i)=>{
                  const dayData = analytics[i]
                  const isToday = i === new Date().getDay() - 1
                  const isDone  = dayData && dayData.completionRate > 50
                  return (
                    <div key={i} style={{
                      flex:1, height:'26px', borderRadius:'5px', display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'9px', fontFamily:'JetBrains Mono',
                      background: isToday ? 'rgba(124,106,247,0.2)' : isDone ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isToday ? 'rgba(124,106,247,0.4)' : isDone ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      color: isToday ? '#9d8fff' : isDone ? '#4ade80' : '#5a5a72'
                    }}>{d}</div>
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
