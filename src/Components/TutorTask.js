import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

// import AudioPlayerDOM from "./AudioPlayerDOM";

// import fix from "./images/fixation-white-small.png";
// import stimTrain1 from "./images/yellow_planet.png";
// import stimTrain2 from "./images/army_planet.png";
// import counter from "./images/planet_counter.png";
//
// import fbAver from "./images/bad.png";
// import fbSafe from "./images/good.png";
// import fbAvoid from "./images/neutral.png";
// import astrodude from "./images/astronaut.png";

import attenSound from "./sounds/task/IADSE_pianomed1360_5000.wav";
import fbSound from "./sounds/task/morriss_scream_1000.wav";
import avoidSound from "./sounds/task/bacigalupo_whitenoise_1000_minus10.wav";

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
    const volumeAtten = logslider(
      logposition(this.props.location.state.volume) / 3
    ); //make warning tone soft
    const volumeHalfAver = this.props.location.state.volumeHalfAver;
    const volumeFullAver = this.props.location.state.volumeFullAver;

    const fix = this.props.location.state.fix;
    const stimTrain1 = this.props.location.state.stimTrain1;
    const stimTrain2 = this.props.location.state.stimTrain2;
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

    // for debug
    // var userID = 1000;
    // var date = 1000;
    // var startTime = 1000;
    // var volume = 20;
    // var volumeHalfAver = 10;

    // console.log("volume: " + volume);
    // console.log("volumeHalfAver: " + volumeHalfAver);
    // console.log("volumeAtten: " + volumeAtten);

    // Define how many trials per tutorial session
    var totalTrialTut1 = 6;
    var totalTrialTut2 = 10;
    var totalTrialTut3 = 10;
    var stimNum = 2;

    var trialPerStim1 = totalTrialTut1 / stimNum; //3 per stim
    var trialPerStim2 = totalTrialTut2 / stimNum; //10 per stim
    var trialPerStim3 = totalTrialTut3 / stimNum; //10 per stim

    var stim = [stimTrain1, stimTrain2];
    var fbProb = [0.2, 0.8];
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
    // var attenCheckTut1 = 0;
    // var attenCheckTut2 = 0;
    // var attenCheckTut3 = 0;
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
    var quizSoundVol = [volumeFullAver, volumeHalfAver, volumeAtten];

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
      timeLag: [500, 750, 1000],

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
      volume: null,
      fullAverVolume: volumeFullAver,
      halfAverVolume: volumeHalfAver,
      attenVolume: volumeAtten,
      averRatingDef: averRatingDef,
      quizAverDefault: null,
      quizAver: null,
      stimCondTrack: stimCondTrack,
      checkPoint: null,

      stimTrain1: stimTrain1,
      stimTrain2: stimTrain2,
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

    this.handleDebugKeyLocal = this.handleDebugKeyLocal.bind(this);

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

    // console.log(JSON.stringify(attenBehaviour));
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

      // console.log("playAttCheck :" + this.state.playAttCheck);
      // console.log("attenindex :" + this.state.attenIndex);

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

      // console.log("Trial No: " + this.state.trialNum);
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

      this.setState({
        showImage: this.state.stim[
          this.state.stimIndex[this.state.trialNum - 1]
        ],
        fixTime: fixTime,
      });

      // console.log("Stim Idx: " + this.state.stimIndex[this.state.trialNum - 1]);

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

      // console.log("Outcome Indx: " + randProb);
      // console.log(
      //   "Fb Prob: " +
      //     this.state.fbProb[this.state.stimIndex[this.state.trialNum - 1]]
      // );
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

      // console.log("Avoid Resp: " + this.state.responseKey);
      // console.log("Fb Play: " + this.state.playFbSound);

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
      }
      // ,
      // () =>
      //   console.log(
      //     "Begin Tutorial One: " +
      //       " FB PROB: " +
      //       this.state.fbProb +
      //       " TOTAL TRIAL: " +
      //       this.state.totalTrial +
      //       " FULL STIM INDEX : " +
      //       this.state.stimIndex +
      //       " FULL OUTCOME INDEX : " +
      //       this.state.outcome
      //   )
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
      }
      // ,
      // () =>
      //   console.log(
      //     "Begin Tutorial Two: " +
      //       " FB PROB: " +
      //       this.state.fbProb +
      //       " TOTAL TRIAL: " +
      //       this.state.totalTrial +
      //       " FULL STIM INDEX : " +
      //       this.state.stimIndex +
      //       " FULL OUTCOME INDEX : " +
      //       this.state.outcome
      //   )
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
      }
      // ,
      // () =>
      //   console.log(
      //     "Begin Tutorial Three: " +
      //       " FB PROB: " +
      //       this.state.fbProb +
      //       " TOTAL TRIAL: " +
      //       this.state.totalTrial +
      //       " FULL STIM INDEX : " +
      //       this.state.stimIndex +
      //       " FULL OUTCOME INDEX : " +
      //       this.state.outcome
      //   )
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
          Welcher Planet war gefährlicher? //Meng's translation
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
            [Drücken Sie die richtige Zahlentaste] //Meng's translation
          </span>
        </p>
      </div>
    );

    return <div>{question_text1}</div>;
  }
  //Meng's translation below 
  quizThree(quizQnNum) {
    let question_text1 = (
      <div className={styles.main}>
        <p>
          <strong>F{this.state.quizQnNum}:</strong> Die Planeten, an denen wir vorbeifliegen...
          <br />
          <br />
          <strong>1</strong> - sind vollkommen sicher und emittieren keine Strahlung,{" "}
          <br />
          was sich im Laufe der Zeit nicht ändert.
          <br />
          <strong>2</strong> - sind alle sehr gefährlich und emittieren sehr hohe Strahlung, <br />
          was sich im Laufe der Zeit ändern kann.
          <br />
          <strong>3</strong> - können entweder größtenteils sicher oder gefährlich sein und emittieren eine gewisse Strahlung, <br />
          das sich im Laufe der Zeit nicht ändert.
          <br />
          <strong>4</strong> - Ich weiß es nicht.
          <br />
          <br />{" "}
          <span className={styles.centerTwo}>
            [Drücken Sie die richtige Zahlentaste] 
          </span>
        </p>
      </div>
    );
    //Meng's translation below 
    let question_text2 = (
      <div className={styles.main}>
        <p>
          <strong>F{this.state.quizQnNum}:</strong> Was passiert, wenn ich den Schild aktiviere, während wir uns einem Planeten nähern?
          <br />
          <br />
          <strong>1</strong> - Nichts passiert, und ein guter grüner Smiley wird angezeigt.
          <br />
          <strong>2</strong> - Die Raumcrew wird schreien, und ein schlechter roter Smiley wird angezeigt.
          <br />
          <strong>3</strong> - Ich werde ein leichtes Unterbrechungsgeräusch hören, und ein neutraler gelber Smiley wird angezeigt.
          <br />
          <strong>4</strong> - Ich weiß es nicht.
          <br />
          <br />{" "}
          <span className={styles.centerTwo}>
            [Drücken Sie die richtige Zahlentaste]
          </span>
        </p>
      </div>
    );
    //Meng's translation below 
    let question_text3 = (
      <div className={styles.main}>
        <p>
          <strong>F{this.state.quizQnNum}:</strong> Was soll ich tun, wenn die Überhitzungswarnung ertönt?
          <br />
          <br />
          <strong>1</strong> - Drücken Sie so schnell wie möglich die Taste <strong>W</strong>.
          <br />
          <strong>2</strong> - Drücken Sie so schnell wie möglich die Taste <strong>LEERTASTE</strong>.
          <br />
          <strong>3</strong> - Drücken Sie nichts.
          <br />
          <strong>4</strong> - Ich weiß es nicht.
          <br />
          <br />{" "}
          <span className={styles.centerTwo}>
            [Drücken Sie die richtige Zahlentaste]
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
          <strong>F{this.state.quizQnNum}:</strong> Wie angenehm (auf einer Skala von <strong>0</strong> bis <strong>100</strong>) finden Sie diesen Klang?{" "} //Meng's translation 
          <br /> <br />
          <span className={styles.centerTwo}>(Klicken Sie auf die Wiedergabetaste.)</span> //Meng's translation 
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
            [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> (nicht nur klicken), um auf WEITER zu klicken.] //Meng's translation 
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
              WEITER
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text2 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>F{this.state.quizQnNum}:</strong> Wie angenehm (auf einer Skala von <strong>0</strong> bis <strong>100</strong>) finden Sie diesen Klang?{" "} //Meng's translation 
          <br /> <br />
          <span className={styles.centerTwo}>(Klicken Sie auf die Wiedergabetaste.)</span> //Meng's translation 
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
            [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> (nicht nur klicken), um auf WEITER zu klicken.] //Meng's translation 
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
              WEITER
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text3 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>F{this.state.quizQnNum}:</strong> Wie angenehm (auf einer Skala von <strong>0</strong> bis <strong>100</strong>) finden Sie diesen Klang?{" "} //Meng's translation 
          <br /> <br />
          <span className={styles.centerTwo}>(Klicken Sie auf die Wiedergabetaste.)</span> //Meng's translation 
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
            [Hinweis: Sie müssen den Schieberegler <strong>ziehen</strong> (nicht nur klicken), um auf ENDE zu klicken.] //Meng's translation 
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
              ENDE
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

    // console.log("quizAns2: " + this.state.quizAns2);
    // console.log("quizSession: " + this.state.quizSession);
    // console.log("quizScoreSum: " + quizScoreSum);
    // console.log("quizScoreCor: " + quizScoreCor);
    // console.log("quizQnNum: " + quizQnNum);

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
      taskSessionTry: 1,
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
      checkPoint: "preTask",
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

    // console.log(JSON.stringify(tutBehaviour));

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
      pathname: `/ExptTask`,
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        fullAverVolume: this.state.fullAverVolume,
        halfAverVolume: this.state.halfAverVolume,
        attenVolume: this.state.attenVolume,

        fix: this.state.fix,
        stimTrain1: this.state.stimTrain1,
        stimTrain2: this.state.stimTrain2,
        counter: this.state.counter,
        fbAver: this.state.fbAver,
        fbSafe: this.state.fbSafe,
        fbAvoid: this.state.fbAvoid,
        astrodude: this.state.astrodude,

        stim1: this.state.stim1,
        stim2: this.state.stim2,
        stim3: this.state.stim3,
        stim4: this.state.stim4,
        stim5: this.state.stim5,
        stim6: this.state.stim6,
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
    if (this.state.debug === false) {
      ////////////////////////////////////////////////////////////////////////////////////
      // INSTRUCTIONS
      if (
        this.state.currentScreen === false &&
        this.state.quizScreen === false
      ) {
        if (this.state.tutorialSession === 1) {
          // wenn es die erste Tutorial-Sitzung ist,
          if (this.state.currentInstructionText === 1) {
            document.addEventListener("keyup", this._handleInstructKey);
            text = (
              <div className={styles.main}>
                <p>
                  {" "}
                  <span className={styles.center}>
                    Hallo und willkommen auf meinem Raumschiff! //Meng's translation 
                  </span>
                  <br />
                  Wir haben an Bord zu wenig Personal. Wir sind wirklich froh, dass Sie hier sind, um zu helfen. //Meng's translation 
                  <br />
                  <br />
                  Heute werden wir Ihnen beibringen, wie man das Raumschiff navigiert. //Meng's translation 
                  <br />
                  <br />
                  Es gibt drei Dinge, die Sie lernen müssen. //Meng's translation 
                  <br />
                  <br />
                  <span className={styles.astro}>
                    <img src={this.state.astrodude} alt="Astrodude" />
                  </span>
                  <span className={styles.centerTwo}>
                    [<strong>WEITER</strong> →]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 2) {
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>TRAINING: TEIL {this.state.tutorialSession} VON 3</strong>
                  </span>
                  <br />
                  Während wir durch die Galaxie navigieren, fliegen wir an einigen Planeten vorbei, z.B. //Meng's translation
                  <br />
                  <br />
                  <span className={styles.center}>
                    <img
                      src={this.state.stimTrain1}
                      alt="Stim-Bilder"
                      width="150"
                      height="auto"
                    />
                  </span>
                  <br />
                  Manchmal überhitzt unser Navigationssystem, und ein Warnsignal wird ertönt. //Meng's translation 
                  <br />
                  <br />
                  Klicken Sie auf die Wiedergabetaste unten, um zu hören, wie es klingt. //Meng's translation
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
                    [← <strong>ZURÜCK</strong>] [<strong>WEITER</strong> →]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 3) {
            document.addEventListener("keyup", this._handleBeginKey); // change later
        
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>TRAINING: TEIL {this.state.tutorialSession} VON 3</strong>
                  </span>
                  <br />
                  Für den ersten Teil des Trainings werden wir an mehreren Planeten vorbeifliegen. //Meng's translation
                  <br /> <br />
                  Ihr Ziel ist es, auf das Warnsignal zu achten. //Meng's translation
                  <br /> <br />
                  Wenn Sie es hören, drücken Sie so schnell wie möglich die <strong>W</strong>-Taste, um unser System abzukühlen. //Meng's translation
                  <br />
                  Das stoppt das Warnsignal. //Meng's translation
                  <br /> <br />
                  Wenn Sie das Warnsignal nicht rechtzeitig stoppen, wird das System überhitzen! //Meng's translation
                  <br />
                  Sie müssen das Training neu starten. //Meng's translation
                  <br /> <br />
                  Es gibt einen Planeten-Zähler oben rechts auf der Seite, um //Meng's translation
                  <br />
                  anzuzeigen, wie viele Planeten Sie bereits passiert haben. //Meng's translation
                  <br /> <br />
                  <span className={styles.centerTwo}>
                    Bitte drücken Sie die <strong>LEERTASTE</strong>, um das erste Training zu beginnen. //Meng's translation
                  </span>
                  <br />
                  <span className={styles.centerTwo}>
                    [← <strong>ZURÜCK</strong>]
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
                      <strong>TRAINING: TEIL {this.state.tutorialSession} VON 3</strong>
                    </span>
                    <br />
                    Gut gemacht! Sie haben das Warnsignal rechtzeitig erkannt! //Meng's translation
                    <br /> <br />
                    Unser System bleibt kühl und sicher.
                    <br /> <br />
                    Während wir durch die Galaxie navigieren, wird sich das System <br />
                    <strong>manchmal</strong> aufheizen, und dieses Warnsignal wird ertönen. //Meng's translation
                    <br />
                    <br />
                    Sie müssen rechtzeitig mit der <strong>W</strong>-Taste reagieren. //Meng's translation
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      [<strong>WEITER</strong> →]
                    </span>
                  </p>
                </div>
              );
            } else {
              // participants missed the signal. they have to repeat the training
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>TRAINING: TEIL {this.state.tutorialSession} VON 3</strong> //Meng's translation
                    </span> 
                    <br />
                    Leider haben Sie das Warnsignal verpasst, und unser System hat überhitzt! //Meng's translation
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      Bitte drücken Sie die <strong>LEERTASTE</strong>, um es erneut zu versuchen. //Meng's translation
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
                      TRAINING: TEIL {this.state.tutorialSession} VON 3
                    </strong>
                  </span>
                  <br />
                  Es ist auch wichtig zu beachten, dass die Planeten, an denen wir vorbeifliegen, jeweils eine <strong>bestimmte</strong>
                  <br />
                  Menge an Strahlung abgeben, die für unser Navigationssystem gefährlich ist. //Meng's translation
                  <br />
                  <br />
                  Wie wahrscheinlich es ist, dass ein Planet unser System beeinflusst, wird sich im Laufe der Zeit nicht ändern,
                  <br />
                  d.h. es bleibt während der gesamten Reise gleich.//Meng's translation
                  <br />
                  <br />
                  Wenn ein Planet nicht gefährlich ist, wird ein gutes grünes Smiley erscheinen, wenn Sie daran vorbeifliegen. //Meng's translation
                  <br />
                  <br />
                  Wenn ein Planet eine Strahlung emittiert und unser Navigationssystem dadurch beeinträchtigt wird, wird ein Schrei vom Raumfahrerteam zu hören sein 
                  <br />
                  und ein trauriges rotes Smiley wird erscheinen. //Meng's translation
                  <br /> <br />
                  Klicken Sie auf die Wiedergabetaste unten, um zu hören, wie der Schrei klingt.
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
                    [<strong>WEITER</strong> →]
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
                      TRAINING: TEIL {this.state.tutorialSession} VON 3
                    </strong>
                  </span>
                  <br />
                  Planeten, die in der Regel gefährlich sind, werden unser System <strong>häufiger</strong> beeinflussen, während
                  <br />
                  Planeten, die normalerweise harmlos sind, unser System <strong>seltener</strong> beeinflussen werden. //Meng's translation
                  <br />
                  <br />
                  Für den zweiten Teil dieses Trainings sollten Sie darauf beachten,
                  <br />
                  welche Planeten überwiegend gefährlich oder welche überwiegend harmlos sind. //Meng's translation
                  <br />
                  <br />
                  Am Ende dieses Trainings werden wir Sie nach Ihre Meinung fragen. //Meng's translation
                  <br /> <br />
                  Unser System wird sich ebenfalls aufheizen, während wir fliegen. Denken Sie bitte daran, das
                  <br />
                  System mit der <strong>W</strong>-Taste abzukühlen, wenn das Warnsignal ertönt! //Meng's translation
                  <br /> <br />
                  <strong>Hinweis</strong>: Falls Sie das Training nicht bestehen, müssen Sie es wiederholen. //Meng's translation
                  <br /> <br />
                  <span className={styles.centerTwo}>
                    Bitte drücken Sie die <strong>LEERTASTE</strong>, um dieses Training zu beginnen. //Meng's translation
                  </span>
                  <br />
                  <span className={styles.centerTwo}>
                    [← <strong>ZURÜCK</strong>]
                  </span>
                </p>
              </div>
            );
          }
          // hinzufügen, was passiert, wenn sie beim Aufmerksamkeitstest in Tutorial 2 nicht bestehen
          else if (this.state.currentInstructionText === 4) {
            //Wenn sie den Aufmerksamkeitstest die meiste Zeit (50%) gedrückt haben,
            document.addEventListener("keyup", this._handleBeginKey);
            if (this.state.attenPass === false) {
              //sie haben den Aufmerksamkeitstest die meiste Zeit NICHT gedrückt, also wiederhole das Tutorial
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TRAINING: TEIL {this.state.tutorialSession} VON 3
                      </strong>
                    </span>
                    <br />
                    Leider haben Sie das Warnsignal verpasst und unser System hat überhitzt! //Meng's translation
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      Bitte drücken Sie die <strong>LEERTASTE</strong>, um es erneut zu versuchen. //Meng's translation
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
                      TRAINING: TEIL {this.state.tutorialSession} VON 3
                    </strong>
                  </span>
                  <br />
                  Großartig! Sie haben gesehen, dass ein Planet gefährlicher war als der andere. //Meng's translation
                  <br />
                  <br />
                  Wie gefährlich oder harmlos die Planeten sind, wird sich während der gesamten Navigation durch die Galaxie nicht ändern. //Meng's translation
                  <br />
                  <br />
                  Im dritten und letzten Teil Ihres Trainings können wir mit der <br />
                  <strong>LEERTASTE</strong> ein magnetisches Schild aktivieren, um unser System vor der Strahlung der Planeten zu schützen. //Meng's translation
                  <br /> <br />
                  Dies hat jedoch seinen Preis - Energie wird benötigt, um das Schild zu aktivieren. //Meng's translation
                  <br />
                  Dies wird unser System <strong>leicht</strong> unterbrechen und ein neutrales gelbes Smiley wird angezeigt. <br /> <br />
                  Klicken Sie auf die Play-Taste unten, um zu hören, wie diese leichte Unterbrechung klingt. //Meng's translation
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
                    [<strong>WEITER</strong> →]
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
                      TRAINING: TEIL {this.state.tutorialSession} VON 3
                    </strong>
                  </span>
                  <br />
                  Das bedeutet, dass Sie entscheiden müssen, ob es vorteilhaft ist, das Schild zu aktivieren <br />
                  für jeden Planeten, an dem wir vorbeifliegen. //Meng's translation
                  <br />
                  <br />
                  Zum Beispiel <strong>SOLLEN</strong> Sie das Schild aktivieren, wenn Sie denken, dass der Planet, dem wir uns nähern, gefährlich sein wird. //Meng's translation
                  <br /> <br />
                  Da unsere Navigationsgeschwindigkeit ziemlich schnell ist, müssen Sie das Schild <u>schnell</u> aktivieren, damit es funktioniert. //Meng's translation
                  <br /> <br />
                  Wenn Sie jedoch denken, dass der Planet, dem wir uns nähern, sicher ist, <strong>SOLLEN</strong> Sie das Schild <strong>NICHT</strong> aktivieren,
                  <br />
                  andernfalls verschwenden wir Energie und unterbrechen unser System unnötig. //Meng's translation
                  <br /> <br />
                  <span className={styles.centerTwo}>
                    [← <strong>BACK</strong>] [<strong>WEITER</strong> →]
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
                      TRAINING: TEIL {this.state.tutorialSession} VON 3
                    </strong>
                  </span>
                  <br />
                  Im letzten Teil Ihres Trainings werden wir an denselben Planeten wie zuvor vorbeifliegen. <br /> //Meng's translation
                  <br />
                  Sie müssen Ihr Wissen darüber nutzen, welche Planeten überwiegend gefährlich oder harmlos sind 
                  <br />
                  und das Schild mit der <strong>LEERTASTE</strong> aktivieren, wenn Sie es für notwendig halten. //Meng's translation
                  <br /> <br />
                  Denken Sie daran, wenn das Warnsignal ertönt, kühlen Sie das System mit der <strong>W</strong>-Taste ab! //Meng's translation
                  <br /> <br />
                  Danach müssen Sie ein kurzes Quiz zu Ihrem Training machen. //Meng's translation
                  <br />
                  <br />
                  <strong>Hinweis</strong>: Wenn Sie das Quiz nicht bestehen, müssen Sie dieses Training wiederholen. //Meng's translation
                  <br />
                  <br />
                  <span className={styles.centerTwo}>
                    Wenn Sie bereit sind, drücken Sie bitte die <strong>LEERTASTE</strong>, um mit diesem Training zu beginnen. //Meng's translation
                  </span>
                  <br />
                  <span className={styles.centerTwo}>
                    [← <strong>BACK</strong>]
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 4) {
            // Wenn sie die Aufmerksamkeitstest mehrheitlich (50%) bestanden haben,
            document.addEventListener("keyup", this._handleBeginKey);
            if (this.state.attenPass === true) {
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TRAINING: TEIL {this.state.tutorialSession} VON 3
                      </strong>
                    </span>
                    <br />
                    Gut gemacht!
                    <br />
                    <br />
                    Wir werden Ihnen nun drei Fragen stellen, um zu sehen, ob Sie
                    <br />
                    verstanden haben, wie man dieses Raumschiff steuert und die Galaxie richtig navigiert. //Meng's translation
                    <br /> <br />
                    Wenn Sie wichtige Dinge verpasst haben, müssen Sie das letzte Training wiederholen. //Meng's translation
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      Wenn Sie bereit sind, drücken Sie bitte die <strong>LEERTASTE</strong>, um das Quiz zu beginnen. //Meng's translation
                    </span>
                  </p>
                </div>
              );
            } else {
              // Sie haben den Aufmerksamkeitstest nicht mehrheitlich bestanden, also wiederholen Sie das Tutorial
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TRAINING: TEIL {this.state.tutorialSession} VON 3
                      </strong>
                    </span>
                    <br />
                    Leider haben Sie das Warnsignal verpasst und unser System hat sich überhitzt! //Meng's translation
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      Bitte drücken Sie die <strong>LEERTASTE</strong>, um es erneut zu versuchen. //Meng's translation
                    </span>
                  </p>
                </div>
              );
            }
          }
        } else if (this.state.tutorialSession === 4) {
          if (this.state.currentInstructionText === 1) {
            // Bewertungen
            text = (
              <div className={styles.main}>
                <p>
                  Herzlichen Glückwunsch, Sie haben Ihr Training abgeschlossen! //Meng's translation
                  <br />
                  <br />
                  Bevor Sie das Raumschiff alleine fliegen, bitten wir Sie, zu
                  <br />
                  bewerten, wie angenehm die Warnsignale, Schreie und Unterbrechungen für Sie sind.//Meng's translation
                  <br />
                  <br />
                  <br />
                  <Slider.ExampleAver />
                  <br />
                  <br />
                  Sehr <strong>unangenehme</strong> Geräusche (0 auf der Skala) sind solche, die
                  <br />
                  für Sie sehr belastend und störend sind. //Meng's translation
                  <br />
                  <br />
                  Im Gegensatz dazu sind sehr <strong>angenehme</strong> Geräusche (100 auf der Skala) solche,
                  <br />
                  die Sie gerne hören und die Ihnen Glücksgefühle vermitteln. //Meng's translation
                  <br />
                  <br />
                  <span className={styles.centerTwo}>
                    Wenn Sie bereit sind, die Geräusche zu bewerten, drücken Sie bitte die <strong>LEERTASTE</strong>. //Meng's translation
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 2) {
            // letzte Seite bevor es zur Hauptaufgabe geht
            // beschlossen, das nicht zu haben, sondern direkt zur Experimentaufgabe nach den Bewertungen zu gehen
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
                      TRAINING: Teil {this.state.tutorialSession} VON 3
                    </strong>
                  </span>
                  <br />
                  Sie haben {this.state.quizScoreSum} von{" "}
                  {this.state.quizQnTotal[this.state.quizSession - 1]} Fragen korrekt
                  beantwortet. Leider müssen Sie diesen Abschnitt des Trainings wiederholen. //Meng's translation
                  <br />
                  <br />
                  <span className={styles.centerTwo}>
                    Bitte drücken Sie die <strong>LEERTASTE</strong> um es erneut zu versuchen.
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
                position="absolute"
                src={this.state.showImage}
                alt="stim images"
                width="250"
                height="auto"
              />
            </div>
          </div>
        );

        // console.log(text);
        // console.log(this.state.currentScreen);
      }
    } else if (this.state.debug === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div className={styles.main}>
          <p>
            <span className={styles.center}>DEBUG MODE</span>
            <br />

            <span className={styles.centerTwo}>
              Drücken Sie bitte die [<strong>LEERTASTE</strong>] um zum nächsten Abschnitt weiterzugehen. //Meng's translation
            </span>
          </p>
        </div>
      );
    }

    return <div className={styles.spaceship}>{text}</div>;
  }
}

export default withRouter(TutorTask);
