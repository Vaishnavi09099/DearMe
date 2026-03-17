import { useState } from 'react'
import { Trash2, Check } from 'lucide-react'

const priorityColors = { high:'#f87171', med:'#fbbf24', low:'#4ade80' }

export default function TaskItem({ task, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'flex', alignItems:'center', gap:'12px',
        padding:'11px 13px', borderRadius:'10px',
        background: hovered ? '#22222e' : '#1a1a24',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        transition:'all 0.15s', opacity: task.done ? 0.6 : 1,
        animation:'fadeIn 0.2s ease'
      }}
    >
      {/* Checkbox */}
      <div
        onClick={() => onToggle(task._id, task.done)}
        style={{
          width:'18px', height:'18px', borderRadius:'5px', flexShrink:0, cursor:'pointer',
          background: task.done ? '#7c6af7' : 'transparent',
          border: `1.5px solid ${task.done ? '#7c6af7' : 'rgba(255,255,255,0.2)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.2s'
        }}
      >
        {task.done && <Check size={10} color="white" />}
      </div>

      {/* Text */}
      <span style={{
        flex:1, fontSize:'13px', lineHeight:'1.4',
        textDecoration: task.done ? 'line-through' : 'none',
        color: task.done ? '#5a5a72' : '#e8e8f0'
      }}>{task.text}</span>

      {/* Meta */}
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <span className={`tag tag-${task.tag || 'other'}`}>{task.tag}</span>
        <div style={{
          width:'6px', height:'6px', borderRadius:'50%', flexShrink:0,
          background: priorityColors[task.priority] || '#5a5a72'
        }} title={`${task.priority} priority`} />
        {hovered && (
          <Trash2
            size={14} color="#f87171" style={{ cursor:'pointer', flexShrink:0 }}
            onClick={() => onDelete(task._id)}
          />
        )}
      </div>
    </div>
  )
}
