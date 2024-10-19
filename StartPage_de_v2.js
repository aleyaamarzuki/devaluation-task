import React from "react";
import { withRouter } from "react-router-dom";
import * as Consent from "survey-react";
import "../../node_modules/survey-react/survey.css";
import "./style/startStyle.css";
import queryString from "query-string";

// Edit: 16/08/2021: Add in pre-load and caching of images here
import fix from "./images/fixation-white-small.png";
import stimTrain1 from "./images/yellow_planet.png";
import stimTrain2 from "./images/army_planet.png";
import counter from "./images/planet_counter.png";

import fbAver from "./images/bad.png";
import fbSafe from "./images/good.png";
import fbAvoid from "./images/neutral.png";
import astrodude from "./images/astronaut.png";

import stim1 from "./images/blue_planet.png";
import stim2 from "./images/light_green_planet.png";
import stim3 from "./images/pink_planet.png";
import stim4 from "./images/red_planet.png";
import stim5 from "./images/black_planet.png";
import stim6 from "./images/white_planet.png";

class StartPage extends React.Component {
  constructor(props) {
    super(props);

    // Get data and time
    var dateTime = new Date().toLocaleString();

    var currentDate = new Date(); // maybe change to local
    var date = currentDate.getDate();
    var month = currentDate.getMonth(); //Be careful! January is 0 not 1
    var year = currentDate.getFullYear();
    var dateString = date + "-" + (month + 1) + "-" + year;
    var timeString = currentDate.toTimeString();

    // Gen a random 6 digit number for now
    // var prolific_id = Math.floor(100000 + Math.random() * 900000);
    // var prolific_id = 120000; //for testing

    let url = this.props.location.search;
    let params = queryString.parse(url);
    const prolific_id =
      params["USER_PID"] === undefined ? "undefined" : params["USER_PID"];
    console.log(prolific_id);

    // Set state
    this.state = {
      //    userID: userID,
      userID: prolific_id,
      date: dateString,
      dateTime: dateTime,
      startTime: timeString,
      consentComplete: 0,

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
    };

    // update State when consent is complete
    this.redirectToTarget = this.redirectToTarget.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);

    var fix = this.state.fix;
    var stimTrain1 = this.state.stimTrain1;
    var stimTrain2 = this.state.stimTrain2;
    var counter = this.state.counter;
    var fbAver = this.state.fbAver;
    var fbSafe = this.state.fbSafe;
    var fbAvoid = this.state.fbAvoid;
    var astrodude = this.state.astrodude;

    var stim1 = this.state.stim1;
    var stim2 = this.state.stim2;
    var stim3 = this.state.stim3;
    var stim4 = this.state.stim4;
    var stim5 = this.state.stim5;
    var stim6 = this.state.stim6;

    [fix].forEach((image) => {
      new Image().src = image;
    });
    [stimTrain1].forEach((image) => {
      new Image().src = image;
    });
    [stimTrain2].forEach((image) => {
      new Image().src = image;
    });
    [counter].forEach((image) => {
      new Image().src = image;
    });
    [fbAver].forEach((image) => {
      new Image().src = image;
    });
    [fbSafe].forEach((image) => {
      new Image().src = image;
    });

    [fbAvoid].forEach((image) => {
      new Image().src = image;
    });
    [astrodude].forEach((image) => {
      new Image().src = image;
    });
    [stim1].forEach((image) => {
      new Image().src = image;
    });
    [stim2].forEach((image) => {
      new Image().src = image;
    });
    [stim3].forEach((image) => {
      new Image().src = image;
    });
    [stim4].forEach((image) => {
      new Image().src = image;
    });
    [stim5].forEach((image) => {
      new Image().src = image;
    });
    [stim6].forEach((image) => {
      new Image().src = image;
    });

    this.setState({
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
      mounted: 1,
    });
  }

  redirectToTarget() {
    this.setState({
      consentComplete: 1,
    });

    this.props.history.push({
      pathname: `/HeadphoneCheck`,
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,

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

    console.log("UserID is: " + this.state.userID);
  }

  render() {
    Consent.StylesManager.applyTheme("default");

    var json1 = {
      title: null,
      pages: [
        {
          questions: [
            { type: "html", name: "info", html: "" },
            {
              type: "html",
              name: "info",
              html: "<b>Wer leitet diese Forschungsstudie?</b>",
              //Meng's translation
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>Diese Forschung wird von der Abteilung für Psychiatrie und Psychotherapie und dem Universitätsklinikum Tübingen durchgeführt. Die Studienleiter für dieses Projekt sind Frau Dr. Aleya Marzuki (Wissenschaftliche Mitarbeiterin, aleya.marzuki@uni-tuebingen.de) und Herr Prof. Tobias Hauser (Gruppenleiter, tobias.hauser@uni-tuebingen.de). Diese Studie wurde von der Ethikkomission des the Universitätsklinikums Tübingen genehmigt (Ethiknummer 336/2024BO1).</p>",
            //Meng's translation
            },
          ],
        },
        {
          questions: [
            {
              type: "checkbox",
              name: "checkbox1",
              title:
                "Ich habe die obigen Informationen gelesen und verstehe den Inhalt der Studie.",
                //Meng's translation
              isRequired: true,
              choices: ["Ja"],
            },
          ],
        },
      ],
    };

    // Full consent form version change json2 to json
    var json = {
      title: null,
      pages: [
        {
          questions: [
            { type: "html", name: "info", html: "" },
            {
              type: "html",
              name: "info",
              html: "<b>Wer leitet diese Forschungsstudie?</b>",
            },

            {
              type: "html",
              name: "info",
              html:
              //Meng's translation
                "<p>Diese Forschung wird von der Abteilung für Psychiatrie und Psychotherapie und dem Universitätsklinikum Tübingen durchgeführt. Die Studienleiter für dieses Projekt sind Frau Dr. Aleya Marzuki (Wissenschaftliche Mitarbeiterin, aleya.marzuki@uni-tuebingen.de) und Herr Prof. Tobias Hauser (Gruppenleiter, tobias.hauser@uni-tuebingen.de). Diese Studie wurde von der Ethikkomission des the Universitätsklinikums Tübingen genehmigt (Ethiknummer 336/2024BO1).</p>",
            },

            {
              type: "html",
              name: "info",
              //Meng's translation
              html: "<b>Was ist das Ziel der Studie?</b>",
            },

            {
              type: "html",
              name: "info",
              html:
              //Meng's translation
                "<p>Wir möchten verstehen, wie das Gehirn Lernen und Entscheidungsfindung steuert. Ziel dieser Studie ist es, Einblicke in die Funktionsweise eines gesunden Gehirns zu gewinnen, um die Ursachen verschiedener psychischen Erkrankungen besser zu verstehen.</p>",
            },

            {
              type: "html",
              name: "info",
              //Meng's translation
              html: "<b>Wer kann an der Studie teilnehmen?</b>",
            },

            {
              type: "html",
              name: "info",
              //Meng's translation
              html:
                "<p>Teilnehmen können Personen im Alter von <strong>13 bis 60 Jahren</strong>, die <strong>fließend Deutsch oder Englisch sprechen</strong> und <strong>normales oder korrigiertes Sehvermögen</strong> haben. Die Teilnehmer sollten zudem <strong>KEINE auditiven oder ohrenbezogenen Erkrankungen</strong> haben, wie zum Beispiel: <ul><li>Tinnitus in der Vergangenheit oder aktuell</li><li>Überempfindlichkeit des Gehörs (z.B. Hyperakusis) in der Vergangenheit oder aktuell</li><li>Hörverlust in der Vergangenheit oder akutell</li><li>Nutzung von Hörgeräten in der Vergangenheit oder aktuell</li><li>sowie Ohrenentzündungen oder-infektionen</li></ul>Wenn Sie an dieser Studie teilnehmen möchten, bestätigen Sie, dass Sie diese Kriterien erfüllen.</p>"
            },
            
            {
              type: "html",
              name: "info",
              html: "<b>Was passiert mit mir, wenn ich teilnehme?</b>"
            },
            
            {
              type: "html",
              name: "info",
              //Meng's translation
              html:
                "<p>In dieser Sitzung werden Sie ein Online-Computerspiel spielen, das ungefähr <strong>1 Stunde</strong> dauern wird. <br/><br/>Während des Computerspiels werden Sie kurze, unangenehme Geräusche hören. Vor Beginn des Computerspiels wird die Lautstärke der Geräusche auf ein Niveau eingestellt, das laut genug, aber angenehm für Sie ist. Dies dient dazu, ein angemessenes Niveau für das Experiment zu finden. Wir werden keine unangenehmen Geräusche abspielen, die intensiver sind, als Sie tolerieren können. <br/><br/>Außerdem werden Ihnen einige Fragen zu Ihrer Befindlichkeit, Ihren Gefühlen, Ihrem Hintergrund, Ihren Einstellungen und Ihrem Verhalten im Alltag gestellt. <br/><br/>Sie erhalten <strong>8 €</strong> für Ihre Teilnahme.<br/>Zusätzlich können Sie je nach Leistung einen <strong>Bonus</strong> von bis zu <strong>2 €</strong> verdienen. <br/><br/>Bitte beachten Sie, dass Sie jederzeit ohne Angabe von Gründen abbrechen können.</p>"
            },
            
            {
              type: "html",
              name: "info",
              //Meng's translation
              html: "<b>Welche möglichen Nachteile und Risiken gibt es bei der Teilnahme?</b>"
            },
            
            {
              type: "html",
              name: "info",
              //Meng's translation
              html:
                "<p>Das Computerspiel, das Sie spielen, stellt keine bekannten Risiken dar. Sie werden gebeten, einige Fragen zu Ihrer Stimmung und Ihren Gefühlen zu beantworten. Sollten Sie sich durch die Themen, die in diesen Fragen angesprochen werden, betroffen fühlen, stellen wir Ihnen Informationen über Unterstützungsmöglichkeiten zur Verfügung.</p>"
            },
            
            {
              type: "html",
              name: "info",
              //Meng's translation
              html: "<b>Welche möglichen Vorteile gibt es wenn ich an die Studie teilnehmen?</b>"
            },            

            {
              type: "html",
              name: "info",
              //Meng's translation
              html:
                "<p>Obwohl es keine direkten Vorteile für Sie gibt, hilft uns Ihre Teilnahme an dieser Forschung, zu verstehen, wie Menschen Entscheidungen treffen. Das kann unser Wissen über psychische Gesundheitsprobleme verbessern und möglicherweise zukünftige Lösungen unterstützen.</p>",
            },

            { type: "html", name: "info", html: "<b>Beschwerden</b>" },

            {
              type: "html",
              name: "info",
              //Meng's translation
              html:
                "<p>Falls Sie eine Beschwerde haben oder Bedenken darüber äußern möchten, wie Sie von unseren Mitarbeitenden angesprochen oder behandelt wurden, können Sie sich an den Datenschutzbeauftragten wenden. Zuerst sollten Sie jedoch mit dem Studienleiter (Prof. Tobias Hauser, tobias.hauser@uni-tuebingen.de) über Ihre Beschwerde sprechen. Wenn Sie anschließend das Gefühl haben, dass Ihre Beschwerde nicht zufriedenstellend gelöst wurde, können Sie den Datenschutzbeauftragten des Universitätsklinikums Tübingen kontaktieren (dsb@med.uni-tuebingen.de; 07071 29-87667). </p>",
            },

            {
              type: "html",
              name: "info",
              //Meng's translation
              html: "<b>Was passiet mit meinen Daten?</b>",
            },

            {
              type: "html",
              name: "info",
              //Meng's translation
              html:
                "<p>Um zukünftige Forschung zu unterstützen und die von Ihnen bereitgestellten Forschungsdaten (wie Antworten auf Fragebögen) bestmöglich zu nutzen, können wir Ihre Forschungsdaten auf unbestimmte Zeit aufbewahren und weitergeben. Ihre Daten werden wie folgt behandelt:<ul><li> In Publikationen werden Ihre Daten anonymisiert, damit Sie nicht identifiziert werden können. </li><li> In öffentlichen Datenbanken werden Ihre Daten ebenfalls anonymisiert. </li><li>Wir sammeln keine persönlichen Daten, die Sie identifizieren könnten. </li><li> Persönliche Daten sind Informationen wie Ihre Benutzer-ID, die Sie identifizieren könnten. Wenn wir Ihre Daten speichern, ersetzen wir Ihre Benutzer-ID durch eine zufällige Nummer, die nicht zurückverfolgt werden kann. Ihre persönlichen Daten werden nicht gespeichert. </li></ul> Wir halten uns an die Richtlinien der Universität und gesetzliche Vorgaben, um Ihre Daten zu schützen. Falls Sie Ihre Meinung ändern und Ihre Einwilligung zur Teilnahme an dieser Studie zurückziehen möchten, können Sie uns direkt kontaktieren.<br/><br/> Ihre Datenschutzrechte sind durch die Datenschutz-Grundverordnung (EU-DSGVO) geschützt. Bei Fragen oder Bedenken wenden Sie sich bitte an Frau Dr. Aleya Marzuki (aleya.marzuki@uni-tuebingen.de).</p>",
            },
          ],
        },
        {
          questions: [
            {
              type: "checkbox",
              name: "checkbox1",
              //Meng's translation
              title:
                "Ich habe die obigen Informationen gelesen und verstehe den Inhalt der Studie.",
              isRequired: true,
              choices: ["Ja"],
            },

            {
              type: "checkbox",
              name: "checkbox2",
              //Meng's translation
              title:
                "Ich erteile meine Einwilligung zur Verarbeitung meiner personenbezogenen Daten (z. B. Benutzer-ID) für die Zwecke dieser Forschungsstudie. Ich bin mir bewusst, dass diese Daten vertraulich behandelt und gemäß allen geltenden Datenschutzgesetzen sowie den ethischen Standards in der Forschung verarbeitet werden. Die Daten werden ausschließlich dem Studienteam sowie den zuständigen Personen der Universität und der wissenschaftlichen Fördermittelgeber, die für die Überwachung und Durchführung von Audits verantwortlich sind, zugänglich gemacht",
              isRequired: true,
              choices: ["Ja"],
            },

            {
              type: "checkbox",
              name: "checkbox3",
              //Meng's translation
              title:
                "Mir ist bewusst, dass die Ergebnisse dieser Studie in medizinischen Fachzeitschriften veröffentlicht werden, jedoch in anonymisierter Form, sodass ein direkter Bezug zu mir nicht hergestellt werden kann.",
              isRequired: true,
              choices: ["Ja"],
            },

            {
              type: "checkbox",
              name: "checkbox4",
              //Meng's translation
              title:
                "Mir ist bewusst, dass ich jederzeit ohne Angabe von Gründen von dieser Studie zurücktreten kann und dies keine Auswirkungen auf meine zukünftige medizinische Versorgung oder meine gesetzlichen Rechte haben wird.",
              isRequired: true,
              choices: ["Ja"],
            },

            {
              type: "checkbox",
              name: "checkbox5",
              //Meng's translation
              title:
                "Ich wurde über die möglichen Vorteile und Risiken der Teilnahme informiert, und auch die Unterstützung, die mir zur Verfügung steht, falls ich während der Forschung belastet werde, und an wen ich mich wenden kann, wenn ich eine Beschwerde einreichen möchte.",
              isRequired: true,
              choices: ["Ja"],
            },

            {
              type: "checkbox",
              name: "checkbox6",
              //Meng's translation
              title:
                "Ich hatte ausreichend Zeit, um über die Teilnahme an dieser Untersuchung zu entscheiden und mir ist bewusst, dass die Teilnahme freiwillig ist. Ich bestätige, dass keine der in den Teilnahmeinformationen aufgeführten Bedingungen, unter denen ich nicht an der Studie teilnehmen kann, zutreffen.",
              isRequired: true,
              choices: ["Ja"],
            },

            {
              type: "checkbox",
              name: "checkbox7",
              //Meng's translation
              title:
                "Ich stimme zu, dass mir das oben genannte Forschungsprojekt zu meiner Zufriedenheit erklärt wurde, und ich bin damit einverstanden, an dieser Studie teilzunehmen",
              isRequired: true,
              choices: ["Ja"],
            },
          ],
        },
      ],
    };

    //NHS version
    var json2 = {
      title: null,
      pages: [
        {
          questions: [
            {
              type: "html",
              name: "info",
              html:
                "<p>We are researchers from University College London. We need your help to understand how the brain works. <br/><br/>Before you decide if you would like to join in, it is really important to understand why the research is being done and what it will involve. Take time to decide whether or not you would like to take part. You can talk to your family, friends or doctor about this if you want to. If something is not clear or you have more questions please email [Dr. Tricia Seow (Research Fellow, t.seow@ucl.ac.uk) and Dr. Tobias Hauser (Principal Investigator, t.hauser@ucl.ac.uk)] us.</p>",
            },

            {
              type: "html",
              name: "info",
              html: "<b>Why is this study being done?</b>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>Some people have problems with emotions, mood and behaviour that affect their life. This can be seen in conditions such as depression, conduct disorder and anxiety, to name a few. We want to find out why some people have these problems and others do not, so that we can help find better treatments.<br/><br/>In this study we are going to compare the brain activity of people who experience difficulties with those who do not.</p>",
            },

            {
              type: "html",
              name: "info",
              html: "<b>Why have I been asked to take part?</b>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>We hope to have 500 people in this study. We want people in the study who do and do not experience difficulties such as problems with mood, emotion and behaviour. At the moment we are looking for people who are:<ul><li>Diagnosed with obsessive-compulsive disorder (OCD)</li><li>Aged 18-55 years</li><li>Fluent in written and spoken English</li><li>Have normal or corrected-to-normal vision</li><li>Starting OCD therapy soon</li><li>Not suffering from autism spectrum disorder, psychosis, schizophrenia, addiction, substance abuse, bipolar, hoarding or Tourette disorder</li><li>Not suffering from any ear-related conditions: Tinnitus, ear inflammation, hearing sensitivity, hearing loss, use of hearing aids</li><li>Not colour blind</li><li>No serious learning disabilities</li></p>",
            },

            {
              type: "html",
              name: "info",
              html: "<b>Do I have to take part?</b>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>No you don’t. It is your choice, you can say ‘no’ and no one will be cross or upset. If you say ‘yes’ and change your mind later that is okay as well.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Will joining help me?</b>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>There will be no direct benefit to you, but you will have helped important research. By understanding how the brain works we hope to help patients in the future and you will have contributed towards this.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>What will happen if take part?</b>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>You will be invited to complete part(s) of the assessment on the web-browser or through a mobile application. The entire assessment will take around 3.5 hours (to be completed twice), including time for breaks. You will be shown an information page explaining what the study involves and you are free to contact the researcher(s) should you have any questions. You will need to give explicit consent by clicking a button on the consent page affirming that you are happy to take part in the study.<br/><br/>We will then start the assessment. The order of the components in the assessment can vary, but it will include either one or both parts:<br/><br/><strong>1. Questions on how you feel and act.</strong> You will be given questionnaires to fill out. You will also have an interview where we talk about your moods and feelings. We would like to record the interview. The recordings will be used for training, quality control, audit, and research purposes. The recordings will be stored anonymously, using password-protected software.  You can ask for the recordings to be stopped or deleted at any time. We only record the interviews if you are happy for us to do so. You do not have to answer anything which makes you feel uncomfortable.<br/><br/><strong>2. Computer games to play.</strong> You will play up to six different games (we call these 'tasks'). Before you take part we will explain each task we would like you to play. In all tasks you make decisions and choices such as ‘Is there more gold or silver fishes in the lake?’, or ‘Should I hide or collect more points?’. There are other choices too depending on the task you play.  In most of the tasks you try to win points, which are usually converted to money. You will be told beforehand if this is the case.<br/><br/>There will be times when you need to avoid losing in the games. Losing will mean hearing unpleasant sounds - we will show you what will happen before you begin the task and check you are happy to continue. As one or some of the games include the use of unpleasant sounds, we recommend that you do not take part in the study if you are overly sensitive to loud or extreme noises.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Payment</b>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>If you complete everything the study will take around 3.5 hours (to be completed twice) and you will receive at least £8.50/hr for the inconvenience of taking part.<br/><br/>We may contact you up to three years after this assessment to invite you to take part in future studies. Remember that you are free to withdraw from the study at any time.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Are the measurements uncomfortable or dangerous?</b>",
            },

            {
              type: "html",
              name: "info",
              html: "<p>All the measures are safe.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Who should I ask if I have questions?</b>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>If you have any questions after reading this information sheet please contact the researcher with whom you initially met [Dr. Tricia Seow (Research Fellow, t.seow@ucl.ac.uk) and Dr. Tobias Hauser (Principal Investigator, t.hauser@ucl.ac.uk)].</p>",
            },
          ],
        },
        {
          questions: [
            {
              type: "html",
              name: "info",
              html:
                "This is more detailed information that you need to know if you are taking part.",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Who will look after my personal data?</b>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<p>UCL is the sponsor for this study based in the United Kingdom. We will be using information from you and your medical records in order to undertake this study and will act as the data controller for this study. This means that we are responsible for looking after your information and using it properly. UCL will keep identifiable information about you until no longer needed.<br/><br/>Your rights to access, change or move your information are limited, as we need to manage your information in specific ways in order for the research to be reliable and accurate. If you withdraw from the study, we will keep the information about you that we have already obtained. However, once unidentifiable data and research results have been anonymised and shared or published it may not be possible for them to be destroyed, withdrawn or recalled. To safeguard your rights, we will use the minimum personally-identifiable information possible.<br/><br/>You can find out more about how we use your information by contacting the researcher you spoke to about this study.<br/><br/>As a university we use personally-identifiable information to conduct research to improve health, care and services. As a publicly-funded organisation, we have to ensure that it is in the public interest when we use personally-identifiable information from people who have agreed to take part in research. This means that when you agree to take part in a research study, we will use your data in the ways needed to conduct and analyse the research study. Your rights to access, change or move your information are limited, as we need to manage your information in specific ways in order for the research to be reliable and accurate. If you withdraw from the study, we will keep the information about you that we have already obtained. To safeguard your rights, we will use the minimum personally-identifiable information possible.<br/><br/>Health and care research should serve the public interest, which means that we have to demonstrate that our research serves the interests of society as a whole. We do this by following the UK Policy Framework for Health and Social Care Research.<br/><br/>If you wish to complain or have any concerns about any aspect of the way you have been approached or treated by members of staff, then please talk to the researcher or the chief investigator (Professor Ray Dolan, r.dolan@ucl.ac.uk) about your complaint. If you would like to discuss a complaint to someone outside the Study team please contact Cathy Price, Director, Wellcome Centre for Human Neuroimaging, UCL Institute of Neurology, 12 Queen Square, London WC1N 3BG; telephone number: 020 3448 4362.<br/><br/>If you wish to raise a complaint on how we have handled your personal data, you can contact our Data Protection Officer who will investigate the matter. If you are not satisfied with our response or believe we are processing your personal data in a way that is not lawful you can complain to the Information Commissioner’s Office (ICO).<br/><br/>Our Data Protection Officer can be contacted at data-protection@ucl.ac.uk.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>What personal data will be collected?</b>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<p>The CNNP Team and NHS trusts involved in your care will collect information from you and your medical records for this research study in accordance with our instructions.<br/><br/>Individuals from UCL and regulatory organisations may look at your medical and research records to check the accuracy of the research study. NHS Trust involved in your care will pass these details to UCL along with the information collected from you and/or your medical records. The only people in UCL who will have access to information that identifies you will be people who need to contact you to give you further information about the study and check you can take part in the study or audit the data collection process. The people who analyse the information will not be able to identify you and will not be able to find out your name, NHS number or contact details.</br><br/><b>However, if you report anything that we feel is a serious risk to your or other people’s safety and well-being, we would then need to share that with the appropriate professionals.  In these cases we will always endeavour to contact you first.</b></p>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<b>UCL will keep identifiable information about you from this study until no longer needed.</b>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<p>UCL will collect information about you for this research study from your medical records. This information may include your name/NHS number/contact details and health information, which is regarded as a special category of information. We will use this information to ensure you can be included in the research and can undergo a research scan as part of the study.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Sharing data</b>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<p>When you agree to take part in a research study, the information about your health and care may be provided to researchers running other research studies in this organisation and in other organisations. These organisations may be universities, NHS organisations or companies involved in health and care research in this country or abroad. Your information will only be used by organisations and researchers to conduct research in accordance with the UK Policy Framework for Health and Social Care Research.<br/><br/>This information will not identify you and will not be combined with other information in a way that could identify you. The information will only be used for the purpose of health and care research, and cannot be used to contact you or to affect your care. It will not be used to make decisions about future services available to you, such as insurance.<br/><br/>We would like to make the best use of the research data you have given us.  Research data is information given by you, such as answers to questionnaires. We can do this by sharing research data between CNNP and other studies that you have taken part in.  If you are part of another research study, such as in the Neuroscience in Psychiatry Network (NSPN), we may ask you if we can share your research data between CNNP and the other research study.  It is up to you to decide if you would like to do this and you can say ‘yes’ or ‘no’ to research data sharing on the consent form. If you put ‘yes’ this only allows sharing of research data, not your medical records. You can still take part in CNNP if you say ‘no’ to sharing research data. If you withdraw from the CNNP study, you can still take part in the other studies.<br/><br/>We may share your research data in public research databases but your data will always be anonymised or pseudonymised. This means that a code will be used instead of your name (or other personal details), and other protections applied that reduce the risk of deliberate or accidental reidentification of you as an individual.</p>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<b>What will happen to the results of the research study?</b>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<p>If you like, we can send you a summary of the findings once the study is complete and published. Your data will be reported anonymously and you will not be identifiable in any publication.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Who is organising and funding the research?</b>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<p>This research has been funded by a Wellcome Trust Strategic Grant Award to the Neuroscience in Psychiatry Network (NSPN) and a Wellcome Trust Sir Henry Dale Fellowship. The former is a collaboration between researchers in University College London and the University of Cambridge.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Who has reviewed the study?</b>",
            },
            {
              type: "html",
              name: "info",
              html:
                "<p>Before any research is allowed to go ahead it has to be checked by a group of people called the Research Ethics Committee. They protect the rights, safety and well-being of research participants. This study has been reviewed by the Westminster Research Ethics Committee (REC reference: 15/LO/1361).</p>",
            },
          ],
        },
        {
          questions: [
            {
              type: "html",
              name: "info",
              html:
                "<p>Thank you for your interest in taking part in this research.<br/><br/>Before you agree to take part, the person organising the research will explain the project to you. If you have any questions arising from the Information Sheet or explanation already given to you, please ask the researcher before you to decide whether to join in. <br/><br/>You will be given a copy of this Consent Form to keep and refer to at any time.</p>",
            },
            {
              type: "html",
              name: "info",
              html: "<b>Participant's statement:</b>",
            },
            {
              type: "checkbox",
              name: "checkbox1",
              title:
                "I have read and understood the information sheet version v5.0 dated 19/05/2021 related to the CNNP Study. I have had sufficient time and opportunity to consider this information, ask questions and have had these answered satisfactorily by a member of the research team.",
              isRequired: true,
              choices: ["Yes"],
            },
            {
              type: "checkbox",
              name: "checkbox2",
              title:
                "I understand that my participation is voluntary and that I am is free to withdraw at any time without giving a reason, without my medical care or legal rights being affected.",
              isRequired: true,
              choices: ["Yes"],
            },
            {
              type: "checkbox",
              name: "checkbox3",
              title:
                "I consent to the processing of my personal data for the purposes explained to me in the Information Sheet. I understand that my information will be handled in accordance with all applicable data protection legislation and ethical standards in research.",
              isRequired: true,
              choices: ["Yes"],
            },
            {
              type: "checkbox",
              name: "checkbox4",
              title:
                "I understand that my personal data (name, contact details etc.) will be held securely by UCL. Personal data will only be accessible to the study team and authorised individuals from UCL or the research funder working with them.",
              isRequired: true,
              choices: ["Yes"],
            },
            {
              type: "checkbox",
              name: "checkbox5",
              title:
                "I understand that my pseudonymised personal data can be shared with others for future research, shared in public databases and in scientific reports.",
              isRequired: true,
              choices: ["Yes"],
            },
            {
              type: "checkbox",
              name: "checkbox6",
              title:
                "I understand that the researchers in charge of this study may close the study, or stop my participation in it, at any time without my consent.",
              isRequired: true,
              choices: ["Yes"],
            },
            {
              type: "checkbox",
              name: "checkbox7",
              title:
                "I understand that information related to my participation in this study may be accessed by responsible individuals from the sponsor for quality control purposes. I give permission for these individuals to have access to this data.",
              isRequired: true,
              choices: ["Yes"],
            },
            {
              type: "checkbox",
              name: "checkbox8",
              title:
                "I understand that relevant sections of my medical notes and data collected during the study may be looked at by individuals from University College London or from regulatory authorities, where it is relevant to my taking part in this research. I give permission for these individuals to have access to my records.",
              isRequired: true,
              choices: ["Yes"],
            },
          ],
        },
      ],
    };

    if (this.state.consentComplete === 0) {
      return (
        <div className="placeMiddle">
          <div className="boldCenter">INFORMATION FOR THE PARTICIPANT</div>
          <br />
          Bitte lesen Sie diese Informationsseite sorgfältig durch. 
          Wenn Sie damit einverstanden sind, kreuzen Sie bitte die Kästchen 
          auf der zweiten Seite dieses Formulars an, 
          um Ihre Zustimmung zu dieser Studie zu geben. 
          Bitte beachten Sie, dass Sie erst dann an der Studie teilnehmen können, 
          wenn Sie Ihre vollständige Einwilligung geben.
          <br />
          <br />
          <Consent.Survey
            json={json} //Aleya changed this from NHS version
            showCompletedPage={false}
            onComplete={this.redirectToTarget}
          />
        </div>
      );
    } else {
      // this.redirectToTarget();

      return null;
    }
  }
}

export default withRouter(StartPage);
