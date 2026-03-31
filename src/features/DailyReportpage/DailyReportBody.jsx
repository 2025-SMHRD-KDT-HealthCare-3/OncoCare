import React from 'react'
import DailyDiet from './DailyDiet'
import DailyBowel from './DailyBowel'
import DailyCondition from './DailyCondition'

const DailyReportBody = () => {
  return (
    <div className='main-content'>
      <div className='daily-body'>
        <DailyDiet></DailyDiet>
        <DailyBowel></DailyBowel>
        <DailyCondition></DailyCondition>
      </div>
    </div>
  )
}

export default DailyReportBody