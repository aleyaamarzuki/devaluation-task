import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import stimTrain1 from "./images/fractalTrain_1.jpg";
import stimTrain2 from "./images/fractalTrain_2.jpg";

import "./button.css";

class Instruct extends React.Component {
  constructor(props) {
    super(props);

    const participant_info = this.props.location.state.participant_info;

    this.state = {
      participant_info: participant_info,
      currentInstructionText: 1,
      trainingComplete: false, // this is the practice
      readyToProceed: false, // this is for the transition between the instructions screens without changing the block number
    };

    this.handleInstructionsLocal = this.handleInstructionsLocal.bind(this);
  }

  handleInstructionsLocal(event) {
    var curText = this.state.currentInstructionText;
    var whichButton = event.currentTarget.id;

    if (whichButton === "left" && curText > 1) {
      this.setState({ currentInstructionText: curText - 1 });
    } else if (whichButton === "right" && curText < 3) {
      this.setState({ currentInstructionText: curText + 1 });
    }

    if (whichButton === "right" && curText === 3) {
      this.setState({ readyToProceed: true });
    }
  }

  redirectToTarget() {
    this.props.history.push({
      pathname: `/ExptTask`,
      state: {
        participant_info: this.state.participant_info,
      },
    });
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    let text;

    if (this.state.currentInstructionText === 1) {
      text = (
        <div className="textbox">
          <p>
            Welcome to the experiment!
            <br />
            <br />
            Today you will be playing a learning task. There are two things for
            you to learn in order to do well. We will practice these separately.
            <br />
            <br />
            The first is: You will be shown fractal images like this:
            <br />
            <br />
            <img src={stimTrain1} alt="stim images" width="100" height="auto" />
            &nbsp; &nbsp; &nbsp;
            <img src={stimTrain2} alt="stim images" width="100" height="auto" />
            <br />
            <br />
            Each of these images have a certain probability of resulting in an
            aversive sound. What you need to do is to learn which fractal(s) are
            bad. We will let you see for yourself how this works. You will
            notice that while some of these fractals result in a aversive sound
            very often, it will not be for every single time.
          </p>
        </div>
      );
    } else if (this.state.currentInstructionText === 2) {
      text = (
        <div className="textbox">
          <p>
            You have two options of response:
            <br />
            <br />
            1) You can choose NOT to do anything, and experience the aversive
            probability linked to the image.
            <br />
            <br />
            Alternatively:
            <br />
            <br />
            2) You can choose to press the <strong>SPACEBAR</strong>, which
            allows you to avoid the aversive probability linked to the image. In
            this case, pressing the <strong>SPACEBAR</strong> will result in a
            20% chance of receiving the aversive sound.
          </p>
        </div>
      );
    } else if (this.state.currentInstructionText === 3) {
      text = (
        <div className="textbox">
          <p>
            The aim of the task is to avoid hearing the aversive noises as much
            as possible. As such, you will need to learn the aversive
            probability linked to the images and decide which images would
            warrant a response of the <strong>SPACEBAR</strong>.
          </p>
        </div>
      );
    } else {
      text = (
        <div className="textbox">
          <p>ERROR</p>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <center>
          <div>{text}</div>
          <div className="instructionsButtonContainer">
            {this.state.currentInstructionText === 3 ? (
              <div>
                {" "}
                <Button
                  id="left"
                  className="buttonInstructions"
                  onClick={this.handleInstructionsLocal}
                >
                  <span className="bold">BACK</span>
                </Button>{" "}
                <Button
                  id="start"
                  className="buttonInstructionsBlock"
                  onClick={() => this.redirectToTarget()}
                >
                  START
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  id="left"
                  className="buttonInstructions"
                  onClick={this.handleInstructionsLocal}
                >
                  <span className="bold">BACK</span>
                </Button>
                <Button
                  id="right"
                  className="buttonInstructions"
                  onClick={this.handleInstructionsLocal}
                >
                  <span className="bold">CONT</span>
                </Button>{" "}
              </div>
            )}
          </div>
        </center>
      </div>
    );
  }
}
export default withRouter(Instruct);
