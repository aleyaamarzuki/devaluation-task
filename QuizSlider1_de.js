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
        variant="info"
        tooltipPlacement="top"
      />
      <span className={styles.alignleft}>nie</span>
      <span className={styles.aligncenter}>die Hälfte der Zeit</span>
      <span className={styles.alignright}>immer</span>
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
        variant="warning"
        tooltipPlacement="top"
      />
      <span className={styles.alignleft}>einfach nur raten</span>
      <span className={styles.aligncenter}>neutral</span>
      <span className={styles.alignright}>sehr sicher</span>
    </div>
  );
};

export const SliderAverQn = ({ callBackValue, initialValue }) => {
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
