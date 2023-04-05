const _ = require('lodash');

const containsAll = (arr1, arr2) => arr2.every(i => arr1.includes(i));

const areOrderedEqual = (arr1, arr2) => JSON.stringify(arr1) === JSON.stringify(arr2);

const mapSections = obj => {
  const sections = Object.assign({}, obj);
  for (const section in sections) {
    if (sections.hasOwnProperty(section)) {
      sections[section] = _.map(sections[section], item => item.field || item);
    }
  }
  return sections;
};

module.exports = {
  containsAll,
  areOrderedEqual,
  mapSections
};
