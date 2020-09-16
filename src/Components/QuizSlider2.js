import React, { useState } from "react";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import RangeSlider from "react-bootstrap-range-slider";
import styles from "./style/taskStyle.module.css";

var initialMin = 35;
var initialMax = 65;

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

var initialStateContin1 = getRandomArbitrary(initialMin, initialMax);
var initialStateConf1 = getRandomArbitrary(initialMin, initialMax);

var initialStateContin2 = getRandomArbitrary(initialMin, initialMax);
var initialStateConf2 = getRandomArbitrary(initialMin, initialMax);

var initialStateContin3 = getRandomArbitrary(initialMin, initialMax);
var initialStateConf3 = getRandomArbitrary(initialMin, initialMax);

var initialStateContin4 = getRandomArbitrary(initialMin, initialMax);
var initialStateConf4 = getRandomArbitrary(initialMin, initialMax);

// var initialStateContin1 = 50;
// var initialStateConf1 = 50;
//
// var initialStateContin2 = 50;
// var initialStateConf2 = 50;
//
// var initialStateContin3 = 50;
// var initialStateConf3 = 50;
//
// var initialStateContin4 = 50;
// var initialStateConf4 = 50;

export const SliderContinQn1 = ({ callBackValue, initialValue }) => {
  const [quizContin, setValue] = useState(initialStateContin1);

  console.log("initial " + initialStateContin1);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizContin}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
          initialValue(initialStateContin1);
        }}
        tooltipLabel={(currentValue) => `${currentValue}%`}
        tooltip="on"
        variant="info"
      />
    </div>
  );
};

export const SliderConfQn1 = ({ callBackValue, initialValue }) => {
  const [quizConf, setValue] = useState(initialStateConf1);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizConf}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
          initialValue(initialStateConf1);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="on"
        variant="warning"
      />
    </div>
  );
};

export const SliderContinQn2 = ({ callBackValue, initialValue }) => {
  const [quizContin, setValue] = useState(initialStateContin2);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizContin}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
          initialValue(initialStateContin2);
        }}
        tooltipLabel={(currentValue) => `${currentValue}%`}
        tooltip="on"
        variant="info"
      />
    </div>
  );
};

export const SliderConfQn2 = ({ callBackValue, initialValue }) => {
  const [quizConf, setValue] = useState(initialStateConf2);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizConf}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
          initialValue(initialStateConf2);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="on"
        variant="warning"
      />
    </div>
  );
};

export const SliderContinQn3 = ({ callBackValue, initialValue }) => {
  const [quizContin, setValue] = useState(initialStateContin3);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizContin}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
          initialValue(initialStateContin3);
        }}
        tooltipLabel={(currentValue) => `${currentValue}%`}
        tooltip="on"
        variant="info"
      />
    </div>
  );
};

export const SliderConfQn3 = ({ callBackValue, initialValue }) => {
  const [quizConf, setValue] = useState(initialStateConf3);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizConf}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
          initialValue(initialStateConf3);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="on"
        variant="warning"
      />
    </div>
  );
};

export const SliderContinQn4 = ({ callBackValue, initialValue }) => {
  const [quizContin, setValue] = useState(initialStateContin4);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizContin}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
          initialValue(initialStateContin4);
        }}
        tooltipLabel={(currentValue) => `${currentValue}%`}
        tooltip="on"
        variant="info"
      />
    </div>
  );
};

export const SliderConfQn4 = ({ callBackValue, initialValue }) => {
  const [quizConf, setValue] = useState(initialStateConf4);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={quizConf}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          setValue(newValue);
          callBackValue(newValue);
          initialValue(initialStateConf4);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="on"
        variant="warning"
      />
    </div>
  );
};
