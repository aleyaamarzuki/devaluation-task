import React, { Component } from "react";
import * as Quest from "survey-react";
import "survey-react/survey.css";
import styles from "./style/taskStyle.module.css";
// import questStyles from "./style/questStyle.module.css";
import { DATABASE_URL } from "./config";

import "./style/questStyle.css";

import astrodude from "./images/astronaut.png";

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

    //when deug
    // const userID = 100;
    // const date = 100;
    // const startTime = 100;
    // const journeyOneContin = 100;
    // const journeyOneContinStim = 100;
    // const journeyOneContinFbProb = 100;
    // const journeyTwoContin = 100;
    // const journeyTwoContinStim = 100;
    // const journeyTwoContinFbProb = 100;
    // const journeyThreeContin = 100;
    // const journeyThreeContinStim = 100;
    // const journeyThreeContinFbProb = 100;

    var currTime = Math.round(performance.now());

    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,
      resultAsString: {},
      currentquiz: false,
      qnStart: currTime,
      qnTime: currTime,
      qnTotal: 7,
      quizLabel: ["OCIR", "STAI_Y2", "STAI_Y1", "BIS11", "SDS", "ASI3", "BEAQ"],
      qnText1: [],
      qnText2: [],
      qnText3: [],
      qnText4: [],
      qnText5: [],
      qnText6: [],
      qnText7: [],
      journeyOneContin: journeyOneContin,
      journeyOneContinStim: journeyOneContinStim,
      journeyOneContinFbProb: journeyOneContinFbProb,
      journeyTwoContin: journeyTwoContin,
      journeyTwoContinStim: journeyTwoContinStim,
      journeyTwoContinFbProb: journeyTwoContinFbProb,
      journeyThreeContin: journeyThreeContin,
      journeyThreeContinStim: journeyThreeContinStim,
      journeyThreeContinFbProb: journeyThreeContinFbProb,

      astrodude: astrodude,

      debug: false,
    };

    // this.onComplete = this.onComplete.bind(this);
    // this.startQuiz = this.startQuiz.bind(this);
    //  this.shuffleQn = this.shuffleQn.bind(this);

    this.handleDebugKeyLocal = this.handleDebugKeyLocal.bind(this);
  }

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

  /////

  //Define a callback methods on survey complete
  onComplete(survey, options) {
    // //Write survey results into database
    // var page = survey.currentPage;
    // var RT_valueName = "Pg_" + (survey.pages.indexOf(page) + 1);

    //last page
    var quizText = "IQ_image";
    var valueName = "PgFinish_" + quizText;
    var valueName2 = "PgRT_" + quizText;

    var qnTime = Math.round(performance.now());
    var qnRT = qnTime - this.state.qnTime;
    survey.setValue(valueName, qnTime);
    survey.setValue(valueName2, qnRT);

    var qnEnd = Math.round(performance.now());
    var userID = this.state.userID;
    survey.setValue("userID", userID);
    survey.setValue("date", this.state.date);
    survey.setValue("startTime", this.state.startTime);
    survey.setValue("qnTimeStart", this.state.qnStart);
    survey.setValue("qnTimeEnd", qnEnd);

    var resultAsString = JSON.stringify(survey.data);
    //
    // console.log("resultAsString", resultAsString);

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
    // console.log("userID: " + userID);
    // console.log("Survey results: " + JSON.stringify(survey.data));

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
    //CHECK THIS!!!
    if (page === 0) {
      quizText = "intro";
    } else if (page === 1) {
      quizText = "demo";
    } else if (page === 9) {
      quizText = "IQ_text";
    } else if (page === 10) {
      quizText = "IQ_image";
    } else {
      quizText = this.state.quizLabel[page - 2];
    }

    var valueName = "PgFinish_" + quizText;
    var valueName2 = "PgRT_" + quizText;
    var qnTime = Math.round(performance.now());
    var qnRT = qnTime - this.state.qnTime;
    survey.setValue(valueName, qnTime);
    survey.setValue(valueName2, qnRT);

    console.log(quizText);
    console.log(valueName);
    console.log(valueName2);
    console.log(survey.data);

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
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleDebugKey);
    this.props.history.push({
      pathname: `/EndPage`,
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,

        journeyOneContin: this.state.journeyOneContin,
        journeyOneContinStim: this.state.journeyOneContinStim,
        journeyOneContinFbProb: this.state.journeyOneContinFbProb,

        journeyTwoContin: this.state.journeyTwoContin,
        journeyTwoContinStim: this.state.journeyTwoContinStim,
        journeyTwoContinFbProb: this.state.journeyTwoContinFbProb,

        journeyThreeContin: this.state.journeyThreeContin,
        journeyThreeContinStim: this.state.journeyThreeContinStim,
        journeyThreeContinFbProb: this.state.journeyThreeContinFbProb,
      },
    });
  }

  shuffleQn() {
    let quiz1 = {
      type: "matrix",
      name: "OCIR",
      isAllRowRequired: true,
      // the translation below was taken the official german version of OCI-R. Meng's translation
      title:
        "Bitte geben Sie an, wie stark Sie im VERGANGENEN MONAT durch eine der folgenden Verhaltens- oder Erlebensweise beeinträchtigt waren oder unter ihr gelitten haben. (Bitte scrollen Sie im Fragebogen nach unten.)",
      columns: [
        { value: 0, text: "gar nicht" },
        { value: 1, text: "wenig" },
        { value: 2, text: "mittel" },
        { value: 3, text: "stark" },
        { value: 4, text: "sehr stark" },
      ],
      rows: [
        {
          value: "OCIR_1",
          text: "Ich bewahre so viele Gegenstände auf, dass sie mich behindern.",
        },
        {
          value: "OCIR_2",
          text: "Ich kontrolliere Dinge öfter als notwendig.",
        },
        {
          value: "OCIR_3",
          text: "Ich werde unruhig, wenn Gegenstände nicht korrekt (an)geordnet sind.",
        },
        {
          value: "OCIR_4",
          text: "Bei vielen Aktivitäten fühle ich mich zum Zählen gezwungen.",
        },
        {
          value: "OCIR_5",
          text:
            "Es fällt mir schwer, einen Gegenstand anzufassen, wenn ich weiß, dass er schon von Fremden oder von bestimmten Personen berührt wurde.",
        },
        {
          value: "OCIR_6",
          text: "Es fällt mir schwer, meine eigenen Gedanken zu kontrollieren.",
        },
        {
          value: "OCIR_7",
          text: "Ich sammle Dinge, die ich nicht brauche.",
        },
        {
          value: "OCIR_8",
          text: "Ich kontrolliere wiederholt Türen, Fenster, Schubladen etc.",
        },
        {
          value: "OCIR_9",
          text:
            "Ich werde unruhig, wenn andere etwas daran ändern, wie ich die Dinge (an)geordnet habe.",
        },
        {
          value: "CHECK_1",
          text: "Zeigen Sie Ihre Aufmerksamkeit, indem Sie 'Viel' auswählen.",
        },
        {
          value: "OCIR_10",
          text: "Ich fühle mich gezwungen, bestimmte Zahlen zu wiederholen.",
        },
        {
          value: "OCIR_11",
          text:
            "Manchmal muss ich mich waschen oder reinigen, einfach weil ich glaube, verunreinigt oder verseucht zu sein.",
        },
        {
          value: "OCIR_12",
          text:
            "Ich fühle mich durch unangenehme Gedanken beunruhigt, die mir gegen meinen Willen in den Sinn kommen.",
        },
        {
          value: "OCIR_13",
          text:
            "Ich vermeide es, Sachen wegzuwerfen, da ich Angst habe, ich könnte sie vielleicht später noch brauchen.",
        },
        {
          value: "OCIR_14",
          text:
            "Ich kontrolliere wiederholt Gas-/Wasserhähne und Lichtschalter, nachdem ich sie zu-/ausgemacht habe.",
        },
        {
          value: "OCIR_15",
          text: "Für mich müssen Dinge in einer bestimmten Weise geordnet sein.",
        },
        {
          value: "OCIR_16",
          text: "Ich glaube, dass es gute und schlechte Zahlen gibt.",
        },
        {
          value: "OCIR_17",
          text: "Ich wasche meine Hände öfter und länger als nötig.",
        },
        {
          value: "OCIR_18",
          text:
            "Ich bekomme häufig abscheuliche Gedanken und es fällt mir schwer, sie wieder loszuwerden.",
        },
      ],
    };
    

    let quiz2 = {
      type: "matrix",
      name: "STAI_Y2",
      isAllRowRequired: true,
      title:
        "Read each statement and then indicate how you GENERALLY feel. There is no right or wrong answer. Do not spend too much time on any one statement but give the answer which seems to describe how you GENERALLY feel. (Please make sure to scroll down within the questionnaire box.)",
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
          text: "Some unimportant thoughts run through my mind and bother me.",
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
        "Read each statement and select the appropriate response to indicate how you feel RIGHT NOW, that is, at this very moment. There are no right or wrong answers. Do not spend too much time on any one statement but give the answer which seems to describe your PRESENT feelings best. (Please make sure to scroll down within the questionnaire box.)",
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

    let quiz4 = {
      type: "matrix",
      name: "BIS11",
      isAllRowRequired: true,
      title:
        "People differ in the ways they act and think in different situations. This is a test to measure some of the ways in which you act and think. Read each statement and select the answer that DESCRIBES YOU BEST. Do not spend too much time on any statement. Answer quickly and honestly. (Please make sure to scroll down within the questionnaire box.)",
      columns: [
        { value: 1, text: "Do not agree at all" },
        { value: 2, text: "Agree slightly" },
        { value: 3, text: "Agree a lot" },
        { value: 4, text: "Agree completely" },
      ],
      rows: [
        { value: "BIS_1", text: "I plan tasks carefully." },
        { value: "BIS_2", text: "I do things without thinking." },
        { value: "BIS_3", text: "I make-up my mind quickly." },
        { value: "BIS_4", text: "I am happy-go-lucky." },
        { value: "BIS_5", text: "I don’t 'pay attention'." },
        { value: "BIS_6", text: "I have 'racing' thoughts." },
        { value: "BIS_7", text: "I plan trips well ahead of time." },
        { value: "BIS_8", text: "I am self controlled." },
        { value: "BIS_9", text: "I concentrate easily." },
        { value: "BIS_10", text: "I save regularly." },
        { value: "BIS_11", text: "I 'squirm' at plays or lectures." },
        { value: "BIS_12", text: "I am a careful thinker." },
        { value: "BIS_13", text: "I plan for job security." },
        { value: "BIS_14", text: "I say things without thinking." },
        { value: "BIS_15", text: "I like to think about complex problems." },
        { value: "BIS_16", text: "I change jobs." },
        { value: "BIS_17", text: "I act 'on impulse'." },
        {
          value: "BIS_18",
          text: "I get easily bored when solving thought problems.",
        },
        { value: "BIS_19", text: "I act on the spur of the moment." },
        { value: "BIS_20", text: "I am a steady thinker." },
        { value: "BIS_21", text: "I change residences." },
        { value: "BIS_22", text: "I buy things on impulse." },
        {
          value: "BIS_23",
          text: "I can only think about one thing at a time.",
        },
        { value: "BIS_24", text: "I change hobbies." },
        { value: "BIS_25", text: "I spend or charge more than I earn." },
        {
          value: "BIS_26",
          text: "I often have extraneous thoughts when thinking.",
        },
        {
          value: "BIS_27",
          text: "I am more interested in the present than the future.",
        },
        { value: "BIS_28", text: "I am restless at the theater or lectures." },
        { value: "BIS_29", text: "I like puzzles." },
        { value: "BIS_30", text: "I am future oriented." },
      ],
    };

    let quiz5 = {
      type: "matrix",
      name: "SDS",
      isAllRowRequired: true,
      title:
        "Please read the following statements and then select the option that best describes how often you FELT OR BEHAVED this way during the PAST SEVERAL DAYS. (Please make sure to scroll down within the questionnaire box.)",
      columns: [
        { value: 1, text: "A little of the time" },
        { value: 2, text: "Some of the time" },
        { value: 3, text: "Good part of the time" },
        { value: 4, text: "Most of the time" },
      ],
      rows: [
        { value: "SDS_1", text: "I feel down-hearted and blue." },
        { value: "SDS_2", text: "Morning is when I feel the best." },
        { value: "SDS_3", text: "I have crying spells or feel like it." },
        { value: "SDS_4", text: "I have trouble sleeping at night." },
        { value: "SDS_5", text: "I eat as much as I used to." },
        { value: "SDS_6", text: "I still enjoy sex." },
        { value: "SDS_7", text: "I notice that I am losing weight." },
        { value: "SDS_8", text: "I have trouble with constipation." },
        { value: "SDS_9", text: "My heart beats faster than normal." },
        { value: "SDS_10", text: "I get tired for no reason." },
        { value: "SDS_11", text: "My mind is as clear as it used to be." },
        {
          value: "SDS_12",
          text: "I find it easy to do the things I used to do.",
        },
        { value: "SDS_13", text: "I am restless and can't keep still." },
        { value: "SDS_14", text: "I feel hopeful about the future." },
        { value: "SDS_15", text: "I am more irritable than usual." },
        { value: "SDS_16", text: "I find it easy to make decisions." },
        { value: "SDS_17", text: "I feel that I am useful and needed." },
        {
          value: "SDS_18",
          text: "My life is pretty full.",
        },
        {
          value: "SDS_19",
          text: "I feel that others would be better off if I were dead.",
        },
        { value: "SDS_20", text: "I still enjoy the things I used to do." },
      ],
    };

    let quiz6 = {
      type: "matrix",
      name: "ASI3",
      isAllRowRequired: true,
      title:
        "Please choose the response that best corresponds to how much you agree with each item. If any items concern something that you have never experienced (e.g., fainting in public) answer on the basis of how you think you might feel if you had such an experience. Otherwise, answer all items on the basis of your own experience. (Please make sure to scroll down within the questionnaire box.)",
      columns: [
        { value: 0, text: "Very little" },
        { value: 1, text: "A little" },
        { value: 2, text: "Some" },
        { value: 3, text: "Much" },
        { value: 4, text: "Very much" },
      ],
      rows: [
        {
          value: "ASI_1",
          text: "It is important for me not to appear nervous.",
        },
        {
          value: "ASI_2",
          text:
            "When I cannot keep my mind on a task, I worry that I might be going crazy.",
        },
        {
          value: "ASI_3",
          text: "It scares me when my heart beats rapidly.",
        },
        {
          value: "ASI_4",
          text:
            "When my stomach is upset, I worry that I might be seriously ill.",
        },
        {
          value: "ASI_5",
          text: "It scares me when I am unable to keep my mind on a task.",
        },
        {
          value: "ASI_6",
          text:
            "When I tremble in the presence of others, I fear what people might think of me.",
        },
        {
          value: "ASI_7",
          text:
            "When my chest feels tight, I get scared that I won’t be able to breathe properly.",
        },
        {
          value: "ASI_8",
          text:
            "When I feel pain in my chest, I worry that I’m going to have a heart attack.",
        },
        {
          value: "ASI_9",
          text: "I worry that other people will notice my anxiety",
        },
        {
          value: "ASI_10",
          text:
            "When I feel “spacey” or spaced out I worry that I may be mentally ill.",
        },
        {
          value: "ASI_11",
          text: "It scares me when I blush in front of people.",
        },
        {
          value: "ASI_12",
          text:
            "When I notice my heart skipping a beat, I worry that there is something seriously wrong with me.",
        },
        {
          value: "ASI_13",
          text:
            "When I begin to sweat in a social situation, I fear people will think negatively of me.",
        },
        {
          value: "ASI_14",
          text:
            "When my thoughts seem to speed up, I worry that I might be going crazy.",
        },
        {
          value: "ASI_15",
          text:
            "When my throat feels tight, I worry that I could choke to death.",
        },
        {
          value: "ASI_16",
          text:
            "When I have trouble thinking clearly, I worry that there is something wrong with me.",
        },
        {
          value: "ASI_17",
          text: "I think it would be horrible for me to faint in public.",
        },
        {
          value: "ASI_18",
          text:
            "When my mind goes blank, I worry there is something terribly wrong with me.",
        },
      ],
    };

    let quiz7 = {
      type: "matrix",
      name: "BEAQ",
      isAllRowRequired: true,
      title:
        "Please indicate the extent to which you agree or disagree with each of the following statements. (Please make sure to scroll down within the questionnaire box.)",
      columns: [
        { value: 1, text: "Strongly disagree" },
        { value: 2, text: "Disagree" },
        { value: 3, text: "Disagree a little" },
        { value: 4, text: "Agree a little" },
        { value: 5, text: "Agree" },
        { value: 6, text: "Strongly agree" },
      ],
      rows: [
        {
          value: "BEAQ_1",
          text: "The key to a good life is never feeling any pain.",
        },
        {
          value: "BEAQ_2",
          text: "I’m quick to leave any situation that makes me feel uneasy.",
        },
        {
          value: "BEAQ_3",
          text:
            "When unpleasant memories come to me, I try to put them out of my mind.",
        },
        {
          value: "BEAQ_4",
          text: "I feel disconnected from my emotions.",
        },
        {
          value: "BEAQ_5",
          text: "I won’t do something until I absolutely have to.",
        },
        {
          value: "BEAQ_6",
          text: "Fear or anxiety won’t stop me from doing something important.",
        },
        {
          value: "BEAQ_7",
          text: "I would give up a lot not to feel bad.",
        },
        {
          value: "BEAQ_8",
          text:
            "I rarely do something if there is a chance that it will upset me.",
        },
        {
          value: "BEAQ_9",
          text: "It’s hard for me to know what I’m feeling.",
        },
        {
          value: "BEAQ_10",
          text: "I try to put off unpleasant tasks for as long as possible.",
        },
        {
          value: "BEAQ_11",
          text: "I go out of my way to avoid uncomfortable situations.",
        },
        {
          value: "CHECK_2",
          text: "Select 'Strongly Disgree'.",
        },
        {
          value: "BEAQ_12",
          text: "One of my big goals is to be free from painful emotions.",
        },
        {
          value: "BEAQ_13",
          text: "I work hard to keep out upsetting feelings.",
        },
        {
          value: "BEAQ_14",
          text:
            "If I have any doubts about doing something, I just won’t do it.",
        },
        {
          value: "BEAQ_15",
          text: "Pain always leads to suffering.",
        },
      ],
    };

    var allQuizText = [quiz1, quiz2, quiz3, quiz4, quiz5, quiz6, quiz7];
    var quizLabel = this.state.quizLabel;

    shuffleDouble(allQuizText, quizLabel);

    allQuizText = allQuizText.filter(function (val) {
      return val !== undefined;
    });
    quizLabel = quizLabel.filter(function (val) {
      return val !== undefined;
    });

    this.setState({
      qnText1: allQuizText[0],
      qnText2: allQuizText[1],
      qnText3: allQuizText[2],
      qnText4: allQuizText[3],
      qnText5: allQuizText[4],
      qnText6: allQuizText[5],
      qnText7: allQuizText[6],
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
    if (this.state.debug === false) {
      if (this.state.currentquiz === false) {
        this.useEffect();
        document.addEventListener("keyup", this._handleBeginKey);
        //intructions
        text = (
          <div className={styles.spaceship}>
            <div className={styles.main}>
              <span className={styles.likeP}>
                <span className={styles.center}>
                  <strong>QUIZ</strong>
                </span>
                <br />
                Congratulations on reaching our destination!
                <br />
                <br />
                For the last section, we would like you to:
                <ul>
                  <li>Provide some demographic information (age and gender)</li>
                  <li>Complete {this.state.qnTotal} questionnaires</li>
                  <li>Complete a short IQ quiz</li>
                </ul>
                Do read the instructions for each quiz, which will be positioned
                at the top of each page, carefully.
                <br />
                <br />
                <span className={styles.centerTwo}>
                  Please press <strong>SPACEBAR</strong> to begin.
                </span>
              </span>
              <span className={styles.astro}>
                <img src={this.state.astrodude} alt="astrodude" />
              </span>
            </div>
          </div>
        );
      } else {
        //the quiz
        document.removeEventListener("keyup", this._handleBeginKey);
        Quest.StylesManager.applyTheme("default");

        var myCss = {
          matrix: {
            // root: "table table-striped",
            root: "table sv_q_matrix",
          },
        };

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
                    "41",
                    "42",
                    "43",
                    "44",
                    "45",
                    "46",
                    "47",
                    "48",
                    "49",
                    "50",
                    "51",
                    "52",
                    "53",
                    "54",
                    "55",
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

            {
              questions: [this.state.qnText4],
            },

            {
              questions: [this.state.qnText5],
            },
            {
              questions: [this.state.qnText6],
            },
            {
              questions: [this.state.qnText7],
            },
            {
              questions: [
                {
                  type: "radiogroup",
                  name: "IQ_1",
                  isRequired: true,
                  title:
                    "What number is one fifth of one fourth of one ninth of 900?",
                  //colCount: 4,
                  choices: [
                    { value: 1, text: "2" },
                    { value: 2, text: "3" },
                    { value: 3, text: "4" },
                    { value: 4, text: "5" },
                    { value: 5, text: "6" },
                    { value: 6, text: "7" },
                  ],
                },

                {
                  type: "radiogroup",
                  name: "IQ_2",
                  isRequired: true,
                  title:
                    "Zach is taller than Matt and Richard is shorter than Zach. Which of the following statements would be the most accurate?",
                  choices: [
                    { value: 1, text: "Richard is taller than Matt" },
                    { value: 2, text: "Richard is shorter than Matt" },
                    { value: 3, text: "Richard is as tall as Matt" },
                    { value: 4, text: "It's impossible to tell" },
                  ],
                },

                {
                  type: "radiogroup",
                  name: "IQ_3",
                  isRequired: true,
                  title:
                    "Joshua is 12 years old and his sister is three times as old as he. When Joshua is 23 years old, how old will his sister be?",
                  choices: [
                    { value: 1, text: "25" },
                    { value: 2, text: "39" },
                    { value: 3, text: "44" },
                    { value: 4, text: "47" },
                    { value: 5, text: "53" },
                  ],
                },

                {
                  type: "radiogroup",
                  name: "IQ_4",
                  isRequired: true,
                  title:
                    "If the day after tomorrow is two days before Thursday then what day is it today?",
                  choices: [
                    { value: 1, text: "Friday" },
                    { value: 2, text: "Monday" },
                    { value: 3, text: "Wednesday" },
                    { value: 4, text: "Saturday" },
                    { value: 5, text: "Tuesday" },
                    { value: 6, text: "Sunday" },
                  ],
                },

                {
                  type: "radiogroup",
                  name: "IQ_5",
                  isRequired: true,
                  title:
                    "In the following alphanumeric series, what letter comes next? K N P S U ...?",
                  choices: [
                    { value: 1, text: "S" },
                    { value: 2, text: "T" },
                    { value: 3, text: "U" },
                    { value: 4, text: "V" },
                    { value: 5, text: "W" },
                    { value: 6, text: "X" },
                  ],
                },

                {
                  type: "radiogroup",
                  name: "IQ_6",
                  isRequired: true,
                  title:
                    "In the following alphanumeric series, what letter comes next? V Q M J H ...?",
                  choices: [
                    { value: 1, text: "E" },
                    { value: 2, text: "F" },
                    { value: 3, text: "G" },
                    { value: 4, text: "H" },
                    { value: 5, text: "I" },
                    { value: 6, text: "J" },
                  ],
                },

                {
                  type: "radiogroup",
                  name: "IQ_7",
                  isRequired: true,
                  title:
                    "In the following alphanumeric series, what letter comes next? I J L O S ...?",
                  choices: [
                    { value: 1, text: "T" },
                    { value: 2, text: "U" },
                    { value: 3, text: "V" },
                    { value: 4, text: "X" },
                    { value: 5, text: "Y" },
                    { value: 6, text: "Z" },
                  ],
                },

                {
                  type: "radiogroup",
                  name: "IQ_8",
                  isRequired: true,
                  title:
                    "In the following alphanumeric series, what letter comes next? Q S N P L ...?",
                  choices: [
                    { value: 1, text: "J" },
                    { value: 2, text: "H" },
                    { value: 3, text: "I" },
                    { value: 4, text: "N" },
                    { value: 5, text: "M" },
                    { value: 6, text: "L" },
                  ],
                },
              ],
            },

            // IQ images
            {
              questions: [
                {
                  type: "html",
                  name: "info",
                  html:
                    "<table><body></br></br></br></br><img src='/icar/mx45_q.jpg' width='230px'/></br></br></br> </td><img src='/icar/mx45_a.jpg' width='460px'/></body></table>",
                },
                {
                  type: "radiogroup",
                  name: "IQimage_1",
                  isRequired: true,
                  title: "Which figure fits into the missing slot?",
                  choices: [
                    { value: 1, text: "A" },
                    { value: 2, text: "B" },
                    { value: 3, text: "C" },
                    { value: 4, text: "D" },
                    { value: 5, text: "E" },
                    { value: 6, text: "F" },
                  ],
                },

                {
                  type: "html",
                  name: "info",
                  html:
                    "<table><body></br></br></br></br><img src='/icar/mx46_q.jpg' width='230px'/></br></br></br> </td><img src='/icar/mx46_a.jpg' width='460px'/></body></table>",
                },
                {
                  type: "radiogroup",
                  name: "IQimage_2",
                  isRequired: true,
                  title: "Which figure fits into the missing slot?",
                  choices: [
                    { value: 1, text: "A" },
                    { value: 2, text: "B" },
                    { value: 3, text: "C" },
                    { value: 4, text: "D" },
                    { value: 5, text: "E" },
                    { value: 6, text: "F" },
                  ],
                },

                {
                  type: "html",
                  name: "info",
                  html:
                    "<table><body></br></br></br></br><img src='/icar/mx47_q.jpg' width='230px'/></br></br></br> </td><img src='/icar/mx47_a.jpg' width='460px'/></body></table>",
                },
                {
                  type: "radiogroup",
                  name: "IQimage_3",
                  isRequired: true,
                  title: "Which figure fits into the missing slot?",
                  choices: [
                    { value: 1, text: "A" },
                    { value: 2, text: "B" },
                    { value: 3, text: "C" },
                    { value: 4, text: "D" },
                    { value: 5, text: "E" },
                    { value: 6, text: "F" },
                  ],
                },

                {
                  type: "html",
                  name: "info",
                  html:
                    "<table><body></br></br></br></br><img src='/icar/mx55_q.jpg' width='230px'/></br></br></br> </td><img src='/icar/mx55_a.jpg' width='460px'/></body></table>",
                },
                {
                  type: "radiogroup",
                  name: "IQimage_4",
                  isRequired: true,
                  title: "Which figure fits into the missing slot?",
                  choices: [
                    { value: 1, text: "A" },
                    { value: 2, text: "B" },
                    { value: 3, text: "C" },
                    { value: 4, text: "D" },
                    { value: 5, text: "E" },
                    { value: 6, text: "F" },
                  ],
                },

                {
                  type: "html",
                  name: "info",
                  html:
                    "<table><body></br></br></br></br><img src='/icar/rsd3_q.jpg' width='550px'/></body></table>",
                },
                {
                  type: "radiogroup",
                  name: "IQimage_5",
                  isRequired: true,
                  title:
                    "All the cubes above have a different image on each side. Select the choice that represents a rotation of the cube labeled X.",
                  choices: [
                    { value: 1, text: "A" },
                    { value: 2, text: "B" },
                    { value: 3, text: "C" },
                    { value: 4, text: "D" },
                    { value: 5, text: "E" },
                    { value: 6, text: "F" },
                    { value: 7, text: "G" },
                    { value: 8, text: "H" },
                  ],
                },

                {
                  type: "html",
                  name: "info",
                  html:
                    "<table><body></br></br></br></br><img src='/icar/rsd4_q.jpg' width='550px'/></body></table>",
                },
                {
                  type: "radiogroup",
                  name: "IQimage_6",
                  isRequired: true,
                  title:
                    "All the cubes above have a different image on each side. Select the choice that represents a rotation of the cube labeled X.",
                  choices: [
                    { value: 1, text: "A" },
                    { value: 2, text: "B" },
                    { value: 3, text: "C" },
                    { value: 4, text: "D" },
                    { value: 5, text: "E" },
                    { value: 6, text: "F" },
                    { value: 7, text: "G" },
                    { value: 8, text: "H" },
                  ],
                },

                {
                  type: "html",
                  name: "info",
                  html:
                    "<table><body></br></br></br></br><img src='/icar/rsd6_q.jpg' width='550px'/></body></table>",
                },
                {
                  type: "radiogroup",
                  name: "IQimage_7",
                  isRequired: true,
                  title:
                    "All the cubes above have a different image on each side. Select the choice that represents a rotation of the cube labeled X.",
                  choices: [
                    { value: 1, text: "A" },
                    { value: 2, text: "B" },
                    { value: 3, text: "C" },
                    { value: 4, text: "D" },
                    { value: 5, text: "E" },
                    { value: 6, text: "F" },
                    { value: 7, text: "G" },
                    { value: 8, text: "H" },
                  ],
                },

                {
                  type: "html",
                  name: "info",
                  html:
                    "<table><body></br></br></br></br><img src='/icar/rsd8_q.jpg' width='550px'/></body></table>",
                },
                {
                  type: "radiogroup",
                  name: "IQimage_8",
                  isRequired: true,
                  title:
                    "All the cubes above have a different image on each side. Select the choice that represents a rotation of the cube labeled X.",
                  choices: [
                    { value: 1, text: "A" },
                    { value: 2, text: "B" },
                    { value: 3, text: "C" },
                    { value: 4, text: "D" },
                    { value: 5, text: "E" },
                    { value: 6, text: "F" },
                    { value: 7, text: "G" },
                    { value: 8, text: "H" },
                  ],
                },
              ],
            },
          ],
        };

        text = (
          <div className="placeMiddle">
            <Quest.Survey
              json={json}
              css={myCss}
              onComplete={this.onComplete.bind(this)}
              onCurrentPageChanged={this.timerCallback.bind(this)}
            />
          </div>
        );
      }
    } else if (this.state.debug === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div className={styles.main}>
          <p>
            <span className={styles.center}>DEBUG MODE</span>
            <br />

            <span className={styles.centerTwo}>
              Press the [<strong>SPACEBAR</strong>] to skip to next section.
            </span>
          </p>
        </div>
      );
    }
    return <div>{text}</div>;
  }
}
export default Questionnaires;
