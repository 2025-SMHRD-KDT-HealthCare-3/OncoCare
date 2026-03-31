import React from 'react'
import MainHeader from '../public/MainHeader'
import MypageBody from './MypageBody'
import Footer from '../public/Footer'

const MyPage = () => {
  return (
    <div className="page-layout">
      <MainHeader></MainHeader>
      <MypageBody></MypageBody>
      <Footer></Footer>
    </div>
  )
}

export default MyPage