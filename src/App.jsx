import React from 'react'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Main from './pages/Main.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MyPage from './pages/MyPage.jsx'
import Fridge from './pages/Fridge.jsx'
import Report from './pages/Report.jsx'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Main" element={<Main />} />
        <Route path='/MyPage' element={<MyPage />}/>
        <Route path='/Fridge' element={<Fridge />}/>
        <Route path='/Report' element={<Report />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
