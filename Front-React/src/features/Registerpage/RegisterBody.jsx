import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../public/root.css'
import './RegisterBody.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'
import { useToast } from '../../context/ToastContext'

// mode: 'register'(기본) | 'edit'(개인정보 수정)
const RegisterBody = ({ mode = 'register' }) => {
  const { showToast } = useToast()
  const isEdit = mode === 'edit'

  const [name, setName] = useState('')
  const [sex, setSex] = useState('')
  const [emailCheck, setEmailCheck] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [birth, setBirth] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    if (!isEdit) return
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return

    axios
      .get(`http://localhost:3000/api/auth/profile?user_idx=${user_idx}`)
      .then((res) => {
        if (!res.data || res.data === '0') return
        setName(res.data.name || '')
        setId(res.data.email || '')
        setPhone(res.data.phone || '')
        setBirth(res.data.birth || '')
        setSex(res.data.gender || '')
      })
      .catch((err) => console.error('유저 정보 조회 실패:', err))
  }, [isEdit])

  const checkEmail = async () => {
    if (!id) {
      setEmailMessage('이메일을 입력해주세요.')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/emailCheck',
        { email: id }
      )

      if (response.data == '1') {
        setEmailCheck(true)
        setEmailMessage('사용 가능한 이메일입니다.')
        showToast('확인', '사용 가능한 이메일입니다.', 'success')
      } else {
        setEmailCheck(false)
        setEmailMessage('이미 사용 중인 이메일입니다.')
        showToast('알림', '중복된 이메일입니다.', 'warning')
      }
    } catch (error) {
      console.error('중복 체크 에러:', error)
      setEmailCheck(false)
      showToast('오류', '서버 통신 중 오류가 발생했습니다.', 'danger')
    }
  }

  const register = async (e) => {
    e.preventDefault()

    if (!emailCheck) {
      setError('이메일 중복확인을 해주세요.')
      return
    }

    if (!sex) {
      showToast('알림', '성별을 선택해주세요.', 'warning')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/register',
        {
          email: id,
          password: password,
          name: name,
          gender: sex,
          birthdate: birth,
          phone: phone,
        }
      )

      if (response.data == '1') {
        showToast('완료', '회원가입 성공!', 'success')
        nav('/')
      } else {
        showToast('오류', '회원가입 실패', 'danger')
      }
    } catch (error) {
      setError('회원가입에 실패했습니다.')
      console.error(error)
    }
  }

  const update = async (e) => {
    e.preventDefault()

    if (password && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) {
      showToast('알림', '로그인이 필요합니다.', 'warning')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/user/update',
        {
          user_idx,
          name,
          gender: sex,
          birth,
          phone,
          ...(password ? { password } : {}),
        }
      )

      if (response.data == '1') {
        showToast('수정 완료', '수정 완료!', 'success')
        nav('/MyPage')
      } else {
        showToast('오류', '수정에 실패했습니다.', 'danger')
      }
    } catch (error) {
      console.error(error)
      showToast('오류', '서버 통신 중 오류가 발생했습니다.', 'danger')
    }
  }

  return (
    <div className="main-content edit-profile-page">
      <div className="edit-profile-wrapper">
        <div className="fr-hero-card">
          <div className="fr-hero-card-body">
            <h1 className="fr-hero-title">
              {isEdit ? '개인정보 수정' : 'Create Account'}
            </h1>
            <p className="fr-hero-sub">
              {isEdit
                ? '개인 정보를 수정하고 최신 상태로 유지하세요.'
                : '계정을 만들어 케어 여정을 시작하세요.'}
            </p>
          </div>
        </div>

        <div className="edit-profile-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">👩</div>
            <button type="button" className="profile-avatar-edit">📷</button>
          </div>

          <form onSubmit={isEdit ? update : register}>
            <section className="profile-form-section">
              <div className="profile-section-title">
                <span className="profile-section-icon">👤</span>
                <h2>개인 정보</h2>
              </div>

              <div className="profile-grid two-col">
                <div className="profile-field">
                  <label>이름</label>
                  <input
                    type="text"
                    className="profile-text-input"
                    placeholder="이름 입력"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label>생년월일</label>
                  <input
                    type="date"
                    className="profile-text-input"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                  />
                </div>
              </div>

              {isEdit ? (
                <div className="profile-grid one-col">
                  <div className="profile-field">
                    <label>이메일 (등록됨)</label>
                    <div className="input-with-end-icon">
                      <input
                        type="text"
                        className="profile-text-input readonly"
                        value={id}
                        readOnly
                      />
                      <span className="end-icon">🔒</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-grid email-check-row">
                  <div className="profile-field">
                    <label>이메일</label>
                    <input
                      type="text"
                      className="profile-text-input"
                      placeholder="이메일 입력"
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value)
                        setEmailCheck(false)
                        setEmailMessage('')
                      }}
                    />
                  </div>

                  <div className="email-check-btn-wrap">
                    <button
                      type="button"
                      className="email-check-btn"
                      onClick={checkEmail}
                    >
                      이메일 중복확인
                    </button>
                  </div>
                </div>
              )}

              <div className="profile-grid two-col">
                <div className="profile-field">
                  <label>전화번호</label>
                  <input
                    type="text"
                    className="profile-text-input"
                    placeholder="전화번호 입력"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label>성별</label>
                  <select
                    className="profile-text-input profile-select-input"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                  >
                    <option value="">성별 선택</option>
                    <option value="Male">남성</option>
                    <option value="Female">여성</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="profile-form-section">
              <div className="profile-section-title">
                <span className="profile-section-icon">🛡️</span>
                <h2>보안</h2>
              </div>

              <div className="profile-grid two-col">
                <div className="profile-field">
                  <label>{isEdit ? '새 비밀번호' : '비밀번호'}</label>
                  <input
                    type="password"
                    className="profile-text-input"
                    placeholder={
                      isEdit ? '새 비밀번호 (변경 시에만 입력)' : '비밀번호 입력'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label>비밀번호 확인</label>
                  <input
                    type="password"
                    className="profile-text-input"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {emailMessage && !isEdit && (
              <p className="profile-message success-msg">{emailMessage}</p>
            )}

            {error && <p className="profile-message error-msg">{error}</p>}

            <div className="profile-action-area">
              <button type="submit" className="profile-save-btn">
                {isEdit ? '변경 저장' : '가입하기'}
              </button>

              {isEdit ? (
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => nav('/MyPage')}
                >
                  취소
                </button>
              ) : (
                <p className="profile-login-link">
                  이미 계정이 있으신가요? <Link to="/">로그인</Link>
                </p>
              )}
            </div>
          </form>
        </div>

        <p className="profile-bottom-note">
          개인정보는 암호화되어 안전하게 보관됩니다.
        </p>
      </div>
    </div>
  )
}

export default RegisterBody