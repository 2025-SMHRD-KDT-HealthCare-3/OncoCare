import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Header.css'
import icon from '../assets/oncocare_icon.png'
import { Link } from 'react-router-dom'

const LoginHeader = () => {
  return (
<nav className="navbar navbar-expand-sm custom-navbar">
    <div className="container-fluid">
        {/* 이미지 로고 클릭하면 홈으로 로그인 페이지 이동 */}
        <Link to='/'>
            <img src={icon} className="navbar-brand"></img>
        </Link>
        {/* 냉장고, 리포트 마이 페이지, 회원가입 화면 이동 */}
        <ul className="navbar-nav ms-auto">
            <li className="nav-item">
                <Link to='/Fridge' className="nav-link">My Fridge</Link>
            </li>
            <li className="nav-item">
                <Link to='/Report' className="nav-link">Report</Link>
            </li>
            <li className="nav-item">
                <Link to='/MyPage' className="nav-link">My page</Link>
            </li>
            <li className="d-flex justify-content-between gap-2">
                <Link to='/Register' className="btn btn-outline-secondary nav-item-btn">Register</Link>
            </li>
        </ul>
    </div>
</nav>
  )
}

export default LoginHeader