import React, { useState } from 'react'
import '../public/root.css'
import MainTop from './MainTop'
import MainRecipe from './MainRecipe'
import RegisterIngredient from '../public/RegisterIngredient'


const MainBody = () => {
  const user_idx = sessionStorage.getItem('user_idx')
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })

  return (
    <div className="main-content">
      <MainTop onDateChange={setSelectedDate} />
      <MainRecipe user_idx={user_idx} selectedDate={selectedDate} />
      <RegisterIngredient />
    </div>
  )
}

export default MainBody