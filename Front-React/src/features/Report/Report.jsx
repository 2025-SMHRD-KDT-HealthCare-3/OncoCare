import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import MainHeader from '../public/MainHeader'
import WeeklyReport from './WeeklyReport'
import MonthlyReport from './MonthlyReport'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './Report.css'
import Footer from '../public/Footer'

const Report = () => {
  const location = useLocation()
  const user_idx = sessionStorage.getItem('user_idx')

  const [weeklyData, setWeeklyData] = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)
  const [prevMonthlyData, setPrevMonthlyData] = useState(null)

  useEffect(() => {
    if (!user_idx) return

    // 주간 리포트: 이번 주 없으면 지난 주로 재시도
    axios.get(`http://localhost:3000/api/report/weekly?user_idx=${user_idx}`)
      .then(res => {
        if (res.data && res.data !== '0') {
          setWeeklyData(res.data)
        } else {
          const lastWeek = new Date()
          lastWeek.setDate(lastWeek.getDate() - 7)
          const lastWeekStr = lastWeek.toISOString().split('T')[0]
          return axios.get(`http://localhost:3000/api/report/weekly?user_idx=${user_idx}&day=${lastWeekStr}`)
        }
      })
      .then(res => { if (res && res.data && res.data !== '0') setWeeklyData(res.data) })
      .catch(err => console.error('주간 리포트 조회 실패:', err))

    // 이번 달 월간 리포트: 없으면 지난 달로 재시도
    const now = new Date()
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth()
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`

    axios.get(`http://localhost:3000/api/report/monthly?user_idx=${user_idx}`)
      .then(res => {
        if (res.data && res.data !== '0') {
          setMonthlyData(res.data)
        } else {
          return axios.get(`http://localhost:3000/api/report/monthly?user_idx=${user_idx}&month=${prevMonthStr}`)
        }
      })
      .then(res => { if (res && res.data && res.data !== '0') setMonthlyData(res.data) })
      .catch(err => console.error('월간 리포트 조회 실패:', err))

    // 지난 달 월간 리포트 (전월 비교용)
    const twoMonthsAgo = now.getMonth() <= 1
      ? `${now.getFullYear() - 1}-${String(12 + now.getMonth()).padStart(2, '0')}`
      : `${now.getFullYear()}-${String(now.getMonth() - 1).padStart(2, '0')}`
    axios.get(`http://localhost:3000/api/report/monthly?user_idx=${user_idx}&month=${twoMonthsAgo}`)
      .then(res => { if (res.data && res.data !== '0') setPrevMonthlyData(res.data) })
      .catch(err => console.error('전월 리포트 조회 실패:', err))
  }, [])

  useEffect(() => {
    const contentEl = document.getElementById('report-content')
    if (contentEl && window.bootstrap) {
      const spy = new window.bootstrap.ScrollSpy(contentEl, {
        target: '#report-nav',
        rootMargin: '0px 0px -60%',
      })
      return () => spy.dispose()
    }
  }, [])

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (!hash) return
    const contentEl = document.getElementById('report-content')
    const targetEl = document.getElementById(hash)
    if (contentEl && targetEl) {
      contentEl.scrollTo({ top: targetEl.offsetTop, behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <div className="report-page page-layout">
      <MainHeader />
      <div className="report-layout">

        {/* 왼쪽 사이드바 네비 */}
        <nav id="report-nav" className="report-sidebar">
          <p className="report-nav-label">리포트</p>
          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link" href="#weekly">주간 리포트</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#monthly">월간 리포트</a>
            </li>
          </ul>
        </nav>

        {/* 오른쪽 스크롤 컨텐츠 */}
        <div
          id="report-content"
          className="report-content"
          data-bs-spy="scroll"
          data-bs-target="#report-nav"
          tabIndex="0"
        >
          <section id="weekly">
            <WeeklyReport data={weeklyData} />
          </section>
          <section id="monthly">
            <MonthlyReport data={monthlyData} prevData={prevMonthlyData} />
          </section>
          <Footer />
        </div>

      </div>
    </div>
  )
}

export default Report
