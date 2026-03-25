import React from 'react'
import { Link,useNavigate } from 'react-router-dom'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/Header.css'
import '../css/root.css'
import '../css/LoginBody.css'
import { useState } from 'react'

const LoginBody = () => {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')

  const nav = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    try{
      const response = await axios.post('http://localhost:3000/user/login', {
        id,
        pw
      })

      if (response.data.result === '1') {
      alert(`${response.data.user_name}님 환영합니다!`);
      
      // (선택 사항) 로그인 정보를 유지하고 싶다면 로컬 스토리지 등에 저장
      // localStorage.setItem('user', JSON.stringify(response.data));

      // 로그인 성공 시 로그인 페이지로 이동
      nav('/Main');
    }
    } catch (error) {
      // 서버에서 '0'을 보냈을 때 (아이디/비번 불일치)
      alert('이메일 또는 비밀번호가 틀렸습니다.');
      setError('이메일 또는 비밀번호가 틀렸습니다.');
    }
    }
  


  return (
<div className="main-content login-wrapper">
      <div className="login-box">
        {/* 로그인 페이지 타이틀 */}
        <h1 className="login-title">OncoCare</h1>
        <p className="login-subtitle">대장암을 이기는 나만의 식단</p>

        {/* 로그인 폼 이메일 비밀번호 로그인 버튼 회원가입 버튼 */}
        <form >
          <div className="form-floating mb-3 mt-3">
            <input type="email" className="form-control" value={id} onChange={(e) => setId(e.target.value)} id="email" placeholder="Enter email" name="email"/>
            <label htmlFor="email">Email</label>
          </div>

          <div className="form-floating mt-3 mb-3">
            <input type="password" className="form-control" value={pw} onChange={(e) => setPw(e.target.value)} id="pwd" placeholder="Enter password" name="pswd"/>
            <label htmlFor="pwd" >Password</label>
          </div>

          <div className="d-flex justify-content-between gap-2">
            <Link to='/Register' className="btn btn-outline-secondary w-50">Register</Link>
            <button onClick = {login} type="submit" className="btn w-50" style={{backgroundColor : '#8EBFA3' }}>Log in</button>
          </div>

          {/* 비밀번호 분실 -> 기능x */}

          <div className="mt-3 text-center">
            <a>Forgot password?</a>
          </div>
        </form>

      </div>
    </div>
  )
}

export default LoginBody