import React from 'react'
import MainHeader from '../public/MainHeader'
import MainBody from './MainBody'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Footer from '../public/Footer'

const Main = () => {
  return (
    <div className="page-layout">
        <MainHeader></MainHeader>
        <MainBody></MainBody>
        <Footer></Footer>
    </div>
  )
}

export default Main