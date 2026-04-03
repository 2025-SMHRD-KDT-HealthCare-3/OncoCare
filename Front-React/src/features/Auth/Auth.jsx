import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import '../public/Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import icon from '../../assets/oncocare_icon.png';
import { useToast } from '../../context/ToastContext';

const Auth = () => {
  const { showToast } = useToast();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  // login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  // register states
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [emailCheck, setEmailCheck] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        id: loginEmail,
        pw: loginPw,
      });

      if (response.data.result === '1') {
        showToast('환영합니다', `${response.data.user_name}님 환영합니다!`, 'success');
        sessionStorage.setItem('user_idx', response.data.user_idx);
        sessionStorage.setItem('user_name', response.data.user_name);
        if (response.data.user_email) {
          sessionStorage.setItem('user_email', response.data.user_email);
        }
        nav('/Main');
      } else {
        setLoginError('이메일 또는 비밀번호가 틀렸습니다.');
      }
    } catch (error) {
      setLoginError('이메일 또는 비밀번호가 틀렸습니다.');
    }
  };

  const checkEmail = async () => {
    if (!registerEmail) {
      setEmailMessage('이메일을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/emailCheck', {
        email: registerEmail,
      });

      if (response.data == '1') {
        setEmailCheck(true);
        setEmailMessage('사용 가능한 이메일입니다.');
        showToast('확인', '사용 가능한 이메일입니다.', 'success');
      } else {
        setEmailCheck(false);
        setEmailMessage('이미 사용 중인 이메일입니다.');
        showToast('알림', '중복된 이메일입니다.', 'warning');
      }
    } catch (error) {
      setEmailCheck(false);
      setEmailMessage('서버 통신 중 오류가 발생했습니다.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!emailCheck) {
      setRegisterError('이메일 중복확인을 해주세요.');
      return;
    }

    if (!sex) {
      setRegisterError('성별을 선택해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        email: registerEmail,
        password: password,
        name: name,
        gender: sex,
        birthdate: birth,
        phone: phone,
      });

      if (response.data == '1') {
        showToast('완료', '회원가입 성공!', 'success');
        setMode('login');
      } else {
        setRegisterError('회원가입 실패');
      }
    } catch (error) {
      setRegisterError('회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-screen">
        <div className="auth-bg">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaXKbD_wXu-WdxLdmbzOrBGsIl8R00LQk_5aXoQWMluxiAMUAId3XnQBLkHSm815rXxNq59JQhj01CSWnMb9QhrPwmberDq0Z57s9RhibK-i9U1pCaZ31ISTxg9NJ2GfMQDuBGxNe71uH-91p7r2P9CFlez5NuC-ZXkHkU9ixYGKs7bUhOzxS9RL-4OBC7hFNt1dMtit1xCrH5oP198N3_WpiyNIZjEBn8Md_PqL9JwY3ovXtgczGD7qZQXVt5-OlAQ-9aH6mzsz9r"
            alt="background"
          />
          <div className="auth-bg-overlay"></div>
        </div>

        <main className="auth-main">
          <section className="auth-left">
            <div className="auth-badge">
              <span className="auth-badge-icon">✦ 치유의 성소</span>
            </div>

            <h1 className="auth-brand-title">OncoCare</h1> 
            <p className="auth-brand-subtitle">대장암을 이기는 나만의 식단</p>

            <div className="auth-feature-row">
              <div className="auth-feature-card">
                <div className="auth-feature-icon">🛡</div>
                <div>
                  <p className="auth-feature-title">맞춤 식단 관리</p>
                  <p className="auth-feature-desc">환자 상태에 맞는 식단과 기록을 관리해요.</p>
                </div>
              </div>

              <div className="auth-feature-card">
                <div className="auth-feature-icon">🔒</div>
                <div>
                  <p className="auth-feature-title">안전한 건강 기록</p>
                  <p className="auth-feature-desc">로그인 후 개인 맞춤 리포트를 확인할 수 있어요.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="auth-right">
            <div className="auth-card">
              <div className="auth-tab-toggle">
                <button
                  type="button"
                  className={mode === 'login' ? 'active' : ''}
                  onClick={() => setMode('login')}
                >
                  로그인
                </button>
                <button
                  type="button"
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => setMode('signup')}
                >
                  회원가입
                </button>
              </div>

              {mode === 'login' ? (
                <div className="auth-panel">
                  <div className="auth-panel-header">
                    <h2>다시 오셨습니다</h2>
                    <p>이메일과 비밀번호를 입력해 주세요.</p>
                  </div>

                  <form onSubmit={handleLogin} className="auth-form">
                    <div className="auth-field">
                      <label>이메일 주소</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">✉</span>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="이름@example.com"
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <div className="auth-label-row">
                        <label>비밀번호</label>
                        <button type="button" className="auth-text-link">
                          잊으셨나요?
                        </button>
                      </div>

                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">🔒</span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPw}
                          onChange={(e) => setLoginPw(e.target.value)}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="auth-eye-btn"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? '숨김' : '보기'}
                        </button>
                      </div>
                    </div>

                    {loginError && <p className="auth-error">{loginError}</p>}

                    <button type="submit" className="auth-submit-btn">
                      로그인
                    </button>
                  </form>

                </div>
              ) : (
                <div className="auth-panel">
                  <div className="auth-panel-header">
                    <h2>회원가입</h2>
                    <p>함께 회복 여정을 시작해보세요.</p>
                  </div>

                  <form onSubmit={handleRegister} className="auth-form">
                    <div className="auth-grid-2">
                      <div className="auth-field">
                        <label>이름</label>
                        <div className="auth-input-wrap no-icon">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                          />
                        </div>
                      </div>

                      <div className="auth-field">
                        <label>성별</label>
                        <div className="auth-input-wrap no-icon">
                          <select value={sex} onChange={(e) => setSex(e.target.value)}>
                            <option value="">선택</option>
                            <option value="Male">남성</option>
                            <option value="Female">여성</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="auth-field">
                      <label>생년월일</label>
                      <div className="auth-input-wrap no-icon">
                        <input
                          type="date"
                          value={birth}
                          onChange={(e) => setBirth(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label>이메일</label>
                      <div className="auth-inline-row">
                        <div className="auth-input-wrap auth-inline-input no-icon">
                          <input
                            type="email"
                            value={registerEmail}
                            onChange={(e) => {
                              setRegisterEmail(e.target.value);
                              setEmailCheck(false);
                              setEmailMessage('');
                            }}
                            placeholder="이름@example.com"
                          />
                        </div>
                        <button type="button" className="auth-check-btn" onClick={checkEmail}>
                          중복확인
                        </button>
                      </div>
                      {emailMessage && <p className="auth-message">{emailMessage}</p>}
                    </div>

                    <div className="auth-field">
                      <label>비밀번호</label>
                      <div className="auth-input-wrap no-icon">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="비밀번호를 입력하세요"
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label>비밀번호 확인</label>
                      <div className="auth-input-wrap no-icon">
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="비밀번호를 다시 입력하세요"
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label>전화번호</label>
                      <div className="auth-input-wrap no-icon">
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="전화번호를 입력하세요"
                        />
                      </div>
                    </div>

                    {registerError && <p className="auth-error">{registerError}</p>}

                    <button type="submit" className="auth-submit-btn">
                      가입하기
                    </button>
                  </form>
                </div>
              )}

            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Auth