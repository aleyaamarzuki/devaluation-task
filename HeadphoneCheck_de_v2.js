import React from "react";
// import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import audioCalib from "./sounds/headphone/noise_calib_stim.wav";
import audioCheck1 from "./sounds/headphone/antiphase_HC_ISO.wav";
import audioCheck2 from "./sounds/headphone/antiphase_HC_IOS.wav";
import audioCheck3 from "./sounds/headphone/antiphase_HC_SOI.wav";
import audioCheck4 from "./sounds/headphone/antiphase_HC_SIO.wav";
import audioCheck5 from "./sounds/headphone/antiphase_HC_OSI.wav";
import audioCheck6 from "./sounds/headphone/antiphase_HC_OIS.wav";

import * as SliderVol from "./sliders/VolumeSlider.js";

import styles from "./style/taskStyle.module.css";

import PlayButton from "./PlayButton";
import { DATABASE_URL } from "./config";

////////////////////////////////////////////////////////////////////////////////
//Functions
////////////////////////////////////////////////////////////////////////////////
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

//shuffleSingle
function shuffleSingle(array) {
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

// Function to shuffle Audio and Answers
function shuffleDouble(fileNames, trackTitles) {
  var tempA;
  var tempB;
  for (var a = 0; a < fileNames.length; a++) {
    tempA = fileNames[a];
    tempB = Math.floor(Math.random() * fileNames.length);
    fileNames[a] = fileNames[tempB];
    fileNames[tempB] = tempA;

    tempA = trackTitles[a];
    trackTitles[a] = trackTitles[tempB];
    trackTitles[tempB] = tempA;
  }
}

var quizSounds = [
  audioCheck1,
  audioCheck2,
  audioCheck3,
  audioCheck4,
  audioCheck5,
  audioCheck6,
];

var varPlayColour = [
  "#bf0069",
  "#395756",
  "#4f5d75",
  "#4d8f1e",
  "#188fa7",
  "#7261a3",
];

var quizAns = [2, 3, 1, 1, 2, 3];

shuffleSingle(varPlayColour);
shuffleDouble(quizSounds, quizAns);

quizSounds = quizSounds.filter(function (val) {
  return val !== undefined;
});

quizAns = quizAns.filter(function (val) {
  return val !== undefined;
});

////////////////////////////////////////////////////////////////////////////////
//React Component
////////////////////////////////////////////////////////////////////////////////
class HeadphoneCheck extends React.Component {
  constructor(props) {
    super(props);
    // Constructor and props
    const userID = this.props.location.state.userID;
    const date = this.props.location.state.date;
    const startTime = this.props.location.state.startTime;

    var currTime = Math.round(performance.now());
    var volNtLog = 80;
    var vol = logslider(80);

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

    ////////////////////////////////////////////////////////////////////////////////
    //Set state
    ////////////////////////////////////////////////////////////////////////////////
    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,

      volCalStage: "volCalib",
      currentInstructionText: 1,
      quizScreen: false,

      qnNumTotal: 6,
      qnNum: 1,
      playNum: 0,
      qnTime: currTime,
      qnRT: 0,
      qnPressKey: [],
      qnCorr: [],
      quizAns: quizAns,
      quizSum: 0,
      quizPer: 0,
      soundFocus: null,
      quizAnsIndiv: null,

      active: false,
      playOnceOnly: false,
      playAgain: false,

      varPlayColour: varPlayColour,
      calibSound: audioCalib,
      quizSounds: quizSounds,
      volume: vol, // this is what i feed into the audio
      volumeNotLog: volNtLog, //this is what you feed into the slider and convert back
      checkTry: 1,

      fix: fix,
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

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    this.togglePlaying = this.togglePlaying.bind(this);
    this.handleInstructLocal = this.handleInstructLocal.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
    this.redirectToTarget = this.redirectToTarget.bind(this);
    this.redirectToBack = this.redirectToBack.bind(this);
    this.display_question = this.display_question.bind(this);
    this.handleDebugKeyLocal = this.handleDebugKeyLocal.bind(this);
  }
  ////////////////////////////////////////////////////////////////////////////////
  //Constructor and props end
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  //Component mount
  ////////////////////////////////////////////////////////////////////////////////
  componentDidMount() {
    window.scrollTo(0, 0);

    var calibSound = this.state.calibSound;

    this.setState({
      calibSound: calibSound,
      mounted: 1,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Instruction Screen
  ////////////////////////////////////////////////////////////////////////////////
  handleInstructLocal(key_pressed) {
    var curText = this.state.currentInstructionText;
    var whichButton = key_pressed;

    if (this.state.volCalStage === "volCalib") {
      if (curText === 1 && whichButton === 5) {
        //go next page
        this.setState({ currentInstructionText: curText + 1 });
      } else if (curText === 2 && whichButton === 5) {
        //go to saveData
        setTimeout(
          function () {
            this.saveData();
          }.bind(this),
          10
        );
      } else if (curText === 2 && whichButton === 4) {
        //go back one
        this.setState({ currentInstructionText: curText - 1 });
      }
    } else if (this.state.volCalStage === "headphoneCheck") {
      if (whichButton === 32) {
        setTimeout(
          function () {
            this.start_quest();
          }.bind(this),
          10
        );
      }
    }
  }

  handleRestart(key_pressed) {
    var whichButton = key_pressed;

    if (whichButton === 32) {
      setTimeout(
        function () {
          this.redirectToBack();
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
        //    this is spacebar
        key_pressed = 32;
        this.handleInstructLocal(key_pressed);
        break;
      default:
    }
  };

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
  ////////////////////////////////////////////////////////////////////////////////
  //After audio calibration, move to headphone check instruction screen
  ////////////////////////////////////////////////////////////////////////////////
  nextStage() {
    this.setState({
      volCalStage: "headphoneCheck",
      currentInstructionText: 1,
      quizScreen: false,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Start headphone check
  ////////////////////////////////////////////////////////////////////////////////
  start_quest() {
    document.removeEventListener("keyup", this._handleInstructKey);

    var currTime = Math.round(performance.now());
    //  console.log("quizAns: " + this.state.quizAns);

    this.setState({
      quizScreen: true,
      qnNum: 1,
      qnTime: currTime,
      playOnceOnly: true, //change this to true make sure sounds can only play once for the quiz
      playAgain: false,
      active: false,
      playNum: 0,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Toggle audio playing
  ////////////////////////////////////////////////////////////////////////////////
  togglePlaying() {
    var playNum = this.state.playNum;

    if (this.state.playOnceOnly === true) {
      //if this is a section where playOnceOnly happens then
      if (this.state.playAgain === false) {
        //if it's the first play,
        playNum++;
        this.setState({
          active: !this.state.active,
          playAgain: true,
          playNum: playNum,
        });
        document.addEventListener("keydown", this._handleKeyDownNumbers);
      } else {
        //if played once then cannot play again
        this.setState({ active: false });
      }
    } else {
      playNum++;
      this.setState({ active: !this.state.active, playNum: playNum });
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Callback functions to set volume before headphone check
  ////////////////////////////////////////////////////////////////////////////////

  callbackVol(callBackValue) {
    var volume = callBackValue;
    if (volume > 100) {
      volume = 100;
    } else if (volume < 0) {
      volume = 1;
    }

    // console.log("Volume set: " + volume);
    this.setState({ volume: volume });
  }

  callbackVolNotLog(callBackValueNotLog) {
    var volumeNotLog = callBackValueNotLog;
    this.setState({ volumeNotLog: volumeNotLog });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Question display for headphone check
  ////////////////////////////////////////////////////////////////////////////////
  display_question(qnNum) {
    //comment this out after debuging, it will make sure that you can only cont when after you play the sound
    //document.addEventListener("keydown", this._handleKeyDownNumbers);
    var audioBite = this.state.quizSounds[qnNum - 1];

    return (
      <div className={styles.main}>
        <p>
          <span className={styles.center}>
            <strong>
              Frage {qnNum} von {this.state.qnNumTotal}
            </strong>
          </span>
          <br />
          Wenn Sie auf den Wiedergabeknopf unten klicken, werden Sie drei Töne hören, 
          die durch Pausen getrennt sind.
          <br />
          <br />
          Testtöne können nur <strong>einmal</strong> abgespielt werden, 
          also achten Sie gut darauf! 
          <br />
          <br />
          <span className={styles.centerTwo}>
            <PlayButton
              audio={audioBite}
              play={this.togglePlaying}
              stop={this.togglePlaying}
              idleBackgroundColor={this.state.varPlayColour[qnNum - 1]}
              volume={this.state.volume}
              active={this.state.active}
            />
            <br />
            <br />
            Welcher Ton war der <strong>leiseste</strong> -- 1, 2 oder 3? 
            <br /> <br />
            <strong>1</strong> - DER ERSTE Ton war AM LEISESTEN <br />
            <strong>2</strong> - DER ZWEITE Ton war AM LEISESTEN <br />
            <strong>3</strong> - DER DRITTE Ton war AM LEISESTEN <br />
            <br />
            [Drücke die entsprechende Zahlentaste] 
            <br /> <br />{" "}
            <span className={styles.smallfont}>
              [Hinweis: Zahlentasten funktionieren erst, nachdem Sie 
              auf den Wiedergabeknopf geklickt haben.] 
            </span>
          </span>
        </p>
      </div>
    );
  }


  ////////////////////////////////////////////////////////////////////////////////
  //When answer the quiz, record and calculate quiz score and key presses
  ////////////////////////////////////////////////////////////////////////////////
  next_question(pressed, time_pressed) {
    this.useEffect();
    document.removeEventListener("keydown", this._handleKeyDownNumbers);

    var qnRT = time_pressed - this.state.qnTime;
    var qnNum = this.state.qnNum;
    var quizSum = this.state.quizSum;
    var qnPressKey = this.state.qnPressKey;
    var qnCorr = this.state.qnCorr;
    var qnCorrIndiv = this.state.qnCorrIndiv;
    var quizAns = this.state.quizAns;
    var quizPer = this.state.quizPer;
    var qnNumTotal = this.state.qnNumTotal;

    var qnNumIdx = qnNum - 1;

    // Check answers if correct
    if (
      (qnNum === 1 && pressed === quizAns[0]) ||
      (qnNum === 2 && pressed === quizAns[1]) ||
      (qnNum === 3 && pressed === quizAns[2]) ||
      (qnNum === 4 && pressed === quizAns[3]) ||
      (qnNum === 5 && pressed === quizAns[4]) ||
      (qnNum === 6 && pressed === quizAns[5])
    ) {
      qnCorr[qnNumIdx] = 1;
      qnCorrIndiv = 1;
      quizSum = quizSum + 1;
    } else {
      qnCorr[qnNumIdx] = 0;
      qnCorrIndiv = 0;
    }
    //
    // console.log("Qn correct: " + qnCorr);
    // console.log("Total quiz score: " + quizSum);
    qnPressKey = pressed;

    quizPer = (qnNum / qnNumTotal) * 100;

    this.setState({
      qnNum: qnNum,
      quizPer: quizPer,
      quizSum: quizSum,
      qnPressKey: qnPressKey,
      qnRT: qnRT,
      qnCorr: qnCorr,
      qnCorrIndiv: qnCorrIndiv,
    });

    setTimeout(
      function () {
        this.saveData();
      }.bind(this),
      10
    );
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Save data
  ////////////////////////////////////////////////////////////////////////////////
  saveData() {
    var userID = this.state.userID;
    var currTime = Math.round(performance.now());
    let quizbehaviour;
    if (this.state.volCalStage === "volCalib") {
      quizbehaviour = {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        volCalStage: this.state.volCalStage,
        checkTry: this.state.checkTry,
        qnTime: this.state.qnTime,
        qnRT: currTime - this.state.qnRT,
        qnNum: 1,
        soundFocus: this.state.calibSound,
        soundIndex: null, // this is in soundCal.js
        volume: this.state.volume,
        volumePer: null, // this is in soundCal.js, percent wrt to the chosen auido volume
        volumeNotLog: this.state.volumeNotLog,
        playNum: this.state.playNum, // this is only for the volume adjustment, for the headcheck task this should be 1
        quizAnsIndiv: null,
        qnPressKey: null,
        qnCorrIndiv: null,
        averRating: null, //no ratings in this script, but there is in sound Cal
        arouRating: null,
        averRatingDef: null,
        arouRatingDef: null,
      };

      fetch(`${DATABASE_URL}/vol_cal/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizbehaviour),
      });

      // console.log(quizbehaviour);

      setTimeout(
        function () {
          this.nextStage();
        }.bind(this),
        10
      );
    } else if (this.state.volCalStage === "headphoneCheck") {
      quizbehaviour = {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        volCalStage: this.state.volCalStage,
        checkTry: this.state.checkTry,
        qnTime: this.state.qnTime,
        qnRT: this.state.qnRT,
        qnNum: this.state.qnNum,
        soundFocus: this.state.quizSounds[this.state.qnNum - 1],
        soundIndex: null, // this is in soundCal.js
        volume: this.state.volume,
        volumePer: null, // this is in soundCal.js, percent wrt to the chosen auido volume
        volumeNotLog: this.state.volumeNotLog,
        playNum: this.state.playNum, // this is only for the volume adjustment, for the headcheck task this should be 1
        quizAnsIndiv: this.state.quizAns[this.state.qnNum - 1],
        qnPressKey: this.state.qnPressKey,
        qnCorrIndiv: this.state.qnCorrIndiv,
        averRating: null, //no ratings in this script, but there is in sound Cal
        arouRating: null,
        averRatingDef: null,
        arouRatingDef: null,
      };

      fetch(`${DATABASE_URL}/vol_cal/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizbehaviour),
      });

      // console.log(quizbehaviour);

      setTimeout(
        function () {
          this.nextQn();
        }.bind(this),
        10
      );
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Move to next question for headphone check
  ////////////////////////////////////////////////////////////////////////////////
  nextQn() {
    var qnNum = this.state.qnNum + 1;
    var currTime = Math.round(performance.now());

    this.setState({
      qnNum: qnNum,
      playNum: 0,
      qnTime: currTime,
      active: false,
      playAgain: false, //reset so next question can play once
      playOnceOnly: true, //change this to make sure sounds can only play once for the quiz
      soundFocus: null,
      quizAnsIndiv: null,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Functions for keypresses
  ////////////////////////////////////////////////////////////////////////////////
  _handleKeyDownNumbers = (event) => {
    var pressed;
    var time_pressed;

    switch (event.keyCode) {
      case 49:
        pressed = 1;
        time_pressed = Math.round(performance.now());
        this.next_question(pressed, time_pressed);

        break;
      case 50:
        pressed = 2;
        time_pressed = Math.round(performance.now());
        this.next_question(pressed, time_pressed);

        break;
      case 51:
        pressed = 3;
        time_pressed = Math.round(performance.now());
        this.next_question(pressed, time_pressed);
        break;

      default:
    }
  };

  _handleRestartKey = (event) => {
    var pressed;
    var time_pressed;

    switch (event.keyCode) {
      case 32:
        pressed = 32;
        time_pressed = Math.round(performance.now());
        this.handleRestart(pressed, time_pressed);
        break;
      default:
    }
  };

  ////////////////////////////////////////////////////////////////////////////////
  //Reset from beginning if fail headphone check
  ////////////////////////////////////////////////////////////////////////////////
  redirectToBack() {
    document.removeEventListener("keydown", this._handleRestartKey);
    var checkTry = this.state.checkTry + 1;
    var vol = logslider(80);
    this.setState({
      checkTry: checkTry,
      volCalStage: "volCalib",
      currentInstructionText: 1,
      quizScreen: false,
      qnNum: 1,
      playNum: 0,
      qnTime: 0,
      quizSum: 0,
      qnPressKey: [],
      qnCorr: [],
      active: false,
      volume: vol,
      volumeNotLog: 80,
    });
    setTimeout(
      function () {
        this.resetSounds();
      }.bind(this),
      0
    );
  }

  ////////////////////////////////////////////////////////////////////////////////
  //If fail headphone check, reset the sounds for another try
  ////////////////////////////////////////////////////////////////////////////////
  resetSounds() {
    var quizSounds = this.state.quizSounds;
    var quizAns = this.state.quizAns;
    var varPlayColour = this.state.varPlayColour;

    shuffleSingle(varPlayColour);
    shuffleDouble(quizSounds, quizAns);

    this.setState({
      quizSounds: quizSounds,
      quizAns: quizAns,
      varPlayColour: varPlayColour,
      soundFocus: null,
      quizAnsIndiv: null,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Function to ensure that the page starts from the top
  ////////////////////////////////////////////////////////////////////////////////
  useEffect() {
    window.scrollTo(0, 0);
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Move to next section of task
  ////////////////////////////////////////////////////////////////////////////////
  redirectToTarget() {
    document.removeEventListener("keyup", this._handleDebugKey);
    this.props.history.push({
      pathname: `/SoundCal`,
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        volume: this.state.volume,
        volumeNotLog: this.state.volumeNotLog,

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

  ////////////////////////////////////////////////////////////////////////////////
  //Rendering
  ////////////////////////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.debug === false) {
      if (this.state.volCalStage === "volCalib") {
        //Dies dient zur Anpassung der Lautstärke
        if (this.state.currentInstructionText === 1) {
          document.addEventListener("keyup", this._handleInstructKey);
          this.useEffect();
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>WILLKOMMEN</strong>
                </span>
                <br />
                Heute spielen wir ein Spiel, bei dem mehrere Geräusche verwendet werden. 
                <br />
                Bevor wir beginnen, müssen wir einige Einstellungen im Zusammenhang mit dem Ton vornehmen. 
                <br />
                <br />
                Dafür sollten Sie sich in einer ruhigen Umgebung befinden und <br />
                während der gesamten Sitzung Kopfhörer oder Ohrhörer tragen. 
                <br /> <br />
                Bitte setzen Sie jetzt Ihre <b>Kopfhörer oder Ohrhörer</b> auf. 
                <br /> <br />
                Wenn Sie bereit sind, können Sie mit den Pfeiltasten nach links und rechts durch die Seiten navigieren.
                <br />
                <span className={styles.centerTwo}>
                  <br />[<strong>WEITER</strong> →]
                </span>
              </p>
            </div>
          );
        } else if (this.state.currentInstructionText === 2) {
          text = (
            <div className={styles.main}>
              <p>
                <br />
                Großartig! Zuerst müssen wir Ihre Toneinstellungen auf ein geeignetes Niveau einstellen. <br />
                Bitte stellen Sie die Lautstärke Ihres Computersystems auf{" "} 
                <strong>30 % der maximalen Lautstärke</strong> ein.
                <br /> <br />
                Klicken Sie jetzt auf den Wiedergabeknopf unten. 
                <br />
                <br />
                <span className={styles.center}>
                  <PlayButton
                    audio={this.state.calibSound}
                    play={this.togglePlaying}
                    stop={this.togglePlaying}
                    volume={this.state.volume}
                    idleBackgroundColor={this.state.varPlayColour[0]}
                    active={this.state.active}
                  />
                </span>
                <br />
                Wenn es zu laut oder zu leise ist, passen Sie die Lautstärke mit dem Schieberegler unten an.
                <br />
                Sie können den Wiedergabeknopf so oft anklicken, wie Sie möchten. 
                <br /> 
                <br />
                Sie sollten ein <u>lautes, aber angenehmes</u> Niveau anstreben.
                <br /> <br />
                <span className={styles.center}>
                  <SliderVol.SliderVol
                    callBackValue={this.callbackVol.bind(this)}
                    callBackValueNotLog={this.callbackVolNotLog.bind(this)}
                  />
                </span>
                <br />
                Bitte fahren Sie mit der nächsten Seite fort, wenn Sie mit der Lautstärke zufrieden sind. 
                <br /> <br />
                <span className={styles.centerTwo}>
                  [← <strong>ZURÜCK</strong>] [<strong>WEITER</strong> →]
                </span>
              </p>
            </div>
          );
        }
      } else if (this.state.volCalStage === "headphoneCheck") {
        this.useEffect();
        // Dies ist das 3-Sound-Quiz
        if (this.state.quizScreen === false) {
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>TONTEST: TEIL I</strong>
                </span>
                <br />
                Um sicherzustellen, dass alles ordnungsgemäß funktioniert, werden wir mit Ihnen 
                nun einen Hörtest machen. 
                <br />
                <br />
                Es ist wichtig, dass Sie Ihre <u>Kopfhörer auflassen</u> und <u>keine Änderungen</u>  
                an den Toneinstellungen vornehmen. 
                <br />
                <br />
                Sie müssen diesen Test bestehen, um fortfahren zu können.
                <br /> <br />
                <span className={styles.centerTwo}>
                  Drücken Sie die <strong>LEERTASTE</strong>, um zu beginnen.
                </span>
              </p>
            </div>
          );
        } else {
          //QUIZ STARTET
          if (this.state.qnNum <= this.state.qnNumTotal) {
            text = (
              <div className="questionnaire">
                <center>
                  <br />
                  {this.display_question(this.state.qnNum)}
                  <br />
                </center>
              </div>
            );
          } else {
            // Wenn das Quiz abgeschlossen ist, stoppt der Listener und berechnet die Punktzahl
            document.removeEventListener("keydown", this._handleKeyDownEnter);
            if (this.state.quizSum > this.state.qnNumTotal - 2) {
              // also entweder 5 oder 6
              this.redirectToTarget();
            } else {
              document.addEventListener("keydown", this._handleRestartKey);
              text = (
                <div className={styles.main}>
                  <p>
                    <span className={styles.center}>
                      <strong>ENDE DES HÖRTESTS</strong>
                    </span>
                    <br />
                    <br />
                    Leider haben Sie den Screening-Test nicht bestanden. 
                    <br />
                    <br />
                    Sie haben {this.state.quizSum} von {this.state.qnNumTotal} Fragen richtig beantwortet. 
                    <br />
                    <br />
                    Bitte stellen Sie sicher, dass Sie Kopfhörer/Ohrhörer tragen 
                    und eine lautere Lautstärke kalibrieren. 
                    <br />
                    <br />
                    <span className={styles.centerTwo}>
                      Drücken Sie die LEERTASTE, um die Lautstärke erneut zu kalibrieren.
                    </span>
                  </p>
                </div>
              );
            }
          }
        }
      }
    } else if (this.state.debug === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div className={styles.main}>
          <p>
            <span className={styles.center}>DEBUG-MODUS</span>
            <br />

            <span className={styles.centerTwo}>
              Drücken Sie die [<strong>LEERTASTE</strong>], um zum nächsten Abschnitt weiterzugehen.
            </span>
          </p>
        </div>
      );
    }

    return <div className={styles.spaceship}>{text}</div>;
  }

}

export default withRouter(HeadphoneCheck);
