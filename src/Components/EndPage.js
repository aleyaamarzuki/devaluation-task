import React from "react";
import { withRouter } from "react-router-dom";

import styles from "./style/taskStyle.module.css";

class EndPage extends React.Component {
  constructor(props) {
    super(props);

    const participant_info = this.props.location.state.participant_info;
    var currentDate = new Date();
    var QuestionsEndTime = currentDate.toTimeString();

    // This will change for the questionnaires going AFTER the main task
    this.state = {
      participant_info: participant_info,
      QuestionsEndTime: QuestionsEndTime,
    };
  }

  // Mount the component to call the BACKEND and GET the information
  componentDidMount() {
    document.body.style.background = "fff";
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className={styles.main}>
        <p>
          <span className="bold">END PAGE</span>
          <br />
          <br />
          <span className="norm">Thanks for completing the experiment!</span>
        </p>
      </div>
    );
  }
}

export default withRouter(EndPage);
