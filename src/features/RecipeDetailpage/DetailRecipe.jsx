import React from 'react'
import MainHeader from '../public/MainHeader'
import RecipeCard from './RecipeCard'
import Footer from '../public/Footer'
import RecipeDetail from './RecipeDetail'

const DetailRecipe = () => {
  return (
  <div className="page-layout">
    <MainHeader></MainHeader>
    <RecipeDetail></RecipeDetail>
    <Footer></Footer>
  </div>
  )
}

export default DetailRecipe