import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import StarRating from './StarRating/StarRating';
import './index.css';
import App from './App';
const defaultRate = 3;
const Test = () => {
  const [rateState, setRateState] = useState(defaultRate);
  return (
    <>
      <StarRating messages={['Terrible', 'Bad', 'Okay', 'Good', 'Amazing']} />
      <StarRating
        maxRating={10}
        color='blue'
        size={24}
        className='stars'
        setRateState={setRateState}
        defaultRate={defaultRate}
      />
      {rateState > 0 && <p> the rating is {rateState}</p>}
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
    {/* <Test /> */}
  </React.StrictMode>
);
