import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import StartPage from "./Components/StartPage";
import HeadphoneCheck from "./Components/HeadphoneCheck";
import SoundCal from "./Components/SoundCal";
import TutorTask from "./Components/TutorTask";
import ExptTask from "./Components/ExptTask";

import EndPage from "./Components/EndPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" component={StartPage} exact />
        <Route path="/HeadphoneCheck" component={HeadphoneCheck} exact />
        <Route path="/SoundCal" component={SoundCal} exact />
        <Route path="/TutorTask" component={TutorTask} exact />
        <Route path="/ExptTask" component={ExptTask} exact />
        <Route path="/EndPage" component={EndPage} exact />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
