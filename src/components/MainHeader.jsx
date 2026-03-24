import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Header.css'
import avater from '../assets/avater.jpg'
import icon from '../assets/oncocare_icon.png'
import { Link } from 'react-router-dom'

const MainHeader = () => {
  return (
<nav className="navbar navbar-expand-sm custom-navbar">
    <div className="container-fluid">
        <Link to='/Main'>
            <img src={icon} className="navbar-brand"></img>
        </Link>
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
            <li className="nav-item-avater">
                <Link className="navbar-brand" to='/MyPage'>
                    <img src={avater} alt="Avatar Logo" style={{ width: '70px' }} className="rounded-pill"/> 
                    <span className='nav-user'>User</span>
                </Link>
            </li>
        </ul>
    </div>
</nav>
  )
}

export default MainHeader