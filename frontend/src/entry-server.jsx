import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router';
import App from './App.jsx';

export function render(url, initialContent) {
  return renderToString(<StaticRouter location={url}><App initialContent={initialContent}/></StaticRouter>);
}
