import React from 'react'
import '../css/root.css'
import MainTop from './MainTop'
import MainRecipe from './MainRecipe'
import RegisterIngredient from './RegisterIngredient'


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