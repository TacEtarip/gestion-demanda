import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import GestionDemanda from './gestion-demanda/gestion-demanda.component';
const routes = [
  { path: '/gestion-demanda', component: <GestionDemanda />, exact: false },
  { path: '/', redirect: '/gestion-demanda', exact: true },
];
const DashboardRouter = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      {routes.map((route, index) => {
        return (
          <Route key={index} path={path + route.path} exact={route.exact}>
            {route.component ? (
              route.component
            ) : (
              <Redirect to={{ pathname: path + route.redirect }} />
            )}
          </Route>
        );
      })}
    </Switch>
  );
};

export default DashboardRouter;
