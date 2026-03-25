import React from 'react'
import { BsCamera, BsPencil } from 'react-icons/bs'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/RegisterIngredient.css'

const RegisterIngredient = () => {
  return (
    <div className="ingredient-input-section">
      <h3>식재료 입력</h3>
      <p className="ingredient-subtitle">Subheading</p>

      <div className="ingredient-btn-list">
        <div className="ingredient-btn-row">
          <BsCamera size={80} />
          <button className="btn ingredient-btn">사진으로 식재료 입력하기</button>
        </div>
        <div className="ingredient-btn-row">
          <BsPencil size={80} />
          <button className="btn ingredient-btn">식재료 수기 작성</button>
        </div>
      </div>
    </div>
  )
}

export default RegisterIngredient
