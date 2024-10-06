import { MouseEvent, useState } from "react";
import Star from "./Star";

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const starContainerStyle = {
  display: "flex",
};

type StarRatingPropsType = {
  maxRating?: number;
  color?: string;
  size?: number;
  className?: string;
  messages?: string[];
  defaultRate?: number;
  setRateState?: React.Dispatch<React.SetStateAction<number>>;
};

const StarRating = ({
  maxRating = 5,
  color = "#fcc419",
  size = 48,
  className = "",
  messages = [],
  defaultRate = 0,
  setRateState = () => {},
}: StarRatingPropsType) => {
  const textStyle = {
    lineHeight: "1",
    margin: "0",
    color: color,
    fontSize: `${size / 1.5}px`,
  };

  const [rate, setRate] = useState<number>(defaultRate);
  const [tempRate, setTempRate] = useState<number>(0);

  const handleRate = function (
    i: number,
    event: MouseEvent<HTMLSpanElement>
  ): void {
    setRate(i + 1);
    setRateState(i + 1);
    return;
  };

  const handleTempRate = function (i: number) {
    setTempRate(i + 1);
  };

  const handleResetTempRate = function () {
    setTempRate(0);
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={starContainerStyle}>
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            onRate={handleRate.bind(null, i)}
            isFull={
              tempRate
                ? i + 1 <= tempRate
                : !rate
                ? false
                : i + 1 <= rate
                ? true
                : false
            }
            onTempRate={handleTempRate.bind(null, i)}
            onResetTempRate={handleResetTempRate}
            color={color}
            size={size}
          />
        ))}
      </div>
      <p style={textStyle}>
        {messages.length > 0 && messages.length === maxRating
          ? messages[tempRate ? tempRate - 1 : rate - 1]
          : tempRate || rate || ""}
      </p>
    </div>
  );
};

export default StarRating;
