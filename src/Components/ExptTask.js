import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import AudioPlayerDOM from "./AudioPlayerDOM";

import fix from "./images/fixation-white.png";

import stim1 from "./images/blue_planet.png";
import stim2 from "./images/light_green_planet.png";
import stim3 from "./images/pink_planet.png";
import stim4 from "./images/red_planet.png";

import fbAver from "./images/bad.png";
import fbSafe from "./images/good.png";
import fbAvoid from "./images/neutral.png";

// import attenSound from "./sounds/800hz_sinetone_verysoft_5000.wav";

import attenSound from "./sounds/800hz_sinetone_05amp_5000.wav";
import fbSound from "./sounds/Bacigalupo_whitenoise_1500.wav";
import avoidSound from "./sounds/browniannoise_08amp_1500.wav";

import styles from "./style/taskStyle.module.css";
import astrodude from "./images/astronaut.png";

import { DATABASE_URL } from "./config";

import PlayButton from "./PlayButton";

import * as SliderQuiz1 from "./QuizSlider1.js";
import * as SliderQuiz2 from "./QuizSlider2.js";

/////////////////////////////////////////////////////////////////////////////////
// GLOBAL FUNCTIONS
//shuffle
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
    rnd = Math.floor(Math.random() * arrLength);
    arrLength -= 1;
    for (argsIndex = 0; argsIndex < argsLength; argsIndex += 1) {
      tmp = arguments[argsIndex][arrLength];
      arguments[argsIndex][arrLength] = arguments[argsIndex][rnd];
      arguments[argsIndex][rnd] = tmp;
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////
// GLOBAL FUNCTIONS END

/////////////////////////////////////////////////////////////////////////////////
// REACT COMPONENT START
class ExptTask extends React.Component {
  constructor(props) {
    super(props);

    /////////////////////////////////////////////////////////////////////////////////
    // SET COMPONENT VARIABLES
    const userID = this.props.location.state.userID;
    const fileID = this.props.location.state.fileID;
    const volume = this.props.location.state.volume;

    //global trial var
    //total trial per part: 1) learning 2) avoidance 3) extinction
    var totalTrial1 = 8;
    var totalTrial2 = 16;
    var totalTrial3 = 16;

    var stimNum = 4;

    var totalBlock1 = 1;
    var totalBlock2 = 2;
    var totalBlock3 = 2;
    var trialPerBlockNum1 = totalTrial1 / totalBlock1;
    var trialPerBlockNum2 = totalTrial2 / totalBlock2;
    var trialPerBlockNum3 = totalTrial3 / totalBlock3;
    // var devalueBlockOnward = totalBlock / 2;

    var stimCond = Array.from(Array(stimNum), (_, i) => i + 1); // [1,2,3]
    var stimIndexTemp1 = shuffle(
      Array(Math.round(totalTrial1 / stimNum))
        .fill(stimCond)
        .flat()
    ); //this is long [2,3,1,2,2] specifying stimulus seen on the trial
    var stimIndexTemp2 = shuffle(
      Array(Math.round(totalTrial2 / stimNum))
        .fill(stimCond)
        .flat()
    );
    var stimIndexTemp3 = shuffle(
      Array(Math.round(totalTrial3 / stimNum))
        .fill(stimCond)
        .flat()
    );

    var stimIndex1 = stimIndexTemp1.map(function (value) {
      return value - 1;
    });
    var stimIndex2 = stimIndexTemp2.map(function (value) {
      return value - 1;
    });
    var stimIndex3 = stimIndexTemp3.map(function (value) {
      return value - 1;
    });

    var attenCheck1 = 1; //30% of trials will have attention chec
    var attenCheck2 = 1;
    var attenCheck3 = 1;
    //If i change the above percentage, also change below the restart paras
    var attenIndex1 = shuffle(
      Array(attenCheck1)
        .fill(1)
        .concat(Array(totalTrial1 - attenCheck1).fill(0))
    );
    var attenIndex2 = shuffle(
      Array(attenCheck2)
        .fill(1)
        .concat(Array(totalTrial2 - attenCheck2).fill(0))
    );
    var attenIndex3 = shuffle(
      Array(attenCheck3)
        .fill(1)
        .concat(Array(totalTrial3 - attenCheck3).fill(0))
    );

    var stim = [stim1, stim2, stim3, stim4];
    var fbProb = [0.8, 0.8, 0.2, 0.2];
    var stimCondTrack = stimCond;
    // this is to randomise fractals and their fb probs
    shuffleSame(stim, fbProb, stimCondTrack);

    var quizSounds = [fbSound, avoidSound, attenSound];
    var quizSoundLabels = ["fb", "avoid", "atten"];

    var varPlayColour = [
      "#008000",
      "#395756",
      "#4f5d75",
      "#b6c8a9",
      "#188fa7",
      "#7261a3",
    ];

    shuffle(varPlayColour);
    shuffleSame(quizSounds, quizSoundLabels);
    /////////////////////////////////////////////////////////////////////////////////
    // SET COMPONENT STATES
    this.state = {
      userID: userID,
      fileID: fileID,
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

      totalTrial: totalTrial1,
      trialPerBlockNum: trialPerBlockNum1,
      devaluedBlock: 0,
      totalBlock: totalBlock1,
      stimIndex: stimIndex1,
      attenIndex: attenIndex1,
      stimCondTrack: stimCondTrack,
      stimCondTrackDevalIndex: [],
      varPlayColour: varPlayColour,
      //this tracks the index for stim fbprob shuffling
      //in other words, for devalution, 1 high 1 low devalue, use index 0 and 2
      responseKey: 0,
      timeLag: [1000, 1500, 1500],
      fbProb: fbProb,
      respProb: 0.2,
      fbProbTrack: 0,
      randProb: 0,
      blockNum: 1,

      trialNum: 0,
      trialinBlockNum: 0,
      imageBorder: false,
      fix: fix,
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

      devalue: false,
      instruct: true,
      continQuiz: false,
      currentScreen: false, // false for break, true for task
      btnDis: true,

      quizContin: [],
      quizConf: [],
      quizAver: [],
      quizTime: 0,
      quizQnRT: 0,
      quizQnNum: 1,
      quizContinDefault: null,
      quizConfDefault: null,
      quizAverDefault: null,
      quizSounds: quizSounds,
      quizSoundLabels: quizSoundLabels,
      soundQuizLabel: null,
      volume: volume,
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
    // this.blockProceed = this.blockProceed.bind(this);
    // this.sessionBegin = this.sessionBegin.bind(this);
    this.quizNext = this.quizNext.bind(this);
    this.sessionProceed = this.sessionProceed.bind(this);

    this.togglePlay = this.togglePlay.bind(this);
    this.audioAtten = new Audio(this.state.attenSound);
    this.audioFb = new Audio(this.state.fbSound);
    this.audioAvoid = new Audio(this.state.avoidSound);
  }
  /////////////////////////////////////////////////////////////////////////////////
  // END COMPONENT PROPS

  togglePlay() {
    // var soundQuiz = this.state.quizSoundLabels[this.state.quizQnNum - 5];

    // if (soundQuiz === "atten") {
    //   this.setState({ active: !this.state.active }, () => {
    //     this.state.active ? this.audioAtten.play() : this.audioAtten.pause();
    //   });
    // } else if (soundQuiz === "fb") {
    //   this.setState({ active: !this.state.active }, () => {
    //     this.state.active ? this.audioFb.play() : this.audioFb.pause();
    //   });
    // } else if (soundQuiz === "avoid") {
    //   this.setState({ active: !this.state.active }, () => {
    //     this.state.active ? this.audioAvoid.play() : this.audioAvoid.pause();
    //   });
    // }

    this.setState({ active: !this.state.active });

    // if (this.state.quizQnNum === 5) {
    //   this.setState({ active: !this.state.active }, () => {
    //     this.state.active ? this.audioAtten.play() : this.audioAtten.pause();
    //   });
    // } else if (this.state.quizQnNum === 6) {
    //   this.setState({ active: !this.state.active }, () => {
    //     this.state.active ? this.audioFb.play() : this.audioFb.pause();
    //   });
    // } else if (this.state.quizQnNum === 7) {
    //   this.setState({ active: !this.state.active }, () => {
    //     this.state.active ? this.audioAvoid.play() : this.audioAvoid.pause();
    //   });
    // }
  }

  // This handles instruction screen within the component
  handleInstructLocal(key_pressed) {
    var curText = this.state.currentInstructionText;
    var whichButton = key_pressed;

    if (whichButton === 4 && curText > 1) {
      this.setState({ currentInstructionText: curText - 1 });
    } else if (whichButton === 5 && curText < 3) {
      this.setState({ currentInstructionText: curText + 1 });
    }
  }

  handleBegin(key_pressed) {
    var whichButton = key_pressed;
    ////////////////////////////////////////////////////////////////////////////////////////
    if (this.state.instruct === true) {
      if (this.state.taskSession === 1) {
        if (this.state.currentInstructionText === 3 && whichButton === 10) {
          setTimeout(
            function () {
              this.sessionBegin();
            }.bind(this),
            0
          );
        }
      } else if (this.state.taskSession == 2) {
        if (whichButton === 10) {
          setTimeout(
            function () {
              this.sessionBegin();
            }.bind(this),
            0
          );
        }
      } else if (this.state.taskSession == 3) {
        if (this.state.currentInstructionText === 2 && whichButton === 10) {
          setTimeout(
            function () {
              this.sessionBegin();
            }.bind(this),
            0
          );
        }
      }
    } else if (this.state.instruct === false) {
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
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////

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
        instruct: false,
      });
    }

    setTimeout(
      function () {
        this.saveAttenData();
      }.bind(this),
      5
    );
  }

  saveAttenData() {
    var fileID = this.state.fileID;

    let attenBehaviour = {
      userID: this.state.userID,
      tutorialSession: null,
      tutorialSessionTry: null,
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,
      attenTrial: this.state.attenTrial,
      attenTime: this.state.attenTime,
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,
      playAttCheck: this.state.playAttCheck,
    };

    console.log(JSON.stringify(attenBehaviour));

    // try {
    //   fetch(`${DATABASE_URL}/tutorial_atten_data/` + fileID, {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(attenBehaviour),
    //   });
    // } catch (e) {
    //   console.log("Cant post?");
    // }
  }

  renderAtten() {
    document.addEventListener("keyup", this._handleAttenCheckKey); // change this later
    this.audioAtten.load();
    this.audioAtten.play();
    var attenTrial = this.state.trialNum;
    var attenTime = Math.round(performance.now());

    this.setState({
      attenTrial: attenTrial,
      attenTime: attenTime,
      playAttCheck: true,
    });

    setTimeout(
      function () {
        this.attenCount();
      }.bind(this),
      2500
    );
  }

  /////////////////////////////////////////////////////////////////////////////////
  // SET TRIAL COMPONENTS - FIXATION
  renderFix() {
    if (this.state.currentScreen === true) {
      //if trial within the block hasn't been reached, continue
      // if trial 1, and total trial in blocknum is 10...
      var trialNum = this.state.trialNum + 1;
      var trialinBlockNum = this.state.trialinBlockNum + 1;

      console.log("trial num is:" + trialNum);

      var trialTime = Math.round(performance.now());
      this.setState({
        trialNum: trialNum,
        trialinBlockNum: trialinBlockNum,
        trialTime: trialTime,
        showImage: this.state.fix,
      });

      this.refreshSound();

      console.log("Trial no: " + this.state.trialNum);
      console.log("Total Trial: " + this.state.totalTrial);
      console.log("Block Trial no: " + this.state.trialinBlockNum);

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

      console.log(
        "StimIndexALL" +
          this.state.stimIndexLog +
          "Stim index :" +
          this.state.stimIndex[this.state.trialNum - 1]
      );

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
      var randProb = Math.random();

      var stimTime =
        Math.round(performance.now()) -
        (this.state.trialTime + this.state.fixTime);

      console.log("now:" + Math.round(performance.now()));
      console.log("trialtime:" + this.state.trialTime);
      console.log("fixtime:" + this.state.fixTime);
      console.log("stimTime:" + stimTime);

      this.setState({
        imageBorder: false,
        stimTime: stimTime,
        fbProbTrack: this.state.fbProb[
          this.state.stimIndex[this.state.trialNum - 1]
        ],
      });

      if (
        this.state.attenIndex[this.state.trialNum - 1] === 0 &&
        this.state.responseKey === 1
      ) {
        // If participant chooses  to avoid on a non-attention trial
        // then milder sound
        this.setState({
          showImage: this.state.fb[2],
          playFb: this.state.avoidSound,
          playFbSound: true,
          randProb: randProb,
        });
      } else {
        // If participant chooses NOT to avoid

        if (
          randProb <
          this.state.fbProb[this.state.stimIndex[this.state.trialNum - 1]]
        ) {
          this.setState({
            showImage: this.state.fb[0],
            playFb: this.state.fbSound,
            playFbSound: true,
            randProb: randProb,
          });
        } else {
          this.setState({
            showImage: this.state.fb[1],
            playFb: null,
            playFbSound: false,
            randProb: randProb,
          });
        }
      }

      setTimeout(
        function () {
          this.saveData();
        }.bind(this),
        this.state.timeLag[2] - 5
      );

      setTimeout(
        function () {
          this.nextTrial();
        }.bind(this),
        this.state.timeLag[2]
      );
    } else {
      console.log("Feedback NOT RENDERED as currentScreen false.");
    }
  }

  nextTrial() {
    if (this.state.currentScreen === true) {
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
          this.setState({
            currentScreen: false,
            instruct: false,
            continQuiz: false,
          });
          console.log("this should go to block resting screen");
        }
      } else {
        //if trials has reached the end of total trial
        //go to sessionProceed, which will lead me to the quiz OR instructions for next round + set parameters
        //for the 2nd session, can proceed to the next round directly
        document.removeEventListener("keyup", this._handleAttenCheckKey);

        if (this.state.taskSession === 2) {
          setTimeout(
            function () {
              this.sessionProceed();
            }.bind(this),
            0
          );
          console.log("End of session 2, proceed to next session");
        } else {
          //for the first and third expt, there is a quiz to do
          var quizTime = Math.round(performance.now()); //for the first question

          this.setState({
            currentScreen: false,
            instruct: true,
            continQuiz: true,
            quizTime: quizTime,
            btnDis: true,
          });
        }
      }
    } else {
      //if current screen is false
      console.log("curent screen is false");
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // THREE COMPONENTS OF THE TASK, FIXATION, STIMULI, FEEDBACK END ---------------

  /////////////////////////////////////////////////////////////////////////////////
  // SET ATTENTCHECK COMPONENTS
  // put the response and attenChecks into one array

  //////////////////////////////////////////////////////////////////////////////////////////////
  // SOUND FUNCTIONS

  refreshSound() {
    this.setState({
      playFb: null,
      playFbSound: false,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // KEY RESPONSE FUNCTIONS
  pressAvoid(key_pressed, time_pressed) {
    //Check first whether it is a valid press
    var reactionTime = time_pressed - this.state.stimTime;

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

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Set states for block/SESSION sections
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

  // Session
  sessionProceed() {
    if (this.state.taskSession === 3) {
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        0
      );
      console.log("End of all sessions, go to exit screen");
    } else {
      var taskSession = this.state.taskSession + 1;
      var totalTrial = this.state.totalTrialLog[taskSession - 1];
      var trialPerBlockNum = this.state.trialPerBlockNumLog[taskSession - 1];
      var totalBlock = this.state.totalBlockLog[taskSession - 1];
      var stimIndex = this.state.stimIndexLog[taskSession - 1];
      var attenIndex = this.state.attenIndexLog[taskSession - 1];
      var attenCheckAll = this.state.attenCheckAllLog[taskSession - 1];

      this.setState({
        taskSession: taskSession,
        totalTrial: totalTrial,
        trialPerBlockNum: trialPerBlockNum,
        totalBlock: totalBlock,
        stimIndex: stimIndex,
        attenIndex: attenIndex,
        attenCheckAll: attenCheckAll,
        currentScreen: false,
        instruct: true,
        continQuiz: false,
        currentInstructionText: 1,

        blockNum: 1,
        trialNum: 0,
        trialinBlockNum: 0,

        quizContin: [],
        quizConf: [],
        quizTime: 0,
        quizQnNum: 1,
        quizQnRT: 0,
        quizContinDefault: null,
        quizConfDefault: null,

        playAttCheck: false,
        playFbSound: false,
        playAtten: null,
        playFb: null,
      });
      console.log("Continuing session: " + taskSession);
      //if its task session 3, additional devalution occurs
      if (taskSession === 3) {
        var stimCondTrack = this.state.stimCondTrack;

        //devlaue one high and one low probs devalue the 1 and 3 option
        var indexHighProb = stimCondTrack.indexOf(1);
        var indexLowProb = stimCondTrack.indexOf(3);
        var stimCondTrackDevalIndex = [indexHighProb, indexLowProb];

        var fbProb = this.state.fbProb;
        fbProb[indexHighProb] = 0;
        fbProb[indexLowProb] = 0;

        this.setState({
          fbProb: fbProb,
          devaluedBlock: 1,
          stimCondTrackDevalIndex: stimCondTrackDevalIndex,
        });
      }
    }
  }

  // Session 1
  sessionBegin() {
    this.setState({
      currentScreen: true,
      instruct: false,
      continQuiz: false,
    });

    setTimeout(
      function () {
        this.nextTrial();
      }.bind(this),
      0
    );
  }

  //Restart the entire task (when fail attentioncheck)
  taskRestart() {
    // Reset task parameters
    var taskSessionTry = this.state.taskSessionTry + 1;
    var stim = this.state.stim;
    var fbProb = this.state.fbProb;
    var stimCondTrack = this.state.stimCondTrack;
    // this is to randomise fractals and their fb probs
    shuffleSame(stim, fbProb, stimCondTrack);

    var taskSession = 1;

    var stimIndex1 = shuffle(this.state.stimIndexLog[0]);
    var stimIndex2 = shuffle(this.state.stimIndexLog[1]);
    var stimIndex3 = shuffle(this.state.stimIndexLog[2]);

    console.log("stimIndex1 " + stimIndex1);
    console.log("stimIndex2 " + stimIndex2);
    console.log("stimIndex3 " + stimIndex3);

    var attenIndex1 = shuffle(this.state.attenIndexLog[0]);
    var attenIndex2 = shuffle(this.state.attenIndexLog[1]);
    var attenIndex3 = shuffle(this.state.attenIndexLog[2]);

    var totalTrial = this.state.totalTrialLog[taskSession - 1];
    var trialPerBlockNum = this.state.trialPerBlockNumLog[taskSession - 1];
    var attenCheckAll = this.state.attenCheckAllLog[taskSession - 1];

    this.setState({
      stimIndexLog: [stimIndex1, stimIndex2, stimIndex3],
      attenIndexLog: [attenIndex1, attenIndex2, attenIndex3],

      totalTrial: totalTrial,
      trialPerBlockNum: trialPerBlockNum,

      totalBlock: this.state.totalBlockLog[0],
      stimIndex: stimIndex1,
      attenIndex: attenIndex1,

      devaluedBlock: 0,
      stimCondTrack: stimCondTrack,
      stimCondTrackDevalIndex: [],

      responseKey: 0,
      fbProb: fbProb,
      fbProbTrack: 0,
      randProb: 0,
      blockNum: 1,
      trialNum: 0,
      trialinBlockNum: 0,
      imageBorder: false,
      stim: stim,
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

      devalue: false,
      instruct: true,
      continQuiz: false,
      currentScreen: false, // false for break, true for task
      btnDis: true,

      quizContin: [],
      quizConf: [],
      quizTime: 0,
      quizQnRT: 0,
      quizQnNum: 1,
      quizContinDefault: null,
      quizConfDefault: null,

      taskSessionTry: taskSessionTry,
      taskSession: taskSession,

      stim: stim,
      fbProb: fbProb,
      stimCondTrack: stimCondTrack,
      stimCondTrackDevalIndex: [],

      responseKey: [],
      reactionTime: [],
      trialNum: 0,
      trialinBlockNum: 0,
      blockNum: 1,
      devaluedBlock: 0,
      randProb: 0,

      attenIndexLog: [stimIndex1, stimIndex2, stimIndex3],
      stimIndexLog: [attenIndex1, attenIndex2, attenIndex3],

      totalTrial: totalTrial,
      trialPerBlockNum: trialPerBlockNum,
      attenCheckAll: attenCheckAll,

      attenCheckKey: 0,
      attenCheckTime: 0,

      playAttCheck: false,
      playFbSound: false,
      playAtten: null,
      playFb: null,
      attenPass: true,
    });
  }

  /////////////////////////////////////////////////////////////////////////////////
  // SET QUIZ COMPONENTS
  quizNext() {
    if (this.state.taskSession === 1) {
      if (this.state.quizQnNum < 4) {
        var quizQnNum = this.state.quizQnNum + 1;
        var quizTime = Math.round(performance.now()); //for the next question
        console.log(quizQnNum);
        this.setState({
          quizQnNum: quizQnNum,
          quizTime: quizTime,
          btnDis: true,
          quizContinDefault: null,
          quizConfDefault: null,
        });
      } else {
        console.log("Go to next session");

        setTimeout(
          function () {
            this.sessionProceed();
          }.bind(this),
          10
        );
      }
    } else {
      if (this.state.quizQnNum < 7) {
        var quizQnNum = this.state.quizQnNum + 1;
        var quizTime = Math.round(performance.now()); //for the next question
        console.log(quizQnNum);
        this.setState({
          quizQnNum: quizQnNum,
          quizTime: quizTime,
          btnDis: true,
          quizContinDefault: null,
          quizConfDefault: null,
          quizAverDefault: null,
        });

        if (this.state.quizQnNum > 4) {
          var soundQuizLabel = this.state.quizSoundLabels[
            this.state.quizQnNum - 5
          ];
          this.setState({
            soundQuizLabel: soundQuizLabel,
            active: false,
          });
        }
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
    }
  }

  /////////////// call back values for the contigency and confidence quiz
  callbackContin(callBackValue) {
    console.log("contin " + callBackValue);
    this.setState({ quizContin: callBackValue });
  }

  callbackContinInitial(initialValue) {
    console.log("contin " + initialValue);
    console.log("contin default " + this.state.quizContinDefault);

    this.setState({ quizContinDefault: initialValue });
    if (
      this.state.quizConfDefault !== null &&
      this.state.quizContinDefault !== null
    ) {
      this.setState({ btnDis: false });
    }
  }

  callbackConf(callBackValue) {
    this.setState({ quizConf: callBackValue });
  }

  callbackConfInitial(initialValue) {
    console.log("conf " + initialValue);
    console.log("conf default " + this.state.quizConfDefault);

    this.setState({ quizConfDefault: initialValue });
    if (
      this.state.quizConfDefault !== null &&
      this.state.quizContinDefault !== null
    ) {
      this.setState({ btnDis: false });
    }
  }

  callbackAver(callBackValue) {
    this.setState({ quizAver: callBackValue });
  }

  callbackAverInitial(initialValue) {
    this.setState({ quizAverDefault: initialValue });
    if (this.state.quizAverDefault !== null) {
      this.setState({ btnDis: false });
    }
  }

  /////////////// call back values for the contigency and confidence quiz

  // Contigency quizes
  continQuizOne(quizQnNum) {
    let question_text1 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={this.state.stim[0]}
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>Q1a:</strong> What is the probability (on a scale of{" "}
          <strong>1</strong> to <strong>100%</strong>) of system interference
          from this planet?
          <br />
          <br />
          <SliderQuiz1.SliderContinQn1
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q1b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your estimate above?
          <br />
          <br />
          <SliderQuiz1.SliderConfQn1
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />{" "}
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the sliders to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text2 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={this.state.stim[1]}
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>Q2a:</strong> What is the probability (on a scale of{" "}
          <strong>1</strong> to <strong>100%</strong>) of system interference
          from this planet?
          <br />
          <br />
          <SliderQuiz1.SliderContinQn2
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q2b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your estimate above?
          <br />
          <br />
          <SliderQuiz1.SliderConfQn2
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the sliders to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text3 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={this.state.stim[2]}
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>Q3a:</strong> What is the probability (on a scale of{" "}
          <strong>1</strong> to <strong>100%</strong>) of system interference
          from this planet?
          <br />
          <br />
          <SliderQuiz1.SliderContinQn3
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q3b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your estimate above?
          <br />
          <br />
          <SliderQuiz1.SliderConfQn3
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the sliders to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text4 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={this.state.stim[3]}
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>Q4a:</strong> What is the probability (on a scale of{" "}
          <strong>1</strong> to <strong>100%</strong>) of system interference
          from this planet?
          <br />
          <br />
          <SliderQuiz1.SliderContinQn4
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q4b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your estimate above?
          <br />
          <br />
          <SliderQuiz1.SliderConfQn4
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the sliders to click END.]
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
      case 4:
        return <div>{question_text4}</div>;
      default:
    }
  }

  // Contigency quizes
  continQuizTwo(quizQnNum) {
    let question_text1 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={this.state.stim[0]}
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>Q{this.state.quizQnNum}a:</strong> What is the probability (on
          a scale of <strong>1</strong> to <strong>100%</strong>) of system
          interference from this planet?
          <br />
          <br />
          <SliderQuiz2.SliderContinQn1
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q{this.state.quizQnNum}b:</strong> How confident (on a scale
          of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your estimate above?
          <br />
          <br />
          <SliderQuiz2.SliderConfQn1
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the sliders to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text2 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={this.state.stim[1]}
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>Q{this.state.quizQnNum}a:</strong> What is the probability (on
          a scale of <strong>1</strong> to <strong>100%</strong>) of system
          interference from this planet?
          <br />
          <br />
          <SliderQuiz2.SliderContinQn2
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q{this.state.quizQnNum}b:</strong> How confident (on a scale
          of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your estimate above?
          <br />
          <br />
          <SliderQuiz2.SliderConfQn2
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the sliders to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text3 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={this.state.stim[2]}
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>Q{this.state.quizQnNum}a:</strong> What is the probability (on
          a scale of <strong>1</strong> to <strong>100%</strong>) of system
          interference from this planet?
          <br />
          <br />
          <SliderQuiz2.SliderContinQn3
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q{this.state.quizQnNum}b:</strong> How confident (on a scale
          of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your estimate above?
          <br />
          <br />
          <SliderQuiz2.SliderConfQn3
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the sliders to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text4 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <div className="col-md-12 text-center">
            <img
              src={this.state.stim[3]}
              alt="stim images"
              width="100"
              height="auto"
            />
          </div>
          <br />
          <strong>Q{this.state.quizQnNum}a:</strong> What is the probability (on
          a scale of <strong>1</strong> to <strong>100%</strong>) of system
          interference from this planet?
          <br />
          <br />
          <SliderQuiz2.SliderContinQn4
            callBackValue={this.callbackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q{this.state.quizQnNum}b:</strong> How confident (on a scale
          of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your estimate above?
          <br />
          <br />
          <SliderQuiz2.SliderConfQn4
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the sliders to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text5 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>Q{this.state.quizQnNum}:</strong> How aversive (on a scale of{" "}
          <strong>1</strong> to <strong>100</strong>) do you find this sound?{" "}
          <br /> <br />
          <span className={styles.centerTwo}>(Click the play button.)</span>
          <br />
          <br />
          <span className={styles.center}>
            <PlayButton
              audio={this.state.quizSounds[0]}
              play={this.togglePlay}
              stop={this.togglePlay}
              volume={this.state.volume}
              idleBackgroundColor={this.state.varPlayColour[quizQnNum - 1]}
              {...this.state}
            />
          </span>
          <br />
          <br />
          <SliderQuiz2.SliderAverQn5
            callBackValue={this.callbackAver.bind(this)}
            initialValue={this.callbackAverInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the slider to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text6 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>Q{this.state.quizQnNum}:</strong> How aversive (on a scale of{" "}
          <strong>1</strong> to <strong>100</strong>) do you find this sound?{" "}
          <br /> <br />
          <span className={styles.centerTwo}>(Click the play button.)</span>
          <br />
          <br />
          <span className={styles.center}>
            <PlayButton
              audio={this.state.quizSounds[1]}
              play={this.togglePlay}
              stop={this.togglePlay}
              volume={this.state.volume}
              idleBackgroundColor={this.state.varPlayColour[quizQnNum - 1]}
              {...this.state}
            />
          </span>
          <br />
          <br />
          <SliderQuiz2.SliderAverQn6
            callBackValue={this.callbackAver.bind(this)}
            initialValue={this.callbackAverInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the slider to click NEXT.]
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
              NEXT
            </Button>
          </div>
        </span>
      </div>
    );

    let question_text7 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>Q{this.state.quizQnNum}:</strong> How aversive (on a scale of{" "}
          <strong>1</strong> to <strong>100</strong>) do you find this sound?{" "}
          <br /> <br />
          <span className={styles.centerTwo}>(Click the play button.)</span>
          <br />
          <br />
          <span className={styles.center}>
            <PlayButton
              audio={this.state.quizSounds[2]}
              play={this.togglePlay}
              stop={this.togglePlay}
              volume={this.state.volume}
              idleBackgroundColor={this.state.varPlayColour[quizQnNum - 1]}
              {...this.state}
            />
          </span>
          <br />
          <br />
          <SliderQuiz2.SliderAverQn7
            callBackValue={this.callbackAver.bind(this)}
            initialValue={this.callbackAverInitial.bind(this)}
          />
          <br />
          <br />
          <span className={styles.centerTwo}>
            [Note: You must <strong>drag</strong> the slider to click NEXT.]
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
      case 4:
        return <div>{question_text4}</div>;
      case 5:
        return <div>{question_text5}</div>;
      case 6:
        return <div>{question_text6}</div>;
      case 7:
        return <div>{question_text7}</div>;
      default:
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // sAVE DATA functions
  saveData() {
    var fileID = this.state.fileID;
    var fbTime =
      Math.round(performance.now()) -
      (this.state.trialNum + this.state.stimTime) +
      5;

    let behaviour = {
      userID: this.state.userID,
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,
      trialNum: this.state.trialNum,
      trialTime: this.state.trialTime,
      blockNum: this.state.blockNum,
      trialinBlockNum: this.state.trialinBlockNum,
      devaluedBlock: this.state.devaluedBlock,
      fixTime: this.state.fixTime,
      attenIndex: this.state.attenIndex[this.state.trialNum - 1],
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,
      stimIndex: this.state.stimIndex[this.state.trialNum - 1],
      stimTime: this.state.stimTime,
      fbProbTrack: this.state.fbProbTrack,
      randProb: this.state.randProb,
      responseKey: this.state.responseKey,
      reactionTime: this.state.reactionTime,
      playFbSound: this.state.playFbSound,
      fbTime: fbTime,
    };

    console.log(behaviour);

    fetch(`${DATABASE_URL}/task_data/` + fileID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(behaviour),
    });

    //   // debuging
    // let test = { userID: this.state.userID };
    //
    // try {
    //   fetch(`${DATABASE_URL}/test/` + fileID, {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(test),
    //   });
    // } catch (e) {
    //   console.log("Cant post?");
    // }
  }

  saveQuizData() {
    var fileID = this.state.fileID;
    var quizQnRT = Math.round(performance.now()) - this.state.quizTime;

    let quizbehaviour = {
      userID: this.state.userID,
      quizTime: this.state.quizTime,
      taskSession: this.state.taskSession,
      taskSessionTry: this.state.taskSessionTry,
      quizQnNum: this.state.quizQnNum,
      quizQnRT: quizQnRT,
      quizContinDefault: this.state.quizContinDefault,
      quizContin: this.state.quizContin,
      quizConfDefault: this.state.quizConfDefault,
      quizConf: this.state.quizConf,
      quizAverDefault: this.state.quizAverDefault,
      quizAver: this.state.quizAver,
      soundQuizLabel: this.state.soundQuizLabel,
    };

    try {
      fetch(`${DATABASE_URL}/task_quiz/` + fileID, {
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
    console.log("Contin:" + this.state.quizContin);
    console.log("ContinDefault:" + this.state.quizContinDefault);

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

  redirectToTarget() {
    this.props.history.push({
      pathname: `/EndPage`,
      state: {
        userID: this.state.userID,
      },
    });
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  // render time

  render() {
    let text;

    if (this.state.currentScreen === false) {
      if (this.state.instruct === true) {
        if (this.state.taskSession === 1) {
          if (this.state.continQuiz === false) {
            if (this.state.currentInstructionText === 1) {
              document.addEventListener("keyup", this._handleInstructKey);
              if (this.state.taskSessionTry > 1) {
                text = (
                  <div className={styles.main}>
                    <p>
                      <span className={styles.center}>
                        <strong>
                          MAIN TASK: PART {this.state.taskSession} OF 3
                        </strong>
                      </span>
                      <br />
                      We will be making a new set of three journeys.
                      <br />
                      <br />
                      In the first journey, we will again encounter{" "}
                      <strong>four</strong> planets.
                      <br /> <br />
                      Unforunately, the shield <strong>cannot</strong> be
                      activated on this leg of the journey.
                      <br />
                      In other words, the <strong>SPACEBAR</strong> key will NOT
                      work.
                      <br /> <br />
                      <span className={styles.centerTwo}>
                        [<strong>NEXT</strong> →]
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
                          MAIN TASK: PART {this.state.taskSession} OF 3
                        </strong>
                      </span>
                      <br />
                      Congratulations, you have completed your training!
                      <br />
                      <br />
                      You are now ready to navigate the spaceship on your own.
                      <br />
                      There will be three journeys that we will be making.
                      <br />
                      <br />
                      In the first journey, we will encounter{" "}
                      <strong>four</strong> new planets <br />
                      instead of the two that you have seen in your training.
                      <br /> <br />
                      As our exploration is long, we will reserve our power
                      first, so <br />
                      shield activation is <strong>unavailable</strong> during
                      this journey.
                      <br /> <br />
                      In other words, the <strong>SPACEBAR</strong> key will NOT
                      work.
                      <br /> <br />
                      <span className={styles.centerTwo}>
                        [<strong>NEXT</strong> →]
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
                        MAIN TASK: PART {this.state.taskSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Instead, you should take this chance to collect some data of
                    how dangerous these planets are. <br />
                    At the end of this journey, we will ask you to report your
                    estimates of how <br />
                    likely each planet will interfere with our navigation
                    system.
                    <br />
                    <br />
                    Again, do remember that our system may overheat, and the
                    warning tone will play. <br />
                    Though this will be <strong>rare</strong>, it is important
                    that you cool it down with the <strong>W</strong> key,{" "}
                    <br />
                    else our system will malfunction.
                    <br /> <br />
                    If this happens, we will have to stop our exploration
                    completely!
                    <br /> <br />
                    We will lower its volume so that you can concentrate on
                    navigation, <br />
                    so it is important that you <strong>DO NOT</strong> adjust
                    your system volume.
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
                        MAIN TASK: PART {this.state.taskSession} OF 3
                      </strong>
                    </span>
                    <br />
                    For the first journey, we will navigate past the planets{" "}
                    {this.state.trialPerBlockNum} times in{" "}
                    {this.state.totalBlock} trip.
                    <br />
                    <br />{" "}
                    <span className={styles.centerTwo}>
                      When you are ready, please press the{" "}
                      <strong>SPACEBAR</strong> to begin.
                    </span>
                    <br />{" "}
                    <span className={styles.centerTwo}>
                      [← <strong>BACK</strong>]
                    </span>
                  </p>
                </div>
              );
            }
          } else if (this.state.continQuiz === true) {
            document.removeEventListener("keyup", this._handleInstructKey);
            document.removeEventListener("keyup", this._handleBeginKey);
            //this.state.instruct is true, continQuiz is true, the taskSession end, will be the contigency quiz
            text = <div> {this.continQuizOne(this.state.quizQnNum)}</div>;
          }
        } else if (this.state.taskSession === 2) {
          //////this.state.instruct is true, no quiz here
          document.addEventListener("keyup", this._handleBeginKey);
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>MAIN TASK: PART {this.state.taskSession} OF 3</strong>
                </span>
                <br />
                Well done! For the second journey, we will use full power ahead.
                <br />
                You can now activate the shield with the{" "}
                <strong>SPACEBAR</strong> key when we approach a planet if you
                wish.
                <br /> <br /> Do use your knowledge of which planets are
                dangerous or safe in order to make your choices.
                <br /> <br />
                <strong>Remember</strong>: <br />
                1) We can activate the shield with the <strong>
                  SPACEBAR
                </strong>{" "}
                key.
                <br />
                2) Cool the system down with the <strong>W</strong> key when the
                warning tone plays.
                <br /> <br />
                For the second journey, we will navigate past{" "}
                {this.state.trialPerBlockNum} planets in {this.state.totalBlock}{" "}
                trips each. <br />
                You will have a chance to take a rest in between trips.
                <br /> <br />
                <span className={styles.centerTwo}>
                  When you are ready, please press <strong>SPACEBAR</strong> to
                  begin.
                </span>
              </p>
            </div>
          );
        } else if (this.state.taskSession === 3) {
          //////this.state.instruct is true, will be the contigency quiz when it ends
          if (this.state.continQuiz === false) {
            if (this.state.currentInstructionText === 1) {
              document.addEventListener("keyup", this._handleInstructKey);
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        MAIN TASK: PART {this.state.taskSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Great job on reaching the final journey!
                    <br />
                    <br />
                    For the rest of the journey, we recieved reports that the
                    radiation levels from these <strong>two</strong> planets:
                    <br /> <br />
                    <span className={styles.center}>
                      <img
                        src={
                          this.state.stim[this.state.stimCondTrackDevalIndex[0]]
                        }
                        alt="stim images"
                        width="100"
                        height="auto"
                      />
                      &nbsp; &nbsp; &nbsp;
                      <img
                        src={
                          this.state.stim[this.state.stimCondTrackDevalIndex[1]]
                        }
                        alt="stim images"
                        width="100"
                        height="auto"
                      />
                      <br /> <br />
                    </span>
                    have been reduced to <strong>0%</strong>. This means that
                    they will NOT interfere with our system at all.
                    <br />
                    On the other hand, the radiation levels of the other two
                    planets remain the same. <br />
                    <br />
                    Do take this new information into account and activate the
                    shield accordingly. Try not to waste power!
                    <br />
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
                        MAIN TASK: PART {this.state.taskSession} OF 3
                      </strong>
                    </span>
                    <br />
                    <strong>Remember</strong>: <br />
                    1) We can activate the shield with the{" "}
                    <strong>SPACEBAR</strong> key.
                    <br />
                    2) Cool the system down with the <strong>W</strong> key when
                    the warning tone plays.
                    <br /> <br />
                    For the third journey, we will navigate past the planets{" "}
                    {this.state.trialPerBlockNum} times in{" "}
                    {this.state.totalBlock} trips each. <br />
                    You will have a chance to take a rest in between trips.
                    <br />
                    <br />
                    <span className={styles.centerTwo}>
                      When you are ready, please press the{" "}
                      <strong>SPACEBAR</strong> to begin.
                    </span>
                  </p>
                </div>
              );
            }
          } else if (this.state.continQuiz === true) {
            document.removeEventListener("keyup", this._handleInstructKey);
            document.removeEventListener("keyup", this._handleBeginKey);
            //this.state.instruct is true, continQuiz is true, the taskSession end, will be the contigency quiz (session 3)
            text = <div> {this.continQuizTwo(this.state.quizQnNum)}</div>;
          }
        }
        //if current screen is false, instruct is false,
      } else {
        //if the attention check is all OK
        document.addEventListener("keyup", this._handleBeginKey);
        if (this.state.attenPass === false) {
          if (this.state.taskSession === 1) {
            text = (
              <div className={styles.main}>
                <p>
                  You have failed to cool the system down in time with the&nbsp;
                  <strong>W</strong> key!
                  <br />
                  <br />
                  The system has overheated!
                  <br />
                  <br />
                  We will need to restart our exploration from the beginning.
                  <br /> <br />
                  <strong>Remember</strong>: <br />
                  Cool the system down with the <strong>W</strong> key when the
                  warning tone plays.
                  <br />
                  <br />
                  <span className={styles.centerTwo}>
                    When you are ready, please press the&nbsp;
                    <strong>SPACEBAR</strong> to restart.
                  </span>
                </p>
              </div>
            );
          } else {
            //task session 2 or 3, where the avoidance key works
            text = (
              <div className={styles.main}>
                <p>
                  You have failed to cool the system down in time with the&nbsp;
                  <strong>W</strong> key!
                  <br />
                  <br />
                  The system has overheated!
                  <br />
                  <br />
                  We will need to restart our exploration from the begining.
                  <br /> <br />
                  <strong>Remember</strong>: <br />
                  1) We can activate the shield with the{" "}
                  <strong>SPACEBAR</strong> key.
                  <br />
                  2) Cool the system down with the <strong>W</strong> key when
                  the warning tone plays.
                  <br />
                  <br />
                  <span className={styles.centerTwo}>
                    When you are ready, please press <strong>SPACEBAR</strong>{" "}
                    to restart.
                  </span>
                </p>
              </div>
            );
          }
        } else {
          //atten is true,
          //if current screen is false, instruct is false, but attention is ok, then it is the break time
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>MAIN TASK: PART {this.state.taskSession} OF 3</strong>
                </span>
                <br />
                You have completed {this.state.blockNum} out of{" "}
                {this.state.totalBlock} trips!
                <br /> <br />
                You can take a short break and continue with the next trip when
                you are ready..
                <br /> <br />
                <strong>Remember</strong>: <br />
                1) We can activate the shield with the <strong>
                  SPACEBAR
                </strong>{" "}
                key.
                <br />
                2) Cool the system down with the <strong>W</strong> key when the
                warning tone plays.
                <br />
                <br />
                <span className={styles.centerTwo}>
                  When you are ready, please press <strong>SPACEBAR</strong> to
                  continue.
                </span>
              </p>
            </div>
          );
        }
      }
    } else {
      // if currentScreen is true, then play the task
      document.removeEventListener("keyup", this._handleInstructKey);
      document.removeEventListener("keyup", this._handleBeginKey);
      text = (
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
          <AudioPlayerDOM src={this.state.playAtten} />
          <AudioPlayerDOM src={this.state.playFb} />
        </div>
      );
    }

    return <div className={styles.spaceship}>{text}</div>;
  }
}

export default withRouter(ExptTask);
