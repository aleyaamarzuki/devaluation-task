import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import attenSound from "./sounds/task/IADSE_pianomed1360_5000.wav";
import fbSound from "./sounds/task/morriss_scream_1000.wav";
import avoidSound from "./sounds/task/bacigalupo_whitenoise_1000_minus10.wav";

import styles from "./style/taskStyle.module.css";

import { DATABASE_URL } from "./config";

import PlayButton from "./PlayButton";

import * as SliderPhasePrior from "./sliders/QuizSliderPrior.js";
import * as TrialRatingSlider from "./sliders/QuizRating.js";
import * as SliderPhase1 from "./sliders/QuizSlider1.js";
import * as SliderPhase2 from "./sliders/QuizSlider2.js";
import * as SliderPhase3 from "./sliders/QuizSlider3.js";
import * as SliderPhaseBreak from "./sliders/QuizSliderBreak.js";

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// GLOBAL FUNCTIONS

//return slider position
function logposition(value) {
  // position will be between 0 and 100
  var minp = 0;
  var maxp = 100;

  // The bounds of the slider
  var minv = Math.log(1);
  var maxv = Math.log(100);

  // calculate adjustt factor
  var scale = (maxv - minv) / (maxp - minp);

  return (Math.log(value) - minv) / scale + minp;
}

//shuffle
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.round(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//shuffling 2 or more arrays in the same order
var isArray =
  Array.isArray ||
  function (value) {
    return {}.toString.call(value) !== "[object Array]";
  };

function shuffleSame() {
  var arrLength = 0;
  var argsLength = arguments.length;
  var rnd, tmp, argsIndex;

  for (var index = 0; index < argsLength; index += 1) {
    if (!isArray(arguments[index])) {
      throw new TypeError("Argument is not an array.");
    }

    if (index === 0) {
      arrLength = arguments[0].length;
    }

    if (arrLength !== arguments[index].length) {
      throw new RangeError("Array lengths do not match.");
    }
  }

  while (arrLength) {
    rnd = Math.round(Math.random() * arrLength);
    arrLength -= 1;
    for (argsIndex = 0; argsIndex < argsLength; argsIndex += 1) {
      tmp = arguments[argsIndex][arrLength];
      arguments[argsIndex][arrLength] = arguments[argsIndex][rnd];
      arguments[argsIndex][rnd] = tmp;
    }
  }
}

// get the index for the first phase to count every 5th element for the task ratings
function getCountIndex(array) {
  var i;
  var count1 = 0;
  var count2 = 0;
  var count3 = 0;
  var count4 = 0;
  var count5 = 0;
  var count6 = 0;
  var stimCount = [];
  for (i = 0; i < array.length; i++) {
    if (array[i] === 0) {
      count1++;
      stimCount = stimCount.concat(count1);
    } else if (array[i] === 1) {
      count2++;
      stimCount = stimCount.concat(count2);
    } else if (array[i] === 2) {
      count3++;
      stimCount = stimCount.concat(count3);
    } else if (array[i] === 3) {
      count4++;
      stimCount = stimCount.concat(count4);
    } else if (array[i] === 4) {
      count5++;
      stimCount = stimCount.concat(count5);
    } else if (array[i] === 5) {
      count6++;
      stimCount = stimCount.concat(count6);
    }
  }
  return stimCount;
}

//multiples of a number (x , length)
function multiples(x, n) {
  const arr = [];
  for (let i = 1; i <= n; i++) arr.push(x * i);
  return arr;
}

//array of certain length within a certain range
function randomArray(length, min, max) {
  let range = max - min + 1;
  return Array.apply(null, Array(length)).map(function () {
    return Math.round(Math.random() * range) + min;
  });
}

/////////////////////////////////////////////////////////////////////////////////
// GLOBAL FUNCTIONS END

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// REACT COMPONENT START
class ExptTask extends React.Component {
  constructor(props) {
    super(props);

    /////////////////////////////////////////////////////////////////////////////////
    // SET COMPONENT VARIABLES
    const userID = this.props.location.state.userID;
    const date = this.props.location.state.date;
    const startTime = this.props.location.state.startTime;
    const fullAverVolume = this.props.location.state.fullAverVolume;
    const halfAverVolume = this.props.location.state.halfAverVolume;
    const attenVolume = this.props.location.state.attenVolume;

    const fix = this.props.location.state.fix;
    const counter = this.props.location.state.counter;
    const fbAver = this.props.location.state.fbAver;
    const fbSafe = this.props.location.state.fbSafe;
    const fbAvoid = this.props.location.state.fbAvoid;
    const astrodude = this.props.location.state.astrodude;
    const stim1 = this.props.location.state.stim1;
    const stim2 = this.props.location.state.stim2;
    const stim3 = this.props.location.state.stim3;
    const stim4 = this.props.location.state.stim4;
    const stim5 = this.props.location.state.stim5;
    const stim6 = this.props.location.state.stim6;

    // const userID = 1000;
    // const date = 1000;
    // const startTime = 1000;
    // const fullAverVolume = 70;
    // const halfAverVolume = 70;
    // const attenVolume = 70;

    //global trial var
    //total trial per part: 1) learning 2) avoidance 3) extinction
    // var totalTrial1 = 12;
    // var totalTrial2 = 24;
    // var totalTrial3 = 24;
    var totalTrial1 = 84;
    var totalTrial2 = 180;
    var totalTrial3 = 180;

    // Number of attention checks per tutorial
    // var attenCheck1 = 0;
    // var attenCheck2 = 0; //per block
    // var attenCheck3 = 0; //per block
    var attenCheck1 = 1; //
    var attenCheck2 = 1; // per block
    var attenCheck3 = 1; // per block

    var stimNum = 6;
    var totalBlock1 = 1;
    var totalBlock2 = 2;
    var totalBlock3 = 2;

    var trialPerBlockNum1 = totalTrial1 / totalBlock1; //20
    var trialPerBlockNum2 = totalTrial2 / totalBlock2; //30
    var trialPerBlockNum3 = totalTrial3 / totalBlock3; //30

    var trialPerStim1 = totalTrial1 / stimNum;
    var trialPerStim2 = totalTrial2 / stimNum;
    var trialPerStim3 = totalTrial3 / stimNum;

    var stim = [stim1, stim2, stim3, stim4, stim5, stim6];
    var fbProb = [0.8, 0.8, 0.2, 0.2, 0.5, 0.5];
    var stimCondTrack = Array.from(Array(stimNum), (_, i) => i);
    // eg. [2,3,1,4] means it is [stim1, stim2, stim3, stim4] and [0.2, 0.8, 0.8, 0.2]
    // this means that stimIndex 1, which is stim 1, has 0.2 fb prob
    // this is to keep track of which stim has which fb Prob
    //  shuffleSame(stim, fbProb, stimCondTrack);
    shuffleSame(fbProb, stimCondTrack);

    fbProb = fbProb.filter(function (val) {
      return val !== undefined;
    });
    stimCondTrack = stimCondTrack.filter(function (val) {
      return val !== undefined;
    });

    //////////////////////////////////
    //PHASE ONE STIM INDEX AND OUTCOME

    var stim1Indx1 = Array(Math.round(trialPerStim1)).fill(0); // 0.2
    var stim2Indx1 = Array(Math.round(trialPerStim1)).fill(1); // 0.8
    var stim3Indx1 = Array(Math.round(trialPerStim1)).fill(2); // 0.8
    var stim4Indx1 = Array(Math.round(trialPerStim1)).fill(3); // 0.2
    var stim5Indx1 = Array(Math.round(trialPerStim1)).fill(4); // 0.5
    var stim6Indx1 = Array(Math.round(trialPerStim1)).fill(5); // 0.5

    var stim1outcome = shuffle(
      Array(Math.round(fbProb[0] * trialPerStim1))
        .fill(1)
        .concat(
          Array(trialPerStim1 - Math.round(fbProb[0] * trialPerStim1)).fill(0)
        )
    );

    var stim2outcome = shuffle(
      Array(Math.round(fbProb[1] * trialPerStim1))
        .fill(1)
        .concat(
          Array(trialPerStim1 - Math.round(fbProb[1] * trialPerStim1)).fill(0)
        )
    );

    var stim3outcome = shuffle(
      Array(Math.round(fbProb[2] * trialPerStim1))
        .fill(1)
        .concat(
          Array(trialPerStim1 - Math.round(fbProb[2] * trialPerStim1)).fill(0)
        )
    );

    var stim4outcome = shuffle(
      Array(Math.round(fbProb[3] * trialPerStim1))
        .fill(1)
        .concat(
          Array(trialPerStim1 - Math.round(fbProb[3] * trialPerStim1)).fill(0)
        )
    );

    var stim5outcome = shuffle(
      Array(Math.round(fbProb[4] * trialPerStim1))
        .fill(1)
        .concat(
          Array(trialPerStim1 - Math.round(fbProb[4] * trialPerStim1)).fill(0)
        )
    );

    var stim6outcome = shuffle(
      Array(Math.round(fbProb[5] * trialPerStim1))
        .fill(1)
        .concat(
          Array(trialPerStim1 - Math.round(fbProb[5] * trialPerStim1)).fill(0)
        )
    );

    //////////////////////////////////
    //PHASE TWO STIM INDEX AND OUTCOME

    var stim1Indx2 = Array(Math.round(trialPerStim2)).fill(0);
    var stim2Indx2 = Array(Math.round(trialPerStim2)).fill(1);
    var stim3Indx2 = Array(Math.round(trialPerStim2)).fill(2);
    var stim4Indx2 = Array(Math.round(trialPerStim2)).fill(3);
    var stim5Indx2 = Array(Math.round(trialPerStim2)).fill(4);
    var stim6Indx2 = Array(Math.round(trialPerStim2)).fill(5);

    var stim1outcome2 = shuffle(
      Array(Math.round(fbProb[0] * trialPerStim2))
        .fill(1)
        .concat(
          Array(trialPerStim2 - Math.round(fbProb[0] * trialPerStim2)).fill(0)
        )
    );

    var stim2outcome2 = shuffle(
      Array(Math.round(fbProb[1] * trialPerStim2))
        .fill(1)
        .concat(
          Array(trialPerStim2 - Math.round(fbProb[1] * trialPerStim2)).fill(0)
        )
    );

    var stim3outcome2 = shuffle(
      Array(Math.round(fbProb[2] * trialPerStim2))
        .fill(1)
        .concat(
          Array(trialPerStim2 - Math.round(fbProb[2] * trialPerStim2)).fill(0)
        )
    );

    var stim4outcome2 = shuffle(
      Array(Math.round(fbProb[3] * trialPerStim2))
        .fill(1)
        .concat(
          Array(trialPerStim2 - Math.round(fbProb[3] * trialPerStim2)).fill(0)
        )
    );

    var stim5outcome2 = shuffle(
      Array(Math.round(fbProb[4] * trialPerStim2))
        .fill(1)
        .concat(
          Array(trialPerStim2 - Math.round(fbProb[4] * trialPerStim2)).fill(0)
        )
    );

    var stim6outcome2 = shuffle(
      Array(Math.round(fbProb[5] * trialPerStim2))
        .fill(1)
        .concat(
          Array(trialPerStim2 - Math.round(fbProb[5] * trialPerStim2)).fill(0)
        )
    );

    //////////////////////////////////
    //PHASE THREE STIM INDEX AND OUTCOME
    var stim1Indx3 = Array(Math.round(trialPerStim3)).fill(0);
    var stim2Indx3 = Array(Math.round(trialPerStim3)).fill(1);
    var stim3Indx3 = Array(Math.round(trialPerStim3)).fill(2);
    var stim4Indx3 = Array(Math.round(trialPerStim3)).fill(3);
    var stim5Indx3 = Array(Math.round(trialPerStim3)).fill(4);
    var stim6Indx3 = Array(Math.round(trialPerStim3)).fill(5);

    var stim1outcome3 = shuffle(
      Array(Math.round(fbProb[0] * trialPerStim3))
        .fill(1)
        .concat(
          Array(trialPerStim3 - Math.round(fbProb[0] * trialPerStim3)).fill(0)
        )
    );

    var stim2outcome3 = shuffle(
      Array(Math.round(fbProb[1] * trialPerStim3))
        .fill(1)
        .concat(
          Array(trialPerStim3 - Math.round(fbProb[1] * trialPerStim3)).fill(0)
        )
    );

    var stim3outcome3 = shuffle(
      Array(Math.round(fbProb[2] * trialPerStim3))
        .fill(1)
        .concat(
          Array(trialPerStim3 - Math.round(fbProb[2] * trialPerStim3)).fill(0)
        )
    );

    var stim4outcome3 = shuffle(
      Array(Math.round(fbProb[3] * trialPerStim3))
        .fill(1)
        .concat(
          Array(trialPerStim3 - Math.round(fbProb[3] * trialPerStim3)).fill(0)
        )
    );

    var stim5outcome3 = shuffle(
      Array(Math.round(fbProb[4] * trialPerStim3))
        .fill(1)
        .concat(
          Array(trialPerStim3 - Math.round(fbProb[4] * trialPerStim3)).fill(0)
        )
    );

    var stim6outcome3 = shuffle(
      Array(Math.round(fbProb[5] * trialPerStim3))
        .fill(1)
        .concat(
          Array(trialPerStim3 - Math.round(fbProb[5] * trialPerStim3)).fill(0)
        )
    );

    ////////////////////////////////
    // PULL ALL TOGETHER
    var stimIndexPhase1 = stim1Indx1.concat(
      stim2Indx1.concat(
        stim3Indx1.concat(stim4Indx1.concat(stim5Indx1.concat(stim6Indx1)))
      )
    );

    var stimOutcomePhase1 = stim1outcome.concat(
      stim2outcome.concat(
        stim3outcome.concat(
          stim4outcome.concat(stim5outcome.concat(stim6outcome))
        )
      )
    );

    var stimIndexPhase2 = stim1Indx2.concat(
      stim2Indx2.concat(
        stim3Indx2.concat(stim4Indx2.concat(stim5Indx2.concat(stim6Indx2)))
      )
    );
    var stimOutcomePhase2 = stim1outcome2.concat(
      stim2outcome2.concat(
        stim3outcome2.concat(
          stim4outcome2.concat(stim5outcome2.concat(stim6outcome2))
        )
      )
    );

    var stimIndexPhase3 = stim1Indx3.concat(
      stim2Indx3.concat(
        stim3Indx3.concat(stim4Indx3.concat(stim5Indx3.concat(stim6Indx3)))
      )
    );
    var stimOutcomePhase3 = stim1outcome3.concat(
      stim2outcome3.concat(
        stim3outcome3.concat(
          stim4outcome3.concat(stim5outcome3.concat(stim6outcome3))
        )
      )
    );

    stimIndexPhase1 = stimIndexPhase1.filter(function (val) {
      return val !== undefined;
    });
    stimIndexPhase2 = stimIndexPhase2.filter(function (val) {
      return val !== undefined;
    });
    stimIndexPhase3 = stimIndexPhase3.filter(function (val) {
      return val !== undefined;
    });

    stimOutcomePhase1 = stimOutcomePhase1.filter(function (val) {
      return val !== undefined;
    });
    stimOutcomePhase2 = stimOutcomePhase2.filter(function (val) {
      return val !== undefined;
    });
    stimOutcomePhase3 = stimOutcomePhase3.filter(function (val) {
      return val !== undefined;
    });

    // console.log("stimIndexPhase1: " + stimIndexPhase1);
    // console.log("stimOutcomePhase1: " + stimOutcomePhase1);
    // console.log("stimIndexPhase2: "+ stimIndexPhase2);
    // console.log("stimOutcomePhase2: "+ stimOutcomePhase2);
    // console.log("stimIndexPhase3: "+ stimIndexPhase3);
    // console.log("stimOutcomePhase3: "+ stimOutcomePhase3);

    shuffleSame(stimIndexPhase1, stimOutcomePhase1);
    shuffleSame(stimIndexPhase2, stimOutcomePhase2);
    shuffleSame(stimIndexPhase3, stimOutcomePhase3);

    //  console.log("ShuffStimIndexPhase1: " + stimIndexPhase1);
    //  console.log("ShuffStimOutcomePhase1: " + stimOutcomePhase1);

    ////////////////////////////////
    // INDEX MINUS ONE

    stimIndexPhase1 = stimIndexPhase1.filter(function (val) {
      return val !== undefined;
    });
    stimIndexPhase2 = stimIndexPhase2.filter(function (val) {
      return val !== undefined;
    });
    stimIndexPhase3 = stimIndexPhase3.filter(function (val) {
      return val !== undefined;
    });

    stimOutcomePhase1 = stimOutcomePhase1.filter(function (val) {
      return val !== undefined;
    });
    stimOutcomePhase2 = stimOutcomePhase2.filter(function (val) {
      return val !== undefined;
    });
    stimOutcomePhase3 = stimOutcomePhase3.filter(function (val) {
      return val !== undefined;
    });

    var stimIndex1 = stimIndexPhase1;
    var stimIndex2 = stimIndexPhase2;
    var stimIndex3 = stimIndexPhase3;

    var ratingCount = getCountIndex(stimIndex1);

    /////////////////////////////////////////////////////////////
    // Define which trial has the attention check

    var padding = [0, 0, 0, 0];
    //Make sure there is padding between the attention checks
    var attenIndex1Temp = shuffle(
      Array(attenCheck1)
        .fill(1)
        .concat(Array(totalTrial1 - attenCheck1 - padding.length * 2).fill(0))
    );

    var attenIndex2Temp1 = shuffle(
      Array(attenCheck2)
        .fill(1)
        .concat(
          Array(totalTrial2 / 2 - attenCheck2 - padding.length * 2).fill(0)
        )
    );
    var attenIndex2Temp2 = shuffle(
      Array(attenCheck2)
        .fill(1)
        .concat(
          Array(totalTrial2 / 2 - attenCheck2 - padding.length * 2).fill(0)
        )
    );

    var attenIndex3Temp1 = shuffle(
      Array(attenCheck3)
        .fill(1)
        .concat(
          Array(totalTrial3 / 2 - attenCheck3 - padding.length * 2).fill(0)
        )
    );
    var attenIndex3Temp2 = shuffle(
      Array(attenCheck3)
        .fill(1)
        .concat(
          Array(totalTrial3 / 2 - attenCheck3 - padding.length * 2).fill(0)
        )
    );
    var attenIndex1 = padding.concat(attenIndex1Temp.concat(padding));

    var attenIndex2Temp3 = padding.concat(attenIndex2Temp1.concat(padding));
    var attenIndex2Temp4 = padding.concat(attenIndex2Temp2.concat(padding));
    var attenIndex2 = attenIndex2Temp4.concat(attenIndex2Temp3);

    var attenIndex3Temp3 = padding.concat(attenIndex3Temp1.concat(padding));
    var attenIndex3Temp4 = padding.concat(attenIndex3Temp2.concat(padding));
    var attenIndex3 = attenIndex3Temp4.concat(attenIndex3Temp3);

    attenIndex1 = attenIndex1.filter(function (val) {
      return val !== undefined;
    });
    attenIndex2 = attenIndex2.filter(function (val) {
      return val !== undefined;
    });

    attenIndex3 = attenIndex3.filter(function (val) {
      return val !== undefined;
    });

    //////////////////////////////////////////////////////////////////////////////////
    // the multplies of 3 where every rating comes on in the first phase
    var numMulti = Math.floor(trialPerStim1 / 3); // 20/3 = 6.67 = 6 now is 14/3 = 4.667
    var ratingArray = multiples(3, numMulti);
    //  var ratingArray = ratingArray.splice(0, ratingArray.length - 1); // use this if we have the last rating on the end of the entire phase

    // sliderKeys
    //Phase 1: 4 stimuli, 20 ratings each...6 ratins in total before the very final one
    var continSliderKeysPhaseTrial = Array.from(
      Array(numMulti * stimNum),
      (_, i) => i + 1
    ); // [1,2,3,4]
    var confSliderKeysPhaseTrial = Array.from(
      Array(numMulti * stimNum),
      (_, i) => i + 10
    ); // [10,20,30,40]

    //Phase 1 Prior: 4 stimuli
    var continSliderKeysPhase1Prior = Array.from(
      Array(stimNum),
      (_, i) => i + 1
    ); // [1,2,3,4]
    var confSliderKeysPhase1Prior = Array.from(
      Array(stimNum),
      (_, i) => i + 10
    ); // [10,20,30,40]

    //Phase 1: 4 stimuli
    var continSliderKeysPhase1 = Array.from(Array(stimNum), (_, i) => i + 1); // [1,2,3,4]
    var confSliderKeysPhase1 = Array.from(Array(stimNum), (_, i) => i + 10); // [10,20,30,40]

    //Phase 2: 4 stimuli
    var continSliderKeysPhase2 = Array.from(Array(stimNum), (_, i) => i + 1); // [1,2,3,4]
    var confSliderKeysPhase2 = Array.from(Array(stimNum), (_, i) => i + 10); // [10,20,30,40]

    //Phase 3: 4 stimuli
    var continSliderKeysPhase3 = Array.from(Array(stimNum), (_, i) => i + 1); // [1,2,3,4]
    var confSliderKeysPhase3 = Array.from(Array(stimNum), (_, i) => i + 10); // [10,20,30,40]

    // for quiz in break
    var continSliderKeysPhase2Break = Array.from(
      Array(stimNum),
      (_, i) => i + 1
    ); // [1,2,3,4]
    var confSliderKeysPhase2Break = Array.from(
      Array(stimNum),
      (_, i) => i + 10
    ); // [10,20,30,40]
    var continSliderKeysPhase3Break = Array.from(
      Array(stimNum),
      (_, i) => i + 1000
    ); // [1,2,3,4]
    var confSliderKeysPhase3Break = Array.from(
      Array(stimNum),
      (_, i) => i + 10000
    ); // [10,20,30,40]

    var averSliderKeys = [100, 200, 300]; // only 3 sounds

    //these are the preset slider defaults
    var qnNumTotalQuizConfContin = 6; // contin for 6 planets
    var qnNumTotalQuizAver = 3; //sound rating for 3 sounds

    //the rating trials
    var confRatingDefRate = randomArray(
      numMulti * qnNumTotalQuizConfContin,
      35,
      65
    );
    var continRatingDefRate = randomArray(
      numMulti * qnNumTotalQuizConfContin,
      35,
      65
    );

    //the quizes
    var confRatingDef1Prior = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef1Prior = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var averRatingDef1 = randomArray(qnNumTotalQuizAver, 35, 65);
    var confRatingDef1 = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef1 = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var averRatingDef2 = randomArray(qnNumTotalQuizAver, 35, 65);
    var confRatingDef2 = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef2 = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var confRatingDef2Break = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef2Break = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var averRatingDef3 = randomArray(qnNumTotalQuizAver, 35, 65);
    var confRatingDef3 = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef3 = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var confRatingDef3Break = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef3Break = randomArray(qnNumTotalQuizConfContin, 35, 65);

    /////////////////////////////////////////////////////////////////////////////////
    // SET COMPONENT STATES
    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,
      taskSessionTry: 1,
      taskSession: 1,

      totalTrialLog: [totalTrial1, totalTrial2, totalTrial3],
      trialPerBlockNumLog: [
        trialPerBlockNum1,
        trialPerBlockNum2,
        trialPerBlockNum3,
      ],

      stimIndexLog: [stimIndex1, stimIndex2, stimIndex3],
      attenIndexLog: [attenIndex1, attenIndex2, attenIndex3],
      totalBlockLog: [totalBlock1, totalBlock2, totalBlock3],
      attenCheckAllLog: [attenCheck1, attenCheck2, attenCheck3],

      outcomeLog: [stimOutcomePhase1, stimOutcomePhase2, stimOutcomePhase3],
      outcome: stimOutcomePhase1,

      continSliderKeysPriorLog: continSliderKeysPhase1Prior,
      confSliderKeysPriorLog: confSliderKeysPhase1Prior,

      continSliderKeysLog: [
        continSliderKeysPhaseTrial,
        continSliderKeysPhase1,
        continSliderKeysPhase2,
        continSliderKeysPhase3,
      ],

      confSliderKeysLog: [
        confSliderKeysPhaseTrial,
        confSliderKeysPhase1,
        confSliderKeysPhase2,
        confSliderKeysPhase3,
      ],

      averSliderKeysLog: [averSliderKeys, averSliderKeys, averSliderKeys],

      continSliderKeysBreakLog: [
        continSliderKeysPhase2Break,
        continSliderKeysPhase3Break,
      ],

      confSliderKeysBreakLog: [
        confSliderKeysPhase2Break,
        confSliderKeysPhase3Break,
      ],

      continSliderKeys: [],
      confSliderKeys: [],
      averSliderKeys: [],

      totalTrial: totalTrial1,
      trialPerBlockNum: trialPerBlockNum1,
      devaluedBlock: 0,

      totalBlock: totalBlock1,
      stimIndex: stimIndex1,
      attenIndex: attenIndex1,
      stimCondTrack: stimCondTrack,
      stimCondTrackDevalIndex: [],
      ratingCount: ratingCount, // [1,2,1,2,1,1,3,2...]
      ratingArray: ratingArray, // [5,10,15,20]
      varPlayColour: null,

      // this is shuffled every quiz section and declared with varPlayColour
      varPlayColourArray: [
        "#008000",
        "#395756",
        "#4f5d75",
        "#b6c8a9",
        "#188fa7",
        "#7261a3",
      ],

      //this tracks the index for stim fbprob shuffling
      //in other words, for devalution, 1 high 1 low devalue, use index 0 and 2
      responseKey: 0,
      attenLag: 5000,
      timeLag: [500, 750, 1000],
      fbProb: fbProb,
      respProb: 0.2,
      fbProbTrack: 0,
      randProb: 0,
      blockNum: 1,

      trialNum: 0,
      ratingNum: 0, // tracks how many rating trials have happened
      trialinBlockNum: 0,
      imageBorder: false,
      stim: stim,
      fb: [fbAver, fbSafe, fbAvoid],
      currentInstructionText: 1,

      fbSound: fbSound,
      avoidSound: avoidSound,
      attenSound: attenSound,
      showImage: fix,

      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      reactionTime: 0,
      fbTime: 0,

      attenTrial: 0,
      attenTime: 0,
      attenCheckTime: 0,
      attenCheckKey: 0,
      attenPass: true, // change this to change the percentage which they have to pass

      playAttCheck: false,
      playFbSound: false,

      playFb: null,

      stimIndexCondIndiv: null,
      attenIndexIndiv: null,

      // devalue: false,
      instructScreen: true,
      ratingTrialScreen: false,
      quizScreen: false,
      currentScreen: false, // false for break, true for task
      btnDis: true,

      quizContin: null,
      quizConf: null,
      quizAver: null,
      quizTime: 0,
      quizQnRT: 0,
      quizQnNum: 1,
      quizContinDefault: null,
      quizConfDefault: null,
      quizAverDefault: null,
      playNum: 0,
      quizSoundArray: [fbSound, avoidSound, attenSound],
      quizSoundLabelArray: ["fb", "avoid", "atten"],
      quizSoundVolArray: [fullAverVolume, halfAverVolume, attenVolume],
      quizStimIndexArray: [0, 1, 2, 3, 4, 5],
      quizStimIndex: null,
      quizSound: null,
      quizSoundLabel: null,
      quizSoundVol: null,
      quizFbProb: null,
      volume: 0,

      fullAverVolume: fullAverVolume,
      halfAverVolume: halfAverVolume,
      attenVolume: attenVolume,

      devalueQuizHistory: [],
      devalueIdx: 0,
      imageBorder1: false,
      imageBorder2: false,
      imageBorder3: false,
      imageBorder4: false,
      imageBorder5: false,
      imageBorder6: false,
      quizStimDevalue: [false, false, false, false, false, false],

      averRatingDefLog: [averRatingDef1, averRatingDef2, averRatingDef3],
      confRatingDefLog: [confRatingDef1, confRatingDef2, confRatingDef3],
      continRatingDefLog: [
        continRatingDef1,
        continRatingDef2,
        continRatingDef3,
      ],

      confRatingBreakDefLog: [confRatingDef2Break, confRatingDef3Break],
      continRatingBreakDefLog: [continRatingDef2Break, continRatingDef3Break],

      confRatingPriorDefLog: confRatingDef1Prior,
      continRatingPriorDefLog: continRatingDef1Prior,

      // this is the general overall rates
      averRatingDef: averRatingDef1,
      confRatingDef: confRatingDef1,
      continRatingDef: continRatingDef1,

      // this is the rating trial
      confRatingDefRate: confRatingDefRate,
      continRatingDefRate: continRatingDefRate,

      //data to pass on for bonus?
      journeyOneContin: [],
      journeyOneContinStim: [],
      journeyOneContinFbProb: [],

      journeyTwoContin: [],
      journeyTwoContinStim: [],
      journeyTwoContinFbProb: [],

      journeyThreeContin: [],
      journeyThreeContinStim: [],
      journeyThreeContinFbProb: [],

      checkPoint: null,
      stimNum: 6,
      soundNum: 3,

      prior: false,

      fix: fix,
      counter: counter,
      fbAver: fbAver,
      fbSafe: fbSafe,
      fbAvoid: fbAvoid,
      astrodude: astrodude,
      stim1: stim1,
      stim2: stim2,
      stim3: stim3,
      stim4: stim4,
      stim5: stim5,
      stim6: stim6,

      debug: false,
    };
    /////////////////////////////////////////////////////////////////////////////////
    // END COMPONENT STATE

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    /////////////////////////////////////////////////////////////////////////////////
    // BIND COMPONENT FUNCTIONS
    this.handleInstructLocal = this.handleInstructLocal.bind(this);
    this.handleBegin = this.handleBegin.bind(this);
    this.quizNext = this.quizNext.bind(this);
    this.sessionProceed = this.sessionProceed.bind(this);
    this.togglePlay = this.togglePlay.bind(this);

    this.audioAtten = new Audio(this.state.attenSound);
    this.audioFb = new Audio(this.state.fbSound);
    this.audioAvoid = new Audio(this.state.avoidSound);

    this.audioAtten.volume = this.state.attenVolume / 100;
    this.audioFb.volume = this.state.fullAverVolume / 100;
    this.audioAvoid.volume = this.state.halfAverVolume / 100;

    this.ratingTrial = this.ratingTrial.bind(this);
    this.quizZero = this.quizZero.bind(this);
    this.quizOne = this.quizOne.bind(this);
    this.quizTwo = this.quizTwo.bind(this);
    this.quizThree = this.quizThree.bind(this);
    this.devalueQuiz = this.devalueQuiz.bind(this);

    this.saveCond = this.saveCond.bind(this);

    this.handleDebugKeyLocal = this.handleDebugKeyLocal.bind(this);
  }
  /////////////////////////////////////////////////////////////////////////////////
  // END COMPONENT PROPS

  // This toggles play for audio
  togglePlay() {
    if (this.state.active === false) {
      var playNum = this.state.playNum + 1;
      this.setState({ playNum: playNum });
    }

    this.setState({ active: !this.state.active });
  }

  // This handles instruction screen within the component
  handleInstructLocal(key_pressed) {
    var curText = this.state.currentInstructionText;
    var whichButton = key_pressed;

    if (this.state.taskSession === 1) {
      if (whichButton === 4 && curText > 1 && curText !== 5) {
        this.setState({ currentInstructionText: curText - 1 });
      } else if (whichButton === 5 && curText < 6 && curText !== 4) {
        this.setState({ currentInstructionText: curText + 1 });
      }
    } else {
      if (whichButton === 4 && curText > 1) {
        this.setState({ currentInstructionText: curText - 1 });
      } else if (whichButton === 5 && curText < 4) {
        this.setState({ currentInstructionText: curText + 1 });
      }
    }
  }

  // Handles the spacebar key primarily to begin sessions
  handleBegin(key_pressed) {
    var whichButton = key_pressed;
    var quizTime;
    ////////////////////////////////////////////////////////////////////////////////////////
    if (this.state.instructScreen === true) {
      if (this.state.taskSession === 1) {
        if (this.state.currentInstructionText === 4 && whichButton === 10) {
          // log the devlaution quiz
          quizTime = Math.round(performance.now());

          var quizStimIndex = this.state.quizStimIndexArray;

          shuffle(quizStimIndex);

          quizStimIndex = quizStimIndex.filter(function (val) {
            return val !== undefined;
          });

          var continSliderKeys = this.state.continSliderKeysPriorLog;
          var confSliderKeys = this.state.confSliderKeysPriorLog;

          // Defaults for the ratings
          var quizContinDefault = this.state.continRatingPriorDefLog[0]; //firstQn
          var quizConfDefault = this.state.confRatingPriorDefLog[0]; //firstQn

          this.setState({
            quizStimIndex: quizStimIndex,
            currentScreen: false,
            instructScreen: true,
            quizScreen: true,
            quizTime: quizTime,
            btnDis: true,
            continSliderKeys: continSliderKeys,
            confSliderKeys: confSliderKeys,
            quizContinDefault: quizContinDefault,
            quizConfDefault: quizConfDefault,
            checkPoint: "phaseOnePrior",
            quizQnNum: 1,
            prior: true,
          });
        } else if (
          this.state.currentInstructionText === 6 &&
          whichButton === 10
        ) {
          setTimeout(
            function () {
              this.sessionBegin();
            }.bind(this),
            0
          );
        }
      } else if (this.state.taskSession === 2) {
        if (whichButton === 10) {
          setTimeout(
            function () {
              this.sessionBegin();
            }.bind(this),
            0
          );
        }
      } else if (this.state.taskSession === 3) {
        if (this.state.currentInstructionText === 1 && whichButton === 10) {
          // log the devlaution quiz
          quizTime = Math.round(performance.now());
          this.setState({
            quizTime: quizTime,
            quizScreen: true,
            instructScreen: true,
            currentScreen: false,
            prior: false,
          });
        } else if (
          this.state.currentInstructionText === 2 &&
          whichButton === 10
        ) {
          setTimeout(
            function () {
              this.sessionBegin();
            }.bind(this),
            0
          );
        } else if (
          this.state.currentInstructionText === 3 &&
          whichButton === 10
        ) {
          this.setState({
            currentInstructionText: 1,
            quizScreen: false,
            instructScreen: true,
            currentScreen: false,
          });
        }
      }
    } else if (this.state.instructScreen === false) {
      if (this.state.attenPass === false && whichButton === 10) {
        setTimeout(
          function () {
            this.taskRestart();
          }.bind(this),
          0
        );
      } else if (this.state.attenPass === true && whichButton === 10) {
        setTimeout(
          function () {
            this.blockProceed();
          }.bind(this),
          0
        );
      }
    }
  }

  // handle beginkey key_pressed
  _handleBeginKey = (event) => {
    var key_pressed;

    switch (event.keyCode) {
      case 32:
        //    this is sapcebar
        key_pressed = 10;
        this.handleBegin(key_pressed);
        break;
      case 39:
        //    this is left arrow
        key_pressed = 5;
        this.handleBegin(key_pressed);
        break;
      default:
    }
  };

  // handle instruct key_pressed
  _handleInstructKey = (event) => {
    var key_pressed;

    switch (event.keyCode) {
      case 37:
        //    this is left arrow
        key_pressed = 4;
        this.handleInstructLocal(key_pressed);
        break;
      case 39:
        //    this is right arrow
        key_pressed = 5;
        this.handleInstructLocal(key_pressed);
        break;
      default:
    }
  };

  pressAvoid(key_pressed, time_pressed) {
    //Check first whether it is a valid press
    var reactionTime =
      time_pressed -
      (this.state.trialTime + this.state.fixTime + this.state.stimTime);

    this.setState({
      responseKey: key_pressed,
      imageBorder: true,
      reactionTime: reactionTime,
    });
  }

  pressAttenCheck(atten_pressed, atten_time_pressed) {
    var attenCheckTime = atten_time_pressed - this.state.attenTime;
    this.audioAtten.pause();
    this.setState({
      attenCheckKey: atten_pressed,
      attenCheckTime: attenCheckTime,
      playAttCheck: false, //stop
    });

    setTimeout(
      function () {
        this.saveAttenData();
      }.bind(this),
      5
    );
  }

  // handle key key_pressed
  _handleResponseKey = (event) => {
    var key_pressed;
    var key_time_pressed;

    switch (event.keyCode) {
      case 32:
        //    this is SPACEBAR
        key_pressed = 1;
        key_time_pressed = Math.round(performance.now());
        this.pressAvoid(key_pressed, key_time_pressed);
        break;
      default:
    }
  };

  //this is to check if i pressed the attention check keys
  _handleAttenCheckKey = (event) => {
    var atten_pressed;
    var atten_time_pressed;

    switch (event.keyCode) {
      // case 79: //o key
      case 87: //W key
        atten_pressed = 9;
        atten_time_pressed = Math.round(performance.now());
        this.pressAttenCheck(atten_pressed, atten_time_pressed);
        break;
      default:
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  // ATTENCHECK
  attenCount() {
    //this is after X seconds, if
    if (this.state.playAttCheck === false) {
      //they successfully stopped the noise
      this.setState({
        attenPass: true, //jut continue on
      });
    } else if (this.state.playAttCheck === true) {
      //they did not successfully stop the noise
      this.audioAtten.pause(); //stop the noise and go to the kick out screen
      // console.log("Fail atten check.");
      this.setState({
        attenPass: false,
        currentScreen: false,
        instructScreen: false,
      });
    }
  }

  saveAttenData() {
    var userID = this.state.userID;
    var volumeNotLog = logposition(this.state.attenVolume);
    let attenBehaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      tutorialSession: null,
      tutorialSessionTry: null,
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,
      attenTrial: this.state.attenTrial,
      attenTime: this.state.attenTime,
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,
      playAttCheck: this.state.playAttCheck,
      volume: this.state.attenVolume,
      volumeNotLog: volumeNotLog,
    };

    try {
      fetch(`${DATABASE_URL}/atten_data/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attenBehaviour),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    console.log(JSON.stringify(attenBehaviour));
  }

  renderAtten() {
    document.addEventListener("keyup", this._handleAttenCheckKey); // change this later
    var attenTrial = this.state.trialNum;
    var attenTime = Math.round(performance.now());

    this.setState({
      attenTrial: attenTrial,
      attenTime: attenTime,
      playAttCheck: true,
      volume: this.state.attenVolume,
    });

    this.audioAtten.load();
    this.audioAtten.play();

    setTimeout(
      function () {
        this.attenCount();
      }.bind(this),
      this.state.attenLag
    );
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  // SET TRIAL COMPONENTS - FIXATION
  renderFix() {
    if (this.state.currentScreen === true) {
      //if trial within the block hasn't been reached, continue
      // if trial 1, and total trial in blocknum is 10...
      var trialNum = this.state.trialNum + 1;
      var trialinBlockNum = this.state.trialinBlockNum + 1;

      var trialTime = Math.round(performance.now());
      this.setState({
        trialNum: trialNum,
        trialinBlockNum: trialinBlockNum,
        trialTime: trialTime,
        showImage: this.state.fix,
      });

      // console.log("Trial no: " + trialNum);
      // console.log("Total Trial: " + this.state.totalTrial);
      // console.log("Block Trial no: " + this.state.trialinBlockNum);

      // This is for the attentionCheck trials
      if (this.state.attenIndex[this.state.trialNum - 1] === 1) {
        setTimeout(
          function () {
            this.renderAtten();
          }.bind(this),
          0
        );
      }

      setTimeout(
        function () {
          this.renderStim();
        }.bind(this),
        this.state.timeLag[0]
      );
    } else {
      console.log("Fixation NOT RENDERED as currentScreen is false");
    }
  }

  /////////////////////////////////////////////////////////////////////////////////
  // SET TRIAL COMPONENTS - STIMULI
  renderStim() {
    if (this.state.currentScreen === true) {
      //if trials are still ongoing

      // resposne key won't work for the first session
      if (this.state.taskSession > 1) {
        document.addEventListener("keyup", this._handleResponseKey);
      }
      document.addEventListener("keyup", this._handleAttenCheckKey);

      var fixTime = Math.round(performance.now()) - this.state.trialTime;

      this.setState({
        showImage: this.state.stim[
          this.state.stimIndex[this.state.trialNum - 1]
        ],
        fixTime: fixTime,
      });

      // console.log(
      //   "Full Stim Index: " +
      //     this.state.stimIndexLog +
      //     " Stim Index : " +
      //     this.state.stimIndex[this.state.trialNum - 1]
      // );

      setTimeout(
        function () {
          this.renderFb();
        }.bind(this),
        this.state.timeLag[1]
      );
    } else {
      console.log("Stimuli NOT RENDERED as currentScreen is false");
    }
  }

  /////////////////////////////////////////////////////////////////////////////////
  // SET TRIAL COMPONENTS - FEEDBACK
  renderFb() {
    if (this.state.currentScreen === true) {
      if (this.state.taskSession > 1) {
        document.removeEventListener("keyup", this._handleResponseKey);
      }
      //if trials are still ongoing

      //iF USE RANDPROB... ELSE?
      var randProb = this.state.outcome[this.state.trialNum - 1];
      //  randProb = Math.random();

      var stimTime =
        Math.round(performance.now()) -
        (this.state.trialTime + this.state.fixTime);

      this.setState({
        imageBorder: false,
        stimTime: stimTime,
        fbProbTrack: this.state.fbProb[
          this.state.stimIndex[this.state.trialNum - 1]
        ],
      });

      // console.log("Outcome Indx: " + randProb);
      // console.log(
      //   "Fb Prob: " +
      //     this.state.fbProb[this.state.stimIndex[this.state.trialNum - 1]]
      // );

      if (
        this.state.attenIndex[this.state.trialNum - 1] === 0 &&
        this.state.responseKey === 1
      ) {
        // If participant chooses to avoid on a non-attention trial
        // then milder sound
        this.audioAvoid.load(); //to make sure it starts from the beginning
        this.audioAvoid.play();

        this.setState({
          showImage: this.state.fb[2],
          playFb: this.state.avoidSound,
          playFbSound: true,
          randProb: randProb,
          volume: this.state.halfAverVolume,
        });
      } else {
        // If participant chooses NOT to avoid

        //// RANDPROB IS IF USE THE MATH FUNCTION
        if (
          // randProb <
          // this.state.fbProb[this.state.stimIndex[this.state.trialNum - 1]]
          // if outcome is 1
          randProb === 1
        ) {
          //if it is devalued phase, then of if that includes devalued stim, then the
          if (
            this.state.taskSession === 3 &&
            this.state.stimCondTrackDevalIndex.includes(
              this.state.stimIndex[this.state.trialNum - 1]
            )
          ) {
            this.setState({
              showImage: this.state.fb[1],
              playFb: null,
              playFbSound: false,
              randProb: "devalued",
              volume: 0,
            });
          } else {
            this.audioFb.load();
            this.audioFb.play();

            this.setState({
              showImage: this.state.fb[0],
              playFb: this.state.fbSound,
              playFbSound: true,
              randProb: randProb,
              volume: this.state.fullAverVolume,
            });
          }
        } else {
          this.setState({
            showImage: this.state.fb[1],
            playFb: null,
            playFbSound: false,
            randProb: randProb,
            volume: 0,
          });
        }
      }

      // console.log("Avoid Resp: " + this.state.responseKey);
      // console.log("Fb Play: " + this.state.playFbSound);

      setTimeout(
        function () {
          this.saveData();
        }.bind(this),
        this.state.timeLag[2] - 5
      );

      // end of the trial, where if it is the first phase
      // every 3 trials we ask for expectency ratings
      var ratingIdx = this.state.ratingCount[this.state.trialNum - 1];
      var ratingArray = this.state.ratingArray;

      // console.log("Full Rating Index: " + this.state.ratingCount);
      // console.log("Rating Index: " + ratingIdx);
      // console.log("Rating Array: " + ratingArray);

      if (
        this.state.taskSession === 1 &&
        ratingArray.includes(ratingIdx) === true
      ) {
        setTimeout(
          function () {
            this.startRatingTrial();
          }.bind(this),
          this.state.timeLag[2]
        );
        console.log("Start rating trial.");
      } else {
        // every other trial
        setTimeout(
          function () {
            this.nextTrial();
          }.bind(this),
          this.state.timeLag[2]
        );
      }
    } else {
      console.log("Feedback NOT RENDERED as currentScreen false.");
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // THREE COMPONENTS OF THE TASK, FIXATION, STIMULI, FEEDBACK END ---------------

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  // if it is a rating trial.....
  startRatingTrial() {
    var ratingNum = this.state.ratingNum + 1;
    var quizTime = Math.round(performance.now());

    this.setState({
      ratingTrialScreen: true,
      instructScreen: true,
      currentScreen: false,
      quizScreen: false,
      ratingNum: ratingNum,
      quizTime: quizTime,
      quizContinDefault: this.state.continRatingDefRate[ratingNum - 1],
      quizConfDefault: this.state.confRatingDefRate[ratingNum - 1],
    });

    console.log("ratingTrialScreen: " + this.state.ratingTrialScreen);
  }

  //at the end of the rating, go back
  backToTrial() {
    this.setState({
      ratingTrialScreen: false,
      instructScreen: false,
      currentScreen: true,
      playFb: null,
      playFbSound: false,
      showImage: this.state.fix, // this make sure it doesn't have this sudden flash of stim before the next trial
      quizConfDefault: null,
      quizContinDefault: null,
      btnDis: true,
    });

    setTimeout(
      function () {
        this.nextTrial();
      }.bind(this),
      0
    );
  }

  ratingTrial() {
    let question_text1 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={
                this.state.stim[this.state.stimIndex[this.state.trialNum - 1]]
              }
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>F:</strong> Wie oft (auf einer Skala von <strong>0</strong> bis{" "}
          <strong>100%</strong>) beeinflusst dieser Planet unser System? 
          <br />
          <br />
          <TrialRatingSlider.SliderContinQn
            key={this.state.continSliderKeys[this.state.ratingNum - 1]}
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.state.quizContinDefault}
          />
          <br />
          <br />
          <strong>F:</strong> Wie sicher (auf einer Skala von <strong>0</strong>
          &nbsp;bis <strong>100</strong>) sind Sie sich Ihrer obigen Schätzung? 
          <br />
          <br />
          <TrialRatingSlider.SliderConfQn
            key={this.state.confSliderKeys[this.state.ratingNum - 1]}
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.state.quizConfDefault}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> (nicht nur 
            klicken), um auf WEITER zu klicken.] 
          </span>
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className={styles.clc}
              disabled={this.state.btnDis}
              onClick={this.saveTrialRatingData.bind(this)}
            >
              WEITER
            </Button>
          </div>
        </span>
      </div>
    );


    return <div>{question_text1}</div>;
  }

  saveTrialRatingData() {
    var userID = this.state.userID;
    var quizQnRT = Math.round(performance.now()) - this.state.quizTime;

    var stimIndex = this.state.stimIndex[this.state.trialNum - 1];
    // 0, 1, 2, 3...
    // var actualStim = this.state.stimCondTrack.indexOf(stimIndex + 1) + 1;
    // // if stimidex is 0, , actual stim is 2 (position three)
    var actualContin = this.state.fbProbTrack;

    var ratingIndex = this.state.ratingCount[this.state.trialNum - 1];
    var quizStimIndexCount = this.state.ratingArray.indexOf(ratingIndex) + 1;

    let quizbehaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      quizTime: this.state.quizTime,
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,
      section: "taskPlanetRating",
      quizQnNum: this.state.ratingNum, //this will be the rating trial index [1,2,3,4..]
      quizQnRT: quizQnRT,
      quizStimIndexCount: quizStimIndexCount, //this will be the stim trial index aka how many times it is of that particular stimuli [1,2, 1, 2, 3,4..]
      quizStimIndex: stimIndex, //which stimuli it is [2]
      quizStimContin: actualContin, //this is the actual contigency of the stimuli
      quizStimDevalue: null,
      quizContinDefault: this.state.quizContinDefault,
      quizContin: this.state.quizContin,
      quizConfDefault: this.state.quizConfDefault,
      quizConf: this.state.quizConf,
      quizSoundLabel: null,
      playNum: this.state.playNum,
      quizVolume: null,
      quizVolumeNotLog: null,
      quizAverDefault: null,
      quizAver: null,
      checkPoint: "phaseOne",
    };

    // console.log(quizbehaviour);

    try {
      fetch(`${DATABASE_URL}/task_quiz/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizbehaviour),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    //lag go to next trial in session 1
    setTimeout(
      function () {
        this.backToTrial();
      }.bind(this),
      10
    );
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  nextTrial() {
    if (this.state.currentScreen === true) {
      var quizTime;
      var continSliderKeys;
      var confSliderKeys;

      // backhere
      var continRatingBreakDefLog;
      var confRatingBreakDefLog;
      var quizContinDefault;
      var quizConfDefault;

      if (this.state.trialNum < this.state.totalTrial) {
        //if trials are still ongoing per block
        if (this.state.trialinBlockNum < this.state.trialPerBlockNum) {
          // if i update the state here will it get stuck bc of the if loop condition
          this.setState({
            responseKey: 0,
            attenCheckKey: 0,
            randProb: 0,

            fixTime: 0,
            stimTime: 0,
            attenCheckTime: 0,
            reactionTime: 0,
            fbTime: 0,
            playFb: null,
            playFbSound: false,
            showImage: this.state.fix, // this make sure it doesn't have this sudden flash of stim before the next trial

            // this was what was giving that img error?
          });
          setTimeout(
            function () {
              this.renderFix();
            }.bind(this),
            0
          );
        } else {
          //if trials are still ongoing per block
          //When it has reached the set number of trials for the block, but the section hasnt ended
          // this.setState({
          //   currentScreen: false,
          //   instructScreen: false,
          //   quizScreen: false,
          // });
          // console.log("this should go to block resting screen");

          // Instead of a break, they do the planet rating instead then do the break
          //all phases proceed to a quiz

          quizTime = Math.round(performance.now()); //for the first question

          //Slider keys
          continSliderKeys = this.state.continSliderKeysBreakLog[
            this.state.taskSession - 2
          ];
          confSliderKeys = this.state.confSliderKeysBreakLog[
            this.state.taskSession - 2
          ];

          // Defaults for the ratings
          continRatingBreakDefLog = this.state.continRatingBreakDefLog[
            this.state.taskSession - 2
          ]; //firstQn
          confRatingBreakDefLog = this.state.confRatingBreakDefLog[
            this.state.taskSession - 2
          ];
          quizContinDefault = continRatingBreakDefLog[0]; //firstQn
          quizConfDefault = confRatingBreakDefLog[0]; //firstQn

          this.setState({
            currentScreen: false,
            instructScreen: false,
            quizScreen: true,
            quizTime: quizTime,
            btnDis: true,
            continSliderKeys: continSliderKeys,
            confSliderKeys: confSliderKeys,
            quizContinDefault: quizContinDefault,
            quizConfDefault: quizConfDefault,
            checkPoint: "phaseBreak",
            quizQnNum: 1,
            prior: false,
          });
        }
      } else {
        //if trials has reached the end of total trial
        //all phases proceed to a quiz
        document.removeEventListener("keyup", this._handleAttenCheckKey);
        quizTime = Math.round(performance.now()); //for the first question

        continSliderKeys = this.state.continSliderKeysLog[
          this.state.taskSession
        ];
        confSliderKeys = this.state.confSliderKeysLog[this.state.taskSession];
        var averSliderKeys = this.state.averSliderKeysLog[
          this.state.taskSession - 1
        ];

        // Defaults for the ratings
        quizContinDefault = this.state.continRatingDef[0]; //firstQn
        quizConfDefault = this.state.confRatingDef[0]; //firstQn

        this.setState({
          currentScreen: false,
          instructScreen: true,
          quizScreen: true,
          quizTime: quizTime,
          btnDis: true,
          continSliderKeys: continSliderKeys,
          confSliderKeys: confSliderKeys,
          averSliderKeys: averSliderKeys,
          quizContinDefault: quizContinDefault,
          quizConfDefault: quizConfDefault,
          checkPoint: "phaseEnd",
          quizQnNum: 1,
          prior: false,
        });
      }
    } else {
      //if current screen is false
      console.log("curent screen is false");
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  devalueQuiz() {
    //which stim are valued?
    var quizStimIndex = this.state.quizStimIndexDevalue;

    let question_text1 = (
      <div className={styles.main}>
        <p>
          Welche drei Planeten sind jetzt vollkommen harmlos und werden unser System nicht stören?
          <br />
          Drücken Sie die richtige Zahlentaste, um zu wählen. (Sie MÜSSEN drei Planeten auswählen.)
          <br /> <br />
          <br />
          <span className={styles.center}>
            <strong>1</strong> -&nbsp;
            <img
              className={
                this.state.imageBorder1 ? styles.selected : styles.nonselected
              }
              src={this.state.stim[quizStimIndex[0]]}
              alt="stim images"
            />
            &nbsp; &nbsp; &nbsp;
            <strong>2</strong> -&nbsp;
            <img
              src={this.state.stim[quizStimIndex[1]]}
              className={
                this.state.imageBorder2 ? styles.selected : styles.nonselected
              }
              alt="stim images"
            />
            &nbsp; &nbsp; &nbsp;
            <strong>3</strong> -&nbsp;
            <img
              className={
                this.state.imageBorder3 ? styles.selected : styles.nonselected
              }
              src={this.state.stim[quizStimIndex[2]]}
              alt="stim images"
              width="150"
              height="auto"
            />
            &nbsp; &nbsp; &nbsp;
            <strong>4</strong> -&nbsp;
            <img
              className={
                this.state.imageBorder4 ? styles.selected : styles.nonselected
              }
              src={this.state.stim[quizStimIndex[3]]}
              alt="stim images"
              width="150"
              height="auto"
            />
            &nbsp; &nbsp; &nbsp;
            <strong>5</strong> -&nbsp;
            <img
              className={
                this.state.imageBorder5 ? styles.selected : styles.nonselected
              }
              src={this.state.stim[quizStimIndex[4]]}
              alt="stim images"
              width="150"
              height="auto"
            />
            &nbsp; &nbsp; &nbsp;
            <strong>6</strong> -&nbsp;
            <img
              className={
                this.state.imageBorder6 ? styles.selected : styles.nonselected
              }
              src={this.state.stim[quizStimIndex[5]]}
              alt="stim images"
              width="150"
              height="auto"
            />
          </span>
          &nbsp;
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Drücken Sie die LEERTASTE, um Ihre Antworten einzureichen]
          </span>
        </p>
      </div>
    );

    return <div>{question_text1}</div>;
  }

  saveDevalueQuiz() {
    var userID = this.state.userID;
    var quizQnRT = Math.round(performance.now()) - this.state.quizTime;

    //if this is [1,2,0,3]
    //if fbProbs is [0.8,0,0.2,0]
    //1 = 0, 2= 1 0 =2, 3 = 3
    //0, 0.2, 0.8, 0

    var quizStimIndex = this.state.quizStimIndexDevalue;
    var quizStimContin = this.state.fbProb;

    var quizStimContinSort = quizStimIndex.map(
      (object, i) => quizStimContin[object]
    );

    //sort the fb prob in order that the planets that were shown
    // therefore this will match with quizStimDevalue, which is the choices made

    let quizbehaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      quizTime: this.state.quizTime,
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,
      section: "devaluationPicks",
      quizQnNum: 1,
      quizQnRT: quizQnRT,
      quizStimContin: quizStimContinSort, //this is the actual contigency of the stimuli
      quizStimIndex: quizStimIndex,
      quizStimDevalue: this.state.quizStimDevalue, // this is the only one in this quiz

      quizStimIndexCount: null, //this is populated for the trial ratings in phase 1, not for anything other quiz sections
      quizContinDefault: null,
      quizContin: null,
      quizConfDefault: null,
      quizConf: null,

      quizSoundLabel: null,
      playNum: null,
      quizVolume: null,
      quizVolumeNotLog: null,
      quizAverDefault: null,
      quizAver: null,
      checkPoint: "prePhaseThree",
    };

    try {
      fetch(`${DATABASE_URL}/task_quiz/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizbehaviour),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    //check if quiz is correct
    setTimeout(
      function () {
        this.checkDevalueQuiz();
      }.bind(this),
      10
    );
  }

  checkDevalueQuiz() {
    //check the quiz, if not correct, then restart the part
    var quizStimDevalue = this.state.quizStimDevalue; //[true, false, true, false]

    var quizStimIndex = this.state.quizStimIndexDevalue;
    var quizStimContin = this.state.fbProb;

    var quizStimContinSort = quizStimIndex.map(
      (object, i) => quizStimContin[object]
    );

    // get index for picked answer
    var quizAnsPicks = quizStimDevalue.reduce(
      (out, bool, index) => (bool ? out.concat(index) : out),
      []
    );

    // get index for the actual answer
    var quizAnsTrue = quizStimContinSort.reduce(
      (r, v, i) => r.concat(v === 0 ? i : []),
      []
    );

    // compare if true
    var correct = quizAnsPicks.toString() === quizAnsTrue.toString();

    if (correct) {
      //return to instructions
      this.setState({
        currentScreen: false,
        instructScreen: true,
        quizScreen: false,
        ratingTrialScreen: false,
        currentInstructionText: 2,
      });
    } else {
      //if fail, restart the quiz
      var taskSessionTry = this.state.taskSessionTry + 1;
      this.setState({
        currentScreen: false,
        instructScreen: true,
        quizScreen: false,
        ratingTrialScreen: false,
        currentInstructionText: 3,
        taskSessionTry: taskSessionTry,
        quizStimDevalue: [false, false, false, false, false, false],
        devalueQuizHistory: [],
        imageBorder1: false,
        imageBorder2: false,
        imageBorder3: false,
        imageBorder4: false,
        imageBorder5: false,
        imageBorder6: false,
        devalueIdx: 0,
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // KEY RESPONSE FUNCTIONS (somemore)

  pressDevalueAns(key_pressed, time_pressed) {
    var reactionTime = time_pressed - this.state.trialTime;
    var idx = this.state.devalueIdx;
    var borderOn1 = this.state.imageBorder1;
    var borderOn2 = this.state.imageBorder2;
    var borderOn3 = this.state.imageBorder3;
    var borderOn4 = this.state.imageBorder4;
    var borderOn5 = this.state.imageBorder5;
    var borderOn6 = this.state.imageBorder6;
    var history = this.state.devalueQuizHistory;
    var removeAns;
    var quizStimDevalue = this.state.quizStimDevalue;

    if (key_pressed === 0) {
      // if this is to submit answers...

      var count = quizStimDevalue.filter(Boolean).length;
      // if thre are 2 picked option, then go to save devalue, if not do nothing
      if (count === 3) {
        this.setState({
          reactionTime: reactionTime,
        });

        setTimeout(
          function () {
            this.saveDevalueQuiz();
          }.bind(this),
          0
        );
      }
    } else {
      idx++;
      history[idx - 1] = key_pressed; // log of all guesses

      // console.log("Devalue Choice Index: " + idx);
      // console.log("Devalue History: " + history);

      if (idx === 1) {
        // if on the very first keyAnswer
        if (key_pressed === 1) {
          borderOn1 = true;
          borderOn2 = false;
          borderOn3 = false;
          borderOn4 = false;
          borderOn5 = false;
          borderOn6 = false;
        } else if (key_pressed === 2) {
          borderOn2 = true;
          borderOn1 = false;
          borderOn3 = false;
          borderOn4 = false;
          borderOn5 = false;
          borderOn6 = false;
        } else if (key_pressed === 3) {
          borderOn3 = true;
          borderOn2 = false;
          borderOn1 = false;
          borderOn4 = false;
          borderOn5 = false;
          borderOn6 = false;
        } else if (key_pressed === 4) {
          borderOn4 = true;
          borderOn2 = false;
          borderOn3 = false;
          borderOn1 = false;
          borderOn5 = false;
          borderOn6 = false;
        } else if (key_pressed === 5) {
          borderOn5 = true;
          borderOn2 = false;
          borderOn1 = false;
          borderOn4 = false;
          borderOn3 = false;
          borderOn6 = false;
        } else if (key_pressed === 6) {
          borderOn6 = true;
          borderOn2 = false;
          borderOn3 = false;
          borderOn1 = false;
          borderOn5 = false;
          borderOn4 = false;
        }
      } else if (idx === 2) {
        // if you choose the same option again...
        if (key_pressed === history[idx - 2]) {
          idx--;
          // then that choice doesnt count
        } else {
          if (key_pressed === 1) {
            borderOn1 = true;
          } else if (key_pressed === 2) {
            borderOn2 = true;
          } else if (key_pressed === 3) {
            borderOn3 = true;
          } else if (key_pressed === 4) {
            borderOn4 = true;
          } else if (key_pressed === 5) {
            borderOn5 = true;
          } else if (key_pressed === 6) {
            borderOn6 = true;
          }
        }
      } else if (idx === 3) {
        // if you choose the same option again...
        if (
          key_pressed === history[idx - 2] ||
          key_pressed === history[idx - 3]
        ) {
          idx--;
          // then that choice doesnt count
        } else {
          if (key_pressed === 1) {
            borderOn1 = true;
          } else if (key_pressed === 2) {
            borderOn2 = true;
          } else if (key_pressed === 3) {
            borderOn3 = true;
          } else if (key_pressed === 4) {
            borderOn4 = true;
          } else if (key_pressed === 5) {
            borderOn5 = true;
          } else if (key_pressed === 6) {
            borderOn6 = true;
          }
        }
      } else {
        //after first two tries

        if (
          key_pressed === history[idx - 2] ||
          key_pressed === history[idx - 3]
        ) {
          //if you choose the same answer again then that choice doesnt count
          idx--;
        } else {
          //if you choose others, you will need to remove the previous answers
          removeAns = history[idx - 4];

          if (removeAns === 1) {
            borderOn1 = false;
          } else if (removeAns === 2) {
            borderOn3 = false;
          } else if (removeAns === 3) {
            borderOn2 = false;
          } else if (removeAns === 4) {
            borderOn4 = false;
          } else if (removeAns === 5) {
            borderOn5 = false;
          } else if (removeAns === 6) {
            borderOn6 = false;
          }

          if (key_pressed === 1) {
            borderOn1 = true;
          } else if (key_pressed === 2) {
            borderOn2 = true;
          } else if (key_pressed === 3) {
            borderOn3 = true;
          } else if (key_pressed === 4) {
            borderOn4 = true;
          } else if (key_pressed === 5) {
            borderOn5 = true;
          } else if (key_pressed === 6) {
            borderOn6 = true;
          }
        }
      }

      quizStimDevalue = [
        borderOn1,
        borderOn2,
        borderOn3,
        borderOn4,
        borderOn5,
        borderOn6,
      ];

      //console.log(quizStimDevalue);

      this.setState({
        responseKey: key_pressed,
        devalueIdx: idx,
        imageBorder1: borderOn1,
        imageBorder2: borderOn2,
        imageBorder3: borderOn3,
        imageBorder4: borderOn4,
        imageBorder5: borderOn5,
        imageBorder6: borderOn6,
        reactionTime: reactionTime,
        quizStimDevalue: quizStimDevalue,
      });
    }
  }

  // handle key key_pressed
  _handleDevalueQuizKey = (event) => {
    var pressed;
    var time_pressed;

    switch (event.keyCode) {
      case 32:
        //    this is SPACEBAR
        pressed = 0;
        time_pressed = Math.round(performance.now());
        this.pressDevalueAns(pressed, time_pressed);
        break;

      case 49:
        pressed = 1;
        time_pressed = Math.round(performance.now());
        this.pressDevalueAns(pressed, time_pressed);

        break;
      case 50:
        pressed = 2;
        time_pressed = Math.round(performance.now());
        this.pressDevalueAns(pressed, time_pressed);

        break;
      case 51:
        pressed = 3;
        time_pressed = Math.round(performance.now());
        this.pressDevalueAns(pressed, time_pressed);
        break;

      case 52:
        pressed = 4;
        time_pressed = Math.round(performance.now());
        this.pressDevalueAns(pressed, time_pressed);
        break;

      case 53:
        pressed = 5;
        time_pressed = Math.round(performance.now());
        this.pressDevalueAns(pressed, time_pressed);
        break;

      case 54:
        pressed = 6;
        time_pressed = Math.round(performance.now());
        this.pressDevalueAns(pressed, time_pressed);
        break;

      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  //Session proceed means it will start the instructions for the next session
  sessionProceed() {
    if (this.state.taskSession === 3) {
      //end task, go to questionnaire section
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        0
      );
      console.log("End of all sessions, go to exit screen");
    } else {
      //Proceed to session 2 or to session 3
      var taskSession = this.state.taskSession + 1;
      var totalTrial = this.state.totalTrialLog[taskSession - 1];
      var trialPerBlockNum = this.state.trialPerBlockNumLog[taskSession - 1];
      var totalBlock = this.state.totalBlockLog[taskSession - 1];
      var stimIndex = this.state.stimIndexLog[taskSession - 1];
      var attenIndex = this.state.attenIndexLog[taskSession - 1];
      var attenCheckAll = this.state.attenCheckAllLog[taskSession - 1];
      var outcome = this.state.outcomeLog[taskSession - 1];
      var averRatingDef = this.state.averRatingDefLog[taskSession - 1];
      var confRatingDef = this.state.confRatingDefLog[taskSession - 1];
      var continRatingDef = this.state.continRatingDefLog[taskSession - 1];

      this.setState({
        taskSession: taskSession,
        totalTrial: totalTrial,
        trialPerBlockNum: trialPerBlockNum,
        totalBlock: totalBlock,
        stimIndex: stimIndex,
        attenIndex: attenIndex,
        outcome: outcome,
        attenCheckAll: attenCheckAll,
        currentScreen: false,
        instructScreen: true,
        quizScreen: false,
        currentInstructionText: 1,

        blockNum: 1,
        trialNum: 0,
        trialinBlockNum: 0,

        quizContin: [],
        quizConf: [],
        quizTime: 0,
        quizQnNum: 1,
        quizQnRT: 0,

        averRatingDef: averRatingDef,
        confRatingDef: confRatingDef,
        continRatingDef: continRatingDef,

        quizContinDefault: null,
        quizConfDefault: null,
        quizAverDefault: null,

        playAttCheck: false,
        playFbSound: false,
        playAtten: null,
        playFb: null,
      });

      console.log("Task Session: " + taskSession);
      //if its task session 3, additional devalution occurs
      if (taskSession === 3) {
        setTimeout(
          function () {
            this.devalueQuizSet();
          }.bind(this),
          0
        );
      }
    }
  }

  // Set the devaluation quiz varibles!
  devalueQuizSet() {
    var stimCondTrack = this.state.stimCondTrack;

    //devlaue one high and one low probs devalue the 1 and 3 option
    var fbProb = this.state.fbProb;
    var indexHighProb = stimCondTrack.indexOf(0);
    var indexLowProb = stimCondTrack.indexOf(2);
    var indexMidProb = stimCondTrack.indexOf(4);
    var stimCondTrackDevalIndex = [indexHighProb, indexLowProb, indexMidProb];

    // console.log("Original FbProb: " + fbProb);
    // console.log("Original StimCondTrack: " + stimCondTrack);

    // FbProb and StimCondTrack are shuffled together
    // so if FbProb is [0.2, 0.2, 0.8, 0.8]
    // then StimCondTrack is [3,2,0,1]
    // stim1 is 0.2, stim2 is 0.2, stim3 is 0.8, stim4 is 0.8
    // StimCondTrack indexOf 0 and 2 is 1 and 2 respectively
    // therefore devalued FbProb is [0.2, 0, 0, 0.8]
    // stim 2 and stim 3 are devalued

    // if quizStimIndexArrary is [0,1,2,3]

    //shuffle quizStimIndexArray is [1,0,3,2]
    //shuffle fbProb in same order is [0,0.2,0.8, 0]

    // meaning that the quiz shows stim2, stim1, stim4, stim3
    //stim 2 and stim 3 are devalued
    //so stim will show as fbProb [0,0.2,0.8,0]
    // so answer should be [true, false, false, true]

    fbProb[indexHighProb] = 0;
    fbProb[indexLowProb] = 0;
    fbProb[indexMidProb] = 0;

    // console.log("Devalue FbProb1: " + fbProb);

    var quizStimIndex = this.state.quizStimIndexArray;
    // var fbProbNoShuffle = fbProb;
    // var fbProbDevalueRef = fbProb;
    // shuffleTwo(quizStimIndex, fbProbDevalueRef);
    shuffle(quizStimIndex);
    quizStimIndex = quizStimIndex.filter(function (val) {
      return val !== undefined;
    });

    // fbProbDevalueRef = fbProbDevalueRef.filter(function (val) {
    //   return val !== undefined;
    // });

    this.setState({
      fbProb: fbProb,
      devaluedBlock: 1,
      stimCondTrackDevalIndex: stimCondTrackDevalIndex,
      quizStimIndexDevalue: quizStimIndex,
      // fbProbDevalueRef: fbProbDevalueRef,
    });

    // console.log("QuizStimIndexDevalue: " + quizStimIndex);
    // // console.log("FbProbDevalueRef: " + fbProbDevalueRef);
    // console.log("Devaluation: " + stimCondTrackDevalIndex);
    // console.log("Devalue FbProb2: " + fbProb);
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  // After instructions, start the first blocks
  // Session 1, 2, 3 head to trials
  sessionBegin() {
    // only session 1 has ratings in trial, before quizes key do it later
    var continSliderKeys;
    var confSliderKeys;

    if (this.state.taskSession === 1) {
      continSliderKeys = this.state.continSliderKeysLog[
        this.state.taskSession - 1
      ];
      confSliderKeys = this.state.confSliderKeysLog[this.state.taskSession - 1];
    } else {
      continSliderKeys = null;
      confSliderKeys = null;
    }

    // set some parameters for the quizes like shuffling planet and sound order
    var quizSoundArray = this.state.quizSoundArray; //get the array
    var quizSoundLabelArray = this.state.quizSoundLabelArray;
    var quizSoundVolArray = this.state.quizSoundVolArray;
    shuffleSame(quizSoundArray, quizSoundLabelArray, quizSoundVolArray); // this shuffles them together, so it should work

    //  console.log(quizSoundVolArray);
    // for some reason, undefined slips in???
    quizSoundArray = quizSoundArray.filter(function (val) {
      return val !== undefined;
    });
    quizSoundLabelArray = quizSoundLabelArray.filter(function (val) {
      return val !== undefined;
    });
    quizSoundVolArray = quizSoundVolArray.filter(function (val) {
      return val !== undefined;
    });

    // Shuffle the planet order for the quiz.........
    // this happens after session Proceed, meaning that it is already devalued in phase 3
    // this messes up the squence AFTER the devaluation... this won't work
    var quizStimIndex = this.state.quizStimIndexArray;

    shuffle(quizStimIndex);

    quizStimIndex = quizStimIndex.filter(function (val) {
      return val !== undefined;
    });

    //shuffle the colour as well
    var varPlayColour = shuffle(this.state.varPlayColourArray);

    varPlayColour = varPlayColour.filter(function (val) {
      return val !== undefined;
    });

    // console.log("quizStimIndex: " + quizStimIndex);

    this.setState({
      quizStimIndex: quizStimIndex,
      quizSound: quizSoundArray,
      quizSoundVol: quizSoundVolArray,
      quizSoundLabel: quizSoundLabelArray,
      varPlayColour: varPlayColour,
      currentScreen: true,
      instructScreen: false,
      quizScreen: false,
      prior: false,
      continSliderKeys: continSliderKeys,
      confSliderKeys: confSliderKeys,
      averSliderKeys: null,
      quizAverDefault: null, //just for the first trials
      quizConfDefault: this.state.confRatingDef[0], //just for the first trials
      quizContinDefault: this.state.continRatingDef[0], //just for the first trials
      imageBorder: false,
    });

    setTimeout(
      function () {
        this.nextTrial();
      }.bind(this),
      0
    );
  }

  // Set states for blocksections
  // This one is after break, will start the trial
  blockProceed() {
    var blockNum = this.state.blockNum + 1;
    this.setState({
      currentScreen: true,
      blockNum: blockNum,
      trialinBlockNum: 0,
      playFb: null,
      playFbSound: false, // just in case it plays during the fixation
    });
    setTimeout(
      function () {
        this.nextTrial();
      }.bind(this),
      0
    );
  }

  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //Restart the phase when fail attention check

  taskRestart() {
    // Reset task parameters

    var taskSessionTry = this.state.taskSessionTry + 1;
    var taskSession = this.state.taskSession;

    var stimIndex1 = this.state.stimIndexLog[0];
    var stimIndex2 = this.state.stimIndexLog[1];
    var stimIndex3 = this.state.stimIndexLog[2];

    var stimOutcomePhase1 = this.state.outcomeLog[0];
    var stimOutcomePhase2 = this.state.outcomeLog[1];
    var stimOutcomePhase3 = this.state.outcomeLog[2];

    var stimIndex;
    var stimOutcomePhase;
    var prior;
    // var attenIndex1 = this.state.attenIndexLog[0];
    // var attenIndex2 = this.state.attenIndexLog[1];
    // var attenIndex3 = this.state.attenIndexLog[2];

    if (taskSession === 1) {
      shuffleSame(stimIndex1, stimOutcomePhase1);

      stimIndex1 = stimIndex1.filter(function (val) {
        return val !== undefined;
      });
      stimOutcomePhase1 = stimOutcomePhase1.filter(function (val) {
        return val !== undefined;
      });
      stimIndex = stimIndex1;
      stimOutcomePhase = stimOutcomePhase1;
      prior = true;
    } else if (taskSession === 2) {
      shuffleSame(stimIndex2, stimOutcomePhase2);
      // shuffle(attenIndex2);
      stimIndex2 = stimIndex2.filter(function (val) {
        return val !== undefined;
      });
      stimOutcomePhase2 = stimOutcomePhase2.filter(function (val) {
        return val !== undefined;
      });

      stimIndex = stimIndex2;
      stimOutcomePhase = stimOutcomePhase2;
      prior = false;
    } else if (taskSession === 3) {
      shuffleSame(stimIndex3, stimOutcomePhase3);

      stimIndex3 = stimIndex3.filter(function (val) {
        return val !== undefined;
      });
      stimOutcomePhase3 = stimOutcomePhase3.filter(function (val) {
        return val !== undefined;
      });

      stimIndex = stimIndex3;
      stimOutcomePhase = stimOutcomePhase3;
      prior = false;
    }

    // console.log("stimIndex1 " + stimIndex1);
    // console.log("stimIndex2 " + stimIndex2);
    // console.log("stimIndex3 " + stimIndex3);

    var totalTrial = this.state.totalTrialLog[taskSession - 1];
    var trialPerBlockNum = this.state.trialPerBlockNumLog[taskSession - 1];
    var attenCheckAll = this.state.attenCheckAllLog[taskSession - 1];
    var totalBlock = this.state.totalBlockLog[taskSession - 1];

    var qnNumTotalQuizConfContin = 6; // contin for 4 planets
    var qnNumTotalQuizAver = 3; //sound rating for 3 sounds

    var continRatingDef1Prior = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var confRatingDef1Prior = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var averRatingDef1 = randomArray(qnNumTotalQuizAver, 35, 65);
    var confRatingDef1 = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef1 = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var averRatingDef2 = randomArray(qnNumTotalQuizAver, 35, 65);
    var confRatingDef2 = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef2 = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var averRatingDef3 = randomArray(qnNumTotalQuizAver, 35, 65);
    var confRatingDef3 = randomArray(qnNumTotalQuizConfContin, 35, 65);
    var continRatingDef3 = randomArray(qnNumTotalQuizConfContin, 35, 65);

    var averRatingDefLog = [averRatingDef1, averRatingDef2, averRatingDef3];
    var confRatingDefLog = [confRatingDef1, confRatingDef2, confRatingDef3];
    var continRatingDefLog = [
      continRatingDef1,
      continRatingDef2,
      continRatingDef3,
    ];
    var averRatingDef = averRatingDefLog[taskSession - 1];
    var confRatingDef = confRatingDefLog[taskSession - 1];
    var continRatingDef = continRatingDefLog[taskSession - 1];

    this.setState({
      stimIndexLog: [stimIndex1, stimIndex2, stimIndex3],
      // attenIndexLog: [attenIndex1, attenIndex2, attenIndex3],
      outcomeLog: [stimOutcomePhase1, stimOutcomePhase2, stimOutcomePhase3],

      totalTrial: totalTrial,
      trialPerBlockNum: trialPerBlockNum,
      attenCheckAll: attenCheckAll,
      totalBlock: totalBlock,
      stimIndex: stimIndex,
      outcome: stimOutcomePhase,
      // attenIndex: this.state.attenIndex,

      responseKey: 0,
      fbProbTrack: 0,
      randProb: 0,
      blockNum: 1,
      trialNum: 0,
      trialinBlockNum: 0,
      imageBorder: false,
      currentInstructionText: 1,
      showImage: this.state.fix,

      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      reactionTime: 0,
      fbTime: 0,

      attenTrial: 0,
      attenTime: 0,
      attenCheckTime: 0,
      attenCheckKey: 0,
      attenPass: true, // change this to change the percentage which they have to pass

      playAttCheck: false,
      playFbSound: false,
      playFb: null,

      // devalue: false,
      instructScreen: true,
      ratingTrialScreen: false,
      quizScreen: false,
      currentScreen: false, // false for break, true for task
      btnDis: true,

      quizContin: [],
      quizConf: [],
      quizTime: 0,
      quizQnRT: 0,
      quizQnNum: 1,
      playNum: 0,

      taskSessionTry: taskSessionTry,
      taskSession: taskSession,
      playAtten: null,

      confRatingPriorDefLog: confRatingDef1Prior,
      continRatingPriorDefLog: continRatingDef1Prior,

      averRatingDefLog: averRatingDefLog,
      confRatingDefLog: confRatingDefLog,
      continRatingDefLog: continRatingDefLog,

      averRatingDef: averRatingDef,
      confRatingDef: confRatingDef,
      continRatingDef: continRatingDef,

      quizConfDefault: null,
      quizContinDefault: null,
      quizAverDefault: null,

      quizStimDevalue: [false, false, false, false, false, false],
      devalueQuizHistory: [],
      imageBorder1: false,
      imageBorder2: false,
      imageBorder3: false,
      imageBorder4: false,
      imageBorder5: false,
      imageBorder6: false,
      devalueIdx: 0,

      prior: prior,
    });

    // resave the conditions
    setTimeout(
      function () {
        this.saveCond();
      }.bind(this),
      5
    );
  }

  /////////////////////////////////////////////////////////////////////////////////
  // SET QUIZ COMPONENTS
  quizNext() {
    var quizQnNum;
    var quizTime;
    var quizAverDefault;
    var quizContinDefault;
    var quizConfDefault;

    if (this.state.checkPoint === "phaseOnePrior") {
      if (this.state.quizQnNum < this.state.stimNum) {
        quizQnNum = this.state.quizQnNum + 1;
        quizTime = Math.round(performance.now()); //for the next question

        quizContinDefault = this.state.continRatingPriorDefLog[quizQnNum - 1]; //second qn alr
        quizConfDefault = this.state.confRatingPriorDefLog[quizQnNum - 1];
        quizAverDefault = null;

        // console.log("quizQnNum: " + quizQnNum);
        // console.log("quizAverDefault: " + quizAverDefault);
        // console.log("quizContinDefault: " + quizContinDefault);
        // console.log("quizConfDefault: " + quizConfDefault);

        this.setState({
          quizQnNum: quizQnNum,
          quizTime: quizTime,
          btnDis: true,
          quizConf: null,
          quizContin: null,
          quizAver: null,
          active: false,
          playNum: 0,
          quizContinDefault: quizContinDefault,
          quizConfDefault: quizConfDefault,
          quizAverDefault: quizAverDefault,
        });
      } else {
        //lag a bit to make sure statestate is saved
        console.log("Return to phase 1 instructions");

        this.setState({
          currentScreen: false,
          instructScreen: true,
          quizScreen: false,
          currentInstructionText: 5,
          prior: false,
        });
      }
    } else if (this.state.checkPoint === "phaseBreak") {
      if (this.state.quizQnNum < this.state.stimNum) {
        quizQnNum = this.state.quizQnNum + 1;
        quizTime = Math.round(performance.now()); //for the next question

        quizContinDefault = this.state.continRatingDef[quizQnNum - 1]; //second qn alr
        quizConfDefault = this.state.confRatingDef[quizQnNum - 1];
        quizAverDefault = null;

        // console.log("quizQnNum: " + quizQnNum);
        // console.log("quizAverDefault: " + quizAverDefault);
        // console.log("quizContinDefault: " + quizContinDefault);
        // console.log("quizConfDefault: " + quizConfDefault);

        this.setState({
          quizQnNum: quizQnNum,
          quizTime: quizTime,
          btnDis: true,
          quizConf: null,
          quizContin: null,
          quizAver: null,
          active: false,
          playNum: 0,
          quizContinDefault: quizContinDefault,
          quizConfDefault: quizConfDefault,
          quizAverDefault: quizAverDefault,
        });
      } else {
        //lag a bit to make sure statestate is saved
        console.log("Go to break session");

        this.setState({
          currentScreen: false,
          instructScreen: false,
          quizScreen: false,
        });
      }
    } else if (this.state.checkPoint === "phaseEnd") {
      if (this.state.quizQnNum < this.state.stimNum + this.state.soundNum) {
        quizQnNum = this.state.quizQnNum + 1;
        quizTime = Math.round(performance.now()); //for the next question

        if (quizQnNum <= this.state.stimNum) {
          quizContinDefault = this.state.continRatingDef[quizQnNum - 1]; //second qn alr
          quizConfDefault = this.state.confRatingDef[quizQnNum - 1];
          quizAverDefault = null;
        } else {
          quizAverDefault = this.state.averRatingDef[
            quizQnNum - (this.state.stimNum + 1)
          ]; //start from index0
          quizContinDefault = null;
          quizConfDefault = null;
        }

        // console.log("quizQnNum: " + quizQnNum);
        // console.log("quizAverDefault: " + quizAverDefault);
        // console.log("quizContinDefault: " + quizContinDefault);
        // console.log("quizConfDefault: " + quizConfDefault);

        this.setState({
          quizQnNum: quizQnNum,
          quizTime: quizTime,
          btnDis: true,
          quizConf: null,
          quizContin: null,
          quizAver: null,
          active: false,
          playNum: 0,
          quizContinDefault: quizContinDefault,
          quizConfDefault: quizConfDefault,
          quizAverDefault: quizAverDefault,
        });
      } else {
        //lag a bit to make sure statestate is saved
        console.log("Go to next session to end");

        setTimeout(
          function () {
            this.sessionProceed();
          }.bind(this),
          10
        );
      }
    } else {
      console.log("checkPoint error - which quiz to go?");
    }
  }

  /////////////// call back values for the contigency and confidence quiz
  callbackContin(callBackValue) {
    this.setState({ quizContin: callBackValue });

    if (this.state.quizConf !== null && this.state.quizContin !== null) {
      this.setState({ btnDis: false });
    }
  }

  callbackConf(callBackValue) {
    this.setState({ quizConf: callBackValue });

    if (this.state.quizConf !== null && this.state.quizContin !== null) {
      this.setState({ btnDis: false });
    }
  }

  callbackAver(callBackValue) {
    this.setState({ quizAver: callBackValue });

    if (this.state.quizAver !== null) {
      this.setState({ btnDis: false });
    }
  }

  /////////////// call back values for the contigency and confidence quiz

  // Contigency quiz RIGHT AT THE BEGINNING this would be the prior
  quizZero(quizQnNum) {
    let question_text;

    // the contingencies first
    var quizStimIndex = this.state.quizStimIndex[quizQnNum - 1]; // e.g if the shuffled array is [1,3,2,0]
    var quizStim = this.state.stim[quizStimIndex];

    question_text = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img src={quizStim} alt="stim images" width="100" height="auto" />
          </div>
          <br />
          <strong>F{this.state.quizQnNum}a:</strong> Wie oft (auf einer Skala 
          von <strong>0</strong> bis <strong>100%</strong>) wird dieser Planet 
          unser System beeinflussen? 
          <br />
          <br />
          <SliderPhasePrior.SliderContinQn
            key={this.state.continSliderKeys[quizQnNum - 1]}
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.state.quizContinDefault}
          />
          <br />
          <br />
          <strong>F{this.state.quizQnNum}b:</strong> Wie sicher (auf einer 
          Skala von <strong>0</strong> &nbsp;bis <strong>100</strong>) sind Sie 
          sich Ihrer obigen Schätzung? 
          <br />
          <br />
          <SliderPhasePrior.SliderConfQn
            key={this.state.confSliderKeys[quizQnNum - 1]}
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.state.quizConfDefault}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> 
            (nicht nur klicken), um auf WEITER zu klicken.] 
          </span>
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className={styles.clc}
              disabled={this.state.btnDis}
              onClick={this.saveQuizData.bind(this)}
            >
              WEITER
            </Button>
          </div>
        </span>
      </div>
    );


    return <div>{question_text}</div>;
  }

  // End phase quizes
  // Phase 1: just the sound RATINGS (add contigency raings if its very 3 trials ask for rating?)
  // Phase 2 and 3: just the sound AND contigency RATINGS

  quizOne(quizQnNum) {
    let question_text;
    if (quizQnNum < this.state.stimNum + 1) {
      // the contingencies first
      var quizStimIndex = this.state.quizStimIndex[quizQnNum - 1]; // e.g if the shuffled array is [1,3,2,0]
      var quizStim = this.state.stim[quizStimIndex];

      question_text = (
        <div className={styles.main}>
          <span className={styles.centerTwo}>
            <div className="col-md-12 text-center">
              <img src={quizStim} alt="stim images" width="100" height="auto" />
            </div>
            <br />
            <strong>F{this.state.quizQnNum}a:</strong> Wie oft (auf einer Skala 
            von <strong>0</strong> bis <strong>100%</strong>) beeinflusst 
            dieser Planet unser System? 
            <br />
            <br />
            <SliderPhase1.SliderContinQn
              key={this.state.continSliderKeys[quizQnNum - 1]}
              callBackValue={this.callbackContin.bind(this)}
              initialValue={this.state.quizContinDefault}
            />
            <br />
            <br />
            <strong>F{this.state.quizQnNum}b:</strong> Wie sicher (auf einer 
            Skala von <strong>0</strong> bis <strong>100</strong>) 
            sind Sie sich Ihrer obigen Schätzung? 
            <br />
            <br />
            <SliderPhase1.SliderConfQn
              key={this.state.confSliderKeys[quizQnNum - 1]}
              callBackValue={this.callbackConf.bind(this)}
              initialValue={this.state.quizConfDefault}
            />
            <br />
            <br />
            <span className={styles.centerTwo}>
              [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> 
              (nicht nur klicken), um auf WEITER zu klicken.]
            </span>
            <br />
            <br />
            <div className="col-md-12 text-center">
              <Button
                id="right"
                className={styles.clc}
                disabled={this.state.btnDis}
                onClick={this.saveQuizData.bind(this)}
              >
                WEITER
              </Button>
            </div>
          </span>
        </div>
      );

    } else {
      // then the sound ratings
      var soundPlay = this.state.quizSound[
        quizQnNum - (this.state.stimNum + 1)
      ];
      var varPlayColour = this.state.varPlayColour[
        quizQnNum - (this.state.stimNum + 1)
      ];
      var volume = this.state.quizSoundVol[
        quizQnNum - (this.state.stimNum + 1)
      ];

      question_text = (
        <div className={styles.main}>
          <span className={styles.centerTwo}>
            <strong>F{this.state.quizQnNum}:</strong> Wie angenehm (auf 
            einer Skala von <strong>0</strong> bis <strong>100</strong>) 
            finden Sie dieses Geräusch? 
            <br /> <br />
            <span className={styles.centerTwo}>(Klicken Sie auf die Wiedergabetaste.)</span> 
            <br />
            <br />
            <span className={styles.center}>
              <PlayButton
                audio={soundPlay}
                play={this.togglePlay}
                stop={this.togglePlay}
                volume={volume}
                idleBackgroundColor={varPlayColour}
                active={this.state.active}
              />
            </span>
            <br />
            <br />
            <SliderPhase1.SliderAverQn
              key={
                this.state.averSliderKeys[quizQnNum - (this.state.stimNum + 1)]
              }
              callBackValue={this.callbackAver.bind(this)}
              initialValue={this.state.quizAverDefault}
            />
            <br />
            <br />
            <span className={styles.centerTwo}>
              [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> 
              (nicht nur klicken), um auf WEITER zu klicken.] 
            </span>
            <br />
            <br />
            <div className="col-md-12 text-center">
              <Button
                id="right"
                className={styles.clc}
                disabled={this.state.btnDis}
                onClick={this.saveQuizData.bind(this)}
              >
                WEITER
              </Button>
            </div>
          </span>
        </div>
      );

    }

    return <div>{question_text}</div>;
  }

  quizTwo(quizQnNum) {
    let question_text;
    if (quizQnNum < this.state.stimNum + 1) {
      // zuerst die Bedingungen
      var quizStimIndex = this.state.quizStimIndex[quizQnNum - 1]; // z.B. wenn das gemischte Array [1,3,2,0] ist
      var quizStim = this.state.stim[quizStimIndex];

      question_text = (
        <div className={styles.main}>
          <span className={styles.centerTwo}>
            <div className="col-md-12 text-center">
              <img src={quizStim} alt="stim images" width="100" height="auto" />
            </div>
            <br />
            <strong>F{this.state.quizQnNum}a:</strong> Wie oft (auf einer Skala von{" "}
            <strong>0</strong> bis <strong>100%</strong>) beeinflusst dieser Planet
            unser System? 
            <br />
            <br />
            <SliderPhase2.SliderContinQn
              key={this.state.continSliderKeys[quizQnNum - 1]}
              callBackValue={this.callbackContin.bind(this)}
              initialValue={this.state.quizContinDefault}
            />
            <br />
            <br />
            <strong>F{this.state.quizQnNum}b:</strong> Wie sicher (auf einer Skala von{" "}
            <strong>0</strong>
            &nbsp;bis <strong>100</strong>) sind Sie sich Ihrer obigen Schätzung? 
            <br />
            <br />
            <SliderPhase2.SliderConfQn
              key={this.state.confSliderKeys[quizQnNum - 1]}
              callBackValue={this.callbackConf.bind(this)}
              initialValue={this.state.quizConfDefault}
            />
            <br />
            <br />
            <span className={styles.centerTwo}>
              [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> 
              (nicht nur klicken), um auf WEITER zu klicken.] 
            </span>
            <br />
            <br />
            <div className="col-md-12 text-center">
              <Button
                id="right"
                className={styles.clc}
                disabled={this.state.btnDis}
                onClick={this.saveQuizData.bind(this)}
              >
                WEITER
              </Button>
            </div>
          </span>
        </div>
      );
    } else {
      // dann die Geräuschbewertungen
      var soundPlay = this.state.quizSound[
        quizQnNum - (this.state.stimNum + 1)
      ];
      var varPlayColour = this.state.varPlayColour[
        quizQnNum - (this.state.stimNum + 1)
      ];
      var volume = this.state.quizSoundVol[
        quizQnNum - (this.state.stimNum + 1)
      ];

      question_text = (
        <div className={styles.main}>
          <span className={styles.centerTwo}>
            <strong>F{this.state.quizQnNum}:</strong> Wie angenehm (auf einer Skala
            von <strong>0</strong> bis <strong>100</strong>) finden Sie dieses
            Geräusch? <br /> <br /> 
            <span className={styles.centerTwo}>(Klicken Sie auf die Wiedergabetaste.)</span> 
            <br />
            <br />
            <span className={styles.center}>
              <PlayButton
                audio={soundPlay}
                play={this.togglePlay}
                stop={this.togglePlay}
                volume={volume}
                idleBackgroundColor={varPlayColour}
                active={this.state.active}
              />
            </span>
            <br />
            <br />
            <SliderPhase2.SliderAverQn
              key={
                this.state.averSliderKeys[quizQnNum - (this.state.stimNum + 1)]
              }
              callBackValue={this.callbackAver.bind(this)}
              initialValue={this.state.quizAverDefault}
            />
            <br />
            <br />
            <span className={styles.centerTwo}>
              [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> 
              (nicht nur klicken), um auf WEITER zu klicken.] 
            </span>
            <br />
            <br />
            <div className="col-md-12 text-center">
              <Button
                id="right"
                className={styles.clc}
                disabled={this.state.btnDis}
                onClick={this.saveQuizData.bind(this)}
              >
                WEITER
              </Button>
            </div>
          </span>
        </div>
      );
    }

    return <div>{question_text}</div>;
  }

  // Contigency quizes
  quizThree(quizQnNum) {
    let question_text;
    if (quizQnNum < this.state.stimNum + 1) {
      // zuerst die Bedingungen
      var quizStimIndex = this.state.quizStimIndex[quizQnNum - 1]; // z.B. wenn das gemischte Array [1,3,2,0] ist
      var quizStim = this.state.stim[quizStimIndex];

      question_text = (
        <div className={styles.main}>
          <span className={styles.centerTwo}>
            <div className="col-md-12 text-center">
              <img src={quizStim} alt="stim images" width="100" height="auto" />
            </div>
            <br />
            <strong>F{this.state.quizQnNum}a:</strong> Wie oft (auf einer Skala von{" "}
            <strong>0</strong> bis <strong>100%</strong>) beeinflusst dieser Planet
            unser System? 
            <br />
            <br />
            <SliderPhase3.SliderContinQn
              key={this.state.continSliderKeys[quizQnNum - 1]}
              callBackValue={this.callbackContin.bind(this)}
              initialValue={this.state.quizContinDefault}
            />
            <br />
            <br />
            <strong>F{this.state.quizQnNum}b:</strong> Wie sicher (auf einer Skala von{" "}
            <strong>0</strong> &nbsp;bis <strong>100</strong>) sind Sie sich Ihrer 
            obigen Schätzung? 
            <br />
            <br />
            <SliderPhase3.SliderConfQn
              key={this.state.confSliderKeys[quizQnNum - 1]}
              callBackValue={this.callbackConf.bind(this)}
              initialValue={this.state.quizConfDefault}
            />
            <br />
            <br />
            <span className={styles.centerTwo}>
              [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> 
              (nicht nur klicken), um auf WEITER zu klicken.] 
            </span>
            <br />
            <br />
            <div className="col-md-12 text-center">
              <Button
                id="right"
                className={styles.clc}
                disabled={this.state.btnDis}
                onClick={this.saveQuizData.bind(this)}
              >
                WEITER
              </Button>
            </div>
          </span>
        </div>
      );
    } else {
      // dann die Geräuschbewertungen
      var soundPlay = this.state.quizSound[
        quizQnNum - (this.state.stimNum + 1)
      ];
      var varPlayColour = this.state.varPlayColour[
        quizQnNum - (this.state.stimNum + 1)
      ];
      var volume = this.state.quizSoundVol[
        quizQnNum - (this.state.stimNum + 1)
      ];

      question_text = (
        <div className={styles.main}>
          <span className={styles.centerTwo}>
            <strong>F{this.state.quizQnNum}:</strong> Wie angenehm (auf einer Skala
            von <strong>0</strong> bis <strong>100</strong>) finden Sie dieses
            Geräusch? 
            <br /> <br />
            <span className={styles.centerTwo}>(Klicken Sie auf die Wiedergabetaste.)</span> 
            <br />
            <br />
            <span className={styles.center}>
              <PlayButton
                audio={soundPlay}
                play={this.togglePlay}
                stop={this.togglePlay}
                volume={volume}
                idleBackgroundColor={varPlayColour}
                active={this.state.active}
              />
            </span>
            <br />
            <br />
            <SliderPhase3.SliderAverQn
              key={
                this.state.averSliderKeys[quizQnNum - (this.state.stimNum + 1)]
              }
              callBackValue={this.callbackAver.bind(this)}
              initialValue={this.state.quizAverDefault}
            />
            <br />
            <br />
            <span className={styles.centerTwo}>
              [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> 
              (nicht nur klicken), um auf WEITER zu klicken.] 
            </span>
            <br />
            <br />
            <div className="col-md-12 text-center">
              <Button
                id="right"
                className={styles.clc}
                disabled={this.state.btnDis}
                onClick={this.saveQuizData.bind(this)}
              >
                WEITER
              </Button>
            </div>
          </span>
        </div>
      );
    }

    return <div>{question_text}</div>;
  }


  // Contigency quizes for breaks
  quizBreak(quizQnNum) {
    let question_text;

    // zuerst die Bedingungen
    var quizStimIndex = this.state.quizStimIndex[quizQnNum - 1]; // z.B. wenn das gemischte Array [1,3,2,0] ist
    var quizStim = this.state.stim[quizStimIndex];

    question_text = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img src={quizStim} alt="Stimulusbilder" width="100" height="auto" />
          </div>
          <br />
          <strong>F{this.state.quizQnNum}a:</strong> Wie oft (auf einer Skala von{" "}
          <strong>0</strong> bis <strong>100%</strong>) beeinflusst dieser Planet
          unser System? 
          <br />
          <br />
          <SliderPhaseBreak.SliderContinQn
            key={this.state.continSliderKeys[quizQnNum - 1]}
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.state.quizContinDefault}
          />
          <br />
          <br />
          <strong>F{this.state.quizQnNum}b:</strong> Wie sicher (auf einer Skala von{" "}
          <strong>0</strong> &nbsp;bis <strong>100</strong>) sind Sie sich Ihrer 
          obigen Schätzung? 
          <br />
          <br />
          <SliderPhaseBreak.SliderConfQn
            key={this.state.confSliderKeys[quizQnNum - 1]}
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.state.quizConfDefault}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> 
            (nicht nur klicken), um auf WEITER zu klicken.] 
          </span>
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className={styles.clc}
              disabled={this.state.btnDis}
              onClick={this.saveQuizData.bind(this)}
            >
              WEITER
            </Button>
          </div>
        </span>
      </div>
    );

    return <div>{question_text}</div>;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // sAVE DATA functions
  saveData() {
    var userID = this.state.userID;
    var fbTime =
      Math.round(performance.now()) -
      (this.state.trialTime + this.state.fixTime + this.state.stimTime) +
      5;
    var volumeNotLog = logposition(this.state.volume);

    // var stimIndexCondIndiv = this.state.stimCondTrack[
    //   this.state.stimIndex[this.state.trialNum - 1]
    // ];

    let behaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,
      trialNum: this.state.trialNum,
      trialTime: this.state.trialTime,
      blockNum: this.state.blockNum,
      trialinBlockNum: this.state.trialinBlockNum,
      devaluedBlock: this.state.devaluedBlock,
      fixTime: this.state.fixTime,
      attenIndexIndiv: this.state.attenIndex[this.state.trialNum - 1],
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,
      stimIndexCondIndiv: this.state.stimIndex[this.state.trialNum - 1],
      stimTime: this.state.stimTime,
      fbProbTrack: this.state.fbProbTrack,
      randProb: this.state.randProb,
      responseKey: this.state.responseKey,
      reactionTime: this.state.reactionTime,
      playFbSound: this.state.playFbSound,
      fbTime: fbTime,
      volume: this.state.volume,
      volumeNotLog: volumeNotLog,
    };

    // console.log(behaviour);

    fetch(`${DATABASE_URL}/task_data/` + userID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(behaviour),
    });
  }

  saveQuizData() {
    var userID = this.state.userID;
    var quizQnRT = Math.round(performance.now()) - this.state.quizTime;
    var quizStimContin;
    var quizSoundLabel;
    var quizVolume;
    var quizVolumeNotLog;
    var section;

    //if it is still the planet rating
    if (this.state.quizQnNum < this.state.stimNum + 1) {
      // as it currently stands, the contigenc ratings at the end of the phase are NOT randomised
      var quizStimIndex = this.state.quizStimIndex[this.state.quizQnNum - 1]; // e.g if the shuffled array is [1,3,2,0]
      quizStimContin = this.state.fbProb[quizStimIndex];
      quizSoundLabel = null;
      quizVolume = null;
      quizVolumeNotLog = null;
      section = "planetRating";

      if (this.state.taskSession === 1) {
        var journeyOneContin = this.state.journeyOneContin;
        var journeyOneContinStim = this.state.journeyOneContinStim;
        var journeyOneContinFbProb = this.state.journeyOneContinFbProb;

        journeyOneContin[this.state.quizQnNum - 1] = this.state.quizContin;
        journeyOneContinStim[this.state.quizQnNum - 1] = quizStimIndex;
        journeyOneContinFbProb[this.state.quizQnNum - 1] = quizStimContin;

        this.setState({
          journeyOneContin: journeyOneContin,
          journeyOneContinStim: journeyOneContinStim,
          journeyOneContinFbProb: journeyOneContinFbProb,
        });
      } else if (this.state.taskSession === 2) {
        var journeyTwoContin = this.state.journeyTwoContin;
        var journeyTwoContinStim = this.state.journeyTwoContinStim;
        var journeyTwoContinFbProb = this.state.journeyTwoContinFbProb;
        journeyTwoContin[this.state.quizQnNum - 1] = this.state.quizContin;
        journeyTwoContinStim[this.state.quizQnNum - 1] = quizStimIndex;
        journeyTwoContinFbProb[this.state.quizQnNum - 1] = quizStimContin;

        this.setState({
          journeyTwoContin: journeyTwoContin,
          journeyTwoContinStim: journeyTwoContinStim,
          journeyTwoContinFbProb: journeyTwoContinFbProb,
        });
      } else if (this.state.taskSession === 3) {
        var journeyThreeContin = this.state.journeyThreeContin;
        var journeyThreeContinStim = this.state.journeyThreeContinStim;
        var journeyThreeContinFbProb = this.state.journeyThreeContinFbProb;
        journeyThreeContin[this.state.quizQnNum - 1] = this.state.quizContin;
        journeyThreeContinStim[this.state.quizQnNum - 1] = quizStimIndex;
        journeyThreeContinFbProb[this.state.quizQnNum - 1] = quizStimContin;

        this.setState({
          journeyThreeContin: journeyThreeContin,
          journeyThreeContinStim: journeyThreeContinStim,
          journeyThreeContinFbProb: journeyThreeContinFbProb,
        });
      }
    } else {
      //quizNum is 5 and above
      //if it is the sound rating
      quizSoundLabel = this.state.quizSoundLabel[
        this.state.quizQnNum - (this.state.stimNum + 1)
      ];
      quizStimIndex = null;
      quizStimContin = null;
      quizVolume = this.state.quizSoundVol[
        this.state.quizQnNum - (this.state.stimNum + 1)
      ];
      quizVolumeNotLog = logposition(quizVolume);
      section = "soundRating";
    }

    // console.log(this.state.quizSoundLabel);
    // console.log(quizSoundLabel);

    let quizbehaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      quizTime: this.state.quizTime,
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,
      section: section,
      quizQnNum: this.state.quizQnNum,
      quizQnRT: quizQnRT,
      quizStimContin: quizStimContin, //this is the actual contigency of the stimuli
      quizStimIndex: quizStimIndex,
      quizStimIndexCount: null, //this is populated for the trial ratings in phase 1, not for anything other quiz sections
      quizStimDevalue: null,
      quizContinDefault: this.state.quizContinDefault,
      quizContin: this.state.quizContin,
      quizConfDefault: this.state.quizConfDefault,
      quizConf: this.state.quizConf,
      quizSoundLabel: quizSoundLabel,
      playNum: this.state.playNum,
      quizVolume: quizVolume,
      quizVolumeNotLog: quizVolumeNotLog,
      quizAverDefault: this.state.quizAverDefault,
      quizAver: this.state.quizAver,
      checkPoint: this.state.checkPoint,
    };

    try {
      fetch(`${DATABASE_URL}/task_quiz/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizbehaviour),
      });
    } catch (e) {
      console.log("Cant post?");
    }
    // console.log("Contin:" + this.state.quizContin);
    // console.log("ContinDefault:" + this.state.quizContinDefault);

    //lag a bit to make sure statestate is saved
    setTimeout(
      function () {
        this.quizNext();
      }.bind(this),
      10
    );
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  // Misc functions

  handleDebugKeyLocal(pressed) {
    var whichButton = pressed;

    if (whichButton === 10) {
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        0
      );
    }
  }

  _handleDebugKey = (event) => {
    var pressed;

    switch (event.keyCode) {
      case 32:
        //    this is SPACEBAR
        pressed = 10;
        this.handleDebugKeyLocal(pressed);
        break;
      default:
    }
  };

  redirectToTarget() {
    document.removeEventListener("keyup", this._handleDebugKey);
    this.props.history.push({
      pathname: `/EndPage`,
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        journeyOneContin: this.state.journeyOneContin,
        journeyOneContinStim: this.state.journeyOneContinStim,
        journeyOneContinFbProb: this.state.journeyOneContinFbProb,

        journeyTwoContin: this.state.journeyTwoContin,
        journeyTwoContinStim: this.state.journeyTwoContinStim,
        journeyTwoContinFbProb: this.state.journeyTwoContinFbProb,

        journeyThreeContin: this.state.journeyThreeContin,
        journeyThreeContinStim: this.state.journeyThreeContinStim,
        journeyThreeContinFbProb: this.state.journeyThreeContinFbProb,
      },
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  // condition check

  saveCond() {
    var userID = this.state.userID;

    let behaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      restartTime: new Date().toLocaleString(), // just to ensure to know which is the last condition rolled
      session: "task",
      // there they restarted
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,

      stimCondTrack: this.state.stimCondTrack,
      totalTrialLog1: this.state.totalTrialLog[0],
      totalTrialLog2: this.state.totalTrialLog[1],
      totalTrialLog3: this.state.totalTrialLog[2],

      trialPerBlockNumLog1: this.state.trialPerBlockNumLog[0],
      trialPerBlockNumLog2: this.state.trialPerBlockNumLog[1],
      trialPerBlockNumLog3: this.state.trialPerBlockNumLog[2],

      stimIndexLog1: this.state.stimIndexLog[0],
      stimIndexLog2: this.state.stimIndexLog[1],
      stimIndexLog3: this.state.stimIndexLog[2],

      attenIndexLog1: this.state.attenIndexLog[0],
      attenIndexLog2: this.state.attenIndexLog[1],
      attenIndexLog3: this.state.attenIndexLog[2],

      totalBlockLog1: this.state.totalBlockLog[0],
      totalBlockLog2: this.state.totalBlockLog[1],
      totalBlockLog3: this.state.totalBlockLog[2],

      attenCheckAllLog1: this.state.attenCheckAllLog[0],
      attenCheckAllLog2: this.state.attenCheckAllLog[1],
      attenCheckAllLog3: this.state.attenCheckAllLog[2],

      outcomeLog1: this.state.outcomeLog[0],
      outcomeLog2: this.state.outcomeLog[1],
      outcomeLog3: this.state.outcomeLog[2],
    };

    // console.log(behaviour);

    fetch(`${DATABASE_URL}/cond_data/` + userID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(behaviour),
    });
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    setTimeout(
      function () {
        this.saveCond();
      }.bind(this),
      5
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  // render time

  render() {
    let text;
    if (this.state.debug === false) {
      if (this.state.currentScreen === false) {
        if (this.state.instructScreen === true) {
          if (this.state.taskSession === 1) {
            if (this.state.quizScreen === false) {
              if (this.state.ratingTrialScreen === false) {
                if (this.state.currentInstructionText === 1) {
                  document.addEventListener("keyup", this._handleInstructKey);
                  if (this.state.taskSessionTry > 1) {
                    text = (
                      <div className={styles.main}>
                        <p>
                          <span className={styles.center}>
                            <strong>
                              HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                            </strong>
                          </span>
                          <br />
                          Wir gehen auf eine neue Reihe von drei Reisen. 
                          <br />
                          <br />
                          <span className={styles.centerTwo}>
                            [<strong>WEITER</strong> →]
                          </span>
                        </p>
                      </div>
                    );
                  } else {
                    text = (
                      <div className={styles.main}>
                        <p>
                          <span className={styles.center}>
                            <strong>
                              HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                            </strong>
                          </span>
                          <br />
                          Großartig!
                          <br /> <br />
                          Heute werden wir drei Reisen unternehmen. 
                          <br />
                          <br />
                          Wenn Sie gute Leistungen erbringen, erhalten Sie
                          einen Bonus von bis zu €2 ! 
                          <br /> <br />
                          <span className={styles.centerTwo}>
                            [<strong>WEITER</strong> →]
                          </span>
                        </p>
                      </div>
                    );
                  }
                } else if (this.state.currentInstructionText === 2) {
                  text = (
                    <div className={styles.main}>
                      <p>
                        <span className={styles.center}>
                          <strong>
                            HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                          </strong>
                        </span>
                        <br />
                        Auf der ersten Reise werden wir auf&nbsp;
                        <strong>sechs</strong> neue Planeten stoßen <br />
                        anstelle der zwei, die Sie in Ihrem Training gesehen haben. 
                        <br /> <br />
                        Da unsere Erkundung lang ist, werden wir unsere Energie zunächst
                        sparen, daher ist <br />
                        die Aktivierung des Schutzschilds während dieser Reise 
                        <strong>nicht verfügbar</strong>. 
                        <br /> <br />
                        Mit anderen Worten, die <strong>LEERTASTE</strong> wird
                        NICHT funktionieren.
                        <br /> <br />
                        <span className={styles.centerTwo}>
                          [← <strong>BACK</strong>] [<strong>WEITER</strong> →]
                        </span>
                      </p>
                    </div>
                  );
                } else if (this.state.currentInstructionText === 3) {
                  text = (
                    <div className={styles.main}>
                      <p>
                        <span className={styles.center}>
                          <strong>
                            HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                          </strong>
                        </span>
                        <br />
                        Stattdessen sollten Sie diese Gelegenheit nutzen, um einige
                        Daten über die Planeten zu sammeln.
                        <br />
                        <br />
                        An mehreren Stellen entlang der Reise möchten wir, dass Sie
                        einschätzen, wie gefährlich der Planet ist, <br />
                        d.h. wie wahrscheinlich es ist, dass der Planet unser System
                        beeinflusst (auf einer Skala von <strong>0</strong> bis <strong>100%</strong>): 
                        <br />
                        <br />
                        <br />
                        <TrialRatingSlider.ExampleContin />
                        <br />
                        <br />
                        Wir möchten auch, dass Sie angeben, wie&nbsp;
                        <strong>sicher</strong> Sie sich bei dieser Schätzung fühlen
                        (auf einer Skala von <strong>0</strong> bis <strong>100</strong>): 
                        <br />
                        <br />
                        <TrialRatingSlider.ExampleConf />
                        <br /> <br />
                        <span className={styles.centerTwo}>
                          [← <strong>BACK</strong>] [<strong>WEITER</strong> →]
                        </span>
                      </p>
                    </div>
                  );
                } else if (this.state.currentInstructionText === 4) {
                  document.addEventListener("keyup", this._handleBeginKey);
                  text = (
                    <div className={styles.main}>
                      <p>
                        <span className={styles.center}>
                          <strong>
                            HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                          </strong>
                        </span>
                        <br />
                        Dies sind die sechs Planeten, denen Sie auf dieser Reise begegnen
                        werden.
                        <br />
                        <br />
                        <span className={styles.centerTwo}>
                          <img
                            src={this.state.stim[0]}
                            alt="stim images"
                            width="100"
                            height="auto"
                          />
                          &nbsp;
                          <img
                            src={this.state.stim[1]}
                            alt="stim images"
                            width="100"
                            height="auto"
                          />
                          &nbsp;
                          <img
                            src={this.state.stim[2]}
                            alt="stim images"
                            width="100"
                            height="auto"
                          />
                          &nbsp;
                          <img
                            src={this.state.stim[3]}
                            alt="stim images"
                            width="100"
                            height="auto"
                          />
                          &nbsp;
                          <img
                            src={this.state.stim[4]}
                            alt="stim images"
                            width="100"
                            height="auto"
                          />
                          &nbsp;
                          <img
                            src={this.state.stim[5]}
                            alt="stim images"
                            width="100"
                            height="auto"
                          />
                        </span>
                        <br />
                        Bevor wir die Reise beginnen, möchten wir Sie bitten eine
                        Einschätzung abzugeben,  
                        <br />
                        wie gefährlich ist jeder der Planeten.  
                        <br /> <br />
                        <span className={styles.centerTwo}>
                          Wenn Sie bereit sind, drücken Sie bitte die&nbsp;
                          <strong>LEERTASTE</strong>, um zu beginnen.  
                        </span>
                        <br />
                        <span className={styles.centerTwo}>
                          [← <strong>BACK</strong>]
                        </span>
                      </p>
                    </div>
                  );
                } else if (this.state.currentInstructionText === 5) {
                  document.addEventListener("keyup", this._handleInstructKey);
                  text = (
                    <div className={styles.main}>
                      <p>
                        <span className={styles.center}>
                          <strong>
                            HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                          </strong>
                        </span>
                        <br />
                        Großartig!
                        <br /> <br />
                        Neben Ihren Angaben dazu, wie wahrscheinlich es ist, dass jeder
                        Planet unser Navigationssystem beeinflusst, 
                        <br />
                        an <u>mehreren Stellen entlang der Reise</u>, werden wir 
                        Sie darum bitten, dass Sie 
                        <br />
                        Ihre endgültige Gesamtbewertung für jeden Planeten am <u>Ende dieser
                        Reise</u> abzugeben. 
                        <br />
                        <br />
                        Denken Sie daran, dass unser System überhitzen kann und das
                        Warnsignal ertönen wird.  
                        <br />
                        <br />
                        Auch wenn dies <strong>selten</strong> vorkommt, ist es wichtig,
                        dass Sie es mit der <strong>W</strong> Taste das System abkühlen, 
                        <br />
                        andernfalls wird unser System nicht richtig funktionieren.  
                        <br /> <br />
                        Wenn dies passiert, müssen wir unsere Erkundung stoppen und
                        neu starten!  
                        <br /> <br />
                        <span className={styles.centerTwo}>
                          [<strong>WEITER</strong> →]
                        </span>
                      </p>
                    </div>
                  );
                } else if (this.state.currentInstructionText === 6) {
                  document.addEventListener("keyup", this._handleBeginKey);
                  text = (
                    <div className={styles.main}>
                      <p>
                        <span className={styles.center}>
                          <strong>
                            HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                          </strong>
                        </span>
                        <br />
                        auf der ersten Reise werden wir&nbsp;
                        {this.state.totalBlock} Flüge unternehmen und dabei die
                        Planeten {this.state.trialPerBlockNum} Mal pro Flug
                        vorbei fliegen.
                        <br />
                        <br />
                        <span className={styles.centerTwo}>
                          Wenn Sie bereit sind, drücken Sie bitte die&nbsp;
                          <strong>LEERTASTE</strong>, um zu beginnen.
                        </span>
                        <br />
                        <span className={styles.centerTwo}>
                          [← <strong>BACK</strong>]
                        </span>
                      </p>
                    </div>
                  );
                }
              }
              
              // if rating screen is TRUE
              else if (this.state.ratingTrialScreen === true) {
                // current screen is false, this.state.instruct is true, ratingTrialScreen is true, the in between rating Trial
                text = <div> {this.ratingTrial()}</div>;
              }
            } else if (this.state.quizScreen === true) {
              document.removeEventListener("keyup", this._handleInstructKey);
              document.removeEventListener("keyup", this._handleBeginKey);
              // current screen is false
              //this.state.instruct is true, quizScreen is true, the sound ratings

              if (this.state.prior === true) {
                text = <div> {this.quizZero(this.state.quizQnNum)}</div>;
              } else {
                //this.state.instruct is true, quizScreen is true, the sound ratings
                text = <div> {this.quizOne(this.state.quizQnNum)}</div>;
              }
            }
          } else if (this.state.taskSession === 2) {
            //////this.state.instruct is true,
            if (this.state.quizScreen === false) {
              document.addEventListener("keyup", this._handleBeginKey);
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                      </strong>
                    </span>
                    <br />
                    Gut gemacht! Für die zweite Reise werden wir die volle Energie
                    nutzen.
                    <br />
                    Wie gefährlich oder harmlos ein Planet ist, <strong>bleibt gleich</strong> wie bei
                    unserer ersten Reise.
                    <br />
                    <br />
                    Jetzt können Sie das Schutzschild mit der&nbsp;
                    <strong>LEERTASTE</strong> aktivieren, wenn wir uns einem Planeten nähern.
                    <br /> <br />
                    Wenn wir uns gefährlicheren Planeten nähern, <strong>SOLLEN</strong> Sie das
                    Schutzschild zum Schutz aktivieren.
                    <br />
                    Wenn wir uns harmlosen Planeten nähern, <strong>SOLLEN</strong> Sie das
                    Schutzschild nicht aktivieren, um Energie zu sparen.
                    <br /> <br />
                    <strong>Denken Sie daran</strong>: <br />
                    1) Wir können das Schutzschild mit der&nbsp;
                    <strong>LEERTASTE</strong> aktivieren.
                    <br />
                    2) Kühlen Sie das System mit der <strong>W</strong> Taste ab, wenn das
                    Warnsignal ertönt.
                    <br /> <br />
                    Für die zweite Reise werden wir {this.state.totalBlock}
                    &nbsp; Flüge unternehmen und dabei {this.state.trialPerBlockNum} 
                    Planeten pro Flug vorbei fliegen.
                    <br />
                    Sie haben die Möglichkeit, zwischen den Reisen eine Pause einzulegen.
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      Wenn Sie bereit sind, drücken Sie bitte die&nbsp;
                      <strong>LEERTASTE</strong>, um zu beginnen. 
                    </span>
                  </p>
                </div>
              );
            } else {
              // wenn hier ein Quiz-Bildschirm angezeigt wird
              document.removeEventListener("keyup", this._handleInstructKey);
              document.removeEventListener("keyup", this._handleBeginKey);
              // aktueller Bildschirm ist falsch
              //this.state.instruct ist wahr, quizScreen ist wahr, die Klangbewertung
              text = <div> {this.quizTwo(this.state.quizQnNum)}</div>;
            }
          } else if (this.state.taskSession === 3) {
            //////this.state.instruct ist wahr, wird das Kontingenz-Quiz sein, wenn es endet
            if (this.state.quizScreen === false) {
              if (this.state.currentInstructionText === 1) {
                document.addEventListener("keyup", this._handleBeginKey);
                //  document.addEventListener("keyup", this._handleInstructKey);
                text = (
                  <div className={styles.main}>
                    <p>
                      <span className={styles.center}>
                        <strong>
                          HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                        </strong>
                      </span>
                      <br />
                      Großartige Arbeit bei der letzten Reise!
                      <br />
                      <br />
                      Für den Rest der Reise haben wir Berichte erhalten, dass die
                      Strahlungswerte von diesen <strong>drei</strong>{" "}
                      Planeten:
                      <br /> <br />
                      <span className={styles.center}>
                        <img
                          src={
                            this.state.stim[
                              this.state.stimCondTrackDevalIndex[0]
                            ]
                          }
                          alt="stim images"
                          width="100"
                          height="auto"
                        />
                        &nbsp; &nbsp; &nbsp;
                        <img
                          src={
                            this.state.stim[
                              this.state.stimCondTrackDevalIndex[1]
                            ]
                          }
                          alt="stim images"
                          width="100"
                          height="auto"
                        />
                        &nbsp; &nbsp; &nbsp;
                        <img
                          src={
                            this.state.stim[
                              this.state.stimCondTrackDevalIndex[2]
                            ]
                          }
                          alt="stim images"
                          width="100"
                          height="auto"
                        />
                        <br /> <br />
                      </span>
                      auf <strong>0%</strong> reduziert wurden. Das bedeutet, dass sie unser
                      System überhaupt nicht beeinflussen werden.
                      <br />
                      Auf der anderen Seite <strong>bleiben die anderen drei</strong>{" "}
                      Planeten <strong>so gefährlich oder so harmlos</strong>
                      <br />
                      wie sie es während der vorherigen Reisen waren.
                      <br /> <br />
                      Wir sollten notieren, welche Planeten jetzt völlig harmlos sind
                      und dies in unser Logbuch eintragen, bevor wir unsere Reise
                      beginnen.
                      <br />
                      <br />
                      <span className={styles.centerTwo}>
                        Bitte drücken Sie die LEERTASTE, um dies festzuhalten. 
                      </span>
                      <br />
                      <span className={styles.centerTwo}>
                        [<strong>START</strong>]
                      </span>
                    </p>
                  </div>
                );
              } else if (this.state.currentInstructionText === 2) {
                document.removeEventListener(
                  "keyup",
                  this._handleDevalueQuizKey
                );
                document.addEventListener("keyup", this._handleBeginKey);
                text = (
                  <div className={styles.main}>
                    <p>
                      <span className={styles.center}>
                        <strong>
                          HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                        </strong>
                      </span>
                      <br />
                      Großartig! Berücksichtigen Sie diese neuen Informationen in unserer
                      nächsten Reise.
                      <br /> <br />
                      Das bedeutet, dass Sie für diese harmlosen Planeten <strong>NICHT</strong>
                      das Schutzschild aktivieren sollten.
                      <br /> <br />
                      <strong>Denken Sie daran</strong>: <br />
                      1) Wir können das Schutzschild mit der&nbsp;
                      <strong>LEERTASTE</strong> aktivieren.
                      <br />
                      2) Kühlen Sie das System mit der <strong>W</strong> Taste ab, wenn das
                      Warnsignal ertönt.
                      <br /> <br />
                      Für die dritte Reise werden wir den Planeten&nbsp;{this.state.trialPerBlockNum} 
                      Mal in&nbsp; {this.state.totalBlock} Flüge vorbei fliegen. <br />
                      Sie haben die Möglichkeit, zwischen den Reisen eine Pause einzulegen.
                      <br />
                      <br />
                      <span className={styles.centerTwo}>
                        Wenn Sie bereit sind, drücken Sie bitte die&nbsp;
                        <strong>LEERTASTE</strong>, um zu beginnen. 
                      </span>
                    </p>
                  </div>
                );
                // wenn Sie das Devalue-Quiz nicht bestehen, machen Sie es erneut
              } else if (this.state.currentInstructionText === 3) {
                document.addEventListener("keyup", this._handleBeginKey);
                text = (
                  <div className={styles.main}>
                    <p>
                      <span className={styles.center}>
                        <strong>
                          HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                        </strong>
                      </span>
                      <br />
                      Leider haben Sie die falschen Planeten notiert! 
                      <br /> <br />
                      Bitte lesen Sie den Bericht sorgfältig durch und notieren Sie die
                      korrekten Planeten. 
                      <br />
                      <br />
                      <span className={styles.centerTwo}>
                        Wenn Sie bereit sind, drücken Sie bitte die&nbsp;
                        <strong>LEERTASTE</strong>, um den Bericht erneut zu lesen. 
                      </span>
                    </p>
                  </div>
                );
              }
              //
            } else if (this.state.quizScreen === true) {
              if (this.state.currentInstructionText === 1) {
                // dies ist das Devalue-Quiz
                document.addEventListener("keyup", this._handleDevalueQuizKey);
                document.removeEventListener("keyup", this._handleBeginKey);
                text = <div> {this.devalueQuiz()}</div>;
              } else {
                // dies ist das Abschlussquiz
                document.removeEventListener("keyup", this._handleInstructKey);
                document.removeEventListener("keyup", this._handleBeginKey);
                //this.state.instruct ist wahr, quizScreen ist wahr, die taskSession endet, wird das Kontingenz-Quiz (Session 3) sein
                text = <div> {this.quizThree(this.state.quizQnNum)}</div>;
              }
            }
          }
          
          //if current screen is false, instruct is false,
        } else {
          // wenn die Aufmerksamkeitskontrolle
          document.addEventListener("keyup", this._handleBeginKey);
          if (this.state.attenPass === false) {
            if (this.state.taskSession === 1) {
              text = (
                <div className={styles.main}>
                  <p>
                    Sie haben es nicht geschafft, das System rechtzeitig mit der&nbsp;
                    <strong>W</strong> Taste abzukühlen! 
                    <br />
                    <br />
                    Das System ist überhitzt! 
                    <br />
                    <br />
                    Wir müssen unsere Reise von vorne beginnen. 
                    <br /> <br />
                    <strong>Denken Sie daran</strong>: <br />
                    Kühlen Sie das System mit der <strong>W</strong> Taste ab, wenn das
                    Warnsignal ertönt. 
                    <br />
                    <br />
                    <span className={styles.centerTwo}>
                      Wenn Sie bereit sind, drücken Sie bitte die&nbsp;
                      <strong>LEERTASTE</strong>, um neu zu starten. 
                    </span>
                  </p>
                </div>
              );
            } else {
              // Task-Session 2 oder 3, wo die Vermeidungstaste funktioniert
              text = (
                <div className={styles.main}>
                  <p>
                    Sie haben es nicht geschafft, das System rechtzeitig mit der&nbsp;
                    <strong>W</strong> Taste abzukühlen!
                    <br />
                    <br />
                    Das System ist überhitzt! 
                    <br />
                    <br />
                    Wir müssen unsere Reise neu starten. 
                    <br /> <br />
                    <strong>Denken Sie daran</strong>: <br />
                    1) Wir können das Schutzschild mit der&nbsp;
                    <strong>LEERTASTE</strong> aktivieren. 
                    <br />
                    2) Kühlen Sie das System mit der <strong>W</strong> Taste ab, wenn das
                    Warnsignal ertönt.
                    <br />
                    <br />
                    <span className={styles.centerTwo}>
                      Wenn Sie bereit sind, drücken Sie bitte die&nbsp;
                      <strong>LEERTASTE</strong>, um neu zu starten. 
                    </span>
                  </p>
                </div>
              );
            }
          } else {
            if (this.state.quizScreen === false) {
              // Aufmerksamkeit ist wahr,
              // wenn der aktuelle Bildschirm falsch ist, Anweisung falsch ist, aber Aufmerksamkeit in Ordnung ist, dann ist es die Pause
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        HAUPTAUFGABE: TEIL {this.state.taskSession} VON 3
                      </strong>
                    </span>
                    <br />
                    Sie sind noch auf Reise {this.state.taskSession}!
                    <br /> <br />
                    Sie haben {this.state.blockNum} von&nbsp;
                    {this.state.totalBlock} Trials abgeschlossen! 
                    <br /> <br />
                    Sie können eine kurze Pause machen und mit der nächsten Reise fortfahren,
                    wenn Sie bereit sind. 
                    <br /> <br />
                    <strong>Denken Sie daran</strong>: <br />
                    1) Wir können das Schutzschild mit der&nbsp;
                    <strong>LEERTASTE</strong> aktivieren. 
                    <br />
                    2) Kühlen Sie das System mit der <strong>W</strong> Taste ab, wenn das
                    Warnsignal ertönt. 
                    <br />
                    3) Wie gefährlich oder harmlos ein Planet ist, bleibt bei der
                    nächsten Reise gleich. 
                    <br />
                    <br />
                    <span className={styles.centerTwo}>
                      Wenn Sie bereit sind, drücken Sie bitte die&nbsp;
                      <strong>LEERTASTE</strong>, um fortzufahren. 
                    </span>
                  </p>
                </div>
              );
            } else if (this.state.quizScreen === true) {
              // das ist das Pause-Quiz
              text = <div> {this.quizBreak(this.state.quizQnNum)}</div>;
            }
          }
        }
        
      } else {
        // if currentScreen is true, then play the task
        document.removeEventListener("keyup", this._handleInstructKey);
        document.removeEventListener("keyup", this._handleBeginKey);
        text = (
          <div>
            <div className={styles.counter}>
              {this.state.trialNum}/{this.state.totalTrial}&nbsp;
              <img
                src={this.state.counter}
                alt="counter"
                width="50"
                height="auto"
              />
            </div>
            <div className={styles.stimuli}>
              <div
                className={styles.square}
                style={{
                  display: this.state.imageBorder ? "block" : "none",
                }}
              ></div>
              <img
                src={this.state.showImage}
                alt="stim images"
                width="250"
                height="auto"
              />
            </div>
          </div>
        );
      }
    } else if (this.state.debug === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div className={styles.main}>
          <p>
            <span className={styles.center}>DEBUG MODE</span>
            <br />

            <span className={styles.centerTwo}>
              Drücken Sie die [<strong>Leertaste</strong>] um fortzufahren. 
            </span>
          </p>
        </div>
      );
    }

    return <div className={styles.spaceship}>{text}</div>;
  }
}

export default withRouter(ExptTask);
