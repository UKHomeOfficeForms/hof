/*
 * This file provides readiness and liveness checks for use with Kubernetes.
 * For information on how to set them up, look at the Kubernetes documentation:
 *
 * https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
 *
 */
'use strict';

const router = require('express').Router();
const healthCheck = require('express-healthcheck');

module.exports = (redis) => {
  router.get('/ping', healthCheck());

  router.get('/readiness', healthCheck({
    test: () => {
      if (!redis.connected && !redis.ready) {
        return new Error('Session store unhealthy');
      }
      return 0;
    }
  }));

  return router;
};
