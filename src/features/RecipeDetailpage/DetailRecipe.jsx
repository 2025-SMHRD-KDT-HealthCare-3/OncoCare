import React from 'react'
import MainHeader from '../public/MainHeader'
import RecipeCard from './RecipeCard'
import Footer from '../public/Footer'

const DetailRecipe = () => {
  return (
  <div className="page-layout">
    <MainHeader></MainHeader>
    <RecipeCard></RecipeCard>
    <Footer></Footer>
  </div>
  )
}

export default DetailRecipe