import React from 'react'
import MainHeader from '../public/MainHeader'
import FridgeBody from './FridgeBody'
import RegisterIngredient from '../public/RegisterIngredient'
import Footer from '../public/Footer'

const Fridge = () => {
  return (
    <div className="page-layout">
      <MainHeader />
      <FridgeBody />
      <RegisterIngredient></RegisterIngredient>
      <Footer></Footer>
    </div>
  )
}

export default Fridge
