import React from 'react'
import '../public/root.css'
import MainTop from './MainTop'
import MainRecipe from './MainRecipe'
import RegisterIngredient from '../public/RegisterIngredient'


const MainBody = () => {
  const user_idx = sessionStorage.getItem('user_idx')

  return (
    <div className="main-content">
      <MainTop />
      <MainRecipe user_idx={user_idx} />
      <RegisterIngredient />
    </div>
  )
}

export default MainBody