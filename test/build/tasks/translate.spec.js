'use strict';

const path = require('path');

describe('translate task', () => {
  let spawn;
  let translate;

  beforeEach(() => {
    spawn = sinon.stub().resolves();
    translate = proxyquire(path.resolve(__dirname, '../../../build/tasks/translate'), {
      '../../lib/spawn': spawn
    });
  });

  it('runs the transpiler with the current Node executable', () => {
    const config = {
      translate: {
        src: 'apps/**/translations/src',
        shared: ['apps/common/translations/src', 'shared/translations/src']
      }
    };

    return translate(config).then(() => {
      spawn.should.have.been.calledOnce;
      spawn.should.have.been.calledWithExactly(process.execPath, [
        path.resolve(__dirname, '../../../bin/hof-transpiler'),
        'apps/**/translations/src',
        '--shared',
        'apps/common/translations/src',
        '--shared',
        'shared/translations/src'
      ]);
    });
  });

  it('does nothing without translation configuration', () => {
    return translate({}).then(() => {
      spawn.should.not.have.been.called;
    });
  });
});
