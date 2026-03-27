import React from 'react'
import { BsCamera, BsPencil } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/RegisterIngredient.css'
import '../css/MainRecipe.css'
import camera_icon from '../assets/camera_icon.png'
import pencil_icon from '../assets/pencil_icon.png'

const RegisterIngredient = () => {
  const navigate = useNavigate()

  return (
    <div className="ingredient-input-section">
      <div className="recipe-section-header">
        <h2 className="recipe-section-title">식재료 입력</h2>
        <p className="recipe-section-sub">식재료를 등록하면 맞춤 식단을 추천해드려요.</p>
      </div>

      <div className="ingredient-btn-list">
        <div className="ingredient-btn-row">
          <img src={camera_icon} className='ingredient-pic' />
          <button className="btn ingredient-btn">사진으로 식재료 입력하기</button>
        </div>
        <div className="ingredient-btn-row">
          <img src={pencil_icon} className='ingredient-pic' />
          <button className="btn ingredient-btn" onClick={() => navigate('/IngredientForm')}>
            식재료 수기 작성
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterIngredient
