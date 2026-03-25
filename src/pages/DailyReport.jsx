import React from 'react'
import { useParams } from 'react-router-dom'
import '../css/root.css'
import MainHeader from '../components/MainHeader'

const DailyReport = () => {

  const { date } = useParams()  // URL에서 날짜 받아옴

  return (
    <div className="main-content">
      <MainHeader></MainHeader>
      <h2>{date} 리포트</h2>
    </div>
  )
}

export default DailyReport