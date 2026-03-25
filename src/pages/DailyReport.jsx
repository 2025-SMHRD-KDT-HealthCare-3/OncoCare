import React from 'react'
import { useParams } from 'react-router-dom'
import '../css/root.css'
import MainHeader from '../components/MainHeader'
import DailyReportBody from '../components/DailyReportBody'

const DailyReport = () => {

  const { date } = useParams()  // URL에서 날짜 받아옴

  return (
    <div className="main-content">
      <MainHeader></MainHeader>
      <h1>{date} 리포트</h1>
      <DailyReportBody></DailyReportBody>
    </div>
  )
}

export default DailyReport