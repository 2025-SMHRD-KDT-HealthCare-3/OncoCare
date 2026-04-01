import React from 'react'
import Sidebar from '../public/Sidebar'
import MypageBody from './MypageBody'
import Footer from '../public/Footer'

const MyPage = () => {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area">
        <MypageBody />
        <Footer />
      </div>
    </div>
  )
}

export default MyPage
