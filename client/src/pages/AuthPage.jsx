import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode }) {
  const [form, setForm]     = useState({ name:'', email:'', password:'', branch:'', semester:1 })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate            = useNavigate()
  const isLogin             = mode === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password, form.branch, form.semester)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Space Grotesk, sans-serif', padding: '20px'
    }}>
      {/* Background blobs */}
      <div style={{
        position:'fixed', top:'-20%', right:'-10%',
        width:'500px', height:'500px', borderRadius:'50%',
        background: 'radial-gradient(circle, rgba(124,106,247,0.08) 0%, transparent 70%)',
        pointerEvents:'none'
      }} />
      <div style={{
        position:'fixed', bottom:'-20%', left:'-10%',
        width:'400px', height:'400px', borderRadius:'50%',
        background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 70%)',
        pointerEvents:'none'
      }} />

      <div style={{
        width: '100%', maxWidth: '420px',
        background: '#111118', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '40px',
        animation: 'fadeIn 0.4s ease'
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{
            width:'52px', height:'52px', borderRadius:'14px', margin:'0 auto 12px',
            background: 'linear-gradient(135deg, #7c6af7, #9d8fff)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'
          }}>📓</div>
          <div style={{ fontSize:'22px', fontWeight:'700', letterSpacing:'-0.5px' }}>DiaryProd</div>
          <div style={{ fontSize:'12px', color:'#5a5a72', fontFamily:'JetBrains Mono', marginTop:'4px' }}>
            {isLogin ? 'Welcome back, scholar 👋' : 'Start your productivity journey'}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)',
            borderRadius:'8px', padding:'10px 14px', color:'#f87171',
            fontSize:'13px', marginBottom:'20px'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'12px', color:'#9898b0', display:'block', marginBottom:'6px', fontFamily:'JetBrains Mono' }}>Full Name</label>
              <input
                className="input-dark" placeholder="Arjun Kumar"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                required={!isLogin}
              />
            </div>
          )}

          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', color:'#9898b0', display:'block', marginBottom:'6px', fontFamily:'JetBrains Mono' }}>Email</label>
            <input
              className="input-dark" type="email" placeholder="you@college.edu"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>

          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', color:'#9898b0', display:'block', marginBottom:'6px', fontFamily:'JetBrains Mono' }}>Password</label>
            <input
              className="input-dark" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>

          {!isLogin && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#9898b0', display:'block', marginBottom:'6px', fontFamily:'JetBrains Mono' }}>Branch</label>
                <select
                  className="input-dark"
                  value={form.branch} onChange={e => setForm({...form, branch: e.target.value})}
                  style={{ cursor:'pointer' }}
                >
                  <option value="">Select</option>
                  {['CSE','ECE','ME','CE','EE','IT','AIDS','AIML'].map(b =>
                    <option key={b} value={b}>{b}</option>
                  )}
                </select>
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#9898b0', display:'block', marginBottom:'6px', fontFamily:'JetBrains Mono' }}>Semester</label>
                <select
                  className="input-dark"
                  value={form.semester} onChange={e => setForm({...form, semester: Number(e.target.value)})}
                  style={{ cursor:'pointer' }}
                >
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit" className="btn-primary"
            style={{ width:'100%', marginTop:'8px', padding:'12px', fontSize:'15px' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'24px', fontSize:'13px', color:'#9898b0' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login'}
            style={{ color:'#9d8fff', textDecoration:'none', fontWeight:'500' }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Link>
        </div>
      </div>
    </div>
  )
}
