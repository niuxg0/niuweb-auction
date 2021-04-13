import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import Home from './layout/home'
import Main from './layout/main'

const app = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/main" component={Main} />
        <Redirect to="/" />
      </Switch>
    </Router>
  )
}

export default app