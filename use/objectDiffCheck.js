import { isEqual, isObject, transform } from 'lodash-es';

export const hasDiff = (a, b) => !! Object.getOwnPropertyNames(difference(a, b)).length;

const difference = (object, base) => {
  return transform(object, (result, value, key) => {
    if (! isEqual(value, base[key])) {
      result[key] = isObject(value) && isObject(base[key])
                    ? difference(value, base[key])
                    : value;
    }
  });
};
