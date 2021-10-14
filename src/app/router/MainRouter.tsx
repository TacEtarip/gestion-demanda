import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Dashboard from '../components/dashboard/dashboard.component';

const routes = [
  { path: '/dashboard', component: <Dashboard />, exact: false },
  { path: '/', redirect: '/dashboard', exact: true },
];

const MainRouter = () => {
  return (
    <Router>
      <Switch>
        {routes.map((route, index) => {
          return (
            <Route key={index} path={route.path} exact={route.exact}>
              {route.component ? (
                route.component
              ) : (
                <Redirect to={{ pathname: route.redirect }} />
              )}
            </Route>
          );
        })}
      </Switch>
    </Router>
  );
};

export default MainRouter;
