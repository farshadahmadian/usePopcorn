import { useState } from "react";
import CustomStar from "./CustomStar";
import PropTypes from "prop-types";

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const starContainerStyle = {
  display: "flex",
};

const StarRating = ({
  maxRate = 5,
  color = "#fcc419",
  size = 48,
  className = "",
  messages = [],
  defaultRating = 0,
  setRate = () => {},
}) => {
  const textStyle = {
    display: "flex",
    gap: "12px",
    lineHeight: "1",
    margin: "0",
    fontSize: `${size / 1.5}px`,
    color: color,
  };

  const [rating, setRating] = useState(defaultRating);
  const [tempRate, setTempRate] = useState(rating);

  const handleRating = (i, event) => {
    // console.log(i);
    // console.log(event);
    setRating(i + 1);
    // getRating(rating);
    setRate(i + 1);
  };

  const handleChangingRate = (i, event) => {
    setTempRate(i + 1);
  };

  const handleMouseLeave = (i, event) => {
    setTempRate(rating);
  };

  return (
    <div style={containerStyle} className={className}>
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
      <p style={textStyle}>
        <span>{tempRate || ""}</span>
        <span>
          {tempRate !== 0 &&
            messages.length > 0 &&
            messages.length === maxRate &&
            `(${messages[tempRate - 1]})`}
        </span>
      </p>
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
  return (
    <CustomStar
      size={size}
      color={color}
      onMouseLeave={onMouseLeave}
      onChangingRate={onChangingRate}
      onRate={onRate}
      isEmpty={isEmpty}
    />
  );
};

StarRating.propTypes = {
  maxRate: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  messages: PropTypes.array,
  defaultRating: PropTypes.number,
  setRate: PropTypes.func,
  // setRate: PropTypes.func.isRequired,
};

export default StarRating;
