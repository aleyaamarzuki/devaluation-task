import React from "react";
import { withRouter } from "react-router-dom";

import styles from "./style/taskStyle.module.css";
import astrodude from "./images/astronaut.png";

class EndPage extends React.Component {
  constructor(props) {
    super(props);

    const userID = this.props.location.state.userID;
    const date = this.props.location.state.date;
    const startTime = this.props.location.state.startTime;

    // This will change for the questionnaires going AFTER the main task
    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,
    };
    this.handleBegin = this.handleBegin.bind(this);
  }

  // Mount the component to call the BACKEND and GET the information
  componentDidMount() {
    document.body.style.background = "fff";
    window.scrollTo(0, 0);
  }

  redirectToTarget() {
    this.props.history.push({
      pathname: `/Questionnaires`,
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
      },
    });
  }

  handleBegin(key_pressed) {
    var whichButton = key_pressed;
    if (whichButton === 10) {
      setTimeout(
        function () {
          this.redirectToTarget();
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
    document.addEventListener("keyup", this._handleBeginKey);
    return (
      <div className={styles.spaceship}>
        <div className={styles.main}>
          <p>
            <span className={styles.center}>END PAGE</span>
            <br />
            <br />
            Congratulations on reaching our destination!
            <br />
            <br />
            For the second part, you be completing 3 questionnaires.
            <br />
            <br />
            <span className={styles.centerTwo}>
              Please press <strong>SPACEBAR</strong> to try again.
            </span>
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
