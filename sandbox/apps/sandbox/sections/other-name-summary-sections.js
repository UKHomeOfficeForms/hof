
module.exports = {
  applicantsDetails: [
    {
      step: '/name',
      field: 'name',
    },
    {
      step: '/add-other-name',
      field: 'otherNames',
      parse: list => {
        if (!Array.isArray(list) || !list.length) {
          return 'None';
        }
        return list
          .map(item => item.record || item.otherName)
          .filter(Boolean)
          .join(', \n');
      }
    },
  ],
};
