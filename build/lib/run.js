/* eslint-disable no-console */
'use strict';

module.exports = (tasks, config) => tasks.reduce((promise, task) => {
  const name = task.task || 'unknown';
  return promise
    .then(() => {
      console.log(`Executing task: ${name}`);
      return task(config);
    })
    .then(() => {
      console.log(`Completed task: ${name}`);
    });
}, Promise.resolve())
  .then(() => {
    console.log();
  });
