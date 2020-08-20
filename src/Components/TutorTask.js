import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import AudioPlayerDOM from "./AudioPlayerDOM";

import fix from "./images/fixation.png";
import stimTrain1 from "./images/fractalTrain_1.jpg";
import stimTrain2 from "./images/fractalTrain_2.jpg";
import fbAver from "./images/fb_no.jpg";
import fbSafe from "./images/fb_yes.jpg";
import taskOutline from "./images/taskOutline.png";

import attenSound from "./sounds/happy-blip.wav";
// import fbSound from "./sounds/player-hit.wav";
import fbSound from "./sounds/0276_2-2secs.wav";

import styles from "./style/taskStyle.module.css";

import { DATABASE_URL } from "./config";

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
function shuffleSame(obj1, obj2) {
  var index = obj1.length;
  var rnd, tmp1, tmp2;

  while (index) {
    rnd = Math.floor(Math.random() * index);
    index -= 1;
    tmp1 = obj1[index];
    tmp2 = obj2[index];
    obj1[index] = obj1[rnd];
    obj2[index] = obj2[rnd];
    obj1[rnd] = tmp1;
    obj2[rnd] = tmp2;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TUTORIAL SESSIONS + QUIZ FOR THE TASK
class TutorTask extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    const userID = this.props.location.state.userID;

    var currentDate = new Date();
    var date = currentDate.getDate();
    var month = currentDate.getMonth(); //Be careful! January is 0 not 1
    var year = currentDate.getFullYear();
    var dateString = date + "-" + (month + 1) + "-" + year;
    var timeString = currentDate.toTimeString();
    // var fileID = userID + "_" + dateString + "_" + timeString;
    var fileID = userID;

    // Define how many trials per tutorial session
    var totalTrialTut1 = 2;
    var totalTrialTut2 = 2;
    var totalTrialTut3 = 2;
    var stimNum = 2;

    // Define which stim is shown for each of the trials for each tutorial session
    var stimCond = Array.from(Array(2), (_, i) => i + 1); // [1,2]
    var stimIndexTut1Temp = shuffle(
      Array(Math.round(totalTrialTut1 / stimNum))
        .fill(stimCond)
        .flat()
    );
    var stimIndexTut2Temp = shuffle(
      Array(Math.round(totalTrialTut2 / stimNum))
        .fill(stimCond)
        .flat()
    );

    var stimIndexTut3Temp = shuffle(
      Array(Math.round(totalTrialTut3 / stimNum))
        .fill(stimCond)
        .flat()
    );

    var stimIndexTut1 = stimIndexTut1Temp.map(function (value) {
      return value - 1;
    });

    var stimIndexTut2 = stimIndexTut2Temp.map(function (value) {
      return value - 1;
    });

    var stimIndexTut3 = stimIndexTut3Temp.map(function (value) {
      return value - 1;
    });

    // Define which trial has the attention check
    var attenCheck = Math.round(0.5 * totalTrialTut3); //30% of trials will have attention check
    var attenIndex = shuffle(
      Array(attenCheck)
        .fill(1)
        .concat(Array(totalTrialTut3 - attenCheck).fill(0))
    );

    var stim = [stimTrain1, stimTrain2];
    var fbProb = [0.1, 0.9];
    // this is to randomise fractals and their fb probs
    shuffleSame(stim, fbProb);

    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      userID: userID,
      fileID: fileID,
      date: dateString,
      UserStartTime: timeString,

      totalTrialLog: [totalTrialTut1, totalTrialTut2, totalTrialTut3],
      stimIndexLog: [stimIndexTut1, stimIndexTut2, stimIndexTut3],
      quizAns1: 2,
      quizAns2: [3, 1, 3, 2],
      quizAns3: [3, 3, 2],
      quizQnTotal: [1, 4, 3],

      attenIndex: attenIndex,
      timeLag: [1000, 1500, 2500],
      fbProb: [0.1, 0.9],
      respProb: 0.2,
      randProb: 0,
      fbProbTrack: 0,

      tutorialSession: 1,
      quizSession: 1,
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
      responseAvoid: 0,
      attenCheckAll: attenCheck, //this is how many atten trials there are
      attenCheckKeySum: 0, //this is calculated later
      attenCheckKeyAll: [],

      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      attenCheckTime: 0,
      reactionTime: 0,
      fbTime: 0,

      fix: fix,
      stim: stim,
      fb: [fbAver, fbSafe],

      fbSound: fbSound,
      attenSound: attenSound,

      showImage: fix,

      playAttCheck: false,
      playFbSound: false,
      playAtten: null,
      playFb: null,

      currentScreen: false, // false for instructions or quiz, true for tutorial
      quizScreen: false, // is it quiz or not
      readyForTask: false, // this is for the transition to experimental block
    };

    console.log("Atten Indx: " + this.state.attenIndex);
    console.log("Tutorial Session: " + this.state.tutorialSession);

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    this.handleInstructionsLocal = this.handleInstructionsLocal.bind(this);
    this.tutorialOne = this.tutorialOne.bind(this);
    this.tutorialTwo = this.tutorialTwo.bind(this);
    this.tutorialThree = this.tutorialThree.bind(this);
    this.quizCheck = this.quizCheck.bind(this);
    this.quizProceed = this.quizProceed.bind(this);
    this.tutorialRedo = this.tutorialRedo.bind(this);
    this.redirectToTarget = this.redirectToTarget.bind(this);
    this.attenCount = this.attenCount.bind(this);
    this.saveQuizData = this.saveQuizData.bind(this);
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  // BEFORE RENDER

  // This handles instruction screen within the component
  handleInstructionsLocal(event) {
    var curText = this.state.currentInstructionText;
    var whichButton = event.currentTarget.id;

    if (whichButton === "left" && curText > 1) {
      this.setState({ currentInstructionText: curText - 1 });
    } else if (whichButton === "right" && curText < 3) {
      this.setState({ currentInstructionText: curText + 1 });
    }

    // if (whichButton === "right" && curText === 3) {
    //   this.setState({ readyToProceed: true });
    // }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // THREE COMPONENTS OF THE TASK, Fixation, Stimulus/Response and Feedback
  renderFix() {
    if (this.state.currentScreen === true) {
      console.log("Fixation IS RENDERED as currentScreen is TRUE");
      //if trials are still ongoing
      var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
      var trialTime = Math.round(performance.now());

      //Reset all parameters
      this.setState({
        trialNum: trialNum,
        responseKey: 0,
        attenCheckKey: 0,
        responseAvoid: 0,
        randProb: 0,

        trialTime: trialTime,
        fixTime: 0,
        stimTime: 0,
        attenCheckTime: 0,
        reactionTime: 0,
        fbTime: 0,
      });

      console.log(this.state.trialNum);
      console.log(this.state.totalTrial);
      console.log("Stim Indx: " + this.state.stimIndex);

      if (this.state.trialNum < this.state.totalTrial + 1) {
        var fixTime = Math.round(performance.now()) - this.state.trialTime;
        this.setState({ showImage: this.state.fix, fixTime: fixTime });

        this.refreshSound();

        console.log("Trial no: " + this.state.trialNum);

        setTimeout(
          function () {
            this.renderStim();
          }.bind(this),
          this.state.timeLag[0]
        );
      } else {
        // When it reach the set number of trials......
        if (this.state.tutorialSession === 1) {
          this.setState({
            currentScreen: false,
            quizScreen: true,
            quizSession: 1,
          });
        } else if (this.state.tutorialSession === 2) {
          this.setState({
            currentScreen: false,
            currentInstructionText: 4,
            quizSession: 2,
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
      console.log("Fixation NOT RENDERED as currentScreen is false");
    }
  }

  renderStim() {
    //if trials are still ongoing

    if (this.state.trialNum < this.state.totalTrial + 1) {
      document.addEventListener("keyup", this._handleResponseKey);
      document.addEventListener("keyup", this._handleAttenCheckKey);

      var stimTime = Math.round(performance.now()) - this.state.fixTime;

      this.setState({
        showImage: this.state.stim[
          this.state.stimIndex[this.state.trialNum - 1]
        ],
        stimTime: stimTime,
      });

      // Only play attention sound if its the third tutorial session
      if (this.state.tutorialSession === 3) {
        if (this.state.attenIndex[this.state.trialNum - 1] === 1) {
          // This is for the attentionCheck trials
          this.setState({ playAttCheck: true });
        } else {
          this.setState({ playAttCheck: false });
        }
        console.log(
          "Atten Idx: " + this.state.attenIndex[this.state.trialNum - 1]
        );
        console.log("Atten Play: " + this.state.playAttCheck);

        this.playAttenSound();
      } else {
      }

      console.log("Stim Idx: " + this.state.stimIndex[this.state.trialNum - 1]);

      setTimeout(
        function () {
          this.renderFb();
        }.bind(this),
        this.state.timeLag[1]
      );
    } else {
      console.log("Stimuli NOT RENDERED");
    }
  }

  renderFb() {
    document.removeEventListener("keyup", this._handleResponseKey);
    document.removeEventListener("keyup", this._handleAttenCheckKey);

    if (this.state.trialNum < this.state.totalTrial + 1) {
      //if trials are still ongoing
      // if its tutorialSession 2 or 3, and the response key is pressed
      var randProb = Math.random();
      var fbTime = Math.round(performance.now()) - this.state.stimTime;
      this.setState({ fbTime: fbTime });

      //index the fb prob
      if (this.state.stimIndex[this.state.trialNum - 1] === 0) {
        this.setState({
          fbProbTrack: this.state.fbProb[0],
        });
      } else if (this.state.stimIndex[this.state.trialNum - 1] === 1) {
        this.setState({
          fbProbTrack: this.state.fbProb[1],
        });
      } else if (this.state.stimIndex[this.state.trialNum - 1] === 2) {
        this.setState({
          fbProbTrack: this.state.fbProb[2],
        });
      } else if (this.state.stimIndex[this.state.trialNum - 1] === 3) {
        this.setState({
          fbProbTrack: this.state.fbProb[3],
        });
      }

      //for tutorial 2
      if (this.state.tutorialSession === 2 && this.state.responseAvoid === 1) {
        // If participant chooses  to avoid
        // Then it's 20% chance of aversive sound feedback
        if (randProb < this.state.respProb) {
          this.setState(
            {
              showImage: this.state.fb[0],
              playFbSound: true,
              randProb: randProb,
            },
            () =>
              console.log(
                "RESP KEY Stim1 Prob: " +
                  randProb +
                  "Fb Prob 0: " +
                  this.state.fbProb[0]
              )
          );
        } else {
          this.setState(
            {
              showImage: this.state.fb[1],
              playFbSound: false,
              randProb: randProb,
            },
            () =>
              console.log(
                "RESP KEY Stim1 Prob: " +
                  randProb +
                  "Fb Prob 1: " +
                  this.state.fbProb[1]
              )
          );
        }
      } else if (
        // for tutorial 3 where it is NOT an attention trial and you respond
        this.state.tutorialSession === 3 &&
        this.state.attenIndex[this.state.trialNum - 1] === 0 &&
        this.state.responseAvoid === 1
      ) {
        if (randProb < this.state.respProb) {
          this.setState({
            showImage: this.state.fb[0],
            playFbSound: true,
            randProb: randProb,
          });
        } else {
          this.setState({
            showImage: this.state.fb[1],
            playFbSound: false,
            randProb: randProb,
          });
        }
      } else {
        // for every other thing,

        // If participant chooses NOT to avoid

        // If it's stim 1
        if (this.state.stimIndex[this.state.trialNum - 1] === 0) {
          if (randProb < this.state.fbProb[0]) {
            //if mathrandom is less than 0.1, then play aversive sound

            this.setState(
              {
                showImage: this.state.fb[0],
                playFbSound: true,
                randProb: randProb,
              },
              () =>
                console.log(
                  "Stim1 Prob: " +
                    randProb +
                    "Fb Prob 0: " +
                    this.state.fbProb[0]
                )
            );
          } else {
            this.setState(
              {
                showImage: this.state.fb[1],
                playFbSound: false,
                randProb: randProb,
              },
              () =>
                console.log(
                  "Stim1 Prob: " +
                    randProb +
                    "Fb Prob 0: " +
                    this.state.fbProb[0]
                )
            );
          }
        } else if (this.state.stimIndex[this.state.trialNum - 1] === 1) {
          if (randProb < this.state.fbProb[1]) {
            //if mathrandom is less than 0.9, then play aversive sound
            this.setState(
              {
                showImage: this.state.fb[0],
                playFbSound: true,
                randProb: randProb,
              },
              () =>
                console.log(
                  "Stim2 Prob: " +
                    randProb +
                    "Fb Prob 0: " +
                    this.state.fbProb[1]
                )
            );
          } else {
            this.setState(
              {
                showImage: this.state.fb[1],
                playFbSound: false,
                randProb: randProb,
              },
              () =>
                console.log(
                  "Stim2 Prob: " +
                    randProb +
                    "Fb Prob 0: " +
                    this.state.fbProb[1]
                )
            );
          }
        } else {
          console.log("More than 2 stimuli?");
        }
      }

      console.log("Resp: " + this.state.responseKey);
      console.log("Fb Play: " + this.state.playFbSound);

      this.playFbSound();
      if (this.state.tutorialSession === 3) {
        this.attenCount();
      }

      setTimeout(this.saveData(), 50);

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

  playFbSound() {
    if (this.state.playFbSound) {
      this.setState({
        playFb: this.state.fbSound,
      });
    } else {
      this.setState({
        playFb: null,
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
  // SOUND FUNCTIONS ----------------------------------------------------------------------END

  //////////////////////////////////////////////////////////////////////////////////////////////
  // KEY RESPONSE FUNCTIONS
  pressAvoid(key_pressed, time_pressed) {
    // If participant chooses to avoid

    //Check first whether it is a valid press
    var stimIndex = this.state.stimIndex[this.state.trialNum - 1];
    var responseAvoid = 0;
    if (
      (stimIndex === 0 && key_pressed === 1) ||
      (stimIndex === 1 && key_pressed === 2)
    ) {
      responseAvoid = 1;
    } else {
      responseAvoid = 0;
    }

    var reactionTime = this.state.stimTime - time_pressed;

    this.setState(
      {
        responseKey: key_pressed,
        responseAvoid: responseAvoid,
        reactionTime: reactionTime,
      },
      () =>
        console.log(
          "responseKey: " +
            this.state.responseKey +
            " responseAvoid: " +
            this.state.responseAvoid +
            " reactionTime: " +
            time_pressed
        )
    );
  }

  pressAttenCheck(atten_pressed, atten_time_pressed) {
    var attenCheckTime = this.state.stimTime - atten_time_pressed;

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
      // case 32:
      //this is SPACEBAR
      // key_pressed = 1;
      // key_time_pressed = Math.round(performance.now());
      // this.pressAvoid(key_pressed, key_time_pressed);
      case 87:
        //this is W
        key_pressed = 1;
        key_time_pressed = Math.round(performance.now());
        this.pressAvoid(key_pressed, key_time_pressed);
        break;
      case 69:
        //this is E
        key_pressed = 2;
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
      case 79:
        atten_pressed = 9;
        atten_time_pressed = Math.round(performance.now());
        this.pressAttenCheck(atten_pressed, atten_time_pressed);
        break;
      default:
    }
  };

  _handleKeyDownQuizOne = (event) => {
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

  _handleKeyDownQuizTwoAndThree = (event) => {
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
  taskProceed() {
    this.setState({
      readyForTask: true,
    });
  }

  tutorialProceedOne() {
    // var tutorialSession = this.state.tutorialSession + 1;
    // var quizSession = this.state.quizSession + 1;
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
      tutorialSessionTry: 1,
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
      tutorialSessionTry: 1,
    });
  }

  tutorialRedo() {
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

  tutorialOne(event) {
    this.setState(
      {
        currentScreen: true, //set for the task instead of instructionScreen
        quizScreen: false,
        trialNum: 0,
        totalTrial: this.state.totalTrialLog[0],
        stimIndex: this.state.stimIndexLog[0],
      },
      () =>
        console.log(
          "STATE UPDATED: " +
            " CURRENT SCREEN: " +
            this.state.currentScreen +
            " QUIZ SCREEN: " +
            this.state.quizScreen +
            " TOTAL TRIAL: " +
            this.state.totalTrial +
            " STIM INDEX : " +
            this.state.stimIndex +
            " trialNum : " +
            this.state.trialNum
        )
    );

    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
    // console.log("T1: currentScreen:" + this.state.currentScreen);
    // console.log("T1: quizScreen:" + this.state.quizScreen);
    // console.log("T1: Total Trial:" + this.state.totalTrial);
    // console.log("T1: Stim Indx:" + this.state.stimIndex);
    // console.log("T1: Trial Num:" + this.state.trialNum);
    // console.log("T1: Trial Log:" + this.state.totalTrialLog[0]);
    // console.log("T1: Stim Log:" + this.state.stimIndexLog[0]);
  }

  // Second tutorial sess
  tutorialTwo(event) {
    this.setState({
      currentScreen: true, //set for the task instead of instructionScreen
      quizScreen: false,
      trialNum: 0,
      totalTrial: this.state.totalTrialLog[1],
      stimIndex: this.state.stimIndexLog[1],
      playAtten: null,
      playFb: null,
      playAttCheck: false,
      playFbSound: false,
    });
    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  // Third tutorial sess
  tutorialThree(event) {
    this.setState({
      currentScreen: true, //set for the task instead of instructionScreen
      quizScreen: false,
      trialNum: 0,
      totalTrial: this.state.totalTrialLog[2],
      stimIndex: this.state.stimIndexLog[2],
      playAtten: null,
      playFb: null,
      playAttCheck: false,
      playFbSound: false,
    });
    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Set states for tutorial sections --------------------------------------------------------end
  // only for quiz 2 and 3 which has the additional page
  quizProceed(event) {
    this.setState({
      quizScreen: true,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Quiz for tutorials

  // First tutorial quiz
  quizOne(quizQnNum) {
    //which stim is the high fb one..
    //the answer is always 2
    var quizStim1 = null;
    var quizStim2 = null;

    if (this.state.fbProb[0] < 0.5) {
      quizStim1 = this.state.stim[0];
      quizStim2 = this.state.stim[1];
    } else {
      quizStim1 = this.state.stim[1];
      quizStim2 = this.state.stim[0];
    }

    let question_text1 = (
      <div className={styles.main}>
        <p>
          Which fractal was bad and had a higher probability of leading to an
          aversive sound?
          <br /> <br />
          <span className={styles.center}>
            <strong>1</strong> -{" "}
            <img src={quizStim1} alt="stim images" width="100" height="auto" />
            &nbsp; &nbsp; &nbsp;
            <strong>2</strong> -{" "}
            <img src={quizStim2} alt="stim images" width="100" height="auto" />
          </span>
          <br />
          <br />
          [Press the correct number key]
        </p>
      </div>
    );

    return <div>{question_text1}</div>;
  }

  quizTwo(quizQnNum) {
    let question_text1 = (
      <div className={styles.main}>
        <p>
          <strong>Q1:</strong> Does the chance of receiving an averisve noise
          for each fractal change over time?
          <br />
          <br />
          <strong>1</strong> - Yes, it changes over time and I need to track it.{" "}
          <br />
          <strong>2</strong> - Yes, it changes over time and is completely
          unpredictable. <br />
          <strong>3</strong> - No, it stays the same over the course of the task
          and I need to learn it. <br />
          <strong>4</strong> - I don’t know.
          <br />
          [Press the correct number key]
        </p>
      </div>
    );

    let question_text2 = (
      <div className={styles.main}>
        <p>
          <strong>Q2:</strong> What happens if I press an avoidance key (the W
          or E key) in response to a fractal?
          <br />
          <br />
          <strong>1</strong> - The chance of receiving an averisve noise becomes
          20%, only if the key is linked to the fractal.
          <br />
          <strong>2</strong> - The chance of receiving an averisve noise becomes
          20% with either key.
          <br />
          <strong>3</strong> - The chance of receiving an averisve noise becomes
          80%, only if the key is linked to the fractal.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />
          [Press the correct number key]
        </p>
      </div>
    );

    let question_text3 = (
      <div className={styles.main}>
        <p>
          <strong>Q3:</strong> What happens if I DON’T press any avoidance keys
          in response to a fractal?
          <br />
          <br />
          <strong>1</strong> - The chance of receiving an averisve noise becomes
          20%.
          <br />
          <strong>2</strong> - The chance of receiving an averisve noise becomes
          80%.
          <br />
          <strong>3</strong> - The chance of receiving an averisve noise depends
          on the fractal.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />
          [Press the correct number key]
        </p>
      </div>
    );

    let question_text4 = (
      <div className={styles.main}>
        <p>
          <strong>Q4:</strong> If a fractal has a 50% chance of receiving an
          averisve noise, should I press its avoidance key?
          <br />
          <br />
          <strong>1</strong> - No, because it will increase the chance of
          receiving an averisve noise to 80%.
          <br />
          <strong>2</strong> - Yes, because it will reduce the chance of
          receiving an averisve noise to 20%.
          <br />
          <strong>3</strong> - No, because it is better to experience 50% chance
          of receiving an averisve noise.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />
          [Press the correct number key]
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
      case 4:
        return <div>{question_text4}</div>;
      default:
    }
  }

  quizThree(quizQnNum) {
    let question_text1 = (
      <div className={styles.main}>
        <p>
          <strong>Q1:</strong> What should I do when a neutral tone is NOT
          played?
          <br />
          <br />
          <strong>1</strong> - Press the <strong>O</strong> key.
          <br />
          <strong>2</strong> - Press the avoidance keys only for good fractals.
          <br />
          <strong>3</strong> - Press the avoidance keys only for bad fractals.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />
          [Press the correct number key]
        </p>
      </div>
    );

    let question_text2 = (
      <div className={styles.main}>
        <p>
          <strong>Q2:</strong> What happens if I press the avoidance key for a
          fractal with a neutral tone?
          <br />
          <br />
          <strong>1</strong> - The chance of receiving an averisve noise becomes
          20%.
          <br />
          <strong>2</strong> - The chance of receiving an averisve noise becomes
          80%.
          <br />
          <strong>3</strong> - Nothing happens, I will experience that fractal’s
          chance of receiving an aversive sound.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />
          [Press the correct number key]
        </p>
      </div>
    );

    let question_text3 = (
      <div className={styles.main}>
        <p>
          <strong>Q3:</strong> What should I do when a neutral tone is played?
          <br />
          <br />
          <strong>1</strong> - Press the <strong>P</strong> key.
          <br />
          <strong>2</strong> - Press the <strong>O</strong> key.
          <br />
          <strong>3</strong> - Press one of the avoidance keys.
          <br />
          <strong>4</strong> - I don’t know.
          <br />
          <br />
          [Press the correct number key]
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

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Quiz for tutorials ---------------------------------------------------------------------end

  // function to go to next quiz question and check score
  quizCheck(pressed, time_pressed) {
    var quizQnNum = this.state.quizQnNum; //quiz question number (this needs to be rest to 1)
    var quizScoreCor = this.state.quizScoreCor; // correct or not for each quiz question (this needs to be rest to 0)
    var quizScoreSum = this.state.quizScoreSum; // sum score of quiz (this needs to be rest to 0)
    var quizQnIndx = quizQnNum - 1; // to index the trial in array, it's 0
    var quizQnRT = time_pressed - this.state.quizTime;

    if (this.state.quizSession === 1) {
      // Check answers if correct
      if (quizQnNum === 1 && pressed === this.state.quizAns1) {
        quizScoreCor[quizQnIndx] = 1;
        quizScoreSum = quizScoreSum + 1;
      }
    } else if (this.state.quizSession === 2) {
      if (
        (quizQnNum === 1 && pressed === this.state.quizAns2[0]) ||
        (quizQnNum === 2 && pressed === this.state.quizAns2[1]) ||
        (quizQnNum === 3 && pressed === this.state.quizAns2[2]) ||
        (quizQnNum === 4 && pressed === this.state.quizAns2[3])
      ) {
        quizScoreCor[quizQnIndx] = 1;
        quizScoreSum = quizScoreSum + 1;
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

    this.setState({
      quizKeypress: pressed,
      quizQnRT: quizQnRT,
      quizScoreCor: quizScoreCor,
      quizScoreSum: quizScoreSum,
    });

    this.saveQuizData();
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Misc functions
  //save data

  saveQuizData() {
    var fileID = this.state.fileID;

    let behaviour = {
      userID: this.state.userID,
      quizTime: this.state.quizTime,
      tutorialSession: this.state.tutorialSession,
      tutorialSessionTry: this.state.tutorialSessionTry,
      quizSession: this.state.quizSession,
      quizQnNum: this.state.quizQnNum,
      quizKeypress: this.state.quizKeypress,
      quizQnRT: this.state.quizQnRT,
      quizScoreCor: this.state.quizScoreCor[this.state.quizQnNum - 1],
    };

    // let test = {
    //   userID: this.state.userID,
    // };
    //
    // fetch(`${DATABASE_URL}/test/` + fileID, {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(test),
    // });

    fetch(`${DATABASE_URL}/tutorial_quiz/` + fileID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(behaviour),
    });

    //lag a bit to make sure statestate is saved
    setTimeout(
      function () {
        this.quizNext();
      }.bind(this),
      10
    );
  }

  quizNext() {
    var quizQnNum = this.state.quizQnNum + 1;
    var quizTime = Math.round(performance.now());
    this.setState({ quizQnNum: quizQnNum, quizTime: quizTime });
  }

  saveData() {
    var fileID = this.state.fileID;
    var attenIndex = 0;
    if (this.state.tutorialSession === 3) {
      attenIndex = this.state.attenIndex[this.state.trialNum - 1];
    } else {
      attenIndex = 0;
    }

    let tutBehaviour = {
      userID: this.state.userID,
      tutorialSession: this.state.tutorialSession,
      tutorialSessionTry: this.state.tutorialSessionTry,

      trialNum: this.state.trialNum,
      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      attenIndex: attenIndex,
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,

      stimTime: this.state.trialNum,
      stimIndex: this.state.stimIndex[this.state.trialNum - 1],
      fbProbTrack: this.state.fbProbTrack,
      randProb: this.state.randProb,
      responseKey: this.state.responseKey,
      reactionTime: this.state.reactionTime,
      responseAvoid: this.state.responseAvoid,
      playFbSound: this.state.playFbSound,
      fbTime: this.state.fbTime,
    };

    console.log(JSON.stringify(tutBehaviour));

    try {
      fetch(`${DATABASE_URL}/tutorial_data/` + fileID, {
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

    let test = {
      userID: this.state.userID,
    };

    fetch(`${DATABASE_URL}/test/` + fileID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(test),
    });
  }

  redirectToTarget() {
    this.props.history.push({
      pathname: `/ExptTask`,
      state: {
        userID: this.state.userID,
        fileID: this.state.fileID,
      },
    });
  }

  componentDidMount() {
    this.renderFix();
    window.scrollTo(0, 0);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  // render time
  render() {
    let text;

    //////////////////////////////////////////////////////////////////////////////////////////////
    // This is the last page before moving on to the exprimental task

    if (this.state.readyForTask === true) {
      text = (
        <div className={styles.main}>
          <p>
            Congragulations, you have completed the tutorial! The main task will
            be the same as the third portion of the tutorial you have played,
            but with <strong>four</strong> new fractals instead of two.
            <br />
            <br />
            Similarly, you will have to: <br />
            1) Learn which fractals are good or bad <br />
            2) Learn which avoidance key (<strong>W</strong> or{" "}
            <strong>E key</strong>) is linked to which fractals
            <br />
            3) Decide whether to press the avoidance key or not
            <br />
            3) Press the <strong>O</strong> key when a neutral tone is played
            <br />
            <br />
            You will play 6 blocks of 50 trials each, with a chance to take a
            short break in between blocks. If you are ready, please click{" "}
            <strong>START</strong> to begin.
            <br /> <br />
            <span className={styles.center}>
              <Button
                id="right"
                className="buttonInstructions"
                onClick={this.redirectToTarget}
              >
                <span className="bold">START</span>
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
            text = (
              <div className={styles.main}>
                <p>
                  <strong>Welcome to the experiment!</strong>
                  <br />
                  <br />
                  Today you will be playing a learning task. There are three
                  things for you to learn in order to do well. We will practice
                  these separately and quiz you on the main points before
                  processing to the main experiment.
                  <br />
                  <br />
                  <span className={styles.center}>
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.handleInstructionsLocal}
                    >
                      <span className="bold">NEXT</span>
                    </Button>
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
                      TUTORIAL: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  The first is: You will be shown fractal images like this:
                  <br />
                  <br />
                  <span className={styles.center}>
                    <img
                      src={stimTrain1}
                      alt="stim images"
                      width="100"
                      height="auto"
                    />
                    &nbsp; &nbsp; &nbsp;
                    <img
                      src={stimTrain2}
                      alt="stim images"
                      width="100"
                      height="auto"
                    />
                  </span>
                  <br />
                  Each of these fractals have a certain probability of resulting
                  in an aversive sound. This means that the bad fractals will
                  result in an aversive sound <strong>often</strong>, but it
                  will not be for every single time. What you need to do is to
                  learn whether the fractal(s) are good or bad. We will let you
                  see for yourself how this works.
                  <br />
                  <br />
                  <span className={styles.center}>
                    <Button
                      id="left"
                      className="buttonInstructions"
                      onClick={this.handleInstructionsLocal}
                    >
                      <span className="bold">BACK</span>
                    </Button>
                    &nbsp;
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.handleInstructionsLocal}
                    >
                      <span className="bold">NEXT</span>
                    </Button>
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
                      TUTORIAL: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  For the first part of this tutorial, you will first be
                  presented with a fixation cross, followed by a fractal image.
                  Thereafter, you will experience if the fractal leads to an
                  aversive sound, accompained by a red cross or is is safe,
                  accompained by a green tick:
                  <br /> <br />
                  <span className={styles.center}>
                    <img
                      src={taskOutline}
                      alt="stim images"
                      width="500"
                      height="auto"
                    />
                  </span>
                  <br />
                  Your aim is to learn which fractal is bad and has a higher
                  probablity of leading to an aversive sound.
                  <br /> <br />
                  <strong>Note</strong>: If you fail, you will be taken back to
                  the beginning of this tutorial.
                  <br /> <br />
                  Please click <strong>START</strong> if you are ready to begin.
                  <br /> <br />
                  <span className={styles.center}>
                    <Button
                      id="left"
                      className="buttonInstructions"
                      onClick={this.handleInstructionsLocal}
                    >
                      <span className="bold">BACK</span>
                    </Button>
                    &nbsp;
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.tutorialOne}
                    >
                      <span className="bold">START</span>
                    </Button>
                  </span>
                </p>
              </div>
            );
          }
        }
        //////////////////////////////////////////////////////////////////////////////////////////////
        // TUTORIAL 2
        else if (this.state.tutorialSession === 2) {
          if (this.state.currentInstructionText === 1) {
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TUTORIAL: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  Great! You saw that some fractals are worse than others. This
                  will remain the same over the course of the task.
                  <br /> <br />
                  The second thing you need to learn is the two options of
                  response you can make when you see the fractal:
                  <br /> <br />
                  <strong>1)</strong> You can choose{" "}
                  <strong>NOT to do anything</strong>, and experience the
                  feedback linked to the fractal.
                  <br /> <br />
                  Alternatively:
                  <br /> <br />
                  <strong>2)</strong> You can choose to{" "}
                  <strong>press one of the avoidance keys</strong>, which allows
                  you to avoid the aversive probability linked to the fractal.
                  Instead, there will be a <strong>20% chance</strong> of
                  receiving the aversive sound. Each fractal is linked to one
                  avoidance key, which you must learn.
                  <br /> <br />
                  <span className={styles.center}>
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.handleInstructionsLocal}
                    >
                      <span className="bold">NEXT</span>
                    </Button>
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
                      TUTORIAL: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  The avoidance keys are the <strong>W key</strong> and the{" "}
                  <strong>E key</strong>. Fractals are linked to{" "}
                  <strong>one</strong> of the keys. What this means is that you
                  have learn which avoidance key will work for which fractal,
                  and to decide whether pressing the avoidance key is
                  advantageous for the fractal that you see.
                  <br />
                  <br />
                  For instance, you <strong>SHOULD</strong> press the avoidance
                  key when you encounter a bad fractal in order to reduce the
                  chance that you will receive an aversive sound with that
                  fractal.
                  <br />
                  <br />
                  On the other hand, you <strong>SHOULD NOT</strong> press the
                  avoidance key when the fractal is good, otherwise you will
                  increase the chance that you will receive an aversive sound
                  with that fractal.
                  <br />
                  <br />
                  If you press the the avoidance key not linked to the fractal,
                  nothing will happen.
                  <br />
                  <br />
                  <span className={styles.center}>
                    <Button
                      id="left"
                      className="buttonInstructions"
                      onClick={this.handleInstructionsLocal}
                    >
                      <span className="bold">BACK</span>
                    </Button>
                    &nbsp;
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.handleInstructionsLocal}
                    >
                      <span className="bold">NEXT</span>
                    </Button>
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
                      TUTORIAL: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  In this second part of the tutorial, you will see the same
                  fractals as the first practice. Here, you will have to use
                  your knowledge of which fractal(s) are good or bad and to
                  press its avoidance key: <strong>W</strong> or{" "}
                  <strong>K key</strong> when it appears (to convert its
                  aversive probability to 20%) if you wish.
                  <br /> <br />
                  After, we will quiz you on the main points of this task.
                  <br /> <br />
                  <strong>Note</strong>: If you fail, you will be taken back to
                  the beginning of the second part of the tutorial. If you are
                  ready, please click <strong>START</strong> to begin.
                  <br /> <br />
                  <span className={styles.center}>
                    <Button
                      id="left"
                      className="buttonInstructions"
                      onClick={this.handleInstructionsLocal}
                    >
                      <span className="bold">BACK</span>
                    </Button>
                    &nbsp;
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.tutorialTwo}
                    >
                      <span className="bold">START</span>
                    </Button>
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 4) {
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TUTORIAL: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  Well done! You should have noticed that the{" "}
                  <strong>W key</strong> works for one fractal and the{" "}
                  <strong>E key</strong> works for the other fractal. You also
                  should have pressed the avoidance keys for bad fractals to
                  decrease the chance of receiving an aversive sound and
                  withheld the <strong>SPACEBAR</strong> press for good
                  fractals.
                  <br /> <br />
                  We will now ask you four questions to test if you have
                  understood the instructions so far. If you missed any
                  important things, you will have to go through the second part
                  of the tutorial again.
                  <br /> <br />
                  If you are ready, please click <strong>START</strong> to
                  begin.
                  <br /> <br />
                  <span className={styles.center}>
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.quizProceed}
                    >
                      <span className="bold">START</span>
                    </Button>
                  </span>
                </p>
              </div>
            );
          }
        }
        //////////////////////////////////////////////////////////////////////////////////////////////
        // TUTORIAL 3
        else if (this.state.tutorialSession === 3) {
          if (this.state.currentInstructionText === 1) {
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TUTORIAL: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  Great! In the third and last part of the tutorial, throughout
                  the task you will sometimes hear a neutral tone when a fractal
                  is being displayed.
                  <br /> <br />
                  In this case, pressing the avoidance keys will have{" "}
                  <strong>no use</strong>. Instead, you should press the{" "}
                  <strong>O key</strong> immediately. If you fail to press the O
                  key for the majority of the time when the neutral tone is
                  played, you will be taken back to the beginning of the third
                  part of the tutorial.
                  <br /> <br />
                  Remember, when no neutral tone is played, the fractal’s chance
                  of receiving an averisve noise can be changed to 20% with a{" "}
                  its avoidance key press.
                  <br />
                  <br />
                  <strong>Note</strong>: If you fail, you will be taken back to
                  the beginning of the third part of the tutorial. If you are
                  ready, please click <strong>START</strong> to begin.
                  <br /> <br />
                  <span className={styles.center}>
                    <Button
                      id="right"
                      className="buttonInstructions"
                      onClick={this.tutorialThree}
                    >
                      <span className="bold">START</span>
                    </Button>
                  </span>
                </p>
              </div>
            );
          } else if (this.state.currentInstructionText === 4) {
            //If they pressed the attenCheck majority (50%) of the time,
            if (this.state.attenCheckKeySum / this.state.attenCheckAll > 0.5) {
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>
                        TUTORIAL: PART {this.state.tutorialSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Well done! You successfully pressed the <strong>
                      O
                    </strong>{" "}
                    key when the neutral tone was played.
                    <br />
                    <br />
                    We will now ask you three questions to test if you have
                    understood what to do when a neutral tone is played. If you
                    missed any important things, you will have to go through the
                    third part of the tutorial again. If you are ready, please
                    click <strong>START</strong> to begin.
                    <br /> <br />
                    <span className={styles.center}>
                      <Button
                        id="right"
                        className="buttonInstructions"
                        onClick={this.quizProceed}
                      >
                        <span className="bold">START</span>
                      </Button>
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
                        TUTORIAL: PART {this.state.tutorialSession} OF 3
                      </strong>
                    </span>
                    <br />
                    Unforunately, you missed pressing the <strong>
                      O key
                    </strong>{" "}
                    when the neutral tone was played more than 50% of the time!
                    <br /> <br />
                    Please click <strong>RESTART</strong> to try again.
                    <br /> <br />
                    <span className={styles.center}>
                      <Button
                        id="restart"
                        className="buttonInstructions"
                        onClick={this.tutorialRedo}
                      >
                        <span className="bold">RESTART</span>
                      </Button>
                    </span>
                  </p>
                </div>
              );
            }
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
        if (
          this.state.quizQnNum <=
          this.state.quizQnTotal[this.state.quizSession - 1]
        ) {
          if (this.state.quizSession === 1) {
            document.addEventListener("keydown", this._handleKeyDownQuizOne);
            text = <div> {this.quizOne(this.state.quizQnNum)}</div>;
          } else if (this.state.quizSession === 2) {
            document.addEventListener(
              "keydown",
              this._handleKeyDownQuizTwoAndThree
            );
            text = <div> {this.quizTwo(this.state.quizQnNum)}</div>;
          } else if (this.state.quizSession === 3) {
            document.addEventListener(
              "keydown",
              this._handleKeyDownQuizTwoAndThree
            );
            text = <div> {this.quizThree(this.state.quizQnNum)}</div>;
          }
        } else {
          //////////////////////////////////////////////////////////////////////////////////////////////
          // If finish questionnaire, stop listener and calculate quiz score
          if (this.state.quizSession === 1) {
            document.removeEventListener("keydown", this._handleKeyDownQuizOne);
          } else {
            document.removeEventListener(
              "keydown",
              this._handleKeyDownQuizTwoAndThree
            );
          }

          // If score pass
          if (
            this.state.quizScoreSum ===
            this.state.quizQnTotal[this.state.quizSession - 1]
          ) {
            //this.tutorialProceed();
            //  text = <div> {this.tutorialProceed()} </div>;
            // if it's the last quiz, move to the main task
            if (this.state.quizSession === 3) {
              setTimeout(
                function () {
                  this.taskProceed();
                }.bind(this),
                0
              );
              // setTimeout(this.taskProceed(), 0);
              console.log("TASK PROCEED");
            } else if (this.state.quizSession === 2) {
              setTimeout(
                function () {
                  this.tutorialProceedTwo();
                }.bind(this),
                0
              );
              // setTimeout(this.tutorialProceed(), 0);
              console.log("TUTORIAL PROCEED");
            } else if (this.state.quizSession === 1) {
              setTimeout(
                function () {
                  this.tutorialProceedOne();
                }.bind(this),
                0
              );
              // setTimeout(this.tutorialProceed(), 0);
              console.log("TUTORIAL PROCEED");
            }
          } else {
            // If score DOESNT pass, go back to begining of the tutorial section
            text = (
              <div className={styles.main}>
                <p>
                  <span className={styles.center}>
                    <strong>
                      TUTORIAL: PART {this.state.tutorialSession} OF 3
                    </strong>
                  </span>
                  <br />
                  You scored {this.state.quizScoreSum} out of{" "}
                  {this.state.quizQnTotal[this.state.quizSession - 1]} questions
                  correctly. Sorry, you will have to restart this section of the
                  tutorial. Click <strong>RESTART</strong> to try again.
                  <span className={styles.center}>
                    <Button
                      id="restart"
                      className="buttonInstructions"
                      onClick={this.tutorialRedo}
                    >
                      <span className="bold">RESTART</span>
                    </Button>
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
        document.addEventListener("keydown", this._handleResponseKey);
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
        console.log(text);
        console.log(this.state.currentScreen);
      }
    }

    return <div className="slideshow-container">{text}</div>;
  }
}

export default withRouter(TutorTask);
