import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import StarRating from "./StarRating/StarRating";
// import "./index.css";
// import App from "./App";

function Test() {
  const [rate, setRate] = useState(0);

  return (
    <div>
      <StarRating
        maxRate={10}
        color="lightblue"
        setRate={setRate}
        className="test"
      />
      {rate ? (
        <p>This movies is rated {rate} stars.</p>
      ) : (
        <p>This movie is not rated</p>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StarRating
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
      defaultRating={3}
    />
    <Test />
  </React.StrictMode>
);
