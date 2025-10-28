/* eslint-disable no-console */
'use strict';

module.exports = (tasks, config) => tasks.reduce((promise, task) => {
  const name = task.task || 'unknown';
  console.log("Running task:", name);
    console.log(`Name task: ${name}`, "Promise task:" ,promise);
  return promise
    .then(() => {
      console.log(`Executing task: ${name}`);
      //if(name !== 'browserify'){  
      return task(config);
      //}else{
       // console.log(`Skipping task: ${name}`);
       // return Promise.resolve();
      //}
    })
    .then(() => {
      console.log(`Completed task: ${name}`);
    });
  // }else{
  //   console.log(`Skipping task: ${name}`);
  // }
}, Promise.resolve())
  .then(() => {
    console.log();
  });
