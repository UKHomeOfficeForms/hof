// 'use strict';

// const axios = require('axios');
// const { response } = require('express');
// const { functions } = require('lodash');
// const baseUrl = 'http://localhost:3000/session'

// module.exports = superclass => class extends superclass{
//   saveValues(req, res, next){
//     super.saveValues(req, res, err => {
//       if (err) {
//         next(err)
//       }
//       // initially just try get it talking 

//       const session = req.sessionModel.toJSON();
//       console.log(session)
//       axios.get(baseUrl)
//         .then(function (response) {
//           const resBody = JSON.parse(response.body);
//           console.log('resBody', resBody)
//         })
//         .catch(function(error) {
//           console.log(err)
//           next(err);
//         })
//         console.log('this is here')
//       })
//       console.log('i am here')       
//       next() ;

    
//   }
// }
