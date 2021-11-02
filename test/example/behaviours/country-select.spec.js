'use strict';

const Behaviour = require('../../../example/apps/example-app/behaviours/country-select');
const homeOfficeCountries = [''].concat(require('homeoffice-countries').allCountries);
const Controller = require('../../../controller')
console.log(Controller)


describe.only('apps/example-app/behaviours/country-select', () => {
  let controller
  let req;
  let res;

  beforeEach(() => {
    req = hof_request();

    let sandbox;
    sandbox = sinon.createSandbox();

    req.form.options = {fields: {
      countrySelect: {
        options: {

        }
      }
    }};
    console.log("req: ", req.form.options)
  
    //sandbox.stub(Controller.protoype, 'configure').yieldsAsync();
    const CountrySelectController = Behaviour(Controller)
    controller = new CountrySelectController()

    //req.form.options.fields.options = { // so does this
        //'countrySelect': {
            //value: 'Austria'
        //}
    //};

  });

  describe('countryselect', () => {
    it('checks to see if austria is in fields', () => {
      controller.configure(req, res, () => {
        req.form.options.fields['countrySelect'].options.should.have.property('Austria')  
      });
    });
  });
});
