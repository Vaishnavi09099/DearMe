import { useState, useEffect } from 'react'
import { Plus, Loader2, Search } from 'lucide-react'
import api from '../../services/api'
import TaskItem from './TaskItem'

const today = () => new Date().toISOString().split('T')[0]

export default function TasksPage() {
  const [tasks,    setTasks]    = useState([])
  const [text,     setText]     = useState('')
  const [tag,      setTag]      = useState('study')
  const [priority, setPriority] = useState('med')
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [addError, setAddError] = useState('')
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
    if (!text.trim()) {
      setAddError('Please write a task!')
      setTimeout(() => setAddError(''), 2000)
      return
    }
    setAdding(true)
    setAddError('')
    try {
      const { data } = await api.post('/tasks', { text: text.trim(), tag, priority, date })
      setTasks(prev => [data, ...prev])
      setText('')
    } catch(e) {
      console.error(e)
      setAddError('Failed to add. Try again!')
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

  const filtered = tasks
    .filter(t => filter === 'all' ? true : filter === 'done' ? t.done : !t.done)
    .filter(t => search ? t.text.toLowerCase().includes(search.toLowerCase()) : true)

  const done  = tasks.filter(t => t.done).length
  const total = tasks.length
  const pct   = total > 0 ? Math.round((done/total)*100) : 0

  return (
    <div style={{ padding:'28px', animation:'fadeIn 0.3s ease' }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Page Header */}
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:'#9d8fff', background:'rgba(124,106,247,0.15)', border:'1px solid rgba(124,106,247,0.25)', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'8px' }}>Task Manager</div>
        <div style={{ fontSize:'26px', fontWeight:'700', letterSpacing:'-0.8px' }}>My Tasks 📋</div>
        <div style={{ fontSize:'13px', color:'#9898b0', marginTop:'3px' }}>Manage, prioritize and track your work</div>
      </div>

      {/* Add Task Card */}
      <div style={{ background:'#111118', border:'1px solid rgba(124,106,247,0.3)', borderRadius:'16px', padding:'20px', marginBottom:'16px', boxShadow:'0 0 30px rgba(124,106,247,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
          <span style={{ fontSize:'16px' }}>⚡</span>
          <span style={{ fontSize:'14px', fontWeight:'600' }}>Add New Task</span>
        </div>

        <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
          <input
            className="input-dark"
            placeholder="What needs to be done?"
            value={text}
            onChange={e => { setText(e.target.value); setAddError('') }}
            onKeyDown={e => e.key === 'Enter' && !adding && addTask()}
            style={{ flex:'1', minWidth:'200px' }}
            disabled={adding}
          />
          <input
            type="date"
            className="input-dark"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ maxWidth:'160px' }}
          />
          <button onClick={addTask} disabled={adding} style={{
            background: adding ? '#3a3a4a':'linear-gradient(135deg,#7c6af7,#9d8fff)',
            color:'white', border:'none', borderRadius:'10px', padding:'10px 20px',
            fontFamily:'Space Grotesk', fontSize:'14px', fontWeight:'600',
            cursor: adding ? 'not-allowed':'pointer',
            display:'flex', alignItems:'center', gap:'6px',
            transition:'all 0.2s', whiteSpace:'nowrap', minWidth:'120px', justifyContent:'center'
          }}>
            {adding
              ? <><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> Adding...</>
              : <><Plus size={15}/> Add Task</>}
          </button>
        </div>

        <div style={{ display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>Tag:</span>
          {['study','project','personal','exam','other'].map(t => (
            <button key={t} onClick={() => setTag(t)} style={{
              padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'500',
              cursor:'pointer', border:'1px solid transparent', fontFamily:'JetBrains Mono',
              background: tag===t ? 'rgba(124,106,247,0.2)':'#1a1a24',
              color:      tag===t ? '#9d8fff':'#5a5a72',
              borderColor:tag===t ? 'rgba(124,106,247,0.4)':'rgba(255,255,255,0.07)',
              transition:'all 0.15s'
            }}>{t}</button>
          ))}
          <span style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono', marginLeft:'8px' }}>Priority:</span>
          {[['high','🔴 High'],['med','🟡 Med'],['low','🟢 Low']].map(([p,label]) => (
            <button key={p} onClick={() => setPriority(p)} style={{
              padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'500',
              cursor:'pointer', border:'1px solid transparent', fontFamily:'JetBrains Mono',
              background: priority===p ? 'rgba(124,106,247,0.2)':'#1a1a24',
              color:      priority===p ? '#9d8fff':'#5a5a72',
              borderColor:priority===p ? 'rgba(124,106,247,0.4)':'rgba(255,255,255,0.07)',
              transition:'all 0.15s'
            }}>{label}</button>
          ))}
        </div>

        {addError && (
          <div style={{ marginTop:'10px', padding:'8px 12px', borderRadius:'8px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', color:'#f87171', fontSize:'12px', fontFamily:'JetBrains Mono' }}>
            ⚠️ {addError}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
        {[
          { label:'Total',   value:total,      color:'#9d8fff' },
          { label:'Done',    value:done,        color:'#4ade80' },
          { label:'Pending', value:total-done,  color:'#fbbf24' },
          { label:'Rate',    value:`${pct}%`,   color:'#2dd4bf' },
        ].map(s=>(
          <div key={s.label} style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 18px', transition:'transform 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px' }}>{s.label}</div>
            <div style={{ fontSize:'24px', fontWeight:'700', color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 20px', marginBottom:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#9898b0', marginBottom:'8px' }}>
          <span>Completion Rate</span>
          <span style={{ color: pct===100 ? '#4ade80':'#7c6af7', fontWeight:'600' }}>{pct}% {pct===100 ? '🎉':''}</span>
        </div>
        <div style={{ height:'8px', background:'rgba(255,255,255,0.05)', borderRadius:'4px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background: pct===100 ? 'linear-gradient(90deg,#4ade80,#22d3ee)':'linear-gradient(90deg,#7c6af7,#9d8fff)', borderRadius:'4px', transition:'width 0.6s ease' }}/>
        </div>
      </div>

      {/* Filter + Search */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'14px', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:'6px' }}>
          {['all','pending','done'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:'6px 16px', borderRadius:'20px', fontSize:'12px', fontWeight:'500',
              cursor:'pointer', fontFamily:'JetBrains Mono', border:'1px solid transparent',
              background: filter===f ? 'rgba(124,106,247,0.15)':'#1a1a24',
              color:      filter===f ? '#9d8fff':'#5a5a72',
              borderColor:filter===f ? 'rgba(124,106,247,0.3)':'rgba(255,255,255,0.07)',
              transition:'all 0.15s'
            }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
        <div style={{ flex:1, position:'relative', minWidth:'160px' }}>
          <Search size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#5a5a72' }}/>
          <input
            className="input-dark"
            placeholder="Search tasks..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            style={{ paddingLeft:'34px', fontSize:'13px' }}
          />
        </div>
        <span style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>{filtered.length} shown</span>
      </div>

      {/* Task List */}
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'16px' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'#5a5a72', padding:'32px', fontFamily:'JetBrains Mono', fontSize:'13px' }}>
            <Loader2 size={24} style={{ animation:'spin 1s linear infinite', margin:'0 auto 8px', display:'block' }}/>
            Loading tasks...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', color:'#5a5a72', padding:'40px', fontFamily:'JetBrains Mono', fontSize:'12px', lineHeight:'2' }}>
            <div style={{ fontSize:'36px', marginBottom:'8px' }}>
              {filter==='done' ? '🎯' : search ? '🔍' : '✨'}
            </div>
            {filter==='done' ? 'No completed tasks yet' : search ? `No tasks matching "${search}"` : 'No tasks here — add one above!'}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
            {filtered.map(t => <TaskItem key={t._id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
          </div>
        )}
      </div>
    </div>
  )
}
