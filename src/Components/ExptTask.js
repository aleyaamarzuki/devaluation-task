import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import AudioPlayerDOM from "./AudioPlayerDOM";

import fix from "./images/fixation.png";

import stim1 from "./images/fractal_1.jpg";
import stim2 from "./images/fractal_2.jpg";
import stim3 from "./images/fractal_3.jpg";
import stim4 from "./images/fractal_4.jpg";
import fb1 from "./images/fb_no.jpg";
import fb2 from "./images/fb_yes.jpg";

import attenSound from "./sounds/happy-blip.wav";
// import fbSound from "./sounds/player-hit.wav";
import fbSound from "./sounds/0276_2-2secs.wav";

import styles from "./style/taskStyle.module.css";

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
    rnd = Math.floor(Math.random() * arrLength);
    arrLength -= 1;
    for (argsIndex = 0; argsIndex < argsLength; argsIndex += 1) {
      tmp = arguments[argsIndex][arrLength];
      arguments[argsIndex][arrLength] = arguments[argsIndex][rnd];
      arguments[argsIndex][rnd] = tmp;
    }
  }
}

class ExptTask extends React.Component {
  constructor(props) {
    super(props);

    const userID = this.props.location.state.userID;

    //global trial var
    var totalTrial = 300;
    var stimNum = 4;
    var totalBlock = 6;
    var trialPerBlockNum = totalTrial / totalBlock;

    var stimCond = Array.from(Array(stimNum), (_, i) => i + 1); // [1,2,3]
    var stimIndexTemp = shuffle(
      Array(Math.round(totalTrial / stimNum))
        .fill(stimCond)
        .flat()
    ); //this is long [2,3,1,2,2] specifying stimulus seen on the trial

    var stimIndex = stimIndexTemp.map(function (value) {
      return value - 1;
    });

    var attenCheck = Math.round(0.3 * totalTrial); //30% of trials will have attention check
    //If i change the above percentage, also change below the restart paras
    var attenIndex = shuffle(
      Array(attenCheck)
        .fill(1)
        .concat(Array(totalTrial - attenCheck).fill(0))
    );

    var stim = [stim1, stim2, stim3, stim4];
    var fbProb = [0.9, 0.9, 0.2, 0.2];
    var stimCondTrack = stimCond;
    // this is to randomise fractals and their fb probs
    shuffleSame(stim, fbProb, stimCondTrack);

    this.state = {
      userID: userID,
      taskSessionTry: 1,
      totalTrial: totalTrial,
      trialPerBlockNum: trialPerBlockNum,
      devalueBlockOnward: 3,
      totalBlock: totalBlock,
      stimIndex: stimIndex,
      attenIndex: attenIndex,
      stimCondTrack: stimCondTrack,
      //this tracks the index for stim fbprob shuffling
      //in other words, for devalution, 1 high 1 low devalue, use index 0 and 2

      responseKey: 0,
      responseAvoid: 0,
      reactionTime: 0,

      timeLag: [1000, 1500, 2500],
      fbProb: fbProb,
      respProb: 0.2,

      trialNum: 0,
      trialinBlockNum: 0,
      blockNum: 1,

      fix: fix,
      stim: stim,
      fb: [fb1, fb2],

      fbSound: fbSound,
      attenSound: attenSound,
      showImage: fix,

      attenCheckKey: 0,
      attenCheckTime: 0,
      attenCheckAll: attenCheck, //this is how many atten trials there are
      attenCheckKeySum: 0, //this is calculated later
      attenCheckKeyAll: [],

      playAttCheck: false,
      playFbSound: false,
      playAtten: null,
      playFb: null,
      attenPass: true,
      devalue: false,

      currentScreen: true, // false for break, true for task
    };

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    this.renderFix = this.renderFix.bind(this);
    this.attenCount = this.attenCount.bind(this);
    this.blockProceed = this.blockProceed.bind(this);
    this.taskRestart = this.taskRestart.bind(this);
    this.devaluation = this.devaluation.bind(this);
  }

  renderFix() {
    //if trials are still ongoing
    var trialNum = this.state.trialNum + 1;
    var trialinBlockNum = this.state.trialinBlockNum + 1;

    this.setState({
      trialNum: trialNum,
      trialinBlockNum: trialinBlockNum,
      responseKey: 0,
      reactionTime: 0,
      attenCheckKey: 0,
      attenCheckTime: 0,
      responseAvoid: 0,
    });

    if (this.state.trialinBlockNum < this.state.trialPerBlockNum + 1) {
      //if total trial hasnt been reached, continue

      //if trial within the block hasn't been reached, continue
      if (this.state.trialinBlockNum < this.state.trialPerBlockNum + 1) {
        this.setState({ showImage: this.state.fix });

        this.refreshSound();

        console.log("Trial no: " + this.state.trialNum);
        console.log("Block Trial no: " + this.state.trialinBlockNum);

        // if it is the 20th or the 50th trial, do the attention Check
        if (this.state.trialNum === 20 || this.state.trialNum === 50) {
          // and they fail >50% of the attentionCheck
          if (this.state.attenCheckKeySum / this.state.attenCheckAll < 0.3) {
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
        //When it has reached the set number of trials for the block, go to
        // break
        this.setState({ currentScreen: false });
      }
    } else {
      //When it has reached the set number of trials, go to the end screen
      this.redirectToTarget();
    }
  }

  renderStim() {
    //if trials are still ongoing
    if (this.state.trialinBlockNum < this.state.trialPerBlockNum + 1) {
      document.addEventListener("keyup", this._handleResponseKey);
      document.addEventListener("keyup", this._handleAttenCheckKey);

      this.setState({
        showImage: this.state.stim[
          this.state.stimIndex[this.state.trialNum - 1]
        ],
      });

      // This is for the attentionCheck trials
      if (this.state.attenIndex[this.state.trialNum - 1] === 1) {
        this.setState({ playAttCheck: true });
      } else {
        this.setState({ playAttCheck: false });
      }

      this.playAttenSound();

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

    if (this.state.trialinBlockNum < this.state.trialPerBlockNum + 1) {
      //if trials are still ongoing
      var randProb = Math.random();
      if (
        this.state.attenIndex[this.state.trialNum - 1] === 0 &&
        this.state.responseAvoid === 1
      ) {
        // If participant chooses  to avoid on a non-attention trial
        // Then it's 20% chance of aversive sound feedback
        if (randProb < this.state.respProb) {
          this.setState({
            showImage: this.state.fb[0],
            playFbSound: true,
          });
        } else {
          this.setState({
            showImage: this.state.fb[1],
            playFbSound: false,
          });
        }
      } else {
        // If participant chooses NOT to avoid or fails to avoid
        // If it's stim 1
        if (this.state.stimIndex[this.state.trialNum - 1] === 0) {
          if (randProb < this.state.fbProb[0]) {
            this.setState({
              showImage: this.state.fb[0],
              playFbSound: true,
            });
          } else {
            this.setState({
              showImage: this.state.fb[1],
              playFbSound: false,
            });
          }
        } else if (this.state.stimIndex[this.state.trialNum - 1] === 1) {
          if (randProb < this.state.fbProb[1]) {
            this.setState({
              showImage: this.state.fb[0],
              playFbSound: true,
            });
          } else {
            this.setState({
              showImage: this.state.fb[1],
              playFbSound: false,
            });
          }
        } else if (this.state.stimIndex[this.state.trialNum - 1] === 2) {
          if (randProb < this.state.fbProb[2]) {
            this.setState({
              showImage: this.state.fb[0],
              playFbSound: true,
            });
          } else {
            this.setState({
              showImage: this.state.fb[1],
              playFbSound: false,
            });
          }
        } else if (this.state.stimIndex[this.state.trialNum - 1] === 3) {
          if (randProb < this.state.fbProb[3]) {
            this.setState({
              showImage: this.state.fb[0],
              playFbSound: true,
            });
          } else {
            this.setState({
              showImage: this.state.fb[1],
              playFbSound: false,
            });
          }
        } else {
          console.log("More than 4 stimuli?");
        }
      }

      this.playFbSound();
      this.attenCount();
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
      attenCheckKeySum = attenCheckKeySum;
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
  // KEY RESPONSE FUNCTIONS
  pressAvoid(key_pressed, time_pressed) {
    //Check first whether it is a valid press
    var stimIndex = this.state.stimIndex[this.state.trialNum - 1];

    if (
      (stimIndex === 0 && key_pressed === 1) ||
      (stimIndex === 1 && key_pressed === 2) ||
      (stimIndex === 2 && key_pressed === 1) ||
      (stimIndex === 4 && key_pressed === 2)
    ) {
      var responseAvoid = 1;
    } else {
      var responseAvoid = 0;
    }

    this.setState({
      responseKey: key_pressed,
      responseAvoid: responseAvoid,
      reactionTime: time_pressed,
    });
  }

  pressAttenCheck(atten_pressed, atten_time_pressed) {
    this.setState({
      attenCheckKey: atten_pressed,
      attenCheckTime: atten_time_pressed,
    });
  }

  // handle key key_pressed
  _handleResponseKey = (event) => {
    var key_pressed;
    var key_time_pressed;

    switch (event.keyCode) {
      // case 32:
      //   key_pressed = 1;
      //   key_time_pressed = Math.round(performance.now());
      //   this.pressAvoid(key_pressed, key_time_pressed);
      case 87:
        //this is W
        key_pressed = 1;
        key_time_pressed = Math.round(performance.now());
        this.pressAvoid(key_pressed, key_time_pressed);
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

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Set states for block sections
  blockProceed() {
    var blockNum = this.state.blockNum + 1;

    //if its the third block, devalue the options
    if (blockNum === this.state.devalueBlockOnward) {
      this.devaluation();
    }

    this.setState({
      currentScreen: true,
      blockNum: blockNum,
      trialinBlockNum: 0,
    });
    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  devaluation() {
    var stimCondTrack = this.state.stimCondTrack;

    //devlaue one high and one low probs devalue the 1 and 3 option
    var indexHighProb = stimCondTrack.indexOf(1);
    var indexLowProb = stimCondTrack.indexOf(3);

    var fbProb = this.state.fbProb;
    fbProb[indexHighProb] = 0;
    fbProb[indexLowProb] = 0;

    this.setState({
      fbProb: fbProb,
    });
  }

  //Restart the entire task (when fail attentioncheck)
  taskRestart() {
    // Reset task parameters
    var stimNum = 4;
    var stimCond = Array.from(Array(stimNum), (_, i) => i + 1); // [1,2,3]
    var taskSessionTry = this.state.taskSessionTry + 1;

    var stimIndexTemp = shuffle(
      Array(Math.round(this.state.totalTrial / stimNum))
        .fill(stimCond)
        .flat()
    ); //this is long [2,3,1,2,2] specifying stimulus seen on the trial

    var stimIndex = stimIndexTemp.map(function (value) {
      return value - 1;
    });

    var attenCheck = Math.round(0.3 * this.state.totalTrial); //30% of trials will have attention check
    var attenIndex = shuffle(
      Array(attenCheck)
        .fill(1)
        .concat(Array(this.state.totalTrial - attenCheck).fill(0))
    );

    var stim = this.state.stim;
    var fbProb = this.state.fbProb;
    shuffleSame(stim, fbProb); //randomise stim and fb probs

    this.setState({
      stimIndex: stimIndex,
      attenIndex: attenIndex,
      taskSessionTry: taskSessionTry,

      stim: stim,
      fbProb: fbProb,

      responseKey: [],
      reactionTime: [],
      trialNum: 0,
      trialinBlockNum: 0,
      blockNum: 1,

      attenCheckKey: 0,
      attenCheckTime: 0,
      attenCheckAll: attenCheck, //this is how many atten trials there are
      attenCheckKeySum: 0, //this is calculated later
      attenCheckKeyAll: [],

      playAttCheck: false,
      playFbSound: false,
      playAtten: null,
      playFb: null,
      attenPass: true,
      currentScreen: true,
      devalue: false,
    });
    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Misc functions
  saveData() {
    var userID = this.state.userID;
    var currentDate = new Date();
    var trialTime = currentDate.toTimeString();

    let behaviour = {
      userID: this.state.userID,
      trialTime: trialTime,
      taskSessionTry: this.state.taskSessionTry,
      trialNum: this.state.trialNum,
      blockNum: this.state.blockNum,
      trialinBlockNum: this.state.trialinBlockNum,

      stimIndex: this.state.stimIndex[this.state.trialNum - 1],
      attenIndex: this.state.attenIndex[this.state.trialNum - 1],
      stimCondTrack: this.state.stimCondTrack,

      responseKey: this.state.responseKey,
      reactionTime: this.state.reactionTime,
      attenCheckKey: this.state.attenCheckKey,
      attenCheckTime: this.state.attenCheckTime,
    };

    // fetch(`${API_URL}/expt/` + userID, {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(behaviour),
    // });
  }

  redirectToTarget() {
    this.props.history.push({
      pathname: `/EndPage`,
      state: {
        userID: this.state.userID,
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

    if (this.state.currentScreen === false) {
      //if the attention check is all OK
      if (this.state.attenPass === false) {
        text = (
          <div className={styles.main}>
            <p>
              You have failed to press the <strong>O key</strong> too often when
              the neutral tone is played! Please restart the task from the
              begining.
              <br /> <br />
              Remember: <br />
              1) Pressing the <strong>avoidance key (W or E key)</strong> leads
              to 20% of receiving the aversive sound for its linked fractal.
              <br />
              2) Press the <strong>O</strong> key when a neutral tone is played.
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
        //if current screen is false, but attention is ok, then it is the break time
        // if the devaluation block starts from next
        if (this.state.blockNum === this.state.devalueBlockOnward - 1) {
          text = (
            <div className={styles.main}>
              <p>
                You have completed {this.state.blockNum} out of{" "}
                {this.state.totalBlock} blocks!
                <br /> <br />
                For the rest of the experiment, <strong>two</strong> of the
                fractals will have <strong>0%</strong>
                chance of receiving an aversive sound, while the other two will
                remain the same. You will have to re-learn which fractals are
                good or bad and make your choices accordingly.
                <br /> <br />
                You can take a short break before proceeding to the next block
                when you are ready by clicking <strong>START</strong> below.
                <br /> <br />
                Remember: <br />
                1) Pressing the <strong>avoidance key (W or E key)</strong>{" "}
                leads to 20% of receiving the aversive sound for its linked
                fractal.
                <br />
                2) Press the <strong>O</strong> key when a neutral tone is
                played.
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
        } else {
          text = (
            <div className={styles.main}>
              <p>
                You have completed {this.state.blockNum} out of{" "}
                {this.state.totalBlock} blocks!
                <br /> <br />
                You can take a short break and proceed to the next block when
                you are ready by clicking <strong>START</strong> below.
                <br /> <br />
                Remember: <br />
                1) Pressing the <strong>avoidance key (W or E key)</strong>{" "}
                leads to 20% of receiving the aversive sound for its linked
                fractal.
                <br />
                2) Press the <strong>O</strong> key when a neutral tone is
                played.
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
