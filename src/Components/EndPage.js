import React from "react";
import { withRouter } from "react-router-dom";

import styles from "./style/taskStyle.module.css";

import astrodude from "./images/astronaut.png";
import stim1 from "./images/blue_planet.png";
import stim2 from "./images/light_green_planet.png";
import stim3 from "./images/pink_planet.png";
import stim4 from "./images/red_planet.png";
import stim5 from "./images/black_planet.png";
import stim6 from "./images/white_planet.png";

import { DATABASE_URL } from "./config";
// functions
function reorder(continArray, stimArray) {
  var index1 = stimArray.indexOf(0);
  var index2 = stimArray.indexOf(1);
  var index3 = stimArray.indexOf(2);
  var index4 = stimArray.indexOf(3);
  var index5 = stimArray.indexOf(4);
  var index6 = stimArray.indexOf(5);

  var newarray = [
    continArray[index1],
    continArray[index2],
    continArray[index3],
    continArray[index4],
    continArray[index5],
    continArray[index6],
  ];

  return newarray;
}

function bonusCal(array1, actual) {
  var i = 0;
  var stimNum = array1.length;
  var newarray = [];

  while (i < stimNum) {
    var diffRating = Math.abs(actual[i] - array1[i]);
    var maxDist;
    if (actual[i] === 0) {
      maxDist = 100;
    } else if (actual[i] === 20) {
      maxDist = 100;
    } else if (actual[i] === 80) {
      maxDist = 0;
    } else if (actual[i] === 50) {
      maxDist = 100;
    }

    var diffMax = Math.abs(actual[i] - maxDist);
    var reward = 1 - diffRating / diffMax;
    newarray[i] = reward;
    i++;
  }
  return newarray;
}

// This is also where we calculate the bonus

class EndPage extends React.Component {
  constructor(props) {
    super(props);

    const userID = this.props.location.state.userID;
    const date = this.props.location.state.date;
    const startTime = this.props.location.state.startTime;
    const journeyOneContin = this.props.location.state.journeyOneContin.map(
      (n) => {
        return parseInt(n, 10);
      }
    );
    const journeyOneContinStim = this.props.location.state.journeyOneContinStim;
    const journeyOneContinFbProb = this.props.location.state
      .journeyOneContinFbProb;
    const journeyTwoContin = this.props.location.state.journeyTwoContin.map(
      (n) => {
        return parseInt(n, 10);
      }
    );
    const journeyTwoContinStim = this.props.location.state.journeyTwoContinStim;
    const journeyTwoContinFbProb = this.props.location.state
      .journeyTwoContinFbProb;
    const journeyThreeContin = this.props.location.state.journeyThreeContin.map(
      (n) => {
        return parseInt(n, 10);
      }
    );
    const journeyThreeContinStim = this.props.location.state
      .journeyThreeContinStim;
    const journeyThreeContinFbProb = this.props.location.state
      .journeyThreeContinFbProb;

    // for debug
    // var userID = 1000;
    // var date = 1000;
    // var startTime = 1000;
    // var journeyOneContin = [0, 1, 2, 3];
    // var journeyOneContinStim = [0, 0, 0, 0];
    // var journeyOneContinFbProb = [0, 0, 0, 0];
    // var journeyTwoContin = [0, 1, 2, 3];
    // var journeyTwoContinStim = [0, 0, 0, 0];
    // var journeyTwoContinFbProb = [0, 0, 0, 0];
    // var journeyThreeContin = [0, 1, 2, 3];
    // var journeyThreeContinStim = [0, 0, 0, 0];
    // var journeyThreeContinFbProb = [0, 0, 0, 0];

    console.log(journeyOneContin);
    console.log(journeyTwoContin);
    console.log(journeyThreeContin);

    console.log(journeyOneContinFbProb);
    console.log(journeyTwoContinFbProb);
    console.log(journeyThreeContinFbProb);

    console.log(journeyOneContinStim);
    console.log(journeyTwoContinStim);
    console.log(journeyThreeContinStim);

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

    var bonus1 = bonusCal(j1Contin, j1Fb);
    var bonus2 = bonusCal(j2Contin, j2Fb);
    var bonus3 = bonusCal(j3Contin, j3Fb);

    var sum1 = bonus1.reduce((a, b) => a + b, 0);
    var avg1 = sum1 / bonus1.length || 0;

    var sum2 = bonus2.reduce((a, b) => a + b, 0);
    var avg2 = sum2 / bonus2.length || 0;

    var sum3 = bonus3.reduce((a, b) => a + b, 0);
    var avg3 = sum3 / bonus3.length || 0;

    var totalBonus = ((avg1 + avg2 + avg3) / 3) * 2;
    totalBonus = Math.round((totalBonus + Number.EPSILON) * 100) / 100;

    // This will change for the questionnaires going AFTER the main task
    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,
      currentInstructionText: 1,

      stim: [stim1, stim2, stim3, stim4, stim5, stim6],
      j1Contin: j1Contin,
      j2Contin: j2Contin,
      j3Contin: j3Contin,

      j1Fb: j1Fb,
      j2Fb: j2Fb,
      j3Fb: j3Fb,

      bonus1: bonus1,
      bonus2: bonus2,
      bonus3: bonus3,
      bonus: totalBonus,

      feedback: "",

      astrodude: astrodude,
    };

    this.handleInstructLocal = this.handleInstructLocal.bind(this);
    this.saveBonus = this.saveBonus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // for the feedback box
  handleChange(event) {
    this.setState({ feedback: event.target.value });
  }

  handleSubmit(event) {
    var userID = this.state.userID;

    let quizbehaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      feedback: this.state.feedback,
    };

    try {
      fetch(`${DATABASE_URL}/feedback/` + userID, {
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

    alert("Thanks for your feedback!");
    event.preventDefault();
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
    } else if (whichButton === 5 && curText < 3) {
      this.setState({ currentInstructionText: curText + 1 });
    } else if (whichButton === 11 && curText === 3) {
      // setTimeout(
      //   function () {
      //     this.redirectToEnd();
      //   }.bind(this),
      //   0
      // );
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
      case 13:
        //    this is enter
        key_pressed = 11;
        this.handleInstructLocal(key_pressed);
        break;
      default:
    }
  };

  saveBonus() {
    var userID = this.state.userID;

    let behaviour = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      stim: this.state.stim,
      phase1Contin: this.state.j1Contin,
      phase2Contin: this.state.j2Contin,
      phase3Contin: this.state.j3Contin,

      phase1FbProb: this.state.j1Fb,
      phase2FbProb: this.state.j2Fb,
      phase3FbProb: this.state.j3Fb,

      bonus1: this.state.bonus1,
      bonus2: this.state.bonus2,
      bonus3: this.state.bonus3,
      totalBonus: this.state.bonus,
    };

    // console.log(behaviour);

    fetch(`${DATABASE_URL}/bonus_data/` + userID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(behaviour),
    });
  }

  // Mount the component to call the BACKEND and GET the information
  componentDidMount() {
    document.body.style.background = "fff";
    window.scrollTo(0, 0);
    setTimeout(
      function () {
        this.saveBonus();
      }.bind(this),
      5
    );
  }

  openInNewTab(url) {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  }

  useEffect() {
    window.scrollTo(0, 0);
  }

  redirectToEnd() {
    alert("You will now be redirected to the validation page.");
    document.removeEventListener("keyup", this._handleInstructKey);
    window.location =
      "https://app.prolific.co/submissions/complete?cc=43B53323"; //this will the prolific validation code
  }

  render() {
    let text;
    this.useEffect();
    if (this.state.currentInstructionText === 1) {
      document.addEventListener("keyup", this._handleInstructKey);
      text = (
        <div className={styles.spaceship}>
          <div className={styles.main}>
            <p>
              <span className={styles.center}>
                <strong>Vielen Dank</strong>
              </span>
              <br />
              <span className={styles.centerTwo}>
                <img
                  src={this.state.stim[0]}
                  alt="stim images"
                  width="50"
                  height="auto"
                />
                &nbsp;
                <img
                  src={this.state.stim[1]}
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
                <img
                  src={this.state.stim[5]}
                  alt="stim images"
                  width="50"
                  height="auto"
                />
              </span>
              <br />
              Gut gemacht, Sie erhalten €{this.state.bonus} als Bonus! 
              <br /> <br />
              Vielen Dank für Ihre Hilfe! 
              <br />
              <br />
              Ihre Daten leisten einen wichtigen Beitrag zu unserem  
              Verständnis der psychischen Gesundheit. 
              <br />
              <br />
              Bei der Aufgabe waren wir daran interessiert, wie Sie auf
              unsicheres und unangenehmes Feedback reagieren. 
              <br /> <br />
              Frühere Arbeiten haben Verhaltensunterschiede mit psychischen
              Störungen in Verbindung gebracht, <br />
              die wir besser verstehen möchten. /
              <br />
              <br />
              <span className={styles.centerTwo}>
                [<strong>Weiter</strong> →]
              </span>
            </p>
          </div>
        </div>
      );
    } else if (this.state.currentInstructionText === 2) {
      text = (
        <div className={styles.spaceship}>
          <div className={styles.main}>
            <p>
              <span className={styles.center}>
                <strong>Vielen Dank</strong>
              </span>
              <br />
              <span className={styles.centerTwo}>
                <img
                  src={this.state.stim[0]}
                  alt="stim images"
                  width="50"
                  height="auto"
                />
                &nbsp;
                <img
                  src={this.state.stim[1]}
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
                <img
                  src={this.state.stim[5]}
                  alt="stim images"
                  width="50"
                  height="auto"
                />
              </span>
              <br />
              Falls Sie das Gefühl haben, dass das Ausfüllen der Fragebögen
              Ihnen Unannehmlichkeiten bereitet hat, <br />
              nutzen Sie bitte die folgenden Kontaktdaten für Hilfe und 
              Unterstützung. 
              <br />
              <br />
              <i>Weblink (klicken):</i>
              <br />
              <span
                className={styles.link}
                onClick={() => {
                  this.openInNewTab(
                    "https://www.telefonseelsorge.de/"
                  );
                }}
              >
                <u>TelefonSeelsorge</u> 
              </span>
              <br />
              <span
                className={styles.link}
                onClick={() => {
                  this.openInNewTab("https://www.116117.de/de/psychotherapie.php");
                }}
              >
                <u>116117 Psychotherapie</u> 
              </span>{" "}
              (Helpline: 116117)
              <br />
              <span
                className={styles.link}
                onClick={() => {
                  this.openInNewTab("https://www.zwaenge.de/diagnose/formen-der-zwangsstorung/");
                }}
              >
                <u>Deutschen Gesellschaft Zwangserkrankungen</u> 
              </span>
              <br /> <br />
              <span className={styles.centerTwo}>
                [← <strong>Zurück</strong>]&nbsp;[<strong>Weiter</strong> →] 
              </span>
            </p>
          </div>
        </div>
      );
    } else if (this.state.currentInstructionText === 3) {
      text = (
        <div className={styles.spaceship}>
          <div className={styles.main}>
            <p>
              <span className={styles.center}>
                <strong>Vielen Dank</strong>
              </span>
              <br />
              Wir würden uns über jegliche Kommentare zu den Aufgaben, die Sie 
              abgeschlossen haben, sehr freuen. 
              <br /> <br />
              Wenn Sie welche Fragen haben, füllen Sie bitte das Formular aus.
              und klicken Sie auf Absenden. 
              <form onSubmit={this.handleSubmit}>
                <label>
                  <textarea
                    rows="5"
                    placeholder=" Waren die Aufgabeninstruktionen klar? Haben Sie auf Probleme gestoßen?" 
                    value={this.state.feedback}
                    onChange={this.handleChange}
                  />
                </label>
                <input type="submit" value="Submit" />
              </form>
              <br />
              <span className={styles.centerTwo}>
              Sie haben die Aufgabe abgeschlossen! Sie können den Tab schließen.
              </span>
              &nbsp;
              <span className={styles.centerTwo}>
                [← <strong>Zurück</strong>]
              </span>
            </p>
            <span className={styles.astro}>
              <img src={this.state.astrodude} alt="astrodude" />
            </span>
          </div>
        </div>
      );
    }

    return <div>{text}</div>;
  }
}

export default withRouter(EndPage);
