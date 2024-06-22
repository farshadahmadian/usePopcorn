import { useState } from "react";

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const startContainerStyle = {
  display: "flex",
};

const textStyle = {
  lineHeight: "1",
  margine: "0",
};

const starStyle = {
  width: "48px",
  height: "48px",
  display: "block",
  cursor: "pointer",
};

const Star = ({ full, onRate }) => {
  return (
    <span role="button" style={starStyle} onClick={onRate}>
      {full ? (
        <img src="./full-star.svg" alt="full star" />
      ) : (
        <img src="./empty-star.svg" alt="empty star" />
      )}
    </span>
  );
};

const StarRating = ({ maxRating = 5 }) => {
  const [rating, setRating] = useState(0);

  const handleRate = function (rating) {
    setRating(rating + 1);
  };

  return (
    <div style={containerStyle}>
      <div style={startContainerStyle}>
        {Array.from({ length: maxRating }, (_, i) => {
          return (
            <Star
              key={i}
              i={i}
              rate={rating}
              onRate={handleRate.bind(this, i)}
              full={rating >= i + 1}
            />
          );
        })}
      </div>
      <p style={textStyle}>{rating || ""}</p>
    </div>
  );
};

export default StarRating;
