import React from 'react'
import Footer from '../public/Footer'
import RecipeDetail from './RecipeDetail'
import Sidebar from '../public/Sidebar'
import '../public/root.css'

const DetailRecipe = () => {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area">
        <RecipeDetail />
        <Footer />
      </div>
    </div>
  )
}

export default DetailRecipe