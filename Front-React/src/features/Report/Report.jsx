import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../public/Sidebar'
import WeeklyReport from './WeeklyReport'
import MonthlyReport from './MonthlyReport'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './Report.css'
import Footer from '../public/Footer'

const Report = () => {
  const user_idx = sessionStorage.getItem('user_idx')

  const [activeTab, setActiveTab] = useState('weekly')
  const [weeklyData, setWeeklyData] = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)
  const [prevMonthlyData, setPrevMonthlyData] = useState(null)

  useEffect(() => {
    if (!user_idx) return

    axios
      .get(`http://localhost:3000/api/report/weekly?user_idx=${user_idx}`)
      .then((res) => {
        if (res.data && res.data !== '0') {
          setWeeklyData(res.data)
        } else {
          const lastWeek = new Date()
          lastWeek.setDate(lastWeek.getDate() - 7)
          const lastWeekStr = lastWeek.toISOString().split('T')[0]
          return axios.get(
            `http://localhost:3000/api/report/weekly?user_idx=${user_idx}&day=${lastWeekStr}`
          )
        }
      })
      .then((res) => {
        if (res && res.data && res.data !== '0') setWeeklyData(res.data)
      })
      .catch((err) => console.error('주간 리포트 조회 실패:', err))

    const now = new Date()
    const prevYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth()
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`

    axios
      .get(`http://localhost:3000/api/report/monthly?user_idx=${user_idx}`)
      .then((res) => {
        if (res.data && res.data !== '0') {
          setMonthlyData(res.data)
        } else {
          return axios.get(
            `http://localhost:3000/api/report/monthly?user_idx=${user_idx}&month=${prevMonthStr}`
          )
        }
      })
      .then((res) => {
        if (res && res.data && res.data !== '0') setMonthlyData(res.data)
      })
      .catch((err) => console.error('월간 리포트 조회 실패:', err))

    const twoMonthsAgo =
      now.getMonth() <= 1
        ? `${now.getFullYear() - 1}-${String(12 + now.getMonth()).padStart(2, '0')}`
        : `${now.getFullYear()}-${String(now.getMonth() - 1).padStart(2, '0')}`

    axios
      .get(
        `http://localhost:3000/api/report/monthly?user_idx=${user_idx}&month=${twoMonthsAgo}`
      )
      .then((res) => {
        if (res.data && res.data !== '0') setPrevMonthlyData(res.data)
      })
      .catch((err) => console.error('전월 리포트 조회 실패:', err))
  }, [user_idx])

  return (
    <div className="report-page page-layout">
      <Sidebar />
      <div className="page-content-area">
        <div className="report-modern-shell">
          <div className="fr-hero-card">
            <div className="fr-hero-card-body">
              <h1 className="fr-hero-title">Recovery Reports</h1>
              <p className="fr-hero-sub">주간과 월간 회복 데이터를 한 화면에서 확인해보세요.</p>
            </div>
            <div className="report-tab-switch">
              <button
                type="button"
                className={`report-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                onClick={() => setActiveTab('weekly')}
              >
                Weekly
              </button>
              <button
                type="button"
                className={`report-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                onClick={() => setActiveTab('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="report-tab-panel">
            {activeTab === 'weekly' ? (
              <WeeklyReport data={weeklyData} />
            ) : (
              <MonthlyReport data={monthlyData} prevData={prevMonthlyData} />
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default Report