import React from 'react'
import MainHeader from '../components/MainHeader'
import MainBody from '../components/MainBody'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const Main = () => {
  return (
    <div>
        <MainHeader></MainHeader>
        <MainBody></MainBody>
    </div>
  )
}

export default Main