'use strict';

const autofill = require('../../utilities/autofill');

describe('autofill utility', () => {
  function createElement(attributes = {}) {
    return {
      clearValue: sinon.stub().resolves(),
      click: sinon.stub().resolves(),
      getAttribute: sinon.stub().callsFake(attribute => Promise.resolve(attributes[attribute])),
      getText: sinon.stub().resolves('page content'),
      isExisting: sinon.stub().resolves(attributes.exists !== false),
      isSelected: sinon.stub().resolves(Boolean(attributes.selected)),
      selectByAttribute: sinon.stub().resolves(),
      selectByIndex: sinon.stub().resolves(),
      setValue: sinon.stub().resolves(),
      $$: sinon.stub().resolves([])
    };
  }

  function createBrowser({ inputs = [], radioGroups = {}, submitButton,
    uploadFileResult = '/remote/file', currentUrl = 'http://localhost/target' } = {}
  ) {
    const content = createElement();
    const missingElement = createElement({ exists: false });

    return {
      browser: {
        $$: sinon.stub().callsFake(selector => {
          if (selector === 'input') {
            return Promise.resolve(inputs);
          }

          if (selector === 'select' || selector === 'textarea') {
            return Promise.resolve([]);
          }

          return Promise.resolve(radioGroups[selector] || []);
        }),
        $: sinon.stub().callsFake(selector => {
          if (selector === 'input[type="submit"], button[type="submit"]') {
            return Promise.resolve(submitButton || missingElement);
          }

          if (selector === '#content') {
            return Promise.resolve(content);
          }

          return Promise.resolve(missingElement);
        }),
        addValue: sinon.stub().resolves(),
        getUrl: sinon.stub().resolves(currentUrl),
        saveScreenshot: sinon.stub().resolves(),
        uploadFile: sinon.stub().resolves(uploadFileResult)
      },
      content,
      missingElement
    };
  }

  it('should set the uploaded remote path on the file input element', async () => {
    const fileInput = createElement({ type: 'file', name: 'document' });
    const submitButton = createElement();
    const { browser } = createBrowser({
      currentUrl: 'http://localhost/target',
      inputs: [fileInput],
      submitButton,
      uploadFileResult: { value: '/remote/file.pdf' }
    });

    await autofill(browser)('/target', { document: '/tmp/file.pdf' });

    expect(browser.uploadFile).to.have.been.calledOnceWithExactly('/tmp/file.pdf');
    expect(fileInput.setValue).to.have.been.calledOnceWithExactly('/remote/file.pdf');
    expect(browser.addValue).not.to.have.been.called;
  });

  it('should select the only radio option when no value is provided', async () => {
    const radio = createElement({ type: 'radio', name: 'choice' });
    const submitButton = createElement();
    const { browser } = createBrowser({
      currentUrl: 'http://localhost/target',
      inputs: [radio],
      radioGroups: {
        'input[type="radio"][name="choice"]': [radio]
      },
      submitButton
    });

    await autofill(browser)('/target', {});

    expect(radio.click).to.have.been.calledOnce;
  });

  it('should process each radio group once per step', async () => {
    const randomStub = sinon.stub(Math, 'random').returns(0);
    const firstRadio = createElement({ type: 'radio', name: 'choice', value: 'first' });
    const secondRadio = createElement({ type: 'radio', name: 'choice', value: 'second' });
    const submitButton = createElement();
    const { browser } = createBrowser({
      currentUrl: 'http://localhost/target',
      inputs: [firstRadio, secondRadio],
      radioGroups: {
        'input[type="radio"][name="choice"]': [firstRadio, secondRadio]
      },
      submitButton
    });

    try {
      await autofill(browser)('/target', {});
    } finally {
      randomStub.restore();
    }

    expect(browser.$$).to.have.been.calledWith('input[type="radio"][name="choice"]');
    expect(browser.$$.withArgs('input[type="radio"][name="choice"]').callCount).to.equal(1);
  });

  it('should submit forms with a button submit control', async () => {
    const submitButton = createElement();
    const { browser } = createBrowser({
      currentUrl: 'http://localhost/target',
      submitButton
    });

    await autofill(browser)('/target', {});

    expect(submitButton.click).to.have.been.calledOnce;
  });

  it('should throw a clear error when no submit control exists', async () => {
    const { browser } = createBrowser({
      currentUrl: 'http://localhost/target'
    });

    await expect(autofill(browser)('/target', {})).to.be.rejectedWith('No submit control found on page');
  });
});
