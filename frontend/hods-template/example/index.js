/* eslint-disable */
'use strict';

const path = require('path');
const express = require('express');
const template = require('../index');

const app = express();

app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, 'views'));

app.use(template());
app.get('*', (req, res) => {
  res.render('index');
});

app.listen(3000);
