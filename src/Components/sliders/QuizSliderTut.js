import React, { useState } from "react";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import RangeSlider from "react-bootstrap-range-slider";
import styles from "../style/taskStyle.module.css";

export const SliderAver = ({ callBackValue, initialValue }) => {
  const [quizAver, setValue] = useState(initialValue);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizAver}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="on"
        tooltipPlacement="top"
        variant="danger"
      />
      <span className={styles.alignleft}>sehr unangenehm</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>sehr angenehm</span>
    </div>
  );
};

export const ExampleAver = () => {
  const [scale, setValue] = useState(50);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={scale}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="on"
        tooltipPlacement="top"
        variant="primary"
      />
      <span className={styles.alignleft}>sehr unangenehm</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>sehr angenehm</span>
    </div>
  );
};
