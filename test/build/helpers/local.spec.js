'use strict';

const path = require('path');

describe('local import helper', () => {
  let glob;
  let local;

  beforeEach(() => {
    glob = sinon.stub().callsFake((target, callback) => callback(null, [target]));
    local = proxyquire(path.resolve(__dirname, '../../../build/helpers/local'), { glob });
  });

  ['hof/frontend/main', 'hof\\frontend\\main'].forEach(importUrl => {
    it(`constructs a local lookup glob for: ${importUrl}`, done => {
      local(importUrl, path.join('project', 'assets', 'app.scss'), (err, isLocal) => {
        should.not.exist(err);
        isLocal.should.equal(1);
        glob.should.have.been.calledWith(
          path.join('project', 'assets', 'hof', 'frontend', '?(_)' + 'main.@(sa|c|sc)ss')
        );
        done();
      });
    });
  });

  ['../main', '/styles/main', '\\styles\\main', 'C:\\styles\\main'].forEach(importUrl => {
    it(`recognises an explicit local path: ${importUrl}`, done => {
      local(importUrl, path.join('project', 'assets', 'app.scss'), (err, isLocal) => {
        should.not.exist(err);
        isLocal.should.equal(true);
        glob.should.not.have.been.called;
        done();
      });
    });
  });
});
