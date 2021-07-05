/* eslint implicit-dependencies/no-implicit: [2, {dev:true}] */

'use strict';
const router = require('express').Router();

module.exports = router.use('/api/postcode-test/:action?/:postcode?', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  const action = req.params.action;
  const postcode = decodeURIComponent(req.params.postcode);
  if (action === 'addresses') {
    if (req.query.postcode === 'CR0 2EU') {
      // eslint-disable-next-line camelcase
      res.send(JSON.stringify([{ formatted_address: '49 Sydenham Road\nCroydon\nCR0 2EU', postcode: 'CR0 2EU' }]));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify([]));
    }
  } else if (action === 'postcodes') {
    if (postcode === 'CR0 2EU') {
      res.send(JSON.stringify({
        country: {
          name: 'England'
        }
      }));
    } else if (postcode === 'CH5 1AB') {
      res.send(JSON.stringify({
        country: {
          name: 'Wales'
        }
      }));
    } else {
      res.send(JSON.stringify({}));
    }
  }
});
