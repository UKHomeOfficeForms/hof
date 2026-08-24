'use strict';

const path = require('path');

describe('images task', () => {
  it('copies image directories using the Node filesystem API', () => {
    const cp = sinon.stub().resolves();
    const fs = {
      existsSync: sinon.stub().returns(true),
      lstatSync: sinon.stub().returns({ isDirectory: () => true }),
      promises: { cp }
    };
    const images = proxyquire(path.resolve(__dirname, '../../../build/tasks/images'), { fs });

    return images({
      images: {
        src: ['assets/images', 'frontend/images'],
        out: 'public/images'
      }
    }).then(() => {
      cp.should.have.been.calledTwice;
      cp.should.have.been.calledWithExactly('assets/images', 'public/images', { recursive: true });
      cp.should.have.been.calledWithExactly('frontend/images', 'public/images', { recursive: true });
    });
  });
});
