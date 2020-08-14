import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import AudioPlayerDOM from "./AudioPlayerDOM";

import fix from "./images/fixation.png";

import stim1 from "./images/fractal_1.jpg";
import stim2 from "./images/fractal_2.jpg";
import stim3 from "./images/fractal_3.jpg";
import fb1 from "./images/fb_no.jpg";
import fb2 from "./images/fb_yes.jpg";

import attenSound from "./sounds/happy-blip.wav";
import fbSound from "./sounds/player-hit.wav";

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

class ExptTask extends React.Component {
  constructor(props) {
    super(props);

    const participant_info = this.props.location.state.participant_info;

    //global trial var
    var totalTrial = 9;
    var stimNum = 3;

    var stimCond = Array.from(Array(3), (_, i) => i + 1); // [1,2,3]
    var stimIndex = shuffle(
      Array(Math.round(totalTrial / stimNum))
        .fill(stimCond)
        .flat()
    ); //this is long [2,3,1,2,2] specifying stimulus seen on the trial

    var attenCheck = Math.round(0.3 * totalTrial); //30% of trials will have attention check
    var attenIndex = shuffle(
      Array(attenCheck)
        .fill(1)
        .concat(Array(totalTrial - attenCheck).fill(0))
    );

    this.state = {
      participant_info: participant_info,
      stimuli: [],
      totalTrial: totalTrial,
      stimIndex: stimIndex,
      attenIndex: attenIndex,
      responseKey: [],
      reactionTime: [],
      timeLag: [2000, 1500, 1000],
      trialNum: 0,
      currentImage: 1,
      fbProb: [0.9, 0.9, 0.9],
      respProb: 0.2,
      fix: fix,
      stim: [stim1, stim2, stim3],
      fb: [fb1, fb2],
      fbSound: fbSound,
      attenSound: attenSound,
      showImage: fix,
      playAttCheck: false,
      playFbSound: false,
      playAtten: false,
      playFb: false,
    };

    console.log("Atten Indx: " + this.state.attenIndex);
    console.log("Stim Indx: " + this.state.stimIndex);
    console.log("Total Trial: " + this.state.totalTrial);

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    this.renderFix = this.renderFix.bind(this);
  }

  renderFix() {
    //if trials are still ongoing
    var trialNum = this.state.trialNum + 1;
    this.setState({ trialNum: trialNum, reponseKey: 0 });

    if (this.state.trialNum < this.state.totalTrial + 1) {
      this.setState({ showImage: this.state.fix });

      this.refreshSound();

      console.log("Trial no: " + this.state.trialNum);

      setTimeout(
        function () {
          this.renderStim();
        }.bind(this),
        this.state.timeLag[0]
      );
    } else {
      this.redirectToTarget();
    }
  }

  renderStim() {
    //if trials are still ongoing
    if (this.state.trialNum < this.state.totalTrial + 1) {
      document.addEventListener("keyup", this._handleResponseKey);
      this.setState({
        showImage: this.state.stim[
          this.state.stimIndex[this.state.trialNum - 1] - 1
        ],
      });

      // This is for the attentionCheck trials
      if (this.state.attenIndex[this.state.trialNum - 1] === 1) {
        this.setState({ playAttCheck: true });
      } else {
        this.setState({ playAttCheck: false });
      }
      console.log("Atten Idx: " + this.state.attenIndex[this.state.trialNum]);
      console.log("Atten Play: " + this.state.playAttCheck);

      this.playAttenSound();

      console.log("Stim Idx: " + this.state.stimIndex[this.state.trialNum - 1]);

      setTimeout(
        function () {
          this.renderFb();
        }.bind(this),
        this.state.timeLag[1]
      );
    } else {
      this.redirectToTarget();
    }
  }

  renderFb() {
    document.removeEventListener("keyup", this._handleResponseKey);

    if (this.state.trialNum < this.state.totalTrial + 1) {
      //if trials are still ongoing

      if (this.state.responseKey === 1) {
        // If participant chooses  to avoid
        // Then it's 20% chance of aversive sound feedback
        if (Math.random() < this.state.respProb) {
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
        // If participant chooses NOT to avoid
        // If it's stim 1
        if (this.state.stimIndex[this.state.trialNum - 1] === 1) {
          if (Math.random() < this.state.fbProb[1]) {
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
          if (Math.random() < this.state.fbProb[2]) {
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
          if (Math.random() < this.state.fbProb[3]) {
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
          console.log("More than 3 stimuli?");
        }
      }

      console.log("Resp: " + this.state.responseKey);
      console.log("Fb Play: " + this.state.playFbSound);

      this.playFbSound();

      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        this.state.timeLag[2]
      );
    } else {
      this.redirectToTarget();
    }
  }

  playAttenSound() {
    if (this.state.playAttCheck) {
      this.setState({
        playAtten: this.state.attenSound,
      });
    } else {
      this.setState({
        playAtten: false,
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
        playFb: false,
      });
    }
  }

  refreshSound() {
    this.setState({
      playAtten: false,
      playFb: false,
    });
  }

  pressAvoid(key_pressed, time_pressed) {
    var reaction_times = time_pressed;
    // If participant chooses to avoid

    this.setState({
      responseKey: key_pressed,
      reactionTime: reaction_times,
    });
  }

  // handle key key_pressed
  _handleResponseKey = (event) => {
    var key_pressed;
    var time_pressed;

    switch (event.keyCode) {
      case 32:
        key_pressed = 1;
        time_pressed = Math.round(performance.now());
        this.pressAvoid(key_pressed, time_pressed);
        break;
      default:
    }
  };

  redirectToTarget() {
    this.props.history.push({
      pathname: `/EndPage`,
      state: {
        participant_info: this.state.participant_info,
      },
    });
  }

  componentDidMount() {
    this.renderFix();
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="slideshow-container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <img
            src={this.state.showImage}
            alt="stim images"
            width="150"
            height="auto"
          />
          <AudioPlayerDOM src={this.state.playAtten} />
          <AudioPlayerDOM src={this.state.playFb} />
        </div>
      </div>
    );
  }
}

export default withRouter(ExptTask);
