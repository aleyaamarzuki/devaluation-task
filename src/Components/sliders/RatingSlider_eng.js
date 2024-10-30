import React, { useState } from "react";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import RangeSlider from "react-bootstrap-range-slider";

import styles from "../style/taskStyle.module.css";

export const AverSlider = ({ callBackValue, initialValue }) => {
  const [averScale, setValue] = useState(initialValue);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={averScale}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="on"
        tooltipPlacement="top"
        variant="primary"
      />

      <span className={styles.alignleft}>very unpleasant</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>very pleasant</span>
    </div>
  );
};

export const ArouSlider = ({ callBackValue, initialValue2 }) => {
  const [arouScale, setValue] = useState(initialValue2);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={arouScale}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="on"
        tooltipPlacement="top"
        variant="warning"
      />
      <span className={styles.alignleft}>very sleepy</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>very awake</span>
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
      <span className={styles.alignleft}>very unpleasant</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>very pleasant</span>
    </div>
  );
};

export const ExampleArou = () => {
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
        variant="warning"
      />
      <span className={styles.alignleft}>very sleepy</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>very awake</span>
    </div>
  );
};
