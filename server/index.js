'use strict';

// React And Redux Setup
import React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import { configureStore } from '../client/store';
import routes from '../client/routes';

// api
import posts from './api/home.routes';

// ignore requesting file .scss
require.extensions['.scss'] = () => {
  return;
};

// Setup Route Bindings
exports = module.exports = (app) => {
  // Setup API use
  app.use('/api', posts);

  app.use((req, res, next) => {
    if (req.path.match(/^\/keystone/)) {
      next();
      return;
    }
    match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
      if (error) res.status(500);
      if (redirectLocation) res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      if (!renderProps) return next();

      const store = configureStore();
      let markup;
      if (renderProps) {
        // if the current route matched we have renderProps
        markup = renderToString(
          <Provider store={store}>
            <RouterContext {...renderProps} />
          </Provider>);
      } else {
        // otherwise we can render a 404 page
        res.status(404);
      }
      // render the index template with the embedded React markup
      return res.render('index', { markup });
    });
  });
};
