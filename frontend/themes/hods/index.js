const template = require('../../hods-template');
const path = require('path');

const partials = require('../../template-partials');

module.exports = options => template(options);

module.exports.views = [path.resolve(__dirname, './views'), partials.views];
module.exports.translations = partials.resources();
