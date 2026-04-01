import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Header.css'
import avater from '../../assets/avater.jpg'
import icon from '../../assets/oncocare_icon.png'
import { Link, useNavigate } from 'react-router-dom'

const MainHeader = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const storedName = sessionStorage.getItem('user_name')
    if (storedName) {
      setUserName(storedName)
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
<nav className="navbar navbar-expand-sm custom-navbar">
    <div className="container-fluid px-0">
        {/* 이미지 로고 클릭하면 홈으로 이동 */}
        <Link to='/Main'>
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

            {/* 회원 프로필, 회원명, 로그아웃 버튼 -> 로그인 화면으로 이동 / 아직 코딩 x 
                                회원 프로필, 회원명 선택했을 때 회원정보 수정 페이지로 이동 */}
            <li className="nav-item-avater">
                <Link to='/PersonalInfo'>
                    <img src={avater} alt="Avatar Logo" style={{ width: '54px' }} className="rounded-pill"/>
                </Link>
                <div className="nav-user-info">
                    <Link to='/PersonalInfo'><span className='nav-user'>{userName} 님</span></Link>
                    <span onClick={handleLogout} className='nav-logout'>logout</span>
                </div>
            </li>
        </ul>
    </div>
</nav>
  )
}

export default MainHeader