/* eslint-disable max-len */
const formFocus = require('../../../frontend/themes/gov-uk/client-js/form-focus');

describe('formFocus', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('focuses the date day input when in edit mode', () => {
    document.body.innerHTML = `
    <form>
      <div id="dateOfBirth" class="govuk-date-input">
        <div class="govuk-form-group">
          <fieldset class="govuk-fieldset" role="group">
            <div class="govuk-date-input">
              <div class="govuk-date-input__item">
                <div class="govuk-form-group">
                  <label class="govuk-label govuk-date-input__label" for="dateOfBirth-day">
                    Day
                  </label>
                  <input class="govuk-input govuk-date-input__input govuk-input--width-2" id="dateOfBirth-day" name="dateOfBirth-day" type="text" inputmode="numeric" autocomplete="bday-day" min="1" max="12" maxlength="2">
                </div>
              </div>
              <div class="govuk-date-input__item">
                <div class="govuk-form-group">
                  <label class="govuk-label govuk-date-input__label" for="dateOfBirth-month">
                    Month
                  </label>
                  <input class="govuk-input govuk-date-input__input govuk-input--width-2" id="dateOfBirth-month" name="dateOfBirth-month" type="text" inputmode="numeric" autocomplete="bday-month" min="1" max="12" maxlength="2">
                </div>
              </div>
              <div class="govuk-date-input__item">
                <div class="govuk-form-group">
                  <label class="govuk-label govuk-date-input__label" for="dateOfBirth-year">
                    Year
                  </label>
                  <input class="govuk-input govuk-date-input__input govuk-input--width-4" id="dateOfBirth-year" name="dateOfBirth-year" type="text" inputmode="numeric" autocomplete="bday-year" maxlength="4">
                </div>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </form>
    `;
    window.history.pushState({}, '', '/test/edit#dateOfBirth');

    const dayInput = document.getElementById('dateOfBirth-day');
    const focusSpy = jest.spyOn(dayInput, 'focus');

    formFocus();

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('focuses the grouped amount input when in edit mode', () => {
    document.body.innerHTML = `
    <form>
      <div id="amountWithUnitSelect" class="govuk-amount-with-unit-select-input">
        <div class="grouped-inputs__item"> 
          <div class="govuk-form-group">
            <label class="govuk-label" for="amountWithUnitSelect-amount">
              Amount:
            </label>
            <div class="govuk-input__wrapper">
              <input class="govuk-input govuk-input--width-3" id="amountWithUnitSelect-amount" name="amountWithUnitSelect-amount" type="text" autocomplete="off" aria-required="false">
            </div>
          </div>
        </div>
        <div class="grouped-inputs__item">
          <div class="govuk-form-group">
            <label class="govuk-label" for="amountWithUnitSelect-unit">
              Unit:
            </label>
            <select class="govuk-select" id="amountWithUnitSelect-unit" name="amountWithUnitSelect-unit" aria-required="false">
              <option value="">Select...</option>
              <option value="L">Litres</option>
              <option value="KG">Kilograms</option>
            </select>
          </div>
        </div>
      </div>
    </form>
    `;
    window.history.pushState({}, '', '/test/edit#amountWithUnitSelect');

    const amountInput = document.getElementById('amountWithUnitSelect-amount');
    const focusSpy = jest.spyOn(amountInput, 'focus');

    formFocus();

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });
});
