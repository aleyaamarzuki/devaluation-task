import React, { useState } from "react";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import RangeSlider from "react-bootstrap-range-slider";
import styles from "../style/taskStyle.module.css";

export const SliderContinQn = ({ callBackValue, initialValue }) => {
  const [quizContin, setValue] = useState(initialValue);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizContin}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
        }}
        tooltipLabel={(currentValue) => `${currentValue}%`}
        tooltip="on"
        tooltipPlacement="top"
        variant="info"
      />
      <span className={styles.alignleft}>never</span>
      <span className={styles.aligncenter}>half the time</span>
      <span className={styles.alignright}>always</span>
    </div>
  );
};

export const SliderConfQn = ({ callBackValue, initialValue }) => {
  const [quizConf, setValue] = useState(initialValue);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizConf}
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
      <span className={styles.alignleft}>very unconfident</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>very confident</span>
    </div>
  );
};

export const ExampleContin = () => {
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
        tooltipLabel={(currentValue) => `${currentValue}%`}
        tooltip="on"
        tooltipPlacement="top"
        variant="primary"
      />
      <span className={styles.alignleft}>never</span>
      <span className={styles.aligncenter}>half the time</span>
      <span className={styles.alignright}>always</span>
    </div>
  );
};

export const ExampleConf = () => {
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
        variant="danger"
      />
      <span className={styles.alignleft}>very unconfident</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>very confident</span>
    </div>
  );
};
