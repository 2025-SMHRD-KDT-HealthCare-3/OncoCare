import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../assets/food.jpg'
import { Link } from 'react-router-dom'

const DailyDiet = () => {
  return (
    <div>
        <div className="card" style={{width: '18rem'}}>
            <img className="card-img-top" src="../assets/food.jpg" alt="Card image"/>
            <div className="card-body">
                <h4 className="card-title">John Doe</h4>
                <p className="card-text">Some example text.</p>
                <Link to='../pages/DetailRecipe' className="btn btn-primary">See Profile</Link>
            </div>
        </div>
    </div>
  )
}

export default DailyDiet