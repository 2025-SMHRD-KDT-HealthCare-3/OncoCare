import React from 'react'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Main from './pages/Main.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MyPage from './pages/MyPage.jsx'
import Fridge from './pages/Fridge.jsx'
import Report from './pages/Report.jsx'
import DailyReport from './pages/DailyReport.jsx'
import DetailRecipe from './pages/DetailRecipe.jsx'
import RecipeDetail from './pages/RecipeDetail.jsx'
import IngredientForm from './pages/IngredientForm.jsx'
import HealthInfo from './pages/HealthInfo.jsx'
import PersonalInfo from './pages/PersonalInfo.jsx'
import axios from 'axios'
axios.defaults.withCredentials = true;



function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Main" element={<Main />} />
        <Route path='/MyPage' element={<MyPage />}/>
        <Route path='/Fridge' element={<Fridge />}/>
        <Route path='/Report' element={<Report />}/>
        <Route path='/DailyReport/:date' element={<DailyReport />}/>
        <Route path='/DailyReport/:date/DetailRecipe' element={<DetailRecipe />} ></Route>
        <Route path='/RecipeDetail/:id' element={<RecipeDetail />} />
        <Route path='/IngredientForm' element={<IngredientForm />} />
        <Route path='/IngredientForm/:id' element={<IngredientForm />} />
        <Route path='/HealthInfo' element={<HealthInfo />} />
        <Route path='/PersonalInfo' element={<PersonalInfo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
