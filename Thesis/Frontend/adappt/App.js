import React from 'react';
import { Provider } from 'react-redux';

import LoginStack from './navigation/Loader.js';
import StoredData from './redux/store';

class App extends React.Component {
  render(){
  return (
    <Provider store={StoredData} >
      <LoginStack />
    </Provider>
  );
  }
}

export default App