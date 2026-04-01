import React from 'react'
import Sidebar from '../public/Sidebar'
import HealthInfoBody from './HealthInfoBody'
import Footer from '../public/Footer'

const HealthInfo = () => {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area">
        <HealthInfoBody />
        <Footer />
      </div>
    </div>
  )
}

export default HealthInfo
