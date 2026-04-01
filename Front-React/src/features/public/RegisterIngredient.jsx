import React from 'react'
import { BsCamera, BsPencil } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './RegisterIngredient.css'
import '../Mainpage/MainRecipe.css'
import camera_icon from '../../assets/camera_icon.png'
import pencil_icon from '../../assets/pencil_icon.png'

const RegisterIngredient = () => {
  const navigate = useNavigate()

  return (
    <section className="ingredient-section">
      <div className="ingredient-header">
        <h3 className="ingredient-title">Ingredient Input</h3>
        <p className="ingredient-subtitle">
          Register your ingredients to receive personalized meal recommendations.
        </p>
      </div>

      <div className="ingredient-action-list">
        <button className="ingredient-action primary">
          <span className="ingredient-action-icon">📷</span>
          <span>Scan Receipt</span>
        </button>

        <button
          className="ingredient-action secondary"
          onClick={() => navigate('/IngredientForm')}
        >
          <span className="ingredient-action-icon">✏️</span>
          <span>Manual Entry</span>
        </button>
      </div>
    </section>
  )
}

export default RegisterIngredient
