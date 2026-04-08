import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ReportLoading from '../public/ReportLoading'
import Sidebar from '../public/Sidebar'
import WeeklyReport from './WeeklyReport'
import MonthlyReport from './MonthlyReport'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './Report.css'
import Footer from '../public/Footer'

const toToday  = () => new Date().toISOString().split('T')[0]
const toMonth  = () => new Date().getMonth() + 1

const Report = () => {
  const user_idx = sessionStorage.getItem('user_idx')
  const [searchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get('tab') === 'monthly' ? 'monthly' : 'weekly'
  )
  const [weeklyData, setWeeklyData] = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)
  const [prevMonthlyData, setPrevMonthlyData] = useState(null)
  const [generating, setGenerating] = useState({ weekly: false, monthly: false })
  const timers = useRef({})

  const fetchReports = () => {
    if (!user_idx) return

    axios
      .get(`http://localhost:3000/api/report/weekly?user_idx=${user_idx}`)
      .then((res) => {
        if (res.data && res.data !== '0') return setWeeklyData(res.data)
        const lastWeek = new Date()
        lastWeek.setDate(lastWeek.getDate() - 7)
        return axios
          .get(`http://localhost:3000/api/report/weekly?user_idx=${user_idx}&day=${lastWeek.toISOString().split('T')[0]}`)
          .then((r) => { if (r.data && r.data !== '0') setWeeklyData(r.data) })
      })
      .catch((err) => console.error('주간 리포트 조회 실패:', err))

    const now = new Date()
    const prevYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth()
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`

    axios
      .get(`http://localhost:3000/api/report/monthly?user_idx=${user_idx}`)
      .then((res) => {
        if (res.data && res.data !== '0') return setMonthlyData(res.data)
        return axios
          .get(`http://localhost:3000/api/report/monthly?user_idx=${user_idx}&month=${prevMonthStr}`)
          .then((r) => { if (r.data && r.data !== '0') setMonthlyData(r.data) })
      })
      .catch((err) => console.error('월간 리포트 조회 실패:', err))

    const twoMonthsAgo =
      now.getMonth() <= 1
        ? `${now.getFullYear() - 1}-${String(12 + now.getMonth()).padStart(2, '0')}`
        : `${now.getFullYear()}-${String(now.getMonth() - 1).padStart(2, '0')}`

    axios
      .get(`http://localhost:3000/api/report/monthly?user_idx=${user_idx}&month=${twoMonthsAgo}`)
      .then((res) => { if (res.data && res.data !== '0') setPrevMonthlyData(res.data) })
      .catch((err) => console.error('전월 리포트 조회 실패:', err))
  }

  useEffect(() => {
    fetchReports()
    return () => { clearTimeout(timers.current.weekly); clearTimeout(timers.current.monthly) }
  }, [])

  const handleGenerate = async (type) => {
    if (!user_idx) return
    setGenerating((prev) => ({ ...prev, [type]: true }))

    try {
      const url =
        type === 'weekly'
          ? `http://localhost:8000/generate-weekly-report/${user_idx}?target_date=${toToday()}`
          : `http://localhost:8000/generate-monthly-report/${user_idx}?month=${toMonth()}`

      await axios.post(url)

      clearTimeout(timers.current[type])
      timers.current[type] = setTimeout(() => {
        fetchReports()
        setGenerating((prev) => ({ ...prev, [type]: false }))
      }, 20000)
    } catch (err) {
      console.error('레포트 생성 실패:', err)
      setGenerating((prev) => ({ ...prev, [type]: false }))
    }
  }

  const isGenerating = generating.weekly || generating.monthly
  const generatingMsg = generating.weekly ? '주간 레포트를 생성하고 있습니다...' : '월간 레포트를 생성하고 있습니다...'

  return (
    <>
    {isGenerating && <ReportLoading message={generatingMsg} />}
    <div className="report-page page-layout">
      <Sidebar />
      <div className="page-content-area">
        <div className="report-modern-shell">
          <div className="fr-hero-card">
            <div className="fr-hero-card-body">
              <h1 className="fr-hero-title">회복 리포트</h1>
              <p className="fr-hero-sub">주간과 월간 회복 데이터를 한 화면에서 확인해보세요.</p>
            </div>
            <div className="report-tab-switch">
              <button
                type="button"
                className={`report-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                onClick={() => setActiveTab('weekly')}
              >
                주간
              </button>
              <button
                type="button"
                className={`report-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                onClick={() => setActiveTab('monthly')}
              >
                월간
              </button>
            </div>
          </div>

          <div className="report-tab-panel">
            {activeTab === 'weekly' && (
              <>
                <div className="report-generate-bar">
                  <button
                    type="button"
                    className="report-generate-btn"
                    onClick={() => handleGenerate('weekly')}
                    disabled={generating.weekly}
                  >
                    <span>📊</span>
                    {generating.weekly ? '생성 요청 중...' : '주간 레포트 생성'}
                  </button>
                </div>
                <WeeklyReport data={weeklyData} />
              </>
            )}
            {activeTab === 'monthly' && (
              <>
                <div className="report-generate-bar">
                  <button
                    type="button"
                    className="report-generate-btn"
                    onClick={() => handleGenerate('monthly')}
                    disabled={generating.monthly}
                  >
                    <span>📈</span>
                    {generating.monthly ? '생성 요청 중...' : '월간 레포트 생성'}
                  </button>
                </div>
                <MonthlyReport data={monthlyData} prevData={prevMonthlyData} />
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
    </>
  )
}

export default Report
