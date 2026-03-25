import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Header.css'
import icon from '../assets/oncocare_icon.png'
import { Link } from 'react-router-dom'
import RegisterBody from '../components/RegisterBody'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'


const Register = () => {
  return (
    <div>
        <nav className="navbar navbar-expand-sm custom-navbar">
          <div className="container-fluid">
            <Link to='/'>
              <img src={icon} className="navbar-brand"></img>
            </Link>
            <span className="navbar-text">OncoCare</span>
          </div>
        </nav>
        <RegisterBody></RegisterBody>
    </div>
  )
}

export default Register