import React from "react";
import { withRouter } from "react-router-dom";

import styles from "./style/taskStyle.module.css";
import astrodude from "./images/astronaut.png";

import stim1 from "./images/blue_planet.png";
import stim2 from "./images/light_green_planet.png";
import stim3 from "./images/pink_planet.png";
import stim4 from "./images/red_planet.png";

// functions
function reorder(continArray, stimArray) {
  var index1 = stimArray.indexOf(1);
  var index2 = stimArray.indexOf(2);
  var index3 = stimArray.indexOf(3);
  var index4 = stimArray.indexOf(4);

  var newarray = [
    continArray[index1],
    continArray[index2],
    continArray[index3],
    continArray[index4],
  ];

  return newarray;
}

// limit between 0 and 100
function limitMinMax(array) {
  var index = array.length;
  var i = 0;
  var tmp1, tmp2;
  var newarray = [];

  while (i < index) {
    tmp1 = array[i];
    tmp2 = Math.max(0, tmp1);
    tmp2 = Math.min(100, tmp2);
    newarray[i] = tmp2;
    i++;
  }

  return newarray;
}

// this is to calucate bonus
function bonusCal(
  array,
  limit1Min,
  limit1Max,
  limit2Min,
  limit2Max,
  limit3Min,
  limit3Max
) {
  var stimNum = 4;
  var i = 0;
  var bonus;
  var newarray = [];
  while (i < stimNum) {
    if (array[i] >= limit1Min[i] && array[i] <= limit1Max[i]) {
      bonus = 0.2;
    } else if (array[i] >= limit2Min[i] && array[i] <= limit2Max[i]) {
      bonus = 0.1;
    } else if (array[i] >= limit3Min[i] && array[i] <= limit3Max[i]) {
      bonus = 0.05;
    } else {
      bonus = 0;
    }

    newarray[i] = bonus;

    i++;
  }
}

// This is also where we calculate the bonus

class EndPage extends React.Component {
  constructor(props) {
    super(props);

    const userID = this.props.location.state.userID;
    const date = this.props.location.state.date;
    const startTime = this.props.location.state.startTime;
    const journeyOneContin = this.props.location.state.journeyOneContin;
    const journeyOneContinStim = this.props.location.state.journeyOneContinStim;
    const journeyOneContinFbProb = this.props.location.state
      .journeyOneContinFbProb;
    const journeyTwoContin = this.props.location.state.journeyTwoContin;
    const journeyTwoContinStim = this.props.location.state.journeyTwoContinStim;
    const journeyTwoContinFbProb = this.props.location.state
      .journeyTwoContinFbProb;
    const journeyThreeContin = this.props.location.state.journeyThreeContin;
    const journeyThreeContinStim = this.props.location.state
      .journeyThreeContinStim;
    const journeyThreeContinFbProb = this.props.location.state
      .journeyThreeContinFbProb;

    // change the fbProb to be more like the contingency ratings
    var actualContin1 = journeyOneContinFbProb.map(function (value) {
      return value * 100;
    });

    var actualContin2 = journeyTwoContinFbProb.map(function (value) {
      return value * 100;
    });

    var actualContin3 = journeyThreeContinFbProb.map(function (value) {
      return value * 100;
    });

    // reorder the contingencies and fbProb to stim1, stim2, stim3, stim4
    var j1Contin = reorder(journeyOneContin, journeyOneContinStim);
    var j1Fb = reorder(actualContin1, journeyOneContinStim);

    var j2Contin = reorder(journeyTwoContin, journeyTwoContinStim);
    var j2Fb = reorder(actualContin2, journeyTwoContinStim);

    var j3Contin = reorder(journeyThreeContin, journeyThreeContinStim);
    var j3Fb = reorder(actualContin3, journeyThreeContinStim);

    // 3 quizes, 4 items each = 12 times to earn... max bonus is 2.4 dollars?
    // each quiz is worth if
    //+- 0.05 from actual (0.75 to 0.85 and 0.15 to 0.25), earn 0.20
    //+- 0.05 from actual (0.7-0.75, 0.85-0.90, 0.15 to 0.1, 0.25 to 0.3), earn 0.10
    //+- 0.05  from actual (0.65-0.7, 0.90-0.95, 0.05 to 0.1, 0.3 to 0.35), earn 0.05

    var limit1Min1 = minMax(
      j1Fb.map(function (value) {
        return value - 5;
      })
    );

    var limit1Max1 = minMax(
      j1Fb.map(function (value) {
        return value + 5;
      })
    );

    var limit1Min2 = minMax(
      j1Fb.map(function (value) {
        return value - 10;
      })
    );
    var limit1Max2 = minMax(
      j1Fb.map(function (value) {
        return value + 10;
      })
    );

    var limit1Min3 = minMax(
      j1Fb.map(function (value) {
        return value - 15;
      })
    );
    var limit1Max3 = minMax(
      j1Fb.map(function (value) {
        return value + 15;
      })
    );

    var limit2Min1 = minMax(
      j2Fb.map(function (value) {
        return value - 5;
      })
    );

    var limit2Max1 = minMax(
      j2Fb.map(function (value) {
        return value + 5;
      })
    );

    var limit2Min2 = minMax(
      j2Fb.map(function (value) {
        return value - 10;
      })
    );
    var limit2Max2 = minMax(
      j2Fb.map(function (value) {
        return value + 10;
      })
    );

    var limit2Min3 = minMax(
      j2Fb.map(function (value) {
        return value - 15;
      })
    );
    var limit2Max3 = minMax(
      j2Fb.map(function (value) {
        return value + 15;
      })
    );

    var limit3Min1 = minMax(
      j3Fb.map(function (value) {
        return value - 5;
      })
    );

    var limit3Max1 = minMax(
      j3Fb.map(function (value) {
        return value + 5;
      })
    );

    var limit3Min2 = minMax(
      j3Fb.map(function (value) {
        return value - 10;
      })
    );
    var limit3Max2 = minMax(
      j3Fb.map(function (value) {
        return value + 10;
      })
    );

    var limit3Min3 = minMax(
      j3Fb.map(function (value) {
        return value - 15;
      })
    );
    var limit3Max3 = minMax(
      j3Fb.map(function (value) {
        return value + 15;
      })
    );

    var bonus1 = bonusCal(
      j1Contin,
      limit1Min1,
      limit1Max1,
      limit1Min2,
      limit1Max2,
      limit1Min3,
      limit1Max3
    );

    var bonus2 = bonusCal(
      j2Contin,
      limit2Min1,
      limit2Max1,
      limit2Min2,
      limit2Max2,
      limit2Min3,
      limit2Max3
    );

    var bonus3 = bonusCal(
      j3Contin,
      limit3Min1,
      limit3Max1,
      limit3Min2,
      limit3Max2,
      limit3Min3,
      limit3Max3
    );

    var bonus1Total = bonus1.reduce((a, b) => a + b, 0);
    var bonus2Total = bonus2.reduce((a, b) => a + b, 0);
    var bonus3Total = bonus3.reduce((a, b) => a + b, 0);

    var bonus = bonus1Total + bonus2Total + bonus3Total;
    // This will change for the questionnaires going AFTER the main task
    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,
      currentInstructionText: 1,

      stim: [stim1, stim2, stim3, stim4],
      j1Contin: j1Contin,
      j2Contin: j2Contin,
      j3Contin: j3Contin,

      j1Fb: j1Fb,
      j2Fb: j2Fb,
      j3Fb: j3Fb,

      bonus: bonus,
    };

    this.handleInstructLocal = this.handleInstructLocal.bind(this);
  }

  // 3 quizes, 4 items each = 12 times to earn... max bonus is 2.4 dollars?
  // each quiz is worth if
  //+- 0.05 from actual (0.75 to 0.85 and 0.15 to 0.25), earn 0.20
  //+- 0.05 from actual (0.7-0.75, 0.85-0.90, 0.15 to 0.1, 0.25 to 0.3), earn 0.10
  //+- 0.05  from actual (0.65-0.7, 0.90-0.95, 0.05 to 0.1, 0.3 to 0.35), earn 0.05

  // This handles instruction screen within the component
  handleInstructLocal(key_pressed) {
    var curText = this.state.currentInstructionText;
    var whichButton = key_pressed;

    if (whichButton === 4 && curText > 1) {
      this.setState({ currentInstructionText: curText - 1 });
    } else if (whichButton === 5 && curText < 2) {
      this.setState({ currentInstructionText: curText + 1 });
    } else if (whichButton === 10 && curText === 2) {
      setTimeout(
        function () {
          this.redirectToEnd();
        }.bind(this),
        0
      );
    }
  }

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
      case 32:
        //    this is sapcebar
        key_pressed = 10;
        this.handleInstructLocal(key_pressed);
        break;
      default:
    }
  };

  //

  // Mount the component to call the BACKEND and GET the information
  componentDidMount() {
    document.body.style.background = "fff";
    window.scrollTo(0, 0);
  }

  useEffect() {
    window.scrollTo(0, 0);
  }

  redirectToEnd() {
    alert("You will now be redirected to the validation page.");

    window.location = "https://google.com"; //this will the prolific validation code
  }

  render() {
    let text;
    this.useEffect();
    if (this.state.currentInstructionText === 1) {
      text = (
        <div className={styles.spaceship}>
          <div className={styles.main}>
            <p>
              <span className={styles.center}>END</span>
              <br />
              Thanks for completing the task!
              <br />
              <br />
              <img
                src={this.state.stim[0]}
                alt="stim images"
                width="50"
                height="auto"
              />
              &nbsp;
              <img
                src={this.state.stim[2]}
                alt="stim images"
                width="50"
                height="auto"
              />
              &nbsp;
              <img
                src={this.state.stim[3]}
                alt="stim images"
                width="50"
                height="auto"
              />
              &nbsp;
              <img
                src={this.state.stim[4]}
                alt="stim images"
                width="50"
                height="auto"
              />
              &nbsp;
              <br />
              <br />
              Journey 1<br />
              Actual Contigency:
              <br />
              {this.state.j1Fb[0]}% {this.state.j1Fb[1]}%&nbsp
              {this.state.j1Fb[2]}% {this.state.j1Fb[3]}%
              <br />
              Your Answer: <br />
              {this.state.j1Contin[0]}% {this.state.j1Contin[1]}%&nbsp
              {this.state.j1Contin[2]}% {this.state.j1Contin[3]}%
              <br />
              <br />
              Journey 2<br />
              Actual Contigency:
              <br />
              {this.state.j2Fb[0]}% {this.state.j2Fb[1]}%&nbsp
              {this.state.j2Fb[2]}% {this.state.j2Fb[3]}%
              <br />
              Your Answer: <br />
              {this.state.j2Contin[0]}% {this.state.j2Contin[1]}%&nbsp
              {this.state.j2Contin[2]}% {this.state.j2Contin[3]}%
              <br />
              <br />
              Journey 3<br />
              Actual Contigency:
              <br />
              {this.state.j3Fb[0]}% {this.state.j3Fb[1]}%&nbsp
              {this.state.j3Fb[2]}% {this.state.j3Fb[3]}%
              <br />
              Your Answer: <br />
              {this.state.j3Contin[0]}% {this.state.j3Contin[1]}%&nbsp
              {this.state.j3Contin[2]}% {this.state.j3Contin[3]}%
              <br />
              <br />
              You earned £{this.state.bonus} more!
              <br />
              <br />
              <span className={styles.centerTwo}>
                [<strong>NEXT</strong> →]
              </span>
            </p>
            <span className={styles.astro}>
              <img src={astrodude} alt="astrodude" />
            </span>
          </div>
        </div>
      );
    } else if (this.state.currentInstructionText === 2) {
      text = (
        <div className={styles.main}>
          <p>
            <span className={styles.center}>
              <strong>END</strong>
            </span>
            <br />
            Thanks for your help!
            <br />
            <br />
            Your data makes an important contribution to our understanding of
            mental health.
            <br />
            <br />
            In the task, we were interested in how you react to uncertain,
            unpleasant feedback.
            <br />
            Previous work have linked differences in behaviour to psychiatric
            disorders, <br />
            which we are aiming to understand better.
            <br />
            <br />
            If you feel that completing the questionnaires on any of the
            psychopathologies caused you any distress, <br />
            please use the following contact details for help and support.
            <br />
            <br />
            <i>Web pages</i>
            <br />
            <strong>National Institute of Mental Health:</strong>&nbsp;
            <a href="https://www.nimh.nih.gov/health/find-help/index.shtml">
              https://www.nimh.nih.gov/health/find-help/index.shtml
            </a>
            <br />
            <strong>Anxiety and Depression Association of America:</strong>
            &nbsp;
            <a href="https://adaa.org/adaa-online-support-group">
              https://adaa.org/adaa-online-support-group
            </a>
            <br />
            <strong>Depression and Bipolar Support Alliance:</strong>&nbsp;
            <a href="http://www.dbsalliance.org/">
              http://www.dbsalliance.org/
            </a>
            <br />
            <strong>Mental Health America:</strong>&nbsp;
            <a href="http://www.mentalhealthamerica.net/">
              http://www.mentalhealthamerica.net/
            </a>
            <br />
            <strong>National Alliance on Mental Illness:</strong>&nbsp;
            <a href="http://www.nami.org/">http://www.nami.org/</a>
            <br /> <br />
            <i>Support lines</i>
            <br />
            <strong> National Suicide Prevention Lifeline:</strong>{" "}
            1-800-273-8255
            <br />
            <br />
            <span className={styles.centerTwo}>
              If you are ready to return to Prolific, press{" "}
              <strong>SPACEBAR</strong> to complete the session.
            </span>
            <br />
            &nbsp;
            <span className={styles.centerTwo}>
              [← <strong>BACK</strong>]
            </span>
          </p>
        </div>
      );
    }

    return <div>{text}</div>;
  }
}

export default withRouter(EndPage);
