import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, CheckSquare, BookOpen, BarChart2, Clock, Target, LogOut } from 'lucide-react'

const navItems = [
  { path: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/tasks',     label: 'Tasks',      icon: CheckSquare },
  { path: '/diary',     label: 'Diary',      icon: BookOpen },
  { path: '/analytics', label: 'Analytics',  icon: BarChart2 },
  { path: '/timer',     label: 'Time Tracker', icon: Clock },
  { path: '/goals',     label: 'Goals',      icon: Target },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: '#111118',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0', minHeight: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'32px', height:'32px', borderRadius:'10px',
            background:'linear-gradient(135deg,#7c6af7,#9d8fff)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px'
          }}>:)</div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:'600', letterSpacing:'-0.3px' }}>DearMe</div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono', marginTop:'1px' }}>B.Tech Edition</div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ padding:'0 12px', flex:1 }}>
        <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono', letterSpacing:'1px', textTransform:'uppercase', padding:'0 8px 8px' }}>Main</div>
        {navItems.slice(0,4).map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path} style={{ textDecoration:'none' }}>
              <div style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'9px 10px', borderRadius:'8px', marginBottom:'2px',
                fontSize:'13px', fontWeight: active ? '500' : '400',
                color: active ? '#9d8fff' : '#9898b0',
                background: active ? 'rgba(124,106,247,0.15)' : 'transparent',
                border: `1px solid ${active ? 'rgba(124,106,247,0.25)' : 'transparent'}`,
                transition:'all 0.15s', cursor:'pointer',
              }}>
                <Icon size={15} opacity={0.8} />
                {label}
              </div>
            </Link>
          )
        })}

        <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono', letterSpacing:'1px', textTransform:'uppercase', padding:'12px 8px 8px' }}>Tools</div>
        {navItems.slice(4).map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path} style={{ textDecoration:'none' }}>
              <div style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'9px 10px', borderRadius:'8px', marginBottom:'2px',
                fontSize:'13px', fontWeight: active ? '500' : '400',
                color: active ? '#9d8fff' : '#9898b0',
                background: active ? 'rgba(124,106,247,0.15)' : 'transparent',
                border: `1px solid ${active ? 'rgba(124,106,247,0.25)' : 'transparent'}`,
                transition:'all 0.15s', cursor:'pointer',
              }}>
                <Icon size={15} opacity={0.8} />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div style={{ padding:'16px 12px 0', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:'10px',
          padding:'10px', borderRadius:'8px', background:'#1a1a24', cursor:'pointer'
        }}>
          <div style={{
            width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,#7c6af7,#f472b6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'12px', fontWeight:'600'
          }}>{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'12px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize:'10px', color:'#5a5a72', fontFamily:'JetBrains Mono' }}>{user?.branch || 'B.Tech'} · Sem {user?.semester || '?'}</div>
          </div>
          <LogOut size={14} color="#5a5a72" style={{ cursor:'pointer', flexShrink:0 }} onClick={logout} />
        </div>
      </div>
    </aside>
  )
}
