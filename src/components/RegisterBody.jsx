import React, { useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../css/root.css'
import '../css/RegisterBody.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'

const RegisterBody = () => {
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

    const checkEmail = async () => {
        if(!id){
            setEmailMessage('이메일을 입력해주세요.')
            return
        }
        try {
             // 서버의 { email } = req.body에 맞게 전달
            const response = await axios.post('http://localhost:3000/user/emailCheck', { email: id });
            
            // 서버 응답이 문자열 '1' 또는 숫자 1일 경우 처리
            if (response.data == '1') {
                setEmailCheck(true); // 중복 확인 통과!
                setEmailMessage('사용 가능한 이메일입니다.');
                alert('사용 가능한 이메일입니다.');
           
        }else {
                setEmailCheck(false); // 중복임
                setEmailMessage('이미 사용 중인 이메일입니다.');
                alert('중복된 이메일입니다.');
            }
        }catch (error){
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
                phone: phone,
                allergy: '0' 
      })
      if (response.data == '1') {
                alert('회원가입 성공!');
                nav('/'); // 로그인 페이지로 이동
    } else {
                alert('회원가입 실패');
            }
        }catch (error) {
      setError('회원가입에 실패했습니다.')
      console.error(error)
    }
  }
    
    


  return (
    <div className='main-content register-wrapper'>
        <div className="register-box">
            <h1 className="register-title">Register</h1>
            <br />
            <form onSubmit={register}>
                {/* 이름 성별 */}
                <div className="form-floating name-gender-wrapper d-flex mb-3 mt-3">
                    <div className='form-floating name-box'>
                        <input type="text" className="form-control" id="name" placeholder="Enter name" name="name" onChange={(e) => setName(e.target.value)}/>
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
                        onChange={(e) => setBirth(e.target.value)} />  {/* ← onChange 추가 */}
                    <label htmlFor="birth">Birth</label>
                </div>

                {/* 이메일 + 중복확인 */}
                <div className="d-flex gap-2 mb-3 mt-3">
                    <div className="form-floating flex-grow-1">
                        <input type="text" className="form-control" id="email"
                            placeholder="Enter email"
                            onChange={(e) => {
                                setId(e.target.value)
                                setEmailCheck(false)  // 이메일 바뀌면 다시 확인
                                setEmailMessage('')
                                }} />
                        <label htmlFor="email">Email</label>
                    </div>
                    <button type="button"  // ← submit → button!
                            className="custom-btn1"
                            onClick={checkEmail}>
                                Check Email
                    </button>
                </div>
          

                {/* 비밀번호 */}
                <div className="form-floating mt-3 mb-3">
                    <input type="password" className="form-control" id="pwd"
                    placeholder="Enter password"
                    onChange={(e) => setPassword(e.target.value)} />  {/* ← onChange 추가 */}
                    <label htmlFor="pwd">Password</label>
                </div>

                {/* 비밀번호 확인 */}
                <div className="form-floating mt-3 mb-3">
                    <input type="password" className="form-control" id="confirmpwd"
                        placeholder="Confirm password"
                        onChange={(e) => setConfirmPassword(e.target.value)} />  {/* ← onChange 추가 */}
                    <label htmlFor="confirmpwd">Confirm Password</label>
                </div>

                {/* 전화번호 */}
                <div className="form-floating mb-3 mt-3">
                    <input type="text" className="form-control" id="phone"
                        placeholder="Enter phone"
                        onChange={(e) => setPhone(e.target.value)} />  {/* ← onChange 추가 */}
                    <label htmlFor="phone">Phone Number</label>
                </div>
                <div className="d-flex justify-content-center mt-4">
                    <button type="submit" className="custom-btn2">Register</button>
                </div>
            </form>
                <br />
            <p>Already have an account? <Link to="/">Login</Link></p>
        </div>
    </div>
  )
}

export default RegisterBody