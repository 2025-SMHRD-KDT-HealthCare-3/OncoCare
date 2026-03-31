import React from 'react'
import LoginHeader from './LoginHeader'
import LoginBody from './LoginBody'
import Footer from '../public/Footer'


const Login = () => {
  return (
    <div className="page-layout">
        <LoginHeader></LoginHeader>
        <LoginBody></LoginBody>
        <Footer />
    </div>
  )
}

export default Login