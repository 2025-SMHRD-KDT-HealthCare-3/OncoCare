import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './MainSidebar.css'
import icon from '../../assets/oncocare_icon.png'
import avater from '../../assets/avater.jpg'

const MainSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const storedName = sessionStorage.getItem('user_name')
    if (storedName) {
      setUserName(storedName)
    }
  }, [])

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
            <span>Recovery Hub</span>
          </div>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/Main"
          className={`sidebar-link ${isActive('/Main') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">🏠</span>
          <span>Overview</span>
        </Link>

        <Link
          to="/Fridge"
          className={`sidebar-link ${isActive('/Fridge') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">🧊</span>
          <span>My Fridge</span>
        </Link>

        <Link
          to="/Report"
          className={`sidebar-link ${isActive('/Report') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">📊</span>
          <span>Report</span>
        </Link>

        <Link
          to="/MyPage"
          className={`sidebar-link ${isActive('/MyPage') ? 'active' : ''}`}
        >
          <span className="sidebar-icon">⚙️</span>
          <span>My Page</span>
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <Link to="/PersonalInfo" className="sidebar-user-card">
          <img src={avater} alt="user avatar" className="sidebar-avatar" />
          <div className="sidebar-user-info">
            <strong>{userName ? `${userName} 님` : '사용자'}</strong>
            <span>개인정보 수정</span>
          </div>
        </Link>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default MainSidebar