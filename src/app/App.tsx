import React from 'react';
import '../assets/styles/App.scss';
import MainRouter from './router/MainRouter';

/**
 * Inicia la aplicacion
 *
 * @return {JSX.Element}
 */
function App(): JSX.Element {
  return (
    <div>
      <MainRouter />
    </div>
  );
}

export default App;
