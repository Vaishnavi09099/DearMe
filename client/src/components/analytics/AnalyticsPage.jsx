import { useState, useEffect } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const moods = ['😴','😔','😐','🙂','😄']

export default function AnalyticsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/weekly')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const labels     = data.map(d => new Date(d.date+'T00:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }))
  const doneData   = data.map(d => d.done)
  const pendData   = data.map(d => d.pending)
  const rateData   = data.map(d => d.completionRate)
  const focusData  = data.map(d => d.productiveHours)
  const wastedData = data.map(d => d.wastedHours)

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color:'#9898b0', font:{ family:'Space Grotesk', size:12 } } } },
    scales: {
      x: { ticks:{ color:'#5a5a72', font:{family:'JetBrains Mono',size:11} }, grid:{ color:'rgba(255,255,255,0.04)' } },
      y: { ticks:{ color:'#5a5a72', font:{family:'JetBrains Mono',size:11} }, grid:{ color:'rgba(255,255,255,0.04)' } },
    }
  }

  const taskChart = {
    labels,
    datasets: [
      { label:'Completed', data:doneData,  backgroundColor:'rgba(124,106,247,0.7)', borderRadius:6 },
      { label:'Pending',   data:pendData,  backgroundColor:'rgba(251,191,36,0.4)',   borderRadius:6 },
    ]
  }

  const rateChart = {
    labels,
    datasets: [{
      label:'Completion %', data:rateData,
      borderColor:'#7c6af7', backgroundColor:'rgba(124,106,247,0.1)',
      borderWidth:2, pointBackgroundColor:'#7c6af7', pointRadius:4, fill:true, tension:0.4
    }]
  }

  const timeChart = {
    labels,
    datasets: [
      { label:'Productive (h)', data:focusData,  borderColor:'#4ade80', backgroundColor:'rgba(74,222,128,0.1)', borderWidth:2, fill:true, tension:0.4, pointRadius:4 },
      { label:'Wasted (h)',     data:wastedData, borderColor:'#f87171', backgroundColor:'rgba(248,113,113,0.1)', borderWidth:2, fill:true, tension:0.4, pointRadius:4 },
    ]
  }

  const totalDone  = data.reduce((s,d) => s+d.done, 0)
  const totalTasks = data.reduce((s,d) => s+d.total, 0)
  const avgRate    = data.length ? Math.round(data.reduce((s,d)=>s+d.completionRate,0)/data.length) : 0
  const totalFocus = data.reduce((s,d) => s+d.productiveHours, 0).toFixed(1)
  const bestDay    = data.reduce((best,d,i) => d.completionRate > (data[best]?.completionRate||0) ? i : best, 0)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#5a5a72', fontFamily:'JetBrains Mono', fontSize:'13px' }}>
      Loading analytics...
    </div>
  )

  return (
    <div style={{ padding:'28px', animation:'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:'#9d8fff', background:'rgba(124,106,247,0.15)', border:'1px solid rgba(124,106,247,0.25)', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'8px' }}>Analytics</div>
        <div style={{ fontSize:'26px', fontWeight:'700', letterSpacing:'-0.8px' }}>Productivity Insights</div>
        <div style={{ fontSize:'13px', color:'#9898b0', marginTop:'3px' }}>Your last 7 days at a glance</div>
      </div>

      {/* Summary Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px' }}>
        {[
          { label:'Tasks Done',     value:totalDone,  total:totalTasks, color:'#9d8fff' },
          { label:'Avg Completion', value:`${avgRate}%`, color:'#4ade80' },
          { label:'Focus Hours',    value:`${totalFocus}h`, color:'#2dd4bf' },
          { label:'Best Day',       value:data[bestDay] ? new Date(data[bestDay].date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}) : '-', color:'#fbbf24' },
        ].map(s=>(
          <div key={s.label} style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:s.color, borderRadius:'14px 14px 0 0' }}/>
            <div style={{ fontSize:'11px', color:'#5a5a72', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px' }}>{s.label}</div>
            <div style={{ fontSize:'26px', fontWeight:'700', letterSpacing:'-1px', color:s.color }}>{s.value}</div>
            {s.total && <div style={{ fontSize:'11px', color:'#5a5a72', marginTop:'2px' }}>of {s.total} total</div>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px' }}>
          <div style={{ fontSize:'14px', fontWeight:'600', marginBottom:'16px' }}>Tasks Completed vs Pending</div>
          <div style={{ height:'220px' }}><Bar data={taskChart} options={chartOpts}/></div>
        </div>
        <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px' }}>
          <div style={{ fontSize:'14px', fontWeight:'600', marginBottom:'16px' }}>Completion Rate (%)</div>
          <div style={{ height:'220px' }}><Line data={rateChart} options={chartOpts}/></div>
        </div>
      </div>

      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px', marginBottom:'16px' }}>
        <div style={{ fontSize:'14px', fontWeight:'600', marginBottom:'16px' }}>Focus vs Wasted Time (hours)</div>
        <div style={{ height:'200px' }}><Line data={timeChart} options={chartOpts}/></div>
      </div>

      {/* Daily breakdown table */}
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', fontSize:'14px', fontWeight:'600' }}>Daily Breakdown</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                {['Date','Done','Pending','Completion','Focus Hrs','Wasted Hrs','Mood'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:'#5a5a72', fontFamily:'JetBrains Mono', fontSize:'11px', fontWeight:'400', textTransform:'uppercase', letterSpacing:'0.6px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d,i)=>(
                <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'10px 16px', color:'#9898b0', fontFamily:'JetBrains Mono', fontSize:'12px' }}>
                    {new Date(d.date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
                  </td>
                  <td style={{ padding:'10px 16px', color:'#4ade80', fontWeight:'500' }}>{d.done}</td>
                  <td style={{ padding:'10px 16px', color:'#fbbf24', fontWeight:'500' }}>{d.pending}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ flex:1, height:'5px', background:'rgba(255,255,255,0.05)', borderRadius:'3px', overflow:'hidden', maxWidth:'80px' }}>
                        <div style={{ height:'100%', width:`${d.completionRate}%`, background:'linear-gradient(90deg,#7c6af7,#4ade80)', borderRadius:'3px' }}/>
                      </div>
                      <span style={{ color:'#9d8fff', fontSize:'12px', fontFamily:'JetBrains Mono' }}>{d.completionRate}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px', color:'#2dd4bf' }}>{d.productiveHours}h</td>
                  <td style={{ padding:'10px 16px', color:'#f87171' }}>{d.wastedHours}h</td>
                  <td style={{ padding:'10px 16px', fontSize:'18px' }}>{d.mood !== null && d.mood !== undefined ? moods[d.mood] : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
