import { useState } from "react";

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const starContainerStyle = {
  display: "flex",
};

const textStyle = {
  lineHeight: "1",
  margin: "0",
};

const StarRating = ({ maxRate = 3, color, size }) => {
  const [rating, setRating] = useState(0);
  const [tempRate, setTempRate] = useState(rating);

  const handleRating = (i, event) => {
    // console.log(i);
    // console.log(event);
    setRating(i + 1);
  };

  const handleChangingRate = (i, event) => {
    setTempRate(i + 1);
  };

  const handleMouseLeave = (i, event) => {
    setTempRate(rating);
  };

  return (
    <div style={containerStyle}>
      <div style={starContainerStyle}>
        {Array.from({ length: maxRate }, (_, i) => {
          return (
            <Star
              isEmpty={i + 1 > tempRate}
              key={i}
              onRate={handleRating.bind(null, i)}
              onChangingRate={handleChangingRate.bind(null, i)}
              onMouseLeave={handleMouseLeave.bind(null, i)}
              color={color}
              size={size}
            />
          );
        })}
      </div>
      <p style={textStyle}>{tempRate || ""}</p>
    </div>
  );
};

const Star = ({
  onRate,
  isEmpty,
  onChangingRate,
  onMouseLeave,
  color,
  size,
}) => {
  const starStyle = {
    width: `${size}px`,
    height: "48px",
    display: "block",
    cursor: "pointer",
  };
  return (
    <img
      onMouseLeave={onMouseLeave}
      onMouseEnter={onChangingRate}
      onClick={onRate}
      role="button"
      style={starStyle}
      src={isEmpty ? "empty-star.svg" : "full-star.svg"}
      alt="Empty Star"
    />
  );
};

export default StarRating;
