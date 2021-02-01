import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

// import AudioPlayerDOM from "./AudioPlayerDOM";

import fix from "./images/fixation-white-small.png";
import stimTrain1 from "./images/yellow_planet.png";
import stimTrain2 from "./images/army_planet.png";
import fbAver from "./images/bad.png";
import fbSafe from "./images/good.png";
import fbAvoid from "./images/neutral.png";
import astrodude from "./images/astronaut.png";

import attenSound from "./sounds/task/IADSE_pianomed1360_5000.wav";
import fbSound from "./sounds/task/morriss_scream_1000.wav";
import avoidSound from "./sounds/task/bacigalupo_whitenoise_1000_red2.wav";

import styles from "./style/taskStyle.module.css";

import PlayButton from "./PlayButton";

import { DATABASE_URL } from "./config";
import * as Slider from "./sliders/QuizSliderTut.js";

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//global function to shuffle
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//shuffling 2 arrays in the same order
// function shuffleTwo(obj1, obj2) {
//   var index = obj1.length;
//   var rnd, tmp1, tmp2;
//
//   while (index) {
//     rnd = Math.floor(Math.random() * index);
//     index -= 1;
//     tmp1 = obj1[index];
//     tmp2 = obj2[index];
//     obj1[index] = obj1[rnd];
//     obj2[index] = obj2[rnd];
//     obj1[rnd] = tmp1;
//     obj2[rnd] = tmp2;
//   }
// }

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

//return slider position
function logposition(value) {
  // position will be between 0 and 100
  var minp = 0;
  var maxp = 100;

  // The bounds of the slider
  var minv = Math.log(1);
  var maxv = Math.log(100);

  // calculate adjustment factor
  var scale = (maxv - minv) / (maxp - minp);

  return (Math.log(value) - minv) / scale + minp;
}

//for volume, it is in log scale
function logslider(position) {
  // position will be between 0 and 100
  var minp = 0;
  var maxp = 100;

  // The bounds of the slider
  var minv = Math.log(1);
  var maxv = Math.log(100);

  // calculate adjustment factor
  var scale = (maxv - minv) / (maxp - minp);

  return Math.exp(minv + scale * (position - minp));
}

//array of certain length within a certain range
function randomArray(length, min, max) {
  let range = max - min + 1;
  return Array.apply(null, Array(length)).map(function () {
    return Math.round(Math.random() * range) + min;
  });
}

// Current structure is:
// Tut 1: tutorial on the warning jingle, no quiz
// Tut 2: tutorial on the aversive probabilites, quizTwo - 1 question
// Tut 3: tutorial on the avoidance key, quizThree, 3 question
// Quiz four- Rating for the sounds before we start the main expt  - 3 sound ratings, only aversiveness

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TUTORIAL SESSIONS + QUIZ FOR THE TASK
class TutorTask extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    const userID = this.props.location.state.userID;
    const date = this.props.location.state.date;
    const startTime = this.props.location.state.startTime;
    const volume = this.props.location.state.volume;
    const volumeHalfAver = this.props.location.state.volumeHalfAver;

    // for debug
    // var userID = 1000;
    // var date = 1000;
    // var startTime = 1000;
    // var volume = 20;
    // var volumeHalfAver = 10;

    var volumeAtten = logslider(logposition(volume) / 3); //make warning tone soft

    console.log("volume: " + volume);
    console.log("volumeHalfAver: " + volumeHalfAver);
    console.log("volumeAtten: " + volumeAtten);

    // Define how many trials per tutorial session
    var totalTrialTut1 = 6;
    var totalTrialTut2 = 20;
    var totalTrialTut3 = 20;
    var stimNum = 2;

    var trialPerStim1 = totalTrialTut1 / stimNum; //3 per stim
    var trialPerStim2 = totalTrialTut2 / stimNum; //10 per stim
    var trialPerStim3 = totalTrialTut3 / stimNum; //10 per stim

    var stim = [stimTrain1, stimTrain2];
    var fbProb = [0.1, 0.9];
    var stimCondTrack = [0, 1];

    // this is to randomise fractals and their fb probs
    //  shuffleSame(stim, fbProb);
    shuffleSame(fbProb, stimCondTrack);

    fbProb = fbProb.filter(function (val) {
      return val !== undefined;
    });
    stimCondTrack = stimCondTrack.filter(function (val) {
      return val !== undefined;
    });

    //////////////////////////////////
    //TUT ONE STIM INDEX AND OUTCOME - actually outcome is not needed
    var stim1Indx1 = Array(Math.round(trialPerStim1)).fill(0); // [1,1,1,1,1]
    var stim2Indx1 = Array(Math.round(trialPerStim1)).fill(1); // [2,2,2,2,2]

    // [0.1*4 = 0.4] [4-0] [0,0,0,0]
    var stim1outcome = shuffle(
      Array(Math.round(fbProb[0] * trialPerStim1))
        .fill(1)
        .concat(
          Array(trialPerStim1 - Math.round(fbProb[0] * trialPerStim1)).fill(0)
        )
    );

    // [0.9*4 = 3.6] [4-4] [1,1,1,1]
    var stim2outcome = shuffle(
      Array(Math.round(fbProb[1] * trialPerStim1))
        .fill(1)
        .concat(
          Array(trialPerStim1 - Math.round(fbProb[1] * trialPerStim1)).fill(0)
        )
    );

    //////////////////////////////////
    //TUT TWO STIM INDEX AND OUTCOME

    var stim1Indx2 = Array(Math.round(trialPerStim2)).fill(0); //8 per stim
    var stim2Indx2 = Array(Math.round(trialPerStim2)).fill(1); //8 per stim

    // [0.1*8 = 0.8] [8-1] [1,0,0,0,0,0,0,0]
    var stim1outcome2 = shuffle(
      Array(Math.round(fbProb[0] * trialPerStim2))
        .fill(1)
        .concat(
          Array(trialPerStim2 - Math.round(fbProb[0] * trialPerStim2)).fill(0)
        )
    );

    // [0.9*8 = 7.2] [8-7] [1,1,1,1,1,1,1,0]
    var stim2outcome2 = shuffle(
      Array(Math.round(fbProb[1] * trialPerStim2))
        .fill(1)
        .concat(
          Array(trialPerStim2 - Math.round(fbProb[1] * trialPerStim2)).fill(0)
        )
    );

    //////////////////////////////////
    //PHASE THREE STIM INDEX AND OUTCOME
    var stim1Indx3 = Array(Math.round(trialPerStim3)).fill(0);
    var stim2Indx3 = Array(Math.round(trialPerStim3)).fill(1);

    // [0.1*8 = 0.8] [8-1] [1,0,0,0,0,0,0,0]
    var stim1outcome3 = shuffle(
      Array(Math.round(fbProb[0] * trialPerStim3))
        .fill(1)
        .concat(
          Array(trialPerStim3 - Math.round(fbProb[0] * trialPerStim3)).fill(0)
        )
    );

    // [0.9*8 = 7.2] [8-7] [1,1,1,1,1,1,1,0]
    var stim2outcome3 = shuffle(
      Array(Math.round(fbProb[1] * trialPerStim3))
        .fill(1)
        .concat(
          Array(trialPerStim3 - Math.round(fbProb[1] * trialPerStim3)).fill(0)
        )
    );

    ////////////////////////////////
    // PULL ALL TOGETHER
    var stimIndexPhase1 = stim1Indx1.concat(stim2Indx1);
    var stimOutcomePhase1 = stim1outcome.concat(stim2outcome);

    var stimIndexPhase2 = stim1Indx2.concat(stim2Indx2);
    var stimOutcomePhase2 = stim1outcome2.concat(stim2outcome2);

    var stimIndexPhase3 = stim1Indx3.concat(stim2Indx3);
    var stimOutcomePhase3 = stim1outcome3.concat(stim2outcome3);

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

    shuffleSame(stimIndexPhase1, stimOutcomePhase1);
    shuffleSame(stimIndexPhase2, stimOutcomePhase2);
    shuffleSame(stimIndexPhase3, stimOutcomePhase3);

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
    // var stimIndexTut1 = stimIndexPhase1.map(function (value) {
    //   return value - 1;
    // });
    //
    // var stimIndexTut2 = stimIndexPhase2.map(function (value) {
    //   return value - 1;
    // });
    //
    // var stimIndexTut3 = stimIndexPhase3.map(function (value) {
    //   return value - 1;
    // });

    var stimIndexTut1 = stimIndexPhase1;

    var stimIndexTut2 = stimIndexPhase2;

    var stimIndexTut3 = stimIndexPhase3;

    // Define which trial has the attention check
    // Number of attention checks per tutorial
    var attenCheckTut1 = 1;
    var attenCheckTut2 = 1;
    var attenCheckTut3 = 1;
    // Padding - first two and last two cannot be the attention check trial
    var padding = [0, 0];

    // shuffling (total trial num (6) minus the number of checks (1) minus the number of padding (2*2=4))
    var attenIndex1Temp = shuffle(
      Array(attenCheckTut1)
        .fill(1)
        .concat(
          Array(totalTrialTut1 - attenCheckTut1 - padding.length * 2).fill(0)
        )
    );

    var attenIndex2Temp = shuffle(
      Array(attenCheckTut2)
        .fill(1)
        .concat(
          Array(totalTrialTut2 - attenCheckTut2 - padding.length * 2).fill(0)
        )
    );
    var attenIndex3Temp = shuffle(
      Array(attenCheckTut3)
        .fill(1)
        .concat(
          Array(totalTrialTut3 - attenCheckTut3 - padding.length * 2).fill(0)
        )
    );

    var attenIndex1 = padding.concat(attenIndex1Temp.concat(padding));
    var attenIndex2 = padding.concat(attenIndex2Temp.concat(padding));
    var attenIndex3 = padding.concat(attenIndex3Temp.concat(padding));

    attenIndex1 = attenIndex1.filter(function (val) {
      return val !== undefined;
    });
    attenIndex2 = attenIndex2.filter(function (val) {
      return val !== undefined;
    });

    attenIndex3 = attenIndex3.filter(function (val) {
      return val !== undefined;
    });

    var quizSounds = [fbSound, avoidSound, attenSound];
    var quizSoundLabels = ["fb", "avoid", "atten"];
    var quizSoundVol = [volume, volumeHalfAver, volumeAtten];

    var varPlayColour = [
      "#008000",
      "#395756",
      "#4f5d75",
      "#b6c8a9",
      "#188fa7",
      "#7261a3",
    ];

    shuffle(varPlayColour);
    shuffleSame(quizSounds, quizSoundLabels, quizSoundVol);

    varPlayColour = varPlayColour.filter(function (val) {
      return val !== undefined;
    });
    quizSounds = quizSounds.filter(function (val) {
      return val !== undefined;
    });

    quizSoundLabels = quizSoundLabels.filter(function (val) {
      return val !== undefined;
    });

    quizSoundVol = quizSoundVol.filter(function (val) {
      return val !== undefined;
    });

    var qnNumTotalQuizFour = 3;
    var averRatingDef = randomArray(qnNumTotalQuizFour, 35, 65);
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,

      varPlayColour: varPlayColour,

      totalTrialLog: [totalTrialTut1, totalTrialTut2, totalTrialTut3],
      stimIndexLog: [stimIndexTut1, stimIndexTut2, stimIndexTut3],

      attenIndexLog: [attenIndex1, attenIndex2, attenIndex3],
      attenCheckAllLog: [attenCheckTut1, attenCheckTut2, attenCheckTut3],

      outcomeLog: [stimOutcomePhase1, stimOutcomePhase2, stimOutcomePhase3],
      outcome: stimOutcomePhase1,

      quizAns2: 2,
      quizAns3: [3, 3, 1],
      quizQnTotal: [0, 1, 3, 3],

      attenIndex: [],
      attenLag: 5000,
      timeLag: [500, 1500, 1000],

      fbProb: fbProb, //this is shuffled so either stim1 is 0.1 or stim1 is 0.9,
      // this is already baked into the stimOutcomes
      // stim1 is always the yellow planet and stim2 is the purple planet
      respProb: 0.2,
      randProb: 0,
      fbProbTrack: 0,

      tutorialSession: 1,
      quizSession: 1,
      playNum: 0,

      currentInstructionText: 1,
      tutorialSessionTry: 1,

      trialNum: 0,
      quizQnNum: 1,
      quizScoreSum: 0,

      quizTime: 0,
      quizQnRT: 0,
      quizKeypress: [],
      quizScoreCor: [],

      totalTrial: [],
      stimIndex: [],
      responseKey: 0,
      attenCheckKey: 0,

      attenPass: true, // cchange this to change the percentage which they have to pass

      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      reactionTime: 0,
      fbTime: 0,

      fix: fix,
      stim: stim,
      fb: [fbAver, fbSafe, fbAvoid],

      fbSound: fbSound,
      attenSound: attenSound,
      avoidSound: avoidSound,
      quizSounds: quizSounds,

      quizSoundVol: quizSoundVol,
      quizSoundLabels: quizSoundLabels,
      quizSoundLabel: null,

      showImage: fix,
      imageBorder: false,

      attenTrial: 0,
      attenCheckTime: 0,
      attenTime: 0,
      playAttCheck: false,

      playFbSound: false,
      playFb: null,

      currentScreen: false, // false for instructions or quiz, true for tutorial
      quizScreen: false, // is it quiz or not

      // this is for the audio sound bite
      active: false,
      debugTask: true,
      volume: null,
      fullAverVolume: volume,
      halfAverVolume: volumeHalfAver,
      attenVolume: volumeAtten,
      averRatingDef: averRatingDef,
      quizAverDefault: null,
      quizAver: null,
      stimCondTrack: stimCondTrack,
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    // this.handleInstructionsLocal = this.handleInstructionsLocal.bind(this);
    this.handleInstructLocal = this.handleInstructLocal.bind(this);
    this.handleBegin = this.handleBegin.bind(this);

    this.quizCheck = this.quizCheck.bind(this);
    this.saveQuizData = this.saveQuizData.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.audioAtten = new Audio(this.state.attenSound);
    this.audioFb = new Audio(this.state.fbSound);
    this.audioAvoid = new Audio(this.state.avoidSound);

    this.audioAtten.volume = this.state.attenVolume / 100;
    this.audioFb.volume = this.state.fullAverVolume / 100;
    this.audioAvoid.volume = this.state.halfAverVolume / 100;

    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  // BEFORE RENDER

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  //Instruction related stuff

  //This toggles the audio for the sound in the instruction block
  togglePlay() {
    if (this.state.tutorialSession === 1) {
      this.setState({ active: !this.state.active }, () => {
        this.state.active ? this.audioAtten.play() : this.audioAtten.pause();
      });
    } else if (this.state.tutorialSession === 2) {
      this.setState({ active: !this.state.active }, () => {
        this.state.active ? this.audioFb.play() : this.audioFb.pause();
      });
    } else if (this.state.tutorialSession === 3) {
      this.setState({ active: !this.state.active }, () => {
        this.state.active ? this.audioAvoid.play() : this.audioAvoid.pause();
      });
    } else if (this.state.quizSession === 4) {
      if (this.state.active === false) {
        var playNum = this.state.playNum + 1;
        this.setState({ playNum: playNum });
      }
      this.setState({ active: !this.state.active });
    }
  }

  // This handles instruction screen within the component USING KEYBOARD
  handleInstructLocal(key_pressed) {
    var curText = this.state.currentInstructionText;
    var whichButton = key_pressed;

    if (this.state.tutorialSession === 2) {
      if (whichButton === 4 && curText > 1) {
        this.setState({ currentInstructionText: curText - 1 });
      } else if (whichButton === 5 && curText < 2) {
        this.setState({ currentInstructionText: curText + 1 });
      }
    } else {
      if (whichButton === 4 && curText > 1) {
        this.setState({ currentInstructionText: curText - 1 });
      } else if (whichButton === 5 && curText < 3) {
        this.setState({ currentInstructionText: curText + 1 });
      }
    }
  }

  handleBegin(key_pressed) {
    var whichButton = key_pressed;
    ////////////////////////////////////////////////////////////////////////////////////////
    if (this.state.tutorialSession === 1) {
      if (this.state.currentInstructionText === 3 && whichButton === 10) {
        setTimeout(
          function () {
            this.tutorialOne();
          }.bind(this),
          0
        );
      } else if (this.state.currentInstructionText === 4) {
        if (this.state.attenPass === false && whichButton === 10) {
          setTimeout(
            function () {
              this.tutorialRedo();
            }.bind(this),
            0
          );
        } else if (this.state.attenPass === true && whichButton === 5) {
          setTimeout(
            function () {
              this.tutorialProceedOne();
            }.bind(this),
            0
          );
        }
      }
      ////////////////////////////////////////////////////////////////////////////////////////
    } else if (this.state.tutorialSession === 2) {
      if (this.state.currentInstructionText === 2 && whichButton === 10) {
        setTimeout(
          function () {
            this.tutorialTwo();
          }.bind(this),
          0
        );
      } else if (this.state.currentInstructionText === 4) {
        if (this.state.attenPass === false && whichButton === 10) {
          //if fail attention check
          setTimeout(
            function () {
              this.tutorialRedo();
            }.bind(this),
            0
          );
        }
      } else if (
        this.state.currentInstructionText === 5 &&
        whichButton === 10
      ) {
        //if fail quiz
        setTimeout(
          function () {
            this.tutorialRedo();
          }.bind(this),
          0
        );
      }
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    else if (this.state.tutorialSession === 3) {
      if (this.state.currentInstructionText === 3 && whichButton === 10) {
        setTimeout(
          function () {
            this.tutorialThree();
          }.bind(this),
          0
        );
      } else if (this.state.currentInstructionText === 4) {
        if (this.state.attenPass === false && whichButton === 10) {
          setTimeout(
            function () {
              this.tutorialRedo();
            }.bind(this),
            0
          );
        } else if (this.state.attenPass === true && whichButton === 10) {
          setTimeout(
            function () {
              this.quizProceed();
            }.bind(this),
            0
          );
        }
      }
    } else if (this.state.tutorialSession === 4) {
      if (this.state.currentInstructionText === 1 && whichButton === 10) {
        //for the ratings screen, if pressbar, move to ratings
        this.setState({
          quizScreen: true,
        });
      }
    }
  }

  //this is for if fail tutorial 3 quiz
  handleRestart(key_pressed) {
    setTimeout(
      function () {
        this.tutorialRedo();
      }.bind(this),
      0
    );
  }

  // handle key key_pressed
  _handleRestartKey = (event) => {
    var key_pressed;

    switch (event.keyCode) {
      case 32:
        //    this is sapcebar
        key_pressed = 10;
        this.handleRestart(key_pressed);
        break;
      default:
    }
  };

  // handle key key_pressed
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

  // handle key key_pressed
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
  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////

  // RENDER ATTENTION TONE, THIS IS CALLED DURING FIXATION OF SOME TRIALS, IF ATTENINDEX = 1
  renderAtten() {
    document.addEventListener("keyup", this._handleAttenCheckKey); // change this later
    var attenTrial = this.state.trialNum;
    var attenTime = Math.round(performance.now());

    this.setState({
      attenTrial: attenTrial,
      attenTime: attenTime,
      playAttCheck: true,
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

  // AFTER A SET AMOUNT OF TIME, CHECK IF THEY CAUGHT THE TONE
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
      this.setState({
        attenPass: false,
        currentScreen: false,
        currentInstructionText: 4,
      });
    }
  }

  // SAVE ATTEN RELATED DATA
  saveAttenData() {
    var userID = this.state.userID;
    var volumeNotLog = logposition(this.state.volume);
    let attenBehaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      tutorialSession: this.state.tutorialSession,
      tutorialSessionTry: this.state.tutorialSessionTry,
      taskSession: null,
      taskSessionTry: null,
      attenTrial: this.state.attenTrial,
      attenTime: this.state.attenTime,
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,
      playAttCheck: this.state.playAttCheck,
      volume: this.state.volume,
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

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  // THREE COMPONENTS OF THE TASK, Fixation, Stimulus/Response and Feedback

  renderFix() {
    if (this.state.currentScreen === true) {
      console.log("Fixation IS RENDERED as currentScreen is TRUE");
      //if trials are still ongoing
      var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
      var trialTime = Math.round(performance.now());
      this.setState({ showImage: this.state.fix });

      console.log("playAttCheck :" + this.state.playAttCheck);
      console.log("attenindex :" + this.state.attenIndex);

      //Reset all parameters
      this.setState({
        trialNum: trialNum,
        responseKey: 0,
        attenCheckKey: 0,
        randProb: 0,
        trialTime: trialTime,
        fixTime: 0,
        stimTime: 0,
        attenCheckTime: 0,
        reactionTime: 0,
        fbTime: 0,
      });

      console.log("Trial No: " + this.state.trialNum);
      // console.log("Trial Total: " + this.state.totalTrial);
      // console.log("Full Stim Indx: " + this.state.stimIndex);

      if (this.state.trialNum < this.state.totalTrial + 1) {
        // Play attenSound
        if (this.state.attenIndex[this.state.trialNum - 1] === 1) {
          setTimeout(
            function () {
              this.renderAtten();
            }.bind(this),
            0
          );
        }
        this.refreshSound();

        setTimeout(
          function () {
            this.renderStim();
          }.bind(this),
          this.state.timeLag[0]
        );
      } else {
        // When it reach the set number of trials......
        document.removeEventListener("keyup", this._handleAttenCheckKey);
        if (this.state.tutorialSession === 1) {
          this.setState({
            currentScreen: false,
            currentInstructionText: 4,
          });
        } else if (this.state.tutorialSession === 2) {
          //set time for quiz
          var quizTime = Math.round(performance.now()); //for the first qn?
          this.setState({
            currentScreen: false,
            quizScreen: true,
            quizSession: 2,
            quizTime: quizTime,
          });
        } else if (this.state.tutorialSession === 3) {
          this.setState({
            currentScreen: false,
            currentInstructionText: 4,
            quizSession: 3,
          });
        } else {
          console.log("Fixation NOT RENDERED");
        }
      }
    } else {
      console.log("Fixation NOT RENDERED as currentScreen is FALSE");
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStim() {
    //if trials are still ongoing
    if (this.state.tutorialSession === 3) {
      // you only repond in the 3 session actually
      document.addEventListener("keyup", this._handleResponseKey);
    }

    if (this.state.trialNum < this.state.totalTrial + 1) {
      var fixTime = Math.round(performance.now()) - this.state.trialTime;
      this.setState({ showImage: this.state.fix, fixTime: fixTime });

      this.setState({
        showImage: this.state.stim[
          this.state.stimIndex[this.state.trialNum - 1]
        ],
      });

      console.log("Stim Idx: " + this.state.stimIndex[this.state.trialNum - 1]);

      //if it tutorial one, no fb is presented, so skip that
      if (this.state.tutorialSession === 1) {
        setTimeout(
          function () {
            this.saveData();
          }.bind(this),
          this.state.timeLag[1] - 50
        );

        setTimeout(
          function () {
            this.renderFix();
          }.bind(this),
          this.state.timeLag[1]
        );
      } else {
        setTimeout(
          function () {
            this.renderFb();
          }.bind(this),
          this.state.timeLag[1]
        );
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderFb() {
    document.removeEventListener("keyup", this._handleResponseKey);

    if (this.state.trialNum < this.state.totalTrial + 1) {
      //if trials are still ongoing
      // if its tutorialSession 2 or 3, and the response key is pressed

      //iF USE RANDPROB... ELSE?
      var randProb = this.state.outcome[this.state.trialNum - 1];
      //  randProb = Math.random();

      var stimTime =
        Math.round(performance.now()) -
        (this.state.trialTime + this.state.fixTime);

      console.log("Outcome Indx: " + randProb);
      console.log(
        "Fb Prob: " +
          this.state.fbProb[this.state.stimIndex[this.state.trialNum - 1]]
      );
      //this is essentially [0.1,0.9], index is 0 or 1 for stim1 or stim 2
      // console.log("Full Outcome Indx: " + this.state.outcome);

      this.setState({
        stimTime: stimTime,
        imageBorder: false,
        fbProbTrack: this.state.fbProb[
          this.state.stimIndex[this.state.trialNum - 1]
        ],
      });

      // If participant chooses  to avoid
      if (this.state.tutorialSession === 3 && this.state.responseKey === 1) {
        this.setState({
          showImage: this.state.fb[2],
          playFbSound: true,
          playFb: this.state.avoidSound,
          volume: this.state.halfAverVolume,
          randProb: randProb,
        });

        this.audioAvoid.load();
        this.audioAvoid.play();
      } else {
        // for every other thing,
        // If participant chooses NOT to avoid
        if (
          // randProb <
          // this.state.fbProb[this.state.stimIndex[this.state.trialNum - 1]]
          randProb === 1
        ) {
          //if mathrandom is less than 0.1, then play aversive sound

          this.audioFb.load();
          this.audioFb.play();

          this.setState({
            showImage: this.state.fb[0],
            playFbSound: true,
            playFb: this.state.fbSound,
            volume: this.state.fullAverVolume,
            randProb: randProb,
          });
        } else {
          this.setState({
            showImage: this.state.fb[1],
            playFbSound: false,
            playFb: null,
            volume: 0,
            randProb: randProb,
          });
        }
      }

      console.log("Avoid Resp: " + this.state.responseKey);
      console.log("Fb Play: " + this.state.playFbSound);

      setTimeout(
        function () {
          this.saveData();
        }.bind(this),
        this.state.timeLag[2] - 10
      );

      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        this.state.timeLag[2]
      );
    } else {
      console.log("Feedback NOT RENDERED.");
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // THREE COMPONENTS OF THE TASK, Fixation, Stimulus/Response and Feedback END ---------------

  //////////////////////////////////////////////////////////////////////////////////////////////
  // SOUND FUNCTIONS
  // REFRESH SOUND FOR FEEDBACK
  refreshSound() {
    this.setState({
      playFb: null,
      playFbSound: false,
    });
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  // KEY RESPONSE FUNCTIONS
  pressAvoid(key_pressed, time_pressed) {
    // If participant chooses to avoid
    var reactionTime =
      time_pressed -
      (this.state.trialTime + this.state.fixTime + this.state.stimTime);

    this.setState({
      responseKey: key_pressed,
      imageBorder: true,
      reactionTime: reactionTime,
    });
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

  pressAttenCheck(atten_pressed, atten_time_pressed) {
    var attenCheckTime = atten_time_pressed - this.state.attenTime;
    this.audioAtten.pause();

    this.setState({
      attenCheckKey: atten_pressed,
      attenCheckTime: attenCheckTime,
      volume: this.state.attenVolume,
      playAttCheck: false, //stop
    });
    console.log("Atten Check Key: Pressed");

    setTimeout(
      function () {
        this.saveAttenData();
      }.bind(this),
      5
    );
  }

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

  _handleKeyDownQuizTwo = (event) => {
    var pressed;
    var time_pressed;

    switch (event.keyCode) {
      case 49:
        pressed = 1;
        time_pressed = Math.round(performance.now());
        this.quizCheck(pressed, time_pressed);

        break;
      case 50:
        pressed = 2;
        time_pressed = Math.round(performance.now());
        this.quizCheck(pressed, time_pressed);

        break;
      default:
    }
  };

  _handleKeyDownQuizThree = (event) => {
    var pressed;
    var time_pressed;

    switch (event.keyCode) {
      case 49:
        pressed = 1;
        time_pressed = Math.round(performance.now());
        this.quizCheck(pressed, time_pressed);

        break;
      case 50:
        pressed = 2;
        time_pressed = Math.round(performance.now());
        this.quizCheck(pressed, time_pressed);

        break;
      case 51:
        pressed = 3;
        time_pressed = Math.round(performance.now());
        this.quizCheck(pressed, time_pressed);
        break;

      case 52:
        pressed = 4;
        time_pressed = Math.round(performance.now());
        this.quizCheck(pressed, time_pressed);
        break;

      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  // KEY RESPONSE FUNCTIONS ----------------------------------------------------------------END

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Set states for tutorial sections

  tutorialProceedOne() {
    this.setState({
      tutorialSession: 2,
      quizSession: 2,
      currentScreen: false,
      quizScreen: false,
      currentInstructionText: 1,
      quizScoreSum: 0,
      quizQnNum: 1,
      playAtten: null,
      playFb: null,
      playAttCheck: false,
      playFbSound: false,
      tutorialSessionTry: 1, // start again from 1, because the count restarts for every section
    });
  }

  tutorialProceedTwo() {
    this.setState({
      tutorialSession: 3,
      quizSession: 3,
      currentScreen: false,
      quizScreen: false,
      currentInstructionText: 1,
      quizScoreSum: 0,
      quizQnNum: 1,
      tutorialSessionTry: 1, // start again from 1, because the count restarts for every section
    });
  }

  // finsished all tutorials, so its just rating the sounds time
  // it goes to instruction page //proceed after tutorial 3
  tutorialProceedThree() {
    document.addEventListener("keyup", this._handleBeginKey);
    // it goes to a
    var quizSoundLabel = this.state.quizSoundLabels[0];

    this.setState({
      quizSoundLabel: quizSoundLabel,
      active: false,
      playNum: 0,
      quizSession: 4,
      tutorialSession: 4,
      currentScreen: false,
      quizScreen: false,
      currentInstructionText: 1,
      quizScoreSum: null,
      quizQnNum: 1,
      tutorialSessionTry: null,
      quizAverDefault: this.state.averRatingDef[0],
    });

    console.log("Tutorial Sess: " + this.state.tutorialSession);
  }

  tutorialRedo() {
    document.removeEventListener("keyup", this._handleRestartKey);
    var tutorialSessionTry = this.state.tutorialSessionTry + 1;

    this.setState({
      tutorialSessionTry: tutorialSessionTry,
      currentScreen: false,
      quizScreen: false,
      currentInstructionText: 1,
      quizScoreSum: 0,
      quizQnNum: 1,
      attenCheckKeyAll: [],
      attenCheckKeySum: 0,
    });
  }

  // First tutorial sess
  // This is just 2 stim, and experiencing the aversive sound probablity
  // No reponse or attention check

  tutorialOne() {
    this.setState(
      {
        currentScreen: true, //set for the task instead of instructionScreen
        quizScreen: false,
        trialNum: 0,
        totalTrial: this.state.totalTrialLog[0],
        stimIndex: this.state.stimIndexLog[0],
        attenIndex: this.state.attenIndexLog[0],
        attenCheckAll: this.state.attenCheckAllLog[0],
        outcome: this.state.outcomeLog[0],
      },
      () =>
        console.log(
          "Begin Tutorial One: " +
            " FB PROB: " +
            this.state.fbProb +
            " TOTAL TRIAL: " +
            this.state.totalTrial +
            " FULL STIM INDEX : " +
            this.state.stimIndex +
            " FULL OUTCOME INDEX : " +
            this.state.outcome
        )
    );

    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  // Second tutorial sess
  tutorialTwo() {
    this.setState(
      {
        currentScreen: true, //set for the task instead of instructionScreen
        quizScreen: false,
        trialNum: 0,
        totalTrial: this.state.totalTrialLog[1],
        stimIndex: this.state.stimIndexLog[1],
        attenIndex: this.state.attenIndexLog[1],
        attenCheckAll: this.state.attenCheckAllLog[1],
        outcome: this.state.outcomeLog[1],
        playFb: null,
        playAttCheck: false,
        playFbSound: false,
      },
      () =>
        console.log(
          "Begin Tutorial Two: " +
            " FB PROB: " +
            this.state.fbProb +
            " TOTAL TRIAL: " +
            this.state.totalTrial +
            " FULL STIM INDEX : " +
            this.state.stimIndex +
            " FULL OUTCOME INDEX : " +
            this.state.outcome
        )
    );

    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  // Third tutorial sess
  tutorialThree() {
    this.setState(
      {
        currentScreen: true, //set for the task instead of instructionScreen
        quizScreen: false,
        trialNum: 0,
        totalTrial: this.state.totalTrialLog[2],
        stimIndex: this.state.stimIndexLog[2],
        attenIndex: this.state.attenIndexLog[2],
        attenCheckAll: this.state.attenCheckAllLog[2],
        outcome: this.state.outcomeLog[2],
        playFb: null,
        playAttCheck: false,
        playFbSound: false,
      },
      () =>
        console.log(
          "Begin Tutorial Three: " +
            " FB PROB: " +
            this.state.fbProb +
            " TOTAL TRIAL: " +
            this.state.totalTrial +
            " FULL STIM INDEX : " +
            this.state.stimIndex +
            " FULL OUTCOME INDEX : " +
            this.state.outcome
        )
    );

    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Set states for tutorial sections --------------------------------------------------------end
  // only for quiz 3 which has the additional page
  quizProceed(event) {
    var quizTime = Math.round(performance.now());
    this.setState({
      quizScreen: true,
      quizTime: quizTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Quiz for tutorials

  // First tutorial quiz
  quizTwo(quizQnNum) {
    //which stim is the high fb one..
    //the answer is always 2
    var quizStim1 = null;
    var quizStim2 = null;

    //number 2 is the more aversive one
    quizStim1 = this.state.stim[this.state.stimCondTrack.indexOf(0)];
    quizStim2 = this.state.stim[this.state.stimCondTrack.indexOf(1)];

    let question_text1 = (
      <div className={styles.main}>
        <p>
          Which planet was more dangerous?
          <br /> <br />
          <span className={styles.center}>
            <strong>1</strong> -{" "}
            <img src={quizStim1} alt="stim images" width="250" height="auto" />
            &nbsp; &nbsp; &nbsp;
            <strong>2</strong> -{" "}
            <img src={quizStim2} alt="stim images" width="250" height="auto" />
          </span>{" "}
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Press the correct number key]
          </span>
        </p>
      </div>
    );

    return <div>{question_text1}</div>;
  }

  quizThree(quizQnNum) {
    let question_text1 = (
      <div className={styles.main}>
        <p>
          <strong>Q{this.state.quizQnNum}:</strong> The planets we fly past...
          <br />
          <br />
          <strong>1</strong> - are all very safe, emitting no radiation at all,{" "}
          <br />
          which does not change across time.
          <br />
          <strong>2</strong> - are all very dangerous, emitting very high levels
          of radiation, <br />
          which can change across time.
          <br />
          <strong>3</strong> - can be either be mostly safe or dangerous, having
          a certain level of radiation each, <br />
          which does not change across time.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />{" "}
          <span className={styles.centerTwo}>
            [Press the correct number key]
          </span>
        </p>
      </div>
    );

    let question_text2 = (
      <div className={styles.main}>
        <p>
          <strong>Q{this.state.quizQnNum}:</strong> What happens if I activate
          the shield as we approach a planet?
          <br />
          <br />
          <strong>1</strong> - Nothing happens and a good green smiley is
          presented.
          <br />
          <strong>2</strong> - The spacecrew will scream and a bad red smiley is
          presented.
          <br />
          <strong>3</strong> - I will receive a slight interruption sound and a
          neutral yellow smiley is presented.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />{" "}
          <span className={styles.centerTwo}>
            [Press the correct number key]
          </span>
        </p>
      </div>
    );

    let question_text3 = (
      <div className={styles.main}>
        <p>
          <strong>Q{this.state.quizQnNum}:</strong> What should I do when the
          overheating warning jingle plays?
          <br />
          <br />
          <strong>1</strong> - Press the <strong>W</strong> key as quickly as
          possible.
          <br />
          <strong>2</strong> - Press the <strong>SPACEBAR</strong> key as
          quickly as possible.
          <br />
          <strong>3</strong> - Don’t press anything.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />{" "}
          <span className={styles.centerTwo}>
            [Press the correct number key]
          </span>
        </p>
      </div>
    );

    switch (quizQnNum) {
      case 1:
        return <div>{question_text1}</div>;
      case 2:
        return <div>{question_text2}</div>;
      case 3:
        return <div>{question_text3}</div>;
      default:
    }
  }

  callbackAver(callBackValue) {
    this.setState({ quizAver: callBackValue });
    if (this.state.quizAver !== null && this.state.playNum > 0) {
      this.setState({ btnDis: false });
    }
  }

  // To ask them for the valence rating of the noises
  // before we start the task
  quizFour(quizQnNum) {
    let question_text1 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>Q{this.state.quizQnNum}:</strong> How pleasant (on a scale of{" "}
          <strong>0</strong> to <strong>100</strong>) do you find this sound?{" "}
          <br /> <br />
          <span className={styles.centerTwo}>(Click the play button.)</span>
          <br />
          <br />
          <span className={styles.center}>
            <PlayButton
              audio={this.state.quizSounds[0]}
              play={this.togglePlay}
              stop={this.togglePlay}
              volume={this.state.quizSoundVol[0]}
              idleBackgroundColor={this.state.varPlayColour[quizQnNum - 1]}
              active={this.state.active}
            />
          </span>
          <br />
          <br />
          <Slider.SliderAver
            key={this.state.quizQnNum}
            callBackValue={this.callbackAver.bind(this)}
            initialValue={this.state.quizAverDefault}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> (not just click) the slider to
            click NEXT.]
          </span>
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className={styles.clc}
              disabled={this.state.btnDis}
              onClick={this.saveRatingData.bind(this)}
            >
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text2 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>Q{this.state.quizQnNum}:</strong> How pleasant (on a scale of{" "}
          <strong>0</strong> to <strong>100</strong>) do you find this sound?{" "}
          <br /> <br />
          <span className={styles.centerTwo}>(Click the play button.)</span>
          <br />
          <br />
          <span className={styles.center}>
            <PlayButton
              audio={this.state.quizSounds[1]}
              play={this.togglePlay}
              stop={this.togglePlay}
              volume={this.state.quizSoundVol[1]}
              idleBackgroundColor={this.state.varPlayColour[quizQnNum - 1]}
              active={this.state.active}
            />
          </span>
          <br />
          <br />
          <Slider.SliderAver
            key={this.state.quizQnNum}
            callBackValue={this.callbackAver.bind(this)}
            initialValue={this.state.quizAverDefault}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> (not just click) the slider to
            click NEXT.]
          </span>
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className={styles.clc}
              disabled={this.state.btnDis}
              onClick={this.saveRatingData.bind(this)}
            >
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text3 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>Q{this.state.quizQnNum}:</strong> How pleasant (on a scale of{" "}
          <strong>0</strong> to <strong>100</strong>) do you find this sound?{" "}
          <br /> <br />
          <span className={styles.centerTwo}>(Click the play button.)</span>
          <br />
          <br />
          <span className={styles.center}>
            <PlayButton
              audio={this.state.quizSounds[2]}
              play={this.togglePlay}
              stop={this.togglePlay}
              volume={this.state.quizSoundVol[2]}
              idleBackgroundColor={this.state.varPlayColour[quizQnNum - 1]}
              active={this.state.active}
            />
          </span>
          <br />
          <br />
          <Slider.SliderAver
            key={this.state.quizQnNum}
            callBackValue={this.callbackAver.bind(this)}
            initialValue={this.state.quizAverDefault}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> (not just click) the slider to
            click NEXT.]
          </span>
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className={styles.clc}
              disabled={this.state.btnDis}
              onClick={this.saveRatingData.bind(this)}
            >
              END
            </Button>
          </div>
        </span>
      </div>
    );

    switch (quizQnNum) {
      case 1:
        return <div>{question_text1}</div>;
      case 2:
        return <div>{question_text2}</div>;
      case 3:
        return <div>{question_text3}</div>;
      default:
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  // Quiz for tutorials ---------------------------------------------------------------------end

  // function to go to next quiz question and check score
  quizCheck(pressed, time_pressed) {
    var quizQnNum = this.state.quizQnNum; //quiz question number (this needs to be rest to 1)
    var quizScoreCor = this.state.quizScoreCor; // correct or not for each quiz question (this needs to be rest to 0)
    var quizScoreSum = this.state.quizScoreSum; // sum score of quiz (this needs to be rest to 0)
    var quizQnIndx = quizQnNum - 1; // to index the trial in array, it's 0
    var quizQnRT = time_pressed - this.state.quizTime;

    if (this.state.quizSession === 2) {
      // Check answers if correct
      if (quizQnNum === 1 && pressed === this.state.quizAns2) {
        quizScoreCor[quizQnIndx] = 1;
        quizScoreSum = quizScoreSum + 1;
      } else {
        //if it is incorrect, redo
      }
    } else if (this.state.quizSession === 3) {
      if (
        (quizQnNum === 1 && pressed === this.state.quizAns3[0]) ||
        (quizQnNum === 2 && pressed === this.state.quizAns3[1]) ||
        (quizQnNum === 3 && pressed === this.state.quizAns3[2])
      ) {
        quizScoreCor[quizQnIndx] = 1;
        quizScoreSum = quizScoreSum + 1;
      }
    }

    console.log("quizAns2: " + this.state.quizAns2);
    console.log("quizSession: " + this.state.quizSession);
    console.log("quizScoreSum: " + quizScoreSum);
    console.log("quizScoreCor: " + quizScoreCor);
    console.log("quizQnNum: " + quizQnNum);

    this.setState({
      quizKeypress: pressed,
      quizQnRT: quizQnRT,
      quizScoreCor: quizScoreCor,
      quizScoreSum: quizScoreSum,
    });

    setTimeout(
      function () {
        this.saveQuizData();
      }.bind(this),
      5
    );
  }

  quizNext() {
    var quizQnNum = this.state.quizQnNum + 1;
    var quizTime = Math.round(performance.now());

    if (this.state.quizSession === 4) {
      // in the last quizSession, which is the rating task
      // if (quizQnNum < this.state.quizQnTotal[this.state.quizSession - 1]) {
      //for the next round
      var quizSoundLabel = this.state.quizSoundLabels[quizQnNum - 1];
      this.setState({
        quizSoundLabel: quizSoundLabel,
        active: false,
        btnDis: true,
        playNum: 0,
        quizTime: quizTime,
        quizQnNum: quizQnNum,
        quizAverDefault: this.state.averRatingDef[quizQnNum - 1],
        quizAver: null,
      });
      // }
      // else {
      //   //if alr reach the last rating, then redirectToTarget
      //   setTimeout(
      //     function () {
      //       this.redirectToTarget();
      //     }.bind(this),
      //     10
      //   );
      // }
    } else {
      this.setState({ quizQnNum: quizQnNum, quizTime: quizTime });
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Misc functions
  //save rating data to the TASK quiz data schema
  saveRatingData() {
    var quizQnRT = Math.round(performance.now()) - this.state.quizTime;
    var userID = this.state.userID;
    var quizVolume = this.state.quizSoundVol[this.state.quizQnNum - 1];
    var quizVolumeNotLog = logposition(quizVolume);

    let quizbehaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      quizTime: this.state.quizTime,
      taskSession: 0,
      taskSessionTry: null,
      section: "soundRating",
      quizQnNum: this.state.quizQnNum,
      quizQnRT: quizQnRT,
      quizStimIndexCount: null, //this will be the stim trial index aka how many times it is of that particular stimuli [1,2, 1, 2, 3,4..]
      quizStimContin: null, //this is the actual contigency of the stimuli
      quizStimDevalue: null,
      quizStimIndex: null,
      quizContinDefault: null,
      quizContin: null,
      quizConfDefault: null,
      quizConf: null,
      quizSoundLabel: this.state.quizSoundLabel,
      playNum: this.state.playNum,
      quizVolume: quizVolume,
      quizVolumeNotLog: quizVolumeNotLog,
      quizAverDefault: this.state.quizAverDefault,
      quizAver: this.state.quizAver,
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

    //lag a bit to make sure statestate is saved
    setTimeout(
      function () {
        this.quizNext();
      }.bind(this),
      10
    );
  }

  saveQuizData() {
    var userID = this.state.userID;

    let behaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      quizTime: this.state.quizTime,
      tutorialSession: this.state.tutorialSession,
      tutorialSessionTry: this.state.tutorialSessionTry,
      quizSession: this.state.quizSession,
      quizQnNum: this.state.quizQnNum,
      quizKeypress: this.state.quizKeypress,
      quizQnRT: this.state.quizQnRT,
      quizScoreCor: this.state.quizScoreCor[this.state.quizQnNum - 1],
    };

    fetch(`${DATABASE_URL}/tutorial_quiz/` + userID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(behaviour),
    });

    setTimeout(
      function () {
        this.quizNext();
      }.bind(this),
      10
    );
  }

  saveData() {
    var userID = this.state.userID;
    var volumeNotLog = logposition(this.state.volume);
    var stimTime;
    var fbTime;
    if (this.state.tutorialSession === 1) {
      // in tutorial one, there is no noise feedback
      stimTime =
        Math.round(performance.now()) -
        (this.state.trialTime + this.state.fixTime) +
        50;
      fbTime = 0;
    } else {
      stimTime = this.state.stimTime;
      fbTime =
        Math.round(performance.now()) -
        (this.state.trialTime + this.state.fixTime + this.state.stimTime) +
        10;
    }

    let tutBehaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      tutorialSession: this.state.tutorialSession,
      tutorialSessionTry: this.state.tutorialSessionTry,

      trialNum: this.state.trialNum,
      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      attenIndex: this.state.attenIndex[this.state.trialNum - 1],
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,

      stimTime: stimTime,
      stimIndex: this.state.stimIndex[this.state.trialNum - 1],
      fbProbTrack: this.state.fbProbTrack,
      randProb: this.state.randProb,
      responseKey: this.state.responseKey,
      reactionTime: this.state.reactionTime,
      playFbSound: this.state.playFbSound,
      fbTime: fbTime,
      volume: this.state.volume,
      volumeNotLog: volumeNotLog,
    };

    console.log(JSON.stringify(tutBehaviour));

    try {
      fetch(`${DATABASE_URL}/tutorial_data/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tutBehaviour),
      });
    } catch (e) {
      console.log("Cant post?");
    }
  }

  redirectToTarget() {
    this.props.history.push({
      pathname: `/ExptTask`,
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        fullAverVolume: this.state.fullAverVolume,
        halfAverVolume: this.state.halfAverVolume,
        attenVolume: this.state.attenVolume,
      },
    });
  }

  saveCond() {
    var userID = this.state.userID;

    let behaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      restartTime: new Date().toLocaleString(), // just to ensure to know which is the last condition rolled
      session: "tutorial",

      // I don't reshuffle the conditions when redo for tut tho
      taskSession: this.state.tutorialSession,
      taskSessionTry: this.state.tutorialSessionTry,

      stimCondTrack: this.state.stimCondTrack,

      totalTrialLog1: this.state.totalTrialLog[0],
      totalTrialLog2: this.state.totalTrialLog[1],
      totalTrialLog3: this.state.totalTrialLog[2],

      trialPerBlockNumLog1: 1,
      trialPerBlockNumLog2: 1,
      trialPerBlockNumLog3: 1,

      stimIndexLog1: this.state.stimIndexLog[0],
      stimIndexLog2: this.state.stimIndexLog[1],
      stimIndexLog3: this.state.stimIndexLog[2],

      attenIndexLog1: this.state.attenIndexLog[0],
      attenIndexLog2: this.state.attenIndexLog[1],
      attenIndexLog3: this.state.attenIndexLog[2],

      totalBlockLog1: this.state.totalTrialLog[0],
      totalBlockLog2: this.state.totalTrialLog[1],
      totalBlockLog3: this.state.totalTrialLog[2],

      attenCheckAllLog1: this.state.attenCheckAllLog[0],
      attenCheckAllLog2: this.state.attenCheckAllLog[1],
      attenCheckAllLog3: this.state.attenCheckAllLog[2],

      outcomeLog1: this.state.outcomeLog[0],
      outcomeLog2: this.state.outcomeLog[1],
      outcomeLog3: this.state.outcomeLog[2],
    };

    console.log(behaviour);

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
    this.renderFix();
    this.audioAtten.addEventListener("ended", () =>
      this.setState({ active: false })
    );
    this.audioFb.addEventListener("ended", () =>
      this.setState({ active: false })
    );

    this.audioAvoid.addEventListener("ended", () =>
      this.setState({ active: false })
    );
    window.scrollTo(0, 0);

    setTimeout(
      function () {
        this.saveCond();
      }.bind(this),
      5
    );
  }

  componentWillUnmount() {
    this.audioAtten.removeEventListener("ended", () =>
      this.setState({ active: false })
    );
    this.audioFb.removeEventListener("ended", () =>
      this.setState({ active: false })
    );
    this.audioAvoid.removeEventListener("ended", () =>
      this.setState({ active: false })
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  // render time
  render() {
    let text;

    //////////////////////////////////////////////////////////////////////////////////////////////
    // This is the last page before moving on to the exprimental task
    if (this.state.debugTask === true) {
      text = (
        <div className={styles.main}>
          <p>
            Move to main task! Click NEXT.
            <br />
            <br />
            <span className={styles.center}>
              <Button
                id="right"
                className={styles.clc}
                onClick={this.redirectToTarget.bind(this)}
              >
                <span className="bold">NEXT</span>
              </Button>
            </span>
          </p>
        </div>
      );
    } else {
      //////////////////////////////////////////////////////////////////////////////////////////////
      // INSTRUCTIONS
      if (
        this.state.currentScreen === false &&
        this.state.quizScreen === false
      ) {
        if (this.state.tutorialSession === 1) {
          // if it's the first tutorial session,
          if (this.state.currentInstructionText === 1) {
            document.addEventListener("keyup", this._handleInstructKey);
            text = (
              <div className={styles.main}>
                <p>
                  {" "}
                  <span className={styles.center}>
                    Hello and welcome to my spaceship!{" "}
                  </span>
                  <br />
                  We&#39;ve been shorthanded on board. We are really glad that
                  you are here to help.
                  <br />
                  <br />
                  Today, we will teach you how to navigate the spaceship.
                  <br />
                  <br />
                  There are three things that you will need to learn.
                  <br />
                  <br />
                  <span className={styles.astro}>
                    <img src={astrodude} alt="astrodude" />
                  </span>
                  <span className={styles.centerTwo}>
                    [<strong>NEXT</strong> →]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 2) {
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TRAINING: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  As we navigate through the galaxy, we will fly past some
                  planets, e.g.
                  <br />
                  <br />
                  <span className={styles.center}>
                    <img
                      src={stimTrain1}
                      alt="stim images"
                      width="150"
                      height="auto"
                    />
                  </span>
                  <br />
                  Sometimes, our nagivation system overheats and a warning
                  jingle will be played. <br />
                  <br />
                  Click the play button below to hear how it sounds like.
                  <br />
                  <br />
                  <span className={styles.center}>
                    <PlayButton
                      audio={this.state.attenSound}
                      play={this.togglePlay}
                      stop={this.togglePlay}
                      volume={this.state.attenVolume}
                      active={this.state.active}
                    />
                  </span>
                  <br />
                  <span className={styles.centerTwo}>
                    [← <strong>BACK</strong>] [<strong>NEXT</strong> →]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 3) {
            document.addEventListener("keyup", this._handleBeginKey); // change this later

            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TRAINING: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  For the first part of your training, we will navigate past a
                  number of planets. <br /> <br />
                  Your aim is to listen for the warning jingle.
                  <br /> <br />
                  When you hear it, press the <strong>W</strong> key as quickly
                  as possible to cool our system down. <br />
                  This will stop the jingle.
                  <br /> <br />
                  If you fail to catch the warning jingle in time, the system
                  will overheat! <br />
                  You will have to restart your training.
                  <br /> <br />
                  <span className={styles.centerTwo}>
                    Please press the <strong>SPACEBAR</strong> to begin the
                    first training.
                  </span>
                  <br />
                  <span className={styles.centerTwo}>
                    [← <strong>BACK</strong>]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 4) {
            document.addEventListener("keyup", this._handleBeginKey);
            if (this.state.attenPass === true) {
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TRAINING: PART {this.state.tutorialSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Well done! You successfully caught the warning jingle in
                    time!
                    <br /> <br />
                    Our system was kept cool and safe.
                    <br /> <br />
                    As we nagivate the galaxy, the system will heat up <br />
                    <strong>sometimes</strong> and this warning jingle will{" "}
                    play.
                    <br />
                    <br />
                    You will have to respond in time with the <strong>
                      W
                    </strong>{" "}
                    key.
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      [<strong>NEXT</strong> →]
                    </span>
                  </p>
                </div>
              );
            } else {
              //they did NOT press attentioncheck majoirty of the time, so redo tutorial 3
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TRAINING: PART {this.state.tutorialSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Unfortunately, you missed the warning jingle and our system
                    overheated!
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      Please press <strong>SPACEBAR</strong> to try again.
                    </span>
                  </p>
                </div>
              );
            }
          }
        }
        //////////////////////////////////////////////////////////////////////////////////////////////
        // TUTORIAL 2
        else if (this.state.tutorialSession === 2) {
          if (this.state.currentInstructionText === 1) {
            document.addEventListener("keyup", this._handleInstructKey);

            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TRAINING: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  The second thing to learn is that planets we fly past each
                  emit a <strong>certain</strong>
                  <br />
                  level of radiation, which is dangerous for our navigation
                  system.
                  <br />
                  <br />
                  How likely a planet is mostly dangerous or harmless will not
                  change across time,
                  <br />
                  i.e. stay the same throughout the journey.
                  <br />
                  <br />
                  When you bypass a planet and are safe, a good green smiley
                  will appear.
                  <br />
                  <br />
                  However, if you are affected, there will be a scream from the
                  spacecrew
                  <br />
                  and a sad red smiley will appear.
                  <br /> <br />
                  Click the play button below to hear how the scream sounds
                  like.
                  <br /> <br />
                  <span className={styles.center}>
                    <PlayButton
                      audio={this.state.fbSound}
                      play={this.togglePlay}
                      stop={this.togglePlay}
                      volume={this.state.fullAverVolume}
                      active={this.state.active}
                    />
                  </span>
                  <br />
                  <span className={styles.centerTwo}>
                    [<strong>NEXT</strong> →]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 2) {
            document.addEventListener("keyup", this._handleBeginKey);
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TRAINING: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  Mostly dangerous planets will affect our system{" "}
                  <strong>more often</strong>, while
                  <br />
                  mostly harmless planets will affect our system{" "}
                  <strong>less often</strong>.
                  <br />
                  <br />
                  For the second part of your training, you will have to take
                  note <br />
                  which planet(s) are mostly dangerous or harmless.
                  <br />
                  <br />
                  We will ask you for your answer at the end of this training.
                  <br /> <br />
                  Our system will also heat up as we fly, so do remember to cool
                  the <br />
                  system down with the <strong>W</strong> key when the warning
                  jingle plays!
                  <br /> <br />
                  <strong>Note</strong>: If you fail, you will have to re-do
                  this training again.
                  <br /> <br />{" "}
                  <span className={styles.centerTwo}>
                    Please press <strong>SPACEBAR</strong> if you are ready to
                    begin this training.
                  </span>{" "}
                  <br />
                  <span className={styles.centerTwo}>
                    [← <strong>BACK</strong>]
                  </span>
                </p>
              </div>
            );
          }
          //add in the what if they fail the atten pass for tutorial 2
          else if (this.state.currentInstructionText === 4) {
            //If they pressed the attenCheck majority (50%) of the time,
            document.addEventListener("keyup", this._handleBeginKey);
            if (this.state.attenPass === false) {
              //they did NOT press attentioncheck majoirty of the time, so redo tutorial
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TRAINING: PART {this.state.tutorialSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Unfortunately, you missed the warning jingle and our system
                    overheated!
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      Please press <strong>SPACEBAR</strong> to try again.
                    </span>
                  </p>
                </div>
              );
            }
          }
        }
        //////////////////////////////////////////////////////////////////////////////////////////////
        // TUTORIAL 3
        else if (this.state.tutorialSession === 3) {
          if (this.state.currentInstructionText === 1) {
            document.addEventListener("keyup", this._handleInstructKey);
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TRAINING: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  Great! You saw that one planet was more dangerous than the
                  other.
                  <br />
                  <br />
                  How dangerous or harmless they are will remain the same as we
                  navigate the galaxy.
                  <br />
                  <br />
                  In the third and last part of your training, we can activate a
                  magnetic shield with <br />
                  the <strong>SPACEBAR</strong> key to protect our system from
                  the radiation the planets emit.
                  <br /> <br />
                  However, this comes at a cost - power will be needed to
                  activate the shield.
                  <br />
                  This will interrupt our system <strong>slightly</strong> and a
                  neutral yellow smiley will be shown. <br /> <br />
                  Click the play button below to hear how this slight
                  interruption sounds like.
                  <br /> <br />
                  <span className={styles.center}>
                    <PlayButton
                      audio={this.state.avoidSound}
                      play={this.togglePlay}
                      stop={this.togglePlay}
                      volume={this.state.halfAverVolume}
                      active={this.state.active}
                    />
                  </span>
                  <br />
                  <span className={styles.centerTwo}>
                    [<strong>NEXT</strong> →]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 2) {
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TRAINING: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  What this means is that you have to decide whether activating
                  the shield <br />
                  is beneficial for each planet that we fly past.
                  <br />
                  <br />
                  For instance, you <strong>SHOULD</strong> activate the shield
                  if you think the planet we approach will be dangerous.
                  <br />
                  <br />
                  However, you <strong>SHOULD NOT</strong> activate the shield
                  if you think the planet we approach will be safe,
                  <br />
                  otherwise we will be wasting power and interrupting our system
                  unnecessarily.
                  <br /> <br />
                  <span className={styles.centerTwo}>
                    [← <strong>BACK</strong>] [<strong>NEXT</strong> →]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 3) {
            document.addEventListener("keyup", this._handleBeginKey);
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TRAINING: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  In this last part of your training, we will nagivate past the
                  same planets as before. <br />
                  <br />
                  You will have to use your knowledge of which planets are
                  mostly dangerous or not
                  <br />
                  and to activate the shield with <strong>SPACEBAR</strong> key
                  if you wish.
                  <br /> <br />
                  Remember, if the warning jingle plays, cool the system with
                  the <strong>W</strong> key!
                  <br /> <br />
                  After, you will have to pass a short quiz based on your
                  training.
                  <br />
                  <br />
                  <strong>Note</strong>: If you fail, you will have to re-do
                  this training.
                  <br />
                  <br />
                  <span className={styles.centerTwo}>
                    If you are ready, please press <strong>SPACEBAR</strong> to
                    begin this training.
                  </span>
                  <br />
                  <span className={styles.centerTwo}>
                    [← <strong>BACK</strong>]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 4) {
            //If they pressed the attenCheck majority (50%) of the time,
            document.addEventListener("keyup", this._handleBeginKey);
            if (this.state.attenPass === true) {
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TRAINING: PART {this.state.tutorialSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Well done!
                    <br />
                    <br />
                    We will now ask you three questions to see if you have
                    <br />
                    understood how to fly this spaceship and navigate the galaxy
                    properly.
                    <br /> <br />
                    If you missed any important things, you will have to re-do
                    the last training again.
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      If you are ready, please press the{" "}
                      <strong>SPACEBAR</strong> to begin the quiz.
                    </span>
                  </p>
                </div>
              );
            } else {
              //they did NOT press attentioncheck majoirty of the time, so redo tutorial
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TRAINING: PART {this.state.tutorialSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Unfortunately, you missed the warning jingle and our system
                    overheated!
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      Please press <strong>SPACEBAR</strong> to try again.
                    </span>
                  </p>
                </div>
              );
            }
          }
        } else if (this.state.tutorialSession === 4) {
          if (this.state.currentInstructionText === 1) {
            //ratings
            text = (
              <div className={styles.main}>
                <p>
                  Congratulations, you have completed your training!
                  <br />
                  <br />
                  Before you start flying the spaceship on your own, we would
                  like you
                  <br />
                  to rate how pleasant the warning, scream and interruption
                  sounds are to you.
                  <br />
                  <br />
                  <br />
                  <Slider.ExampleAver />
                  <br />
                  <br />
                  Very <strong>unpleasant</strong> sounds (0 on the scale) would
                  be sounds which
                  <br />
                  you greatly dislike, that you find are annoying or bothersome.
                  <br />
                  <br />
                  In contrast, very <strong>pleasant</strong> sounds (100 on the
                  scale) would be sounds
                  <br />
                  you greatly enjoy hearing, and give you feelings of happiness.
                  <br />
                  <br />
                  <span className={styles.centerTwo}>
                    If you are ready to rate the sounds, please press{" "}
                    <strong>SPACEBAR</strong>.
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 2) {
            //last screen before it goes to the main task
            // decided not to have this, instead just go straight to expt task
            // after ratings
          }
        }
      } else if (
        //////////////////////////////////////////////////////////////////////////////////////////////
        // QUIZES
        //if its quiz time
        this.state.currentScreen === false &&
        this.state.quizScreen === true
      ) {
        //////////////////////////////////////////////////////////////////////////////////////////////
        // If there are still quiz questions

        document.removeEventListener("keyup", this._handleInstructKey);
        if (
          this.state.quizQnNum <=
          this.state.quizQnTotal[this.state.quizSession - 1]
        ) {
          if (this.state.quizSession === 2) {
            document.addEventListener("keydown", this._handleKeyDownQuizTwo);
            text = <div> {this.quizTwo(this.state.quizQnNum)}</div>;
          } else if (this.state.quizSession === 3) {
            document.addEventListener("keydown", this._handleKeyDownQuizThree);
            text = <div> {this.quizThree(this.state.quizQnNum)}</div>;
          } else if (this.state.quizSession === 4) {
            // use mouse - remove all listeners in case?
            text = <div> {this.quizFour(this.state.quizQnNum)}</div>;
          }
        } else {
          //No more quiz questions, then......
          // this is for quiz session 4 only
          if (this.state.quizScoreSum === null) {
            setTimeout(
              function () {
                this.redirectToTarget();
              }.bind(this),
              0
            );
          }
          //for all other proper quizes
          // If score pass
          else if (
            this.state.quizScoreSum ===
            this.state.quizQnTotal[this.state.quizSession - 1]
          ) {
            // if it's the last quiz, move to the ratings
            if (this.state.quizSession === 2) {
              document.removeEventListener(
                "keydown",
                this._handleKeyDownQuizTwo
              );
              setTimeout(
                function () {
                  this.tutorialProceedTwo();
                }.bind(this),
                0
              );
              // setTimeout(this.tutorialProceed(), 0);
              console.log("TUTORIAL PROCEED");
            } else if (this.state.quizSession === 3) {
              document.removeEventListener(
                "keydown",
                this._handleKeyDownQuizThree
              );
              setTimeout(
                function () {
                  this.tutorialProceedThree();
                }.bind(this),
                0
              );
              console.log("RATINGS PROCEED");
            }
          } else {
            // If score DOESNT pass, go back to begining of the tutorial section

            document.addEventListener("keyup", this._handleRestartKey);
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TRAINING: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  You scored {this.state.quizScoreSum} out of{" "}
                  {this.state.quizQnTotal[this.state.quizSession - 1]} questions
                  correctly. Sorry, you will have to restart this section of the
                  training.
                  <br />
                  <br />
                  <span className={styles.centerTwo}>
                    Please press <strong>SPACEBAR</strong> to try again.
                  </span>
                </p>
              </div>
            );
          }
        }
      }
      //////////////////////////////////////////////////////////////////////////////////////////////
      // PLAYING THE TUTORIAL TRIALS
      // TUTORIAL TASK IN PROGRESS
      else if (this.state.currentScreen === true) {
        document.removeEventListener("keyup", this._handleInstructKey);
        document.removeEventListener("keyup", this._handleBeginKey); // change this later
        text = (
          <div className={styles.stimuli}>
            <div
              className={styles.square}
              style={{
                display: this.state.imageBorder ? "block" : "none",
              }}
            ></div>
            <img
              position="absolute"
              src={this.state.showImage}
              alt="stim images"
              width="250"
              height="auto"
            />
          </div>
        );
        console.log(text);
        console.log(this.state.currentScreen);
      }
    }
    return <div className={styles.spaceship}>{text}</div>;
  }
}

export default withRouter(TutorTask);
