const { isObject } = require('lodash-es');

module.exports = {
  // https://stackoverflow.com/a/18022123
  setValue(path, value, obj) {
    const fields = path.split('.');
    let result = obj;
    for (let i = 0, n = fields.length; i < n && result !== undefined; i++) {
      const field = fields[i];
      if (i === n - 1) {
        result[field] = value;
      } else {
        if (typeof result[field] === 'undefined' || !isObject(result[field])) {
          result[field] = {};
        }
        result = result[field];
      }
    }
  },
};
