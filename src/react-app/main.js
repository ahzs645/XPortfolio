import html from './html.js';
import App from './App.js';

const container = document.getElementById('root');
const root = window.ReactDOM.createRoot(container);

root.render(html`<${App} />`);
