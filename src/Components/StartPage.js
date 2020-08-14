import React from "react";
import { withRouter } from "react-router-dom";
import * as Survey from "survey-react";
import "../../node_modules/survey-react/survey.css";
import "./style/startPage.css";

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

    // Set state
    this.state = {
      date: dateString,
      dateTime: dateTime,
      startTime: timeString,
      consentComplete: 0,
    };

    // update State when consent is complete
    //  this.onCompleteConsent = this.onCompleteConsent.bind(this);
    this.redirectToTarget = this.redirectToTarget.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  redirectToTarget() {
    this.setState({
      consentComplete: 1,
    });

    this.props.history.push({
      pathname: `/TutorTask`,
      state: {
        participant_info: this.state.participant_info,
      },
    });
  }

  render() {
    var json = {
      title: null,
      pages: [
        {
          questions: [
            { type: "html", name: "info", html: "" },

            {
              type: "html",
              name: "info",
              html: "<strong>Who is conducting this research study?</strong>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p>This research is being conducted by the Wellcome Centre for Human Neuroimaging and the Max Planck UCL Centre for Computational Psychiatry and Ageing Research. This study has been approved by the UCL Research Ethics Committee (project ID number 15301&#92;001) and funded by the Wellcome Trust.</p>",
            },

            {
              type: "html",
              name: "info",
              html: "<strong>What is the purpose of this study?</strong>",
            },

            {
              type: "html",
              name: "info",
              html:
                "<p> We are interested in how the adult brain controls learning and decision-making. This research aims to provide insights into how the healthy brain works to help us understand the causes of a number of different medical conditions.</p>",
            },
          ],
        },

        {
          //next page
          questions: [
            {
              type: "checkbox",
              name: "checkbox1",
              title:
                "I have read the information presented, and understand what the study involves.",
              isRequired: true,
              choices: ["Yes"],
            },
          ],
        },
      ],
    };

    if (this.state.consentComplete === 0) {
      return (
        <div className="place-middle">
          <br /> <br /> <br /> <br />
          <p>
            <span className="bold">INFORMATION FOR THE PARTICIPANT</span>
          </p>
          Please read this information page carefully. If you are happy to
          proceed, please check the boxes on the second page of this form to
          consent to this study proceeding. Please note that you cannot proceed
          to the study unless you give your full consent.
          <br />
          <br />
          <Survey.Survey
            json={json}
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
