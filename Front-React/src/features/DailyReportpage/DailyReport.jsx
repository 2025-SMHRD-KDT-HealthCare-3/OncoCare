import React from 'react'
import { useParams } from 'react-router-dom'
import '../public/root.css'
import './DailyReport.css'
import Sidebar from '../public/Sidebar'
import DailyReportBody from './DailyReportBody'
import Footer from '../public/Footer'

const DailyReport = () => {
  const { date } = useParams()

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area main-content">
        <div className="daily-hero">
          <div style={{ maxWidth: '70%', margin: '0 auto' }}>
            <h1 className="daily-hero-title">Daily Report</h1>
            <p className="daily-hero-sub">{date}</p>
          </div>
        </div>
        <DailyReportBody date={date} />
        <Footer />
      </div>
    </div>
  )
}

export default DailyReport
