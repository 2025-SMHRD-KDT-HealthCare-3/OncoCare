import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../css/root.css'
import '../css/RegisterBody.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'

// mode: 'register'(기본) | 'edit'(개인정보 수정)
const RegisterBody = ({ mode = 'register' }) => {
    const isEdit = mode === 'edit'

    const [name, setName] = useState('');
    const [sex, setSex] = useState('');
    const [emailCheck, setEmailCheck] = useState(false);
    const [emailMessage, setEmailMessage] = useState('');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [birth, setBirth] = useState('');
    const [error, setError] = useState('');
    const nav = useNavigate();

    // 수정 모드: 기존 유저 정보 불러와서 pre-fill
    useEffect(() => {
        if (!isEdit) return
        // TODO: GET /user/info 백엔드 API 연결
        // axios.get('http://localhost:3000/user/info')
        //   .then((res) => {
        //     setName(res.data.name)
        //     setId(res.data.id)
        //     setPhone(res.data.phone)
        //     setBirth(res.data.birthdate)
        //     setSex(res.data.gender)
        //   })
    }, [isEdit])

    const checkEmail = async () => {
        if(!id){
            setEmailMessage('이메일을 입력해주세요.')
            return
        }
        try {
            const response = await axios.post('http://localhost:3000/user/emailCheck', { email: id });
            if (response.data == '1') {
                setEmailCheck(true);
                setEmailMessage('사용 가능한 이메일입니다.');
                alert('사용 가능한 이메일입니다.');
            } else {
                setEmailCheck(false);
                setEmailMessage('이미 사용 중인 이메일입니다.');
                alert('중복된 이메일입니다.');
            }
        } catch (error) {
            console.error("중복 체크 에러:", error);
            setEmailCheck(false);
            alert('서버 통신 중 오류가 발생했습니다.')
        }
    }

    const register = async (e) => {
        e.preventDefault();

        if(!emailCheck){
            setError('이메일 중복확인을 해주세요.')
            return
        }
        if (!sex) {
            alert('성별을 선택해주세요.');
            return;
        }
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        try {
            const response = await axios.post('http://localhost:3000/user/register', {
                email: id,
                password: password,
                name: name,
                gender: sex,
                birthdate: birth,
                phone: phone
            })
            if (response.data == '1') {
                alert('회원가입 성공!');
                nav('/');
            } else {
                alert('회원가입 실패');
            }
        } catch (error) {
            setError('회원가입에 실패했습니다.')
            console.error(error)
        }
    }

    const update = async (e) => {
        e.preventDefault();

        if (!sex) {
            alert('성별을 선택해주세요.');
            return;
        }
        if (password && password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        // TODO: PUT /user/update 백엔드 API 연결
        // try {
        //     const response = await axios.put('http://localhost:3000/user/update', {
        //         name, gender: sex, birthdate: birth, phone,
        //         ...(password ? { password } : {})
        //     })
        //     if (response.data == '1') {
        //         alert('수정 완료!')
        //         nav('/MyPage')
        //     }
        // } catch (error) {
        //     console.error(error)
        // }
        alert('수정 완료! (백엔드 연결 후 활성화)')
        nav('/MyPage')
    }

    return (
        <div className='main-content register-wrapper'>
            <div className="register-box">
                <h1 className="register-title">{isEdit ? '개인정보 수정' : 'Register'}</h1>
                <br />
                <form onSubmit={isEdit ? update : register}>
                    {/* 이름 성별 */}
                    <div className="form-floating name-gender-wrapper d-flex mb-3 mt-3">
                        <div className='form-floating name-box'>
                            <input type="text" className="form-control" id="name"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)} />
                            <label htmlFor="name">Name</label>
                        </div>
                        <div className="dropdown">
                            <button type="button" className="gender-btn dropdown-toggle" data-bs-toggle="dropdown">
                                {sex || 'Sex'}
                            </button>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" onClick={() => setSex('Male')}>Male</a></li>
                                <li><a className="dropdown-item" onClick={() => setSex('Female')}>Female</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* 생년월일 */}
                    <div className="form-floating mb-3 mt-3">
                        <input type="date" className="form-control" id="birth"
                            placeholder="Enter birth"
                            value={birth}
                            onChange={(e) => setBirth(e.target.value)} />
                        <label htmlFor="birth">Birth</label>
                    </div>

                    {/* 이메일: 수정 모드면 read-only, 회원가입이면 중복확인 포함 */}
                    {isEdit ? (
                        <div className="form-floating mb-3 mt-3">
                            <input type="text" className="form-control" id="email"
                                placeholder="Email"
                                value={id}
                                readOnly />
                            <label htmlFor="email">Email (변경 불가)</label>
                        </div>
                    ) : (
                        <div className="d-flex gap-2 mb-3 mt-3">
                            <div className="form-floating flex-grow-1">
                                <input type="text" className="form-control" id="email"
                                    placeholder="Enter email"
                                    onChange={(e) => {
                                        setId(e.target.value)
                                        setEmailCheck(false)
                                        setEmailMessage('')
                                    }} />
                                <label htmlFor="email">Email</label>
                            </div>
                            <button type="button" className="custom-btn1" onClick={checkEmail}>
                                Check Email
                            </button>
                        </div>
                    )}

                    {/* 비밀번호 */}
                    <div className="form-floating mt-3 mb-3">
                        <input type="password" className="form-control" id="pwd"
                            placeholder={isEdit ? '새 비밀번호 (변경 시에만 입력)' : 'Enter password'}
                            onChange={(e) => setPassword(e.target.value)} />
                        <label htmlFor="pwd">{isEdit ? '새 비밀번호' : 'Password'}</label>
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="form-floating mt-3 mb-3">
                        <input type="password" className="form-control" id="confirmpwd"
                            placeholder="Confirm password"
                            onChange={(e) => setConfirmPassword(e.target.value)} />
                        <label htmlFor="confirmpwd">Confirm Password</label>
                    </div>

                    {/* 전화번호 */}
                    <div className="form-floating mb-3 mt-3">
                        <input type="text" className="form-control" id="phone"
                            placeholder="Enter phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)} />
                        <label htmlFor="phone">Phone Number</label>
                    </div>

                    {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

                    <div className="d-flex justify-content-center mt-4">
                        <button type="submit" className="custom-btn2">
                            {isEdit ? '수정하기' : 'Register'}
                        </button>
                    </div>
                </form>
                <br />
                {!isEdit && (
                    <p>Already have an account? <Link to="/">Login</Link></p>
                )}
            </div>
        </div>
    )
}

export default RegisterBody
