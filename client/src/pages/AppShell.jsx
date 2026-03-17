import { Routes, Route } from 'react-router-dom'
import Sidebar       from '../components/layout/Sidebar'
import Dashboard     from '../components/dashboard/Dashboard'
import TasksPage     from '../components/tasks/TasksPage'
import DiaryPage     from '../components/diary/DiaryPage'
import AnalyticsPage from '../components/analytics/AnalyticsPage'

export default function AppShell() {
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#0a0a0f' }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/tasks"     element={<TasksPage />} />
          <Route path="/diary"     element={<DiaryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*"          element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
