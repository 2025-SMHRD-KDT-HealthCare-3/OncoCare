import React from 'react'
import '../public/root.css'
import MainTop from './MainTop'
import MainRecipe from './MainRecipe'
import RegisterIngredient from '../public/RegisterIngredient'


const MainBody = () => {


  return (
    <div >
      <MainTop></MainTop>
      <MainRecipe></MainRecipe>
      <RegisterIngredient></RegisterIngredient>
    </div>
  )
}

export default MainBody