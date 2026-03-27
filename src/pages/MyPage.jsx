import React from 'react'
import MainHeader from '../components/MainHeader'
import MypageBody from '../components/MypageBody'

const MyPage = () => {
  return (
    <div className="page-layout">
      <MainHeader></MainHeader>
      <MypageBody></MypageBody>
    </div>
  )
}

export default MyPage