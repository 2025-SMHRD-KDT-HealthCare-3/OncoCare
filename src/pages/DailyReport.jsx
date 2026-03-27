import React from 'react'
import { useParams } from 'react-router-dom'
import '../css/root.css'
import '../css/DailyReport.css'
import MainHeader from '../components/MainHeader'
import DailyReportBody from '../components/DailyReportBody'

const DailyReport = () => {

  const { date } = useParams()  // URL에서 날짜 받아옴

  return (
    <div className="page-layout main-content">
      <MainHeader></MainHeader>
      <div className="daily-hero">
        <div style={{ maxWidth: '70%', margin: '0 auto' }}>
          <h1 className="daily-hero-title">Daily Report</h1>
          <p className="daily-hero-sub">{date}</p>
        </div>
      </div>
      <DailyReportBody></DailyReportBody>
    </div>
  )
}

export default DailyReport