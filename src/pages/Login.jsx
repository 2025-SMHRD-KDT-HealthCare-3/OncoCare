import React from 'react'
import LoginHeader from '../components/LoginHeader'
import LoginBody from '../components/LoginBody'

const Login = () => {
  return (
    <div className="page-layout">
        <LoginHeader></LoginHeader>
        <LoginBody></LoginBody>
    </div>
  )
}

export default Login