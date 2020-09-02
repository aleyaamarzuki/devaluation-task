import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import AudioPlayerDOM from "./AudioPlayerDOM";

import fix from "./images/fixation.png";

import stim1 from "./images/fractal_1.jpg";
import stim2 from "./images/fractal_2.jpg";
import stim3 from "./images/fractal_3.jpg";
import stim4 from "./images/fractal_4.jpg";

import fbAver from "./images/1.png";
import fbSafe from "./images/3.png";
import fbAvoid from "./images/2.png";

import attenSound from "./sounds/happy-blip.wav";
import fbSound from "./sounds/metal-scrape1.wav";
import avoidSound from "./sounds/dental-scrape.wav";

import styles from "./style/taskStyle.module.css";

import { DATABASE_URL } from "./config";

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

    var attenCheck1 = Math.round(0.3 * totalTrial1); //30% of trials will have attention chec
    var attenCheck2 = Math.round(0.3 * totalTrial2);
    var attenCheck3 = Math.round(0.3 * totalTrial3);
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
      //this tracks the index for stim fbprob shuffling
      //in other words, for devalution, 1 high 1 low devalue, use index 0 and 2
      responseKey: 0,
      // responseAvoid: 0,
      attenPassPer: -1, // fail 30% of the attention checks?// change this to enable attentioncheck

      timeLag: [1000, 1500, 1000],
      fbProb: fbProb,
      respProb: 0.2,
      fbProbTrack: 0,
      randProb: 0,
      blockNum: 1,

      trialNum: 0,
      trialinBlockNum: 0,

      fix: fix,
      stim: stim,
      fb: [fbAver, fbSafe, fbAvoid],

      fbSound: fbSound,
      avoidSound: avoidSound,
      attenSound: attenSound,
      showImage: fix,

      attenCheckKey: 0,
      attenCheckAll: [], //this is how many atten trials there are
      attenCheckKeySum: 0, //this is calculated later
      attenCheckKeyAll: [],

      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      attenCheckTime: 0,
      reactionTime: 0,
      fbTime: 0,

      playAttCheck: false,
      playFbSound: false,
      playAtten: null,
      playFb: null,
      attenPass: true,
      devalue: false,

      instruct: true,
      continQuiz: false,
      currentScreen: false, // false for break, true for task

      quizContin: [],
      quizConf: [],
      quizTime: 0,
      quizQnRT: 0,
      quizQnNum: 1,
      quizContinDefault: 50,
      quizConfDefault: 50,
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

    this.playAttenSound = this.playAttenSound.bind(this);
    this.attenCount = this.attenCount.bind(this);
    this.blockProceed = this.blockProceed.bind(this);
    this.taskRestart = this.taskRestart.bind(this);
    //  this.saveData = this.saveData.bind(this);
    this.sessionBegin = this.sessionBegin.bind(this);
    this.quizNext = this.quizNext.bind(this);
    this.sessionProceed = this.sessionProceed.bind(this);
  }
  /////////////////////////////////////////////////////////////////////////////////
  // END COMPONENT PROPS

  /////////////////////////////////////////////////////////////////////////////////
  // SET TRIAL COMPONENTS - FIXATION
  renderFix() {
    if (this.state.currentScreen === true) {
      //if trial within the block hasn't been reached, continue
      // if trial 1, and total trial in blocknum is 10...
      var trialTime = Math.round(performance.now());
      this.setState({ trialTime: trialTime, showImage: this.state.fix });

      this.refreshSound();

      console.log("Trial no: " + this.state.trialNum);
      console.log("Total Trial: " + this.state.totalTrial);
      console.log("Block Trial no: " + this.state.trialinBlockNum);

      // This is for the attentionCheck trials
      if (this.state.attenIndex[this.state.trialNum - 1] === 1) {
        this.setState({ playAttCheck: true });
      } else {
        this.setState({ playAttCheck: false });
      }

      this.playAttenSound();

      // if it is the 20th or the 50th trial, do the attention Check
      if (this.state.trialNum === 20 || this.state.trialNum === 50) {
        // and they fail % of the attentionCheck
        if (
          this.state.attenCheckKeySum / this.state.attenCheckAll <
          this.state.attenPassPer
        ) {
          this.setState({ attenPass: false, currentScreen: false });
        } else {
          this.setState({ attenPass: true, currentScreen: true });
        }
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
          this.attenCount();
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
      document.removeEventListener("keyup", this._handleAttenCheckKey);
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
          var trialNum = this.state.trialNum + 1;
          var trialinBlockNum = this.state.trialinBlockNum + 1;

          this.setState({
            trialNum: trialNum,
            trialinBlockNum: trialinBlockNum,
            responseKey: 0,
            attenCheckKey: 0,
            // responseAvoid: 0,
            randProb: 0,

            fixTime: 0,
            stimTime: 0,
            attenCheckTime: 0,
            reactionTime: 0,
            fbTime: 0,
          });
          console.log("trial num is:" + trialNum);

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
        if (this.state.taskSession === 2) {
          setTimeout(
            function () {
              this.sessionProceed();
            }.bind(this),
            0
          );
        } else {
          //for the first and third expt, there is a quiz to do
          var quizTime = Math.round(performance.now()); //for the first question

          this.setState({
            currentScreen: false,
            instruct: true,
            continQuiz: true,
            quizTime: quizTime,
          });
        }
      }
    } else {
      console.log("curent screen is false");
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // THREE COMPONENTS OF THE TASK, FIXATION, STIMULI, FEEDBACK END ---------------

  /////////////////////////////////////////////////////////////////////////////////
  // SET ATTENTCHECK COMPONENTS
  // put the response and attenChecks into one array
  attenCount() {
    var attenCheckKeyAll = this.state.attenCheckKeyAll;
    var trialNum = this.state.trialNum;
    var attenCheckKey = this.state.attenCheckKey;
    var attenIndex = this.state.attenIndex;
    var countIndex = trialNum - 1;
    var attenCheckKeySum = this.state.attenCheckKeySum;

    attenCheckKeyAll[countIndex] = attenCheckKey;

    // Future: I might need to just save whenever they press the O key to check against the index,
    //this will show when they press O key when they DONT need to
    // If the O key is pressed when it needs to be pressed,
    if (attenCheckKeyAll[countIndex] === 9 && attenIndex[countIndex] === 1) {
      attenCheckKeySum = attenCheckKeySum + 1;
      console.log("O KEY WHEN IT IS ATTEN TRIAL");
    } else {
      console.log("nothiNG");
    }

    this.setState(
      {
        attenCheckKeyAll: attenCheckKeyAll,
        attenCheckKeySum: attenCheckKeySum,
      },
      () =>
        console.log(
          "AttenCheckKey: " +
            this.state.attenCheckKeyAll +
            "Sum: " +
            this.state.attenCheckKeySum +
            "AttenIndex: " +
            attenIndex
        )
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // SOUND FUNCTIONS
  playAttenSound() {
    if (this.state.playAttCheck) {
      this.setState({
        playAtten: this.state.attenSound,
      });
    } else {
      this.setState({
        playAtten: null,
      });
    }
  }

  refreshSound() {
    this.setState({
      playAtten: null,
      playFb: null,
      playAttCheck: false,
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
      // responseAvoid: 1,
      reactionTime: reactionTime,
    });
  }

  pressAttenCheck(atten_pressed, atten_time_pressed) {
    var attenCheckTime = atten_time_pressed - this.state.stimTime;

    this.setState({
      attenCheckKey: atten_pressed,
      attenCheckTime: attenCheckTime,
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
      case 79: //o key
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

        blockNum: 1,

        trialNum: 0,
        trialinBlockNum: 0,

        quizContin: [],
        quizConf: [],
        quizTime: 0,
        quizQnNum: 1,
        quizQnRT: 0,
        quizContinDefault: [],
        quizConfDefault: [],

        playAttCheck: false,
        playFbSound: false,
        playAtten: null,
        playFb: null,
      });

      //if its task session 3, additional devalution occurs
      if (taskSession === 3) {
        var stimCondTrack = this.state.stimCondTrack;

        //devlaue one high and one low probs devalue the 1 and 3 option
        var indexHighProb = stimCondTrack.indexOf(1);
        var indexLowProb = stimCondTrack.indexOf(3);

        var fbProb = this.state.fbProb;
        fbProb[indexHighProb] = 0;
        fbProb[indexLowProb] = 0;

        this.setState({ fbProb: fbProb, devaluedBlock: 1 });
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

    var attenIndex1 = shuffle(this.state.attenIndexLog[0]);
    var attenIndex2 = shuffle(this.state.attenIndexLog[1]);
    var attenIndex3 = shuffle(this.state.attenIndexLog[2]);

    var totalTrial = this.state.totalTrialLog[taskSession - 1];
    var trialPerBlockNum = this.state.trialPerBlockNumLog[taskSession - 1];
    var attenCheckAll = this.state.attenCheckAllLog[taskSession - 1];

    this.setState({
      taskSessionTry: taskSessionTry,
      taskSession: taskSession,

      stim: stim,
      fbProb: fbProb,
      stimCondTrack: stimCondTrack,

      responseKey: [],
      reactionTime: [],
      trialNum: 1,
      trialinBlockNum: 1,
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
      attenCheckKeySum: 0, //this is calculated later
      attenCheckKeyAll: [],

      playAttCheck: false,
      playFbSound: false,
      playAtten: null,
      playFb: null,
      attenPass: true,

      currentScreen: true,
      instruct: false,
      continQuiz: false,

      quizContin: [],
      quizConf: [],
      quizTime: 0,
      quizQnNum: 1,
      quizQnRT: 0,
      quizContinDefault: [],
      quizConfDefault: [],
    });
    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  /////////////////////////////////////////////////////////////////////////////////
  // SET QUIZ COMPONENTS
  quizNext() {
    if (this.state.quizQnNum < 4) {
      var quizQnNum = this.state.quizQnNum + 1;
      var quizTime = Math.round(performance.now()); //for the next question
      console.log(quizQnNum);
      this.setState({ quizQnNum: quizQnNum, quizTime: quizTime });
    } else {
      //lag a bit to make sure statestate is saved
      console.log("Go to next session");

      setTimeout(
        function () {
          this.sessionProceed();
        }.bind(this),
        10
      );
    }
  }

  /////////////// call back values for the contigency and confidence quiz
  callBackContin(callBackValue) {
    console.log("contin " + callBackValue);
    this.setState({ quizContin: callBackValue });
  }

  callbackContinInitial(initialValue) {
    console.log("contin default" + initialValue);
    this.setState({ quizContinDefault: initialValue });
  }

  callbackConf(callBackValue) {
    this.setState({ quizConf: callBackValue });
  }

  callbackConfInitial(initialValue) {
    this.setState({ quizConfDefault: initialValue });
  }

  /////////////// call back values for the contigency and confidence quiz

  // Contigency quizes
  continQuizOne(quizQnNum) {
    let question_text1 = (
      <div className={styles.main}>
        <span className={styles.center}>
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
          <strong>1</strong> to <strong>100%</strong>) of receiving an
          unpleasant sound for the above image?
          <br />
          <br />
          <SliderQuiz1.SliderContinQn1
            callBackValue={this.callBackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q1b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your answer above?
          <br />
          <br />
          <SliderQuiz1.SliderConfQn1
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          [Select using the number sliders above. To submit your answers and
          move on to the next question, click <strong>NEXT</strong> below.]
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className="buttonInstructions"
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
        <span className={styles.center}>
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
          <strong>1</strong> to <strong>100%</strong>) of receiving an
          unpleasant sound for the above image?
          <br />
          <br />
          <SliderQuiz1.SliderContinQn2
            callBackValue={this.callBackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q3b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your answer above?
          <br />
          <br />
          <SliderQuiz1.SliderConfQn2
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          [Select using the number sliders above. To submit your answers and
          move on to the next question, click <strong>NEXT</strong> below.]
          <br />
          <br />{" "}
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className="buttonInstructions"
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
        <span className={styles.center}>
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
          <strong>1</strong> to <strong>100%</strong>) of receiving an
          unpleasant sound for the above image?
          <br />
          <br />
          <SliderQuiz1.SliderContinQn3
            callBackValue={this.callBackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q3b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your answer above?
          <br />
          <br />
          <SliderQuiz1.SliderConfQn3
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          [Select using the number sliders above. To submit your answers and
          move on to the next question, click <strong>NEXT</strong> below.]
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className="buttonInstructions"
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
        <span className={styles.center}>
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
          <strong>1</strong> to <strong>100%</strong>) of receiving an
          unpleasant sound for the above image?
          <br />
          <br />
          <SliderQuiz1.SliderContinQn4
            callBackValue={this.callBackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q4b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your answer above?
          <br />
          <br />
          <SliderQuiz1.SliderConfQn4
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          [Select using the number sliders above. To submit your answers and
          move on to the next session, click <strong>END</strong> below.]
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className="buttonInstructions"
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
        <span className={styles.center}>
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
          <strong>1</strong> to <strong>100%</strong>) of receiving an
          unpleasant sound for the above image?
          <br />
          <br />
          <SliderQuiz2.SliderContinQn1
            callBackValue={this.callBackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q1b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your answer above?
          <br />
          <br />
          <SliderQuiz2.SliderConfQn1
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          [Select using the number sliders above. To submit your answers and
          move on to the next question, click <strong>NEXT</strong> below.]
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className="buttonInstructions"
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
        <span className={styles.center}>
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
          <strong>1</strong> to <strong>100%</strong>) of receiving an
          unpleasant sound for the above image?
          <br />
          <br />
          <SliderQuiz2.SliderContinQn2
            callBackValue={this.callBackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q3b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your answer above?
          <br />
          <br />
          <SliderQuiz2.SliderConfQn2
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          [Select using the number sliders above. To submit your answers and
          move on to the next question, click <strong>NEXT</strong> below.]
          <br />
          <br />{" "}
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className="buttonInstructions"
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
        <span className={styles.center}>
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
          <strong>1</strong> to <strong>100%</strong>) of receiving an
          unpleasant sound for the above image?
          <br />
          <br />
          <SliderQuiz2.SliderContinQn3
            callBackValue={this.callBackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q3b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your answer above?
          <br />
          <br />
          <SliderQuiz2.SliderConfQn3
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          [Select using the number sliders above. To submit your answers and
          move on to the next question, click <strong>NEXT</strong> below.]
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className="buttonInstructions"
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
        <span className={styles.center}>
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
          <strong>1</strong> to <strong>100%</strong>) of receiving an
          unpleasant sound for the above image?
          <br />
          <br />
          <SliderQuiz2.SliderContinQn4
            callBackValue={this.callBackContin.bind(this)}
            initialValue={this.callbackContinInitial.bind(this)}
          />
          <br />
          <br />
          <strong>Q4b:</strong> How confident (on a scale of <strong>1</strong>
          &nbsp;to <strong>100</strong>) are you in your answer above?
          <br />
          <br />
          <SliderQuiz2.SliderConfQn4
            callBackValue={this.callbackConf.bind(this)}
            initialValue={this.callbackConfInitial.bind(this)}
          />
          <br />
          <br />
          [Select using the number sliders above. To submit your answers and
          move on to the next session, click <strong>END</strong> below.]
          <br />
          <br />
          <div className="col-md-12 text-center">
            <Button
              id="right"
              className="buttonInstructions"
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
      stimTime: this.state.trialNum,
      fbProbTrack: this.state.fbProbTrack,
      randProb: this.state.randProb,
      responseKey: this.state.responseKey,
      reactionTime: this.state.reactionTime,
      // responseAvoid: this.state.responseAvoid,
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
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      MAIN TASK: PART {this.state.taskSession} OF 3
                    </strong>
                  </span>
                  <br />
                  Congragulations, you have completed the tutorial! We will now
                  begin with the main task.
                  <br />
                  <br />
                  There will be three sections to the main task. In the first
                  section, you will be shown <strong>four</strong> new images
                  instead of the two that you practiced with in the tutorial.
                  Each of these images are uniquely linked to a certain chance
                  of recieving an unpleasant sound.
                  <br />
                  <br />
                  Your aim in this section is simply to learn what the
                  probability level of recieving an unpleasant sound is for each
                  of these four images - we will ask you to report your guess at
                  the end of this section.
                  <br />
                  <br />
                  <strong>Note</strong>: The avoidance <strong>SPACEBAR</strong>{" "}
                  key will <strong>NOT</strong> work in this section, but do
                  remember to press the <strong>O</strong> key when the image is
                  presented if a neutral sound plays during the fixation prior.
                  If you fail to press the <strong>O</strong> key when the a
                  neutral sound is played too many times, the task will
                  automatically reset and you will have to start again from the
                  beginning of this section.
                  <br />
                  <br />
                  There will be {this.state.totalBlock} block of{" "}
                  {this.state.trialPerBlockNum} trials per block for this
                  section.
                  <br />
                  <br />
                  When you are ready, please click <strong>START</strong> to
                  begin.
                  <br /> <br />
                  <span className={styles.center}>
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.sessionBegin}
                    >
                      <span className="bold">START</span>
                    </Button>
                  </span>
                </p>
              </div>
            );
          } else if (this.state.continQuiz === true) {
            //this.state.instruct is true, continQuiz is true, the taskSession end, will be the contigency quiz
            text = <div> {this.continQuizOne(this.state.quizQnNum)}</div>;
          }
        } else if (this.state.taskSession === 2) {
          //////this.state.instruct is true, no quiz here
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>MAIN TASK: PART {this.state.taskSession} OF 3</strong>
                </span>
                <br />
                Well done! For the second session of the task, you now have the
                option to use the avoidance <strong>SPACEBAR</strong> key to
                receive a milder unpleasant noise instead if you wish. Do use
                your knowledge of which images are good or bad in order to make
                your choices.
                <br /> <br />
                <strong>Remember</strong>: <br />
                1) Pressing the avoidance <strong>SPACEBAR</strong> key leads to
                a milder unpleasant noise.
                <br />
                2) Press the <strong>O</strong> key when the image is presented
                if a neutral tone is played during fixation.
                <br /> <br />
                There will be {this.state.totalBlock} block(s) of{" "}
                {this.state.trialPerBlockNum} trials per block for this section.
                <br /> <br />
                When you are ready, please click <strong>START</strong> to
                begin.
                <br /> <br />
                <span className={styles.center}>
                  <Button
                    id="right"
                    className="buttonInstructions"
                    onClick={this.sessionBegin}
                  >
                    <span className="bold">START</span>
                  </Button>
                </span>
              </p>
            </div>
          );
        } else if (this.state.taskSession === 3) {
          //////this.state.instruct is true, will be the contigency quiz when it ends
          if (this.state.continQuiz === false) {
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      MAIN TASK: PART {this.state.taskSession} OF 3
                    </strong>
                  </span>
                  <br />
                  Great job on reaching the final section! For the rest of the
                  experiment, the chance of these <strong>two</strong> images:
                  <br /> <br />
                  <span className={styles.center}>
                    <img
                      src={this.state.stim[this.state.stimCondTrack[1]]}
                      alt="stim images"
                      width="100"
                      height="auto"
                    />
                    &nbsp; &nbsp; &nbsp;
                    <img
                      src={this.state.stim[this.state.stimCondTrack[3]]}
                      alt="stim images"
                      width="100"
                      height="auto"
                    />
                    <br /> <br />
                  </span>
                  receiving an unpleasant have been reduced to{" "}
                  <strong>0%</strong>, while the chance for the other two images
                  remain the same. You will have to take this new information
                  into account and make your responses accordingly.
                  <br /> <br />
                  <strong>Remember</strong>:<br />
                  1) Pressing the avoidance <strong>SPACEBAR</strong> key leads
                  to a milder unpleasant noise.
                  <br />
                  2) Press the <strong>O</strong> key when the image is
                  presented if a neutral tone is played during fixation.
                  <br /> <br />
                  There will be {this.state.totalBlock} block of{" "}
                  {this.state.trialPerBlockNum} trials per block for this
                  section.
                  <br /> <br />
                  When you are ready, please click <strong>START</strong> to
                  begin.
                  <br /> <br />
                  <span className={styles.center}>
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.sessionBegin}
                    >
                      <span className="bold">START</span>
                    </Button>
                  </span>
                </p>
              </div>
            );
          } else if (this.state.continQuiz === true) {
            //this.state.instruct is true, continQuiz is true, the taskSession end, will be the contigency quiz (session 3)
            text = <div> {this.continQuizTwo(this.state.quizQnNum)}</div>;
          }
        }
        //if current screen is false, instruct is false,
      } else {
        //if the attention check is all OK
        if (this.state.attenPass === false) {
          text = (
            <div className={styles.main}>
              <p>
                You have failed to press the <strong>O key</strong> too often
                when the neutral tone is played! Please restart the task from
                the begining.
                <br /> <br />
                <strong>Remember</strong>: <br />
                1) Pressing the avoidance <strong>SPACEBAR</strong> key leads to
                a milder unpleasant noise.
                <br />
                2) Press the <strong>O</strong> key when the image is presented
                if a neutral tone is played during fixation.
                <br /> <br />
                <br /> <br />
                <span className={styles.center}>
                  <Button
                    id="right"
                    className="buttonInstructions"
                    onClick={this.taskRestart}
                  >
                    <span className="bold">RESTART</span>
                  </Button>
                </span>
              </p>
            </div>
          );
        } else {
          //if current screen is false, instruct is false, but attention is ok, then it is the break time
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>MAIN TASK: PART {this.state.taskSession} OF 3</strong>
                </span>
                <br />
                You have completed {this.state.blockNum} out of{" "}
                {this.state.totalBlock} blocks!
                <br /> <br />
                You can take a short break and proceed to the next block when
                you are ready by clicking <strong>START</strong> below.
                <br /> <br />
                <strong>Remember</strong>: 1) Pressing the avoidance{" "}
                <strong>SPACEBAR</strong> key leads to a milder unpleasant
                noise.
                <br />
                2) Press the <strong>O</strong> key when the image is presented
                if a neutral tone is played during fixation
                <br /> <br />
                <span className={styles.center}>
                  <Button
                    id="right"
                    className="buttonInstructions"
                    onClick={this.blockProceed}
                  >
                    <span className="bold">START</span>
                  </Button>
                </span>
              </p>
            </div>
          );
        }
      }
    } else {
      // if currentScreen is true, then play the task
      text = (
        <div className={styles.stimuli}>
          <img
            src={this.state.showImage}
            alt="stim images"
            width="150"
            height="auto"
          />
          <AudioPlayerDOM src={this.state.playAtten} />
          <AudioPlayerDOM src={this.state.playFb} />
        </div>
      );
    }

    return <div className="slideshow-container">{text}</div>;
  }
}

export default withRouter(ExptTask);
