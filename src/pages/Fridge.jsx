import React from 'react'
import MainHeader from '../components/MainHeader'
import FridgeBody from '../components/FridgeBody'
import RegisterIngredient from '../components/RegisterIngredient'

const Fridge = () => {
  return (
    <div className="page-layout">
      <MainHeader />
      <FridgeBody />
      <RegisterIngredient></RegisterIngredient>
    </div>
  )
}

export default Fridge
