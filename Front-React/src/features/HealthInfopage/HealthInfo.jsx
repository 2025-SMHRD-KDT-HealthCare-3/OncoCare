import React from 'react'
import MainHeader from '../public/MainHeader'
import HealthInfoBody from './HealthInfoBody'
import Footer from '../public/Footer'

const HealthInfo = () => {
  return (
    <div className="page-layout">
      <MainHeader />
      <HealthInfoBody />
      <Footer></Footer>
    </div>
  )
}

export default HealthInfo
