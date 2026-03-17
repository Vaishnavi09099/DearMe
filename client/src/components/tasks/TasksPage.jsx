import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import api from '../../services/api'
import TaskItem from './TaskItem'

const today = () => new Date().toISOString().split('T')[0]

export default function TasksPage() {
  const [tasks,    setTasks]    = useState([])
  const [text,     setText]     = useState('')
  const [tag,      setTag]      = useState('study')
  const [priority, setPriority] = useState('med')
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)
  const [date,     setDate]     = useState(today())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/tasks?date=${date}`)
        setTasks(data)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [date])

  const addTask = async () => {
    if (!text.trim()) return
    const { data } = await api.post('/tasks', { text, tag, priority, date })
    setTasks(prev => [data, ...prev])
    setText('')
  }

  const toggleTask = async (id, done) => {
    const { data } = await api.put(`/tasks/${id}`, { done: !done })
    setTasks(prev => prev.map(t => t._id === id ? data : t))
  }

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  const filtered = filter === 'all' ? tasks : filter === 'done' ? tasks.filter(t=>t.done) : tasks.filter(t=>!t.done)
  const done  = tasks.filter(t=>t.done).length
  const total = tasks.length
  const pct   = total > 0 ? Math.round((done/total)*100) : 0

  return (
    <div style={{ padding:'28px', animation:'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:'#9d8fff', background:'rgba(124,106,247,0.15)', border:'1px solid rgba(124,106,247,0.25)', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'8px' }}>Task Manager</div>
        <div style={{ fontSize:'26px', fontWeight:'700', letterSpacing:'-0.8px' }}>My Tasks</div>
        <div style={{ fontSize:'13px', color:'#9898b0', marginTop:'3px' }}>Manage, prioritize and track your work</div>
      </div>

      {/* Add Task Card */}
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px', marginBottom:'16px' }}>
        <div style={{ fontSize:'13px', fontWeight:'600', marginBottom:'14px', color:'#9898b0' }}>Add New Task</div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <input
            className="input-dark" placeholder="What do you need to do?"
            value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addTask()}
            style={{ flex:'1', minWidth:'200px' }}
          />
          <select className="input-dark" value={tag} onChange={e=>setTag(e.target.value)} style={{ maxWidth:'110px', cursor:'pointer' }}>
            {['study','project','personal','exam','other'].map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input-dark" value={priority} onChange={e=>setPriority(e.target.value)} style={{ maxWidth:'100px', cursor:'pointer' }}>
            <option value="high">🔴 High</option>
            <option value="med">🟡 Med</option>
            <option value="low">🟢 Low</option>
          </select>
          <input type="date" className="input-dark" value={date} onChange={e=>setDate(e.target.value)} style={{ maxWidth:'150px' }} />
          <button className="btn-primary" onClick={addTask} style={{ display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap' }}>
            <Plus size={16}/> Add Task
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'16px' }}>
        {[
          { label:'Total',   value:total,       color:'#9d8fff' },
          { label:'Done',    value:done,         color:'#4ade80' },
          { label:'Pending', value:total-done,   color:'#fbbf24' },
        ].map(s=>(
          <div key={s.label} style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 18px' }}>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px' }}>{s.label}</div>
            <div style={{ fontSize:'24px', fontWeight:'700', color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'14px 20px', marginBottom:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#9898b0', marginBottom:'8px' }}>
          <span>Completion Rate</span><span style={{ color:'#7c6af7', fontWeight:'600' }}>{pct}%</span>
        </div>
        <div style={{ height:'6px', background:'rgba(255,255,255,0.05)', borderRadius:'3px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#7c6af7,#4ade80)', borderRadius:'3px', transition:'width 0.6s ease' }} />
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'14px' }}>
        {['all','pending','done'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:'5px 14px', borderRadius:'20px', fontSize:'11px', fontWeight:'500', cursor:'pointer',
            fontFamily:'JetBrains Mono', border:'1px solid transparent',
            background: filter===f ? 'rgba(124,106,247,0.15)' : '#1a1a24',
            color:      filter===f ? '#9d8fff' : '#5a5a72',
            borderColor:filter===f ? 'rgba(124,106,247,0.3)' : 'rgba(255,255,255,0.07)',
            transition:'all 0.15s'
          }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
        ))}
        <span style={{ marginLeft:'auto', fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono', alignSelf:'center' }}>{filtered.length} shown</span>
      </div>

      {/* Task list */}
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'#5a5a72', padding:'24px', fontFamily:'JetBrains Mono', fontSize:'13px' }}>Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', color:'#5a5a72', padding:'32px', fontFamily:'JetBrains Mono', fontSize:'12px' }}>
            {filter === 'done' ? '🎯 No completed tasks yet' : '✅ Nothing pending here'}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {filtered.map(t => <TaskItem key={t._id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
          </div>
        )}
      </div>
    </div>
  )
}
