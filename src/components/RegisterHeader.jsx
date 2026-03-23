import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Header.css'


const RegisterHeader = () => {
  return (
<nav className="navbar navbar-expand-sm custom-navbar">
    <div className="container-fluid">
        <a className="navbar-brand" href="/Main">Logo</a>
        <span className="navbar-text">OncoCare</span>
    </div>
</nav>
  )
}

export default RegisterHeader