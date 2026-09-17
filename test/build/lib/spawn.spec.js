'use strict';

const EventEmitter = require('events');
const path = require('path');

describe('build process helper', () => {
  it('does not invoke commands through a shell', () => {
    const child = new EventEmitter();
    const childProcess = { spawn: sinon.stub().returns(child) };
    const spawn = proxyquire(path.resolve(__dirname, '../../../build/lib/spawn'), {
      child_process: childProcess
    });
    const result = spawn(process.execPath, ['script with spaces.js']);

    childProcess.spawn.should.have.been.calledWithExactly(
      process.execPath,
      ['script with spaces.js'],
      {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: false
      }
    );
    child.emit('exit', 0);
    return result;
  });
});
