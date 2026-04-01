import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../public/root.css'
import './DailyReport.css'
import Sidebar from '../public/Sidebar'
import DailyReportBody from './DailyReportBody'
import Footer from '../public/Footer'

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const DailyReport = () => {
  const { date } = useParams()
  const navigate = useNavigate()

  return (
    <div className="page-layout daily-log-page">
      <Sidebar />
      <div className="page-content-area">
        <div className="daily-log-header">
          <h1 className="daily-log-title">Daily Health Log</h1>
          <p className="daily-log-date">{formatDisplayDate(date)}</p>
        </div>
        <DailyReportBody date={date} />
        <div className="dr-action-bar">
          <button className="dr-btn-discard" onClick={() => navigate(-1)}>
            Discard Draft
          </button>
          <button className="dr-btn-complete" onClick={() => navigate('/Main')}>
            Complete Log ✓
          </button>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default DailyReport
