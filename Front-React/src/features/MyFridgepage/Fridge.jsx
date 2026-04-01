import React from 'react'
import Sidebar from '../public/Sidebar'
import FridgeBody from './FridgeBody'
import Footer from '../public/Footer'

const Fridge = () => {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area">
        <FridgeBody />
        <Footer />
      </div>
    </div>
  )
}

export default Fridge
