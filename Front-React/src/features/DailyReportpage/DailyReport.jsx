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
  return d.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const DailyReport = () => {
  const { date } = useParams()
  const navigate = useNavigate()

  return (
    <div className="page-layout daily-log-page">
      <Sidebar />
      <div className="page-content-area">
        <div className="daily-log-hero-wrap">
          <div className="fr-hero-card">
            <div className="fr-hero-card-body">
              <h1 className="fr-hero-title">일일 건강 기록</h1>
              <p className="fr-hero-sub">{formatDisplayDate(date)}</p>
            </div>
          </div>
        </div>
        <DailyReportBody date={date} />
        <div className="dr-action-bar">
          <button className="dr-btn-discard" onClick={() => navigate(-1)}>
            취소
          </button>
          <button className="dr-btn-complete" onClick={() => navigate('/Main')}>
            기록 저장 ✓
          </button>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default DailyReport
