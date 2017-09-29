import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
//import LiveChat from './components/LiveChat';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
