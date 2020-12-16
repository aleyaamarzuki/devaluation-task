import React from "react";
import { withRouter } from "react-router-dom";

import styles from "./style/taskStyle.module.css";
import astrodude from "./images/astronaut.png";

class EndPage extends React.Component {
  constructor(props) {
    super(props);

    const userID = this.props.location.state.userID;
    var currentDate = new Date();
    var QuestionsEndTime = currentDate.toTimeString();

    // This will change for the questionnaires going AFTER the main task
    this.state = {
      userID: userID,
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
      <div className={styles.spaceship}>
        <div className={styles.main}>
          <p>
            <span className={styles.center}>END PAGE</span>
            <br />
            <br />
            Congratulations on reaching our destination!
          </p>
          <span className={styles.astro}>
            <img src={astrodude} alt="astrodude" />
          </span>
        </div>
      </div>
    );
  }
}

export default withRouter(EndPage);
