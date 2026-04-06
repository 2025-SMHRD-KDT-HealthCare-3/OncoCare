import React from 'react'
import { ToastProvider } from './context/ToastContext.jsx'
// import Register from './features/Registerpage/Register.jsx'
// import Login from './features/Loginpage/Login.jsx'
import Auth from './features/Auth/Auth.jsx'
import Main from './features/Mainpage/Main.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MyPage from './features/Mypage/MyPage.jsx'
import Fridge from './features/MyFridgepage/Fridge.jsx'
import Report from './features/Report/Report.jsx'
import DailyReport from './features/DailyReportpage/DailyReport.jsx'
import DetailRecipe from './features/RecipeDetailpage/DetailRecipe.jsx'
import RecipeDetail from './features/RecipeDetailpage/RecipeDetail.jsx'
import IngredientForm from './features/IngredientFormpage/IngredientForm.jsx'
import HealthInfo from './features/HealthInfopage/HealthInfo.jsx'
import PersonalInfo from './features/Registerpage/PersonalInfo.jsx'
import Landing from './features/Landing/Landing.jsx'
import axios from 'axios'
axios.defaults.withCredentials = true;



function App() {

  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        {/* <Route path="/Register" element={<Register />} /> */}
        <Route path="/" element={<Landing />} />
        <Route path="/Auth" element={<Auth />} />
        <Route path="/Main" element={<Main />} />
        <Route path='/MyPage' element={<MyPage />}/>
        <Route path='/Fridge' element={<Fridge />}/>
        <Route path='/Report' element={<Report />}/>
        <Route path='/DailyReport/:date' element={<DailyReport />}/>
        <Route path='/DailyReport/:date/DetailRecipe' element={<DetailRecipe />} ></Route>
        <Route path='/RecipeDetail/:id' element={<DetailRecipe />} />
        <Route path='/IngredientForm' element={<IngredientForm />} />
        <Route path='/IngredientForm/:id' element={<IngredientForm />} />
        <Route path='/HealthInfo' element={<HealthInfo />} />
        <Route path='/PersonalInfo' element={<PersonalInfo />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}

export default App
