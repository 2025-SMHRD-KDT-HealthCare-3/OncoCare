import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import MainHeader from '../public/MainHeader'
import WeeklyReport from './WeeklyReport'
import MonthlyReport from './MonthlyReport'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './Report.css'
import Footer from '../public/Footer'


const Report = () => {
  const location = useLocation()

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

  // URL 해시(#monthly 등)에 맞춰 해당 섹션으로 스크롤
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
            <WeeklyReport />
          </section>
          <section id="monthly">
            <MonthlyReport />
          </section>
          <Footer />
        </div>

      </div>
    </div>
  )
}

export default Report
