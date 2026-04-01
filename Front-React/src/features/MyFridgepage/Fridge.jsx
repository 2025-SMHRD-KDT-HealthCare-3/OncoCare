import React from 'react'
import Sidebar from '../public/Sidebar'
import FridgeBody from './FridgeBody'
import RegisterIngredient from '../public/RegisterIngredient'
import Footer from '../public/Footer'

const Fridge = () => {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area">
        <FridgeBody />
        <RegisterIngredient />
        <Footer />
      </div>
    </div>
  )
}

export default Fridge
