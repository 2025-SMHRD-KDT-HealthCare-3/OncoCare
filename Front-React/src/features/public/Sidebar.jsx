import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import './Sidebar.css'
import icon from '../../assets/oncocare_icon.png'
import avater from '../../assets/avater.jpg'

const toToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [userName, setUserName] = useState('')
  const [lowStockItems, setLowStockItems] = useState([])
  const [notifVisible, setNotifVisible] = useState(true)
  const [notifExpanded, setNotifExpanded] = useState(false)
  const [dbAlerts, setDbAlerts] = useState([])
  const [dbAlertExpanded, setDbAlertExpanded] = useState(false)

  const fetchDbAlerts = () => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return
    axios.get(`http://localhost:3000/api/alert?user_idx=${user_idx}`)
      .then(res => { if (Array.isArray(res.data)) setDbAlerts(res.data) })
      .catch(() => {})
  }

  useEffect(() => {
    const storedName = sessionStorage.getItem('user_name')
    if (storedName) setUserName(storedName)

    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return
    axios.get(`http://localhost:3000/api/ingredient?user_idx=${user_idx}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setLowStockItems(res.data.filter(i => Number(i.cnt) <= 1))
        }
      })
      .catch(() => {})

    fetchDbAlerts()
  }, [])

  const handleAlertRead = () => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return
    axios.post('http://localhost:3000/api/alert/read', { user_idx })
      .then(() => setDbAlerts([]))
      .catch(() => {})
  }

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <aside className="main-sidebar">
      <div className="sidebar-top">
        <Link to="/Main" className="sidebar-brand">
          <img src={icon} alt="OncoCare logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <strong>OncoCare</strong>
            <span>Recovery Sanctuary</span>
          </div>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <Link to="/Main" className={`sidebar-link ${isActive('/Main') ? 'active' : ''}`}>
          <span className="sidebar-icon">🏠</span>
          <span>홈</span>
        </Link>

        <Link to="/Fridge" className={`sidebar-link ${isActive('/Fridge') ? 'active' : ''}`}>
          <span className="sidebar-icon">🧊</span>
          <span>내 냉장고</span>
        </Link>

        <Link to="/Report" className={`sidebar-link ${isActive('/Report') ? 'active' : ''}`}>
          <span className="sidebar-icon">📊</span>
          <span>리포트</span>
        </Link>

        <Link to="/MyPage" className={`sidebar-link ${isActive('/MyPage') ? 'active' : ''}`}>
          <span className="sidebar-icon">⚙️</span>
          <span>마이 페이지</span>
        </Link>
      </nav>

      <div className="sidebar-bottom">
        {/* ── 알림 카드 ── */}
        {notifVisible && lowStockItems.length > 0 && (
          <div className="sidebar-notif-card">
            <div className="sidebar-notif-header">
              <div className="sidebar-notif-title-row">
                <span className="sidebar-notif-icon">🌿</span>
                <span className="sidebar-notif-title">OncoCare</span>
              </div>
              <button className="sidebar-notif-close" onClick={() => setNotifVisible(false)}>✕</button>
            </div>
            <p className="sidebar-notif-summary">
              재고가 부족한 식재료가 <strong>{lowStockItems.length}개</strong> 있습니다.
            </p>
            {notifExpanded && (
              <ul className="sidebar-notif-list">
                {lowStockItems.map((item) => (
                  <li key={item.ingre_idx}>
                    {item.ingre_name}
                    <span className={Number(item.cnt) === 0 ? 'notif-badge-empty' : 'notif-badge-low'}>
                      {Number(item.cnt) === 0 ? '재고 없음' : `${item.cnt}개 남음`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="sidebar-notif-detail-btn"
              onClick={() => setNotifExpanded(v => !v)}
            >
              {notifExpanded ? '닫기 ▲' : '자세히 보기 ▼'}
            </button>
          </div>
        )}

        {/* ── DB 알림 카드 ── */}
        {dbAlerts.length > 0 && (
          <div className="sidebar-notif-card sidebar-alert-card">
            <div className="sidebar-notif-header">
              <div className="sidebar-notif-title-row">
                <span className="sidebar-notif-icon">🔔</span>
                <span className="sidebar-notif-title">새 알림 {dbAlerts.length}건</span>
              </div>
            </div>
            {dbAlertExpanded && (
              <ul className="sidebar-notif-list">
                {dbAlerts.map((alert, i) => (
                  <li key={alert.alert_idx ?? i} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#888' }}>{alert.alert_type}</span>
                    <span style={{ fontSize: '12px', color: '#333', whiteSpace: 'pre-wrap' }}>{alert.alert_msg}</span>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="sidebar-notif-detail-btn"
                style={{ flex: 1 }}
                onClick={() => setDbAlertExpanded(v => !v)}
              >
                {dbAlertExpanded ? '닫기 ▲' : '내용 보기 ▼'}
              </button>
              <button
                className="sidebar-notif-detail-btn"
                style={{ flex: 1, background: '#2a5c1e', color: '#fff' }}
                onClick={handleAlertRead}
              >
                확인 ✓
              </button>
            </div>
          </div>
        )}

        {/* ── 데일리 로그 버튼 ── */}
        <Link
          to={`/DailyReport/${toToday()}`}
          className="sidebar-daily-btn"
        >
          📋 데일리 기록 작성
        </Link>

        {/* ── 유저 카드 ── */}
        <Link to="/PersonalInfo" className="sidebar-user-card">
          <img src={avater} alt="user avatar" className="sidebar-avatar" />
          <div className="sidebar-user-info">
            <strong>{userName ? `${userName} 님` : '사용자'}</strong>
            <span>개인정보 수정</span>
          </div>
        </Link>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
