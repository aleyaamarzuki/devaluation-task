import React, { Component } from "react";
import * as Survey from "survey-react";
import "survey-react/survey.css";
import styles from "./style/taskStyle.module.css";
import { DATABASE_URL } from "./config";
import astrodude from "./images/astronaut.png";

// this makes the quiz have grey stripes and lengthens the questions for better visibility
var myCss = {
  matrix: {
    root: "table table-striped",
  },
};

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

class Questionnaires extends Component {
  constructor(props) {
    super(props);

    const userID = 10000;
    const date = 1000;
    const startTime = 1000;
    // const userID = this.props.location.state.userID;
    // const date = this.props.location.state.date;
    // const startTime = this.props.location.state.startTime;

    var currTime = Math.round(performance.now());

    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,
      resultAsString: {},
      currentquiz: false,
      qnStart: currTime,
      qnTime: currTime,
      qnTotal: 3,
      quizLabel: ["OCIR", "STAI_Y2", "STAI_Y1"],
      qnText1: [],
      qnText2: [],
      qnText3: [],
    };

    // this.onComplete = this.onComplete.bind(this);
    // this.startQuiz = this.startQuiz.bind(this);
    //  this.shuffleQn = this.shuffleQn.bind(this);
  }

  //Define a callback methods on survey complete
  onComplete(survey, options) {
    // //Write survey results into database
    // var page = survey.currentPage;
    // var RT_valueName = "Pg_" + (survey.pages.indexOf(page) + 1);
    var qnEnd = Math.round(performance.now());
    var userID = this.state.userID;
    survey.setValue("userID", userID);
    survey.setValue("date", this.state.date);
    survey.setValue("startTime", this.state.startTime);
    survey.setValue("qnTimeStart", this.state.qnStart);
    survey.setValue("qnTimeEnd", qnEnd);

    var resultAsString = JSON.stringify(survey.data);

    console.log("resultAsString", resultAsString);

    fetch(`${DATABASE_URL}/psych_quiz/` + userID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: resultAsString,
    });

    this.setState({
      resultAsString: resultAsString,
    });
    console.log("userID: " + userID);
    console.log("Survey results: " + JSON.stringify(survey.data));

    setTimeout(
      function () {
        this.redirectToTarget();
      }.bind(this),
      10
    );
  }

  startQuiz() {
    // var currTime = Math.round(performance.now());
    //
    this.setState({ currentquiz: true });
    setTimeout(
      function () {
        this.shuffleQn();
      }.bind(this),
      10
    );
  }

  updateTime() {
    var qnTime = Math.round(performance.now()) - 10;
    this.setState({ qnTime: qnTime });
  }

  timerCallback(survey) {
    var page = survey.pages.indexOf(survey.currentPage);
    let quizText;
    if (page === 0) {
      quizText = "demo";
    } else {
      quizText = this.state.quizLabel[page - 1];
    }

    var valueName = "PgFinish_" + quizText;
    var valueName2 = "PgRT_" + quizText;
    var qnTime = Math.round(performance.now());
    var qnRT = qnTime - this.state.qnTime;
    survey.setValue(valueName, qnTime);
    survey.setValue(valueName2, qnRT);

    setTimeout(
      function () {
        this.updateTime();
      }.bind(this),
      10
    );
  }

  useEffect() {
    window.scrollTo(0, 0);
  }

  redirectToTarget() {
    this.props.history.push({
      pathname: `/EndPage`,
      state: { userID: this.state.userID },
    });
  }

  shuffleQn() {
    let quiz1 = {
      type: "matrix",
      name: "OCIR",
      isAllRowRequired: true,
      title:
        "Please indicate what best describes HOW MUCH each experience has DISTRESSED or BOTHERED you during the PAST MONTH.",
      columns: [
        { value: 0, text: "Not at all" },
        { value: 1, text: "A little" },
        { value: 2, text: "Moderately" },
        { value: 3, text: "A lot" },
        { value: 4, text: "Extremely" },
      ],
      rows: [
        {
          value: "OCIR_1",
          text: "I have saved up so many things that they get in the way.",
        },
        {
          value: "OCIR_2",
          text: "I check things more often than necessary.",
        },
        {
          value: "OCIR_3",
          text: "I get upset if objects are not arranged properly.",
        },
        {
          value: "OCIR_4",
          text: "I feel compelled to count while I am doing things.",
        },
        {
          value: "OCIR_5",
          text:
            "I find it difficult to touch an object when I know it has been touched by strangers or certain people.",
        },
        {
          value: "OCIR_6",
          text: "I find it difficult to control my own thoughts.",
        },
        { value: "OCIR_7", text: "I collect things I don’t need." },
        {
          value: "OCIR_8",
          text: "I repeatedly check doors, windows, drawers, etc.",
        },
        {
          value: "OCIR_9",
          text: "I get upset if others change the way I have arranged things.",
        },

        {
          value: "CHECK_1",
          text: "Demonstrate your attention by selecting 'A lot'. ",
        },

        {
          value: "OCIR_10",
          text: "I feel I have to repeat certain numbers.",
        },
        {
          value: "OCIR_11",
          text:
            "I sometimes have to wash or clean myself simply because I feel contaminated.",
        },
        {
          value: "OCIR_12",
          text:
            "I am upset by unpleasant thoughts that come into my mind against my will.",
        },
        {
          value: "OCIR_13",
          text:
            "I avoid throwing things away because I am afraid I might need them later.",
        },
        {
          value: "OCIR_14",
          text:
            "I repeatedly check gas and water taps and light switches after turning them off.",
        },
        {
          value: "OCIR_15",
          text: "I need things to be arranged in a particular way.",
        },
        {
          value: "OCIR_16",
          text: "I feel that there are good and bad numbers.",
        },
        {
          value: "OCIR_17",
          text: "I wash my hands more often and longer than necessary.",
        },
        {
          value: "OCIR_18",
          text:
            "I frequently get nasty thoughts and have difficulty in getting rid of them.",
        },
      ],
    };

    let quiz2 = {
      type: "matrix",
      name: "STAI_Y2",
      isAllRowRequired: true,
      title:
        "Read each statement and then indicate how you GENERALLY feel. There is no right or wrong answer. Do not spend too much time on any one statement but give the answer which seems to describe how you GENERALLY feel.",
      columns: [
        { value: 1, text: "Almost Never" },
        { value: 2, text: "Sometimes" },
        { value: 3, text: "Often" },
        { value: 4, text: "Almost Always" },
      ],
      rows: [
        { value: "STAI_21", text: "I feel pleasant." },
        { value: "STAI_22", text: "I feel nervous and restless." },
        { value: "STAI_23", text: "I feel satisfied with myself." },
        {
          value: "STAI_24",
          text: "I wish I could be as happy as others seem to be.",
        },
        { value: "STAI_25", text: "I feel like a failure." },
        { value: "STAI_26", text: "I feel rested." },
        { value: "STAI_27", text: "I am calm, cool, and collected." },
        {
          value: "STAI_28",
          text:
            "I feel that difficulties are piling up so that I cannot overcome them.",
        },
        {
          value: "STAI_29",
          text: "I worry too much over something that really doesn’t matter.",
        },
        { value: "STAI_30", text: "I am happy." },
        { value: "STAI_31", text: "I have disturbing thoughts." },
        { value: "STAI_32", text: "I lack self confidence." },
        { value: "STAI_33", text: "I feel secure." },
        { value: "STAI_34", text: "I make decisions easily." },
        { value: "STAI_35", text: "I feel inadequate." },
        { value: "STAI_36", text: "I am content." },
        {
          value: "STAI_37",
          text:
            "Some unimportant thoughts runs through my mind and bothers me.",
        },
        {
          value: "STAI_38",
          text:
            "I take disappointments so keenly that I can’t put them out of my mind.",
        },
        { value: "STAI_39", text: "I am a steady person." },
        {
          value: "STAI_40",
          text:
            "I get in a state of tension or turmoil as I think over my recent concerns and interests.",
        },
      ],
    };

    let quiz3 = {
      type: "matrix",
      name: "STAI_Y1",
      isAllRowRequired: true,
      title:
        "Read each statement and select the appropriate response to indicate how you feel RIGHT NOW, that is, at this very moment. There are no right or wrong answers. Do not spend too much time on any one statement but give the answer which seems to describe your PRESENT feelings best.",
      columns: [
        { value: 1, text: "Not At All" },
        { value: 2, text: "A Little" },
        { value: 3, text: "Somewhat" },
        { value: 4, text: "Very Much So" },
      ],
      rows: [
        { value: "STAI_1", text: "I feel calm." },
        { value: "STAI_2", text: "I feel secure." },
        { value: "STAI_3", text: "I feel tense." },
        { value: "STAI_4", text: "I feel strained." },
        { value: "STAI_5", text: "I feel at ease." },
        { value: "STAI_6", text: "I feel upset." },
        {
          value: "STAI_7",
          text: "I am presently worrying over possible misfortunes.",
        },
        { value: "STAI_8", text: "I feel satisfied." },
        { value: "STAI_9", text: "I feel frightened." },
        { value: "STAI_10", text: "I feel uncomfortable." },
        { value: "STAI_11", text: "I feel self confident." },
        { value: "STAI_12", text: "I feel nervous." },
        { value: "STAI_13", text: "I feel jittery." },
        { value: "STAI_14", text: "I feel indecisive." },
        { value: "STAI_15", text: "I am relaxed." },
        { value: "STAI_16", text: "I am content." },
        { value: "STAI_17", text: "I am worried." },
        { value: "STAI_18", text: "I feel confused." },
        { value: "STAI_19", text: "I feel steady." },
        { value: "STAI_20", text: "I feel pleasant." },
      ],
    };

    var allQuizText = [quiz1, quiz2, quiz3];
    var quizLabel = this.state.quizLabel;

    shuffleSingle(shuffleDouble);

    this.setState({
      qnText1: allQuizText[0],
      qnText2: allQuizText[1],
      qnText3: allQuizText[2],
      quizLabel: quizLabel,
    });
  }

  handleBegin(key_pressed) {
    var whichButton = key_pressed;
    if (whichButton === 10) {
      setTimeout(
        function () {
          this.startQuiz();
        }.bind(this),
        0
      );
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
      default:
    }
  };

  render() {
    let text;
    if (this.state.currentquiz === false) {
      this.useEffect();
      document.addEventListener("keyup", this._handleBeginKey);
      //intructions
      text = (
        <div className={styles.spaceship}>
          <div className={styles.main}>
            <p>
              <span className={styles.center}>
                <strong>QUIZ</strong>
              </span>
              <br />
              Congratulations on reaching our destination!
              <br />
              <br />
              For the last section, we would like you to provide some
              demographic information (age and gender) and complete{" "}
              {this.state.qnTotal} questionnaires.
              <br />
              <br />
              Do read the instructions for each quiz, which will be positioned
              at the top of each page, carefully.
              <br />
              <br />
              If you are ready, click START to begin.
              <br />
              <br />
              <span className={styles.centerTwo}>
                Please press <strong>SPACEBAR</strong> to try again.
              </span>
            </p>
            <span className={styles.astro}>
              <img src={astrodude} alt="astrodude" />
            </span>
          </div>{" "}
        </div>
      );
    } else {
      //the quiz
      var json = {
        title: null,
        showProgressBar: "top",
        pages: [
          {
            questions: [
              {
                type: "dropdown",
                name: "age",
                title: "What is your age?",
                isRequired: true,
                colCount: 0,
                choices: [
                  "18",
                  "19",
                  "20",
                  "21",
                  "22",
                  "23",
                  "24",
                  "25",
                  "26",
                  "27",
                  "28",
                  "29",
                  "30",
                  "31",
                  "32",
                  "33",
                  "34",
                  "35",
                  "36",
                  "37",
                  "38",
                  "39",
                  "40",
                ],
              },
              {
                type: "dropdown",
                name: "gender",
                title: "What is your gender?",
                isRequired: true,
                colCount: 0,
                choices: ["Female", "Male", "Other"],
              },
            ],
          },
          {
            questions: [this.state.qnText1],
          },

          {
            questions: [this.state.qnText2],
          },

          {
            questions: [this.state.qnText3],
          },
        ],
      };

      text = (
        <div>
          <Survey.Survey
            json={json}
            css={myCss}
            onComplete={this.onComplete.bind(this)}
            onCurrentPageChanged={this.timerCallback.bind(this)}
          />
        </div>
      );
    }

    return <div>{text}</div>;
  }
}
export default Questionnaires;
