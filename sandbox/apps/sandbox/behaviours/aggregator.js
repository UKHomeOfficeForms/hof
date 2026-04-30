const path = require('path');

module.exports = superclass => class extends superclass {
  constructor(options) {
    if (!options.aggregateTo) {
      throw new Error('options.aggregateTo is required for loops');
    }
    if (!options.aggregateFrom) {
      throw new Error('options.aggregateField is required for loops');
    }
    super(options);
  }

  deleteItem(req, res) {
    const id = req.params.id;

    if (id) {
      const items = this.getAggregateArray(req).filter((element, index) => index !== parseInt(id, 10));
      this.setAggregateArray(req, items);
    }
    res.redirect(`${req.baseUrl}${req.form.options.route}`);
  }

  updateItem(req, res) {
    const id = req.sessionModel.get(`${req.form.options.aggregateTo}-itemToReplaceId`);
    const items = this.getAggregateArray(req);

    let itemTitle = '';

    req.form.options.aggregateFrom.forEach(aggregateFromElement => {
      const aggregateFromField = aggregateFromElement.field || aggregateFromElement;

      if (req.form.options.titleField === aggregateFromField) {
        itemTitle = req.sessionModel.get(aggregateFromField);
      }

      const value = req.sessionModel.get(aggregateFromField);

      const fieldToUpdate = items[id].fields.find(field => field.field === aggregateFromField);

      fieldToUpdate.value = req.sessionModel.get(aggregateFromField);
      fieldToUpdate.parsed = this.parseField(aggregateFromElement, value, req);

      req.sessionModel.unset(aggregateFromField);
    });

    items[id].itemTitle = itemTitle;

    this.setAggregateArray(req, items);
    req.sessionModel.unset(`${req.form.options.aggregateTo}-itemToReplaceId`);


    if (req.sessionModel.get('returnToSummary') && !this.continueOnEdit) {
      req.sessionModel.unset('returnToSummary');
      res.redirect(path.join(req.baseUrl, this.confirmStep));
    } else {
      res.redirect(`${req.baseUrl}${req.form.options.route}`);
    }
  }

  showEditItemPage(req, res) {
    const items = this.getAggregateArray(req);
    const id = req.params.id;

    if (req.query.returnToSummary) {
      req.sessionModel.set('returnToSummary', true);
    }

    if (id) {
      console.log("id @@@@@@@@" + id);
      req.sessionModel.set(`${req.form.options.aggregateTo}-itemToReplaceId`, id);

      req.form.options.aggregateFrom.forEach(aggregateFromElement => {
        const aggregateFromField = aggregateFromElement.field || aggregateFromElement;

        req.sessionModel.set(aggregateFromField,
          items[id].fields.find(field => field.field === aggregateFromField).value);
      });
      const editPath = req.params.edit ? `/edit#${req.params.edit}` : '/edit';
      res.redirect(`${req.baseUrl}/${req.form.options.addStep}${editPath}`);
      console.log("edit path" + `${req.baseUrl}/${req.form.options.addStep}${editPath}`);
    } else {
      
      console.log("else @@@@@@@@" +`${req.baseUrl}${req.form.options.route}`);
      res.redirect(`${req.baseUrl}${req.form.options.route}`);
    }
  }

  addItem(req, res) {
    const items = this.getAggregateArray(req);
    const fields = [];

    let itemTitle = '';

    req.form.options.aggregateFrom.forEach(aggregateFromElement => {
      const aggregateFromField = aggregateFromElement.field || aggregateFromElement;
      const isTitleField = req.form.options.titleField === aggregateFromField;
      const value = req.sessionModel.get(aggregateFromField);

      if (isTitleField) {
        itemTitle = value;
      }

      fields.push({
        field: aggregateFromField,
        parsed: this.parseField(aggregateFromField, value, req),
        value,
        showInSummary: !isTitleField,
        changeField: aggregateFromElement.changeField
      });

      this.setAggregateArray(req, items);
      req.sessionModel.unset(aggregateFromField);
    });

    const newItem = { itemTitle, fields };

    items.push(newItem);

    this.setAggregateArray(req, items);
    res.redirect(`${req.baseUrl}${req.form.options.route}`);
  }

  getAggregateArray(req) {
    const aggregateToField = req.sessionModel.get(req.form.options.aggregateTo) || { aggregatedValues: [] };
    return aggregateToField.aggregatedValues;
  }

  setAggregateArray(req, value) {
    req.sessionModel.set(req.form.options.aggregateTo, { aggregatedValues: value });
  }

  newFieldsProvided(req) {
    let fieldsProvided = false;

    req.form.options.aggregateFrom.forEach(aggregateFromField => {
      if (req.sessionModel.get(aggregateFromField)) {
        fieldsProvided = true;
      }
    });

    return fieldsProvided;
  }

  redirectToAddStep(req, res) {
    res.redirect(`${req.baseUrl}/${req.form.options.addStep}`);
  }

  editItem(req, res) {
    if (req.sessionModel.get(`${req.form.options.aggregateTo}-itemToReplaceId`)) {
      this.updateItem(req, res);
    } else {
      this.showEditItemPage(req, res);
    }
  }

  getAction(req) {
    const noItemsPresent = () => this.getAggregateArray(req).length === 0;

    let action;

    if (this.newFieldsProvided(req)) {
      action = 'addItem';
    } else if (noItemsPresent()) {
      action = 'redirectToAddStep';
    }

    return action || 'showItems';
  }

  getValues(req, res, next) {
    const action = req.params.action || this.getAction(req, res, next);
    this.handleAction(req, res, next, action);
  }

  handleAction(req, res, next, action) {
    switch (action) {
      case 'delete':
        this.deleteItem(req, res);
        break;
      case 'edit':
        this.editItem(req, res);
        break;
      case 'addItem':
        this.addItem(req, res);
        break;
      case 'redirectToAddStep':
        this.redirectToAddStep(req, res);
        break;
      case 'showItems':
      default:
        return Object.assign({}, super.getValues(req, res, next), { redirected: false });
    }
    return { redirected: true };
  }

  parseField(field, value, req) {
    const fieldName = field.field || field;
    const parser = req.form.options.fieldsConfig[fieldName].parse;
    return parser ? parser(value, fieldName, req) : value;
  }

  locals(req, res) {
    const items = this.getAggregateArray(req);

    items.forEach((element, index) => {
      element.index = index;
    });

    return Object.assign({}, super.locals(req, res), {
      items,
      hasItems: items.length > 0,
      addStep: req.form.options.addStep,
      field: req.form.options.aggregateTo,
      addAnotherLinkText: req.form.options.addAnotherLinkText
    });
  }
};
