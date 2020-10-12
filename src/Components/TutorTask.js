import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import AudioPlayerDOM from "./AudioPlayerDOM";

import fix from "./images/fixation-white.png";
import stimTrain1 from "./images/yellow_planet.png";
import stimTrain2 from "./images/army_planet.png";
import fbAver from "./images/bad.png";
import fbSafe from "./images/good.png";
import fbAvoid from "./images/neutral.png";
import astrodude from "./images/astronaut.png";

import attenSound from "./sounds/800hz_sinetone_05amp_5000.wav";
import fbSound from "./sounds/Bacigalupo_whitenoise_1500.wav";
import avoidSound from "./sounds/browniannoise_08amp_1500.wav";

import styles from "./style/taskStyle.module.css";

import PlayButton from "./PlayButton";

import { DATABASE_URL } from "./config";

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
    var totalTrialTut1 = 6;
    var totalTrialTut2 = 6;
    var totalTrialTut3 = 10;
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

    var stim = [stimTrain1, stimTrain2];
    var fbProb = [0.1, 0.9];
    // this is to randomise fractals and their fb probs
    shuffleSame(stim, fbProb);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      userID: userID,
      fileID: fileID,
      date: dateString,
      UserStartTime: timeString,

      totalTrialLog: [totalTrialTut1, totalTrialTut2, totalTrialTut3],
      stimIndexLog: [stimIndexTut1, stimIndexTut2, stimIndexTut3],

      attenIndexLog: [attenIndex1, attenIndex2, attenIndex3],
      attenCheckAllLog: [attenCheckTut1, attenCheckTut2, attenCheckTut3],

      quizAns2: 2,
      quizAns3: [3, 3, 1],
      quizQnTotal: [0, 1, 3],

      attenIndex: [],
      timeLag: [1000, 1500, 1500],
      fbProb: fbProb,
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
      debugTask: false,
      volume: 100,
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    console.log("Atten Indx: " + this.state.attenIndex);
    console.log("Tutorial Session: " + this.state.tutorialSession);

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
    }
  }

  // togglePlay() {
  //   this.setState({ active: !this.state.active }, () => {
  //     this.state.active ? this.audioAtten.play() : this.audioAtten.pause();
  //   });
  // }

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
      } else if (this.state.currentInstructionText === 3) {
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
              this.tutorialProceedTwo();
            }.bind(this),
            0
          );
        }
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
  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////

  // RENDER ATTENTION TONE, THIS IS CALLED DURING FIXATION OF SOME TRIALS, IF ATTENINDEX = 1
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

    setTimeout(
      function () {
        this.saveAttenData();
      }.bind(this),
      5
    );
  }

  // SAVE ATTEN RELATED DATA
  saveAttenData() {
    var fileID = this.state.fileID;

    let attenBehaviour = {
      userID: this.state.userID,
      tutorialSession: this.state.tutorialSession,
      tutorialSessionTry: this.state.tutorialSessionTry,
      taskSession: null,
      taskSessionTry: null,
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

      console.log(this.state.trialNum);
      console.log(this.state.totalTrial);
      console.log("Stim Indx: " + this.state.stimIndex);

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

        console.log("Trial no: " + this.state.trialNum);

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
      console.log("Fixation NOT RENDERED as currentScreen is false");
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStim() {
    //if trials are still ongoing
    if (this.state.tutorialSession > 1) {
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
        setTimeout(this.saveData(), 50);

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
          randProb: randProb,
        });
      } else {
        // for every other thing,
        // If participant chooses NOT to avoid
        if (
          randProb <
          this.state.fbProb[this.state.stimIndex[this.state.trialNum - 1]]
        ) {
          //if mathrandom is less than 0.1, then play aversive sound
          this.setState(
            {
              showImage: this.state.fb[0],
              playFbSound: true,
              playFb: this.state.fbSound,
              randProb: randProb,
            },
            () =>
              console.log(
                "Stim1 Prob: " +
                  randProb +
                  "Fb Prob 0: " +
                  this.state.fbProb[
                    this.state.stimIndex[this.state.trialNum - 1]
                  ]
              )
          );
        } else {
          this.setState(
            {
              showImage: this.state.fb[1],
              playFbSound: false,
              playFb: null,
              randProb: randProb,
            },
            () =>
              console.log(
                "Stim1 Prob: " +
                  randProb +
                  "Fb Prob 0: " +
                  this.state.fbProb[
                    this.state.stimIndex[this.state.trialNum - 1]
                  ]
              )
          );
        }
      }

      console.log("Resp: " + this.state.responseKey);
      console.log("Fb Play: " + this.state.playFbSound);

      setTimeout(this.saveData(), this.state.timeLag[2] - 5);

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
    var reactionTime = time_pressed - this.state.stimTime;

    this.setState(
      {
        responseKey: key_pressed,
        imageBorder: true,
        reactionTime: reactionTime,
      },
      () =>
        console.log(
          "responseKey: " +
            this.state.responseKey +
            " reactionTime: " +
            time_pressed +
            " imageBorder: " +
            this.state.imageBorder
        )
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

  pressAttenCheck(atten_pressed, atten_time_pressed) {
    var attenCheckTime = atten_time_pressed - this.state.attenTime;
    this.audioAtten.pause();

    this.setState({
      attenCheckKey: atten_pressed,
      attenCheckTime: attenCheckTime,
      playAttCheck: false, //stop
    });
    console.log("PRESS ATTEN CHECK KEY");
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
    console.log("PRESSED:" + event.keyCode);

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
  }

  // Second tutorial sess
  tutorialTwo() {
    this.setState({
      currentScreen: true, //set for the task instead of instructionScreen
      quizScreen: false,
      trialNum: 0,
      totalTrial: this.state.totalTrialLog[1],
      stimIndex: this.state.stimIndexLog[1],
      attenIndex: this.state.attenIndexLog[1],
      attenCheckAll: this.state.attenCheckAllLog[1],

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
  tutorialThree() {
    this.setState({
      currentScreen: true, //set for the task instead of instructionScreen
      quizScreen: false,
      trialNum: 0,
      totalTrial: this.state.totalTrialLog[2],
      stimIndex: this.state.stimIndexLog[2],
      attenIndex: this.state.attenIndexLog[2],
      attenCheckAll: this.state.attenCheckAllLog[2],

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
          Which planet was dangerous and had a higher chance of interfering with
          our system?
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
          <strong>Q{this.state.quizQnNum}:</strong> The planets...
          <br />
          <br />
          <strong>1</strong> - are equally safe, having the same chance of
          interference each, <br />
          which does not change across time.
          <br />
          <strong>2</strong> - are equally dangerous, having the same chance of
          interference each, <br />
          which can change across time.
          <br />
          <strong>3</strong> - can be either safe or dangerous, having a certain
          chance of interference each, <br />
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
          <strong>1</strong> - I will receive no interference and a good green
          smiley is presented.
          <br />
          <strong>2</strong> - I will receive interference sound and a bad red
          smiley is presented.
          <br />
          <strong>3</strong> - I will receive a less damaging interference sound
          and a neutral yellow smiley is presented.
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
          overheating warning tone plays?
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

    this.saveQuizData();
  }

  quizNext() {
    var quizQnNum = this.state.quizQnNum + 1;
    var quizTime = Math.round(performance.now());
    this.setState({ quizQnNum: quizQnNum, quizTime: quizTime });
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

  saveData() {
    var fileID = this.state.fileID;
    var fbTime =
      Math.round(performance.now()) -
      (this.state.trialTime + this.state.stimTime) +
      5;

    let tutBehaviour = {
      userID: this.state.userID,
      tutorialSession: this.state.tutorialSession,
      tutorialSessionTry: this.state.tutorialSessionTry,

      trialNum: this.state.trialNum,
      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      attenIndex: this.state.attenIndex[this.state.trialNum - 1],
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,

      stimTime: this.state.stimTime,
      stimIndex: this.state.stimIndex[this.state.trialNum - 1],
      fbProbTrack: this.state.fbProbTrack,
      randProb: this.state.randProb,
      responseKey: this.state.responseKey,
      reactionTime: this.state.reactionTime,
      // responseAvoid: this.state.responseAvoid,
      playFbSound: this.state.playFbSound,
      fbTime: fbTime,
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
  }

  redirectToTarget() {
    this.props.history.push({
      pathname: `/ExptTask`,
      state: {
        userID: this.state.userID,
        fileID: this.state.fileID,
        volume: this.state.volume,
      },
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
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    this.audioAtten.removeEventListener("ended", () =>
      this.setState({ active: false })
    );
    this.audioFb.removeEventListener("ended", () =>
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
                  Please use the left and right arrow keys to navigate the
                  pages.
                  <br />
                  <br />
                  <span className={styles.astro}>
                    <img src={astrodude} />
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
                  Sometimes, our nagivation system overheats and a warning tone
                  will be played. <br />
                  <br />
                  Click the play button below to hear how it sounds like.
                  <br />
                  <br />
                  <span className={styles.center}>
                    <PlayButton
                      audio={this.state.attenSound}
                      play={this.togglePlay}
                      stop={this.togglePlay}
                      volume={this.state.volume}
                      {...this.state}
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
                  Your aim is to listen for the warning tone.
                  <br /> <br />
                  When you hear it, press the <strong>W</strong> key as quickly
                  as possible to cool our system down. <br />
                  This will stop the tone.
                  <br /> <br />
                  <strong>Note</strong>: If you fail to catch the warning tone
                  in time, the system will overheat! <br />
                  You will have to restart your training.
                  <br /> <br />
                  <span className={styles.centerTwo}>
                    Please press the <strong>SPACEBAR</strong> to begin.
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
                    Well done! You successfully caught the warning tone in time!
                    <br /> <br />
                    Our system was kept cool and safe.
                    <br /> <br />
                    As we nagivate the galaxy, the system will heat up <br />
                    and this warning tone will <strong>sometimes</strong> play.
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
                    Unforunately, you missed the warning tone and our system
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
                  The second thing to learn is that planets we fly past emit
                  radiation, and
                  <br />
                  each of them has a certain chance of interfering with our
                  nagivation system. <br />
                  <br />
                  This chance of interference for each planet will not change
                  across time,
                  <br />
                  i.e. stay the same throughout the journey.
                  <br />
                  <br />
                  If you are safe, a good green smiley will appear.
                  <br />
                  However if you are affected, you will receive an interference
                  sound <br />
                  and a sad red smiley will appear.
                  <br /> <br />
                  Click the play button below to hear how the interference
                  sounds like.
                  <br /> <br />
                  <span className={styles.center}>
                    <PlayButton
                      audio={this.state.fbSound}
                      play={this.togglePlay}
                      stop={this.togglePlay}
                      volume={this.state.volume}
                      {...this.state}
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
                  Dangerous planets will interfere with our system{" "}
                  <strong>more often</strong>, while
                  <br />
                  harmless planets will interfere with our system{" "}
                  <strong>less often</strong>.<br />
                  <br />
                  For the second part of your training, you will have to take
                  note <br />
                  which planet(s) are dangerous or harmless for our nagivation
                  system.
                  <br />
                  <br />
                  We will ask you for your answer at the end of this part.
                  <br /> <br />
                  Our system will also heat up as we fly, so remember to cool
                  the system down with <br />
                  the <strong>W</strong> key when the warning tone plays!
                  <br /> <br />
                  <strong>Note</strong>: If you fail, you will have to re-do
                  this training again.
                  <br /> <br />{" "}
                  <span className={styles.centerTwo}>
                    Please press <strong>SPACEBAR</strong> if you are ready to
                    begin.
                  </span>{" "}
                  <br />
                  <span className={styles.centerTwo}>
                    [← <strong>BACK</strong>]
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
                  This will remain the same as we navigate the galaxy.
                  <br /> <br />
                  In the third and last part of your training, we can activate a
                  magnetic shield with <br />
                  the <strong>SPACEBAR</strong> key to protect our system from
                  the radiation the planets emit.
                  <br /> <br />
                  However, this comes at a cost - power will be needed to
                  activate the shield.
                  <br />
                  This will interrupt our system <strong>slightly</strong> and a
                  neutral yellow smiely will be shown. <br /> <br />
                  Click the black button below to hear how this slight
                  interruption sounds like.
                  <br /> <br />
                  <span className={styles.center}>
                    <PlayButton
                      audio={this.state.avoidSound}
                      play={this.togglePlay}
                      stop={this.togglePlay}
                      volume={this.state.volume}
                      {...this.state}
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
                  is necessary for each of the planets we fly past.
                  <br />
                  <br />
                  For instance, you <strong>SHOULD</strong> activate the shield
                  when we approach dangerous planets.
                  <br />
                  <br />
                  On the other hand, you <strong>SHOULD NOT</strong> activate
                  the shield when we approach safer planets,
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
                  You will have to use your knowledge of which planets are
                  dangerous or not
                  <br />
                  and to activate the shield with <strong>SPACEBAR</strong> key
                  if you wish.
                  <br /> <br />
                  Remember, if the warning tone plays, cool the system with the{" "}
                  <strong>W</strong> key!
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
                    begin.
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
                    understood how to navigate this spaceship properly.
                    <br /> <br />
                    If you missed any important things, you will have to re-do
                    the last training again.
                    <br /> <br />
                    <span className={styles.centerTwo}>
                      If you are ready, please press the{" "}
                      <strong>SPACEBAR</strong> to begin.
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
                    Unforunately, you missed the warning tone and our system
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
          }
        } else {
          //No more quiz questions, then......
          // If score pass
          if (
            this.state.quizScoreSum ===
            this.state.quizQnTotal[this.state.quizSession - 1]
          ) {
            // if it's the last quiz, move to the main task
            if (this.state.quizSession === 3) {
              document.removeEventListener(
                "keydown",
                this._handleKeyDownQuizThree
              );
              setTimeout(
                function () {
                  this.redirectToTarget();
                }.bind(this),
                0
              );
              console.log("TASK PROCEED");
            } else if (this.state.quizSession === 2) {
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
            }
          } else {
            // If score DOESNT pass, go back to begining of the tutorial section
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
                  tutorial. Click <strong>RESTART</strong> to try again.
                  <span className={styles.center}>
                    <Button
                      id="restart"
                      className={styles.clc}
                      onClick={this.tutorialRedo.bind(this)}
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
            <AudioPlayerDOM src={this.state.playFb} />
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
