'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

describe('images task', () => {
  it('copies image directories using the Node filesystem API', () => {
    const cp = sinon.stub().resolves();
    const mockFs = {
      existsSync: sinon.stub().returns(true),
      lstatSync: sinon.stub().returns({ isDirectory: () => true }),
      promises: { cp }
    };
    const images = proxyquire(path.resolve(__dirname, '../../../build/tasks/images'), { fs: mockFs });

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

  it('merges multiple image directories into the output directory', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hof-images-'));
    const firstSource = path.join(temporaryRoot, 'first');
    const secondSource = path.join(temporaryRoot, 'second');
    const imagesOutput = path.join(temporaryRoot, 'output');

    fs.mkdirSync(path.join(firstSource, 'icons'), { recursive: true });
    fs.mkdirSync(path.join(secondSource, 'logos'), { recursive: true });
    fs.writeFileSync(path.join(firstSource, 'icons', 'first.png'), 'first');
    fs.writeFileSync(path.join(secondSource, 'logos', 'second.png'), 'second');

    const images = proxyquire(path.resolve(__dirname, '../../../build/tasks/images'), { fs });

    return images({
      images: {
        src: [firstSource, secondSource],
        out: imagesOutput
      }
    }).then(() => {
      fs.readFileSync(path.join(imagesOutput, 'icons', 'first.png'), 'utf8').should.equal('first');
      fs.readFileSync(path.join(imagesOutput, 'logos', 'second.png'), 'utf8').should.equal('second');
    }).finally(() => {
      fs.rmSync(temporaryRoot, { recursive: true, force: true });
    });
  });
});
