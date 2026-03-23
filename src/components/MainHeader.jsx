import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Header.css'
import avater from '../assets/avater.jpg'

const MainHeader = () => {
  return (
<nav className="navbar navbar-expand-sm custom-navbar">
    <div className="container-fluid">
        <a className="navbar-brand" href="/Main">Logo</a>
        <ul className="navbar-nav ms-auto">
            <li className="nav-item">
                <a className="nav-link" href="/Recipe">Recipe</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="/Ingredient">Ingredient</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="/Report">Report</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="/MyPage">My page</a>
            </li>
            <li className="nav-item-avater">
                <a class="navbar-brand" href="/Info">
                    <img src={avater} alt="Avatar Logo" style={{ width: '70px' }} className="rounded-pill"/> 
                    <span className='nav-user'>User</span>
                </a>
            </li>
        </ul>
    </div>
</nav>
  )
}

export default MainHeader