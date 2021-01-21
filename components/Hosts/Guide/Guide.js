import { get as getValue, set as setValue } from 'dot-prop';
import { merge } from 'lodash-es';

class Guide {
  /**
   * Defaults...
   */
  settings = {
    // if false then required/optional badges won't be shown
    // regardless of their settings...
    active: false,
    // host create dialog title
    title: '',
    frontman: {
      // controls visibility of entire monitoring location section
      show: true,
      // show required badge if true, optional badge if false
      required: false,
    },
    name: {
      // use to change input placeholder / label
      label: '',
      // show required badge if true, optional badge if false
      required: true,
    },
    connect: {
      // use to change input placeholder / label
      label: '',
      // show required badge if true, optional badge if false
      required: false,
    },
    description: {
      // use to change input placeholder / label
      label: '',
      // show required badge if true, optional badge if false
      required: false,
    },
    tags: {
      // use to change input placeholder / label
      label: '',
      // show required badge if true, optional badge if false
      required: false,
    },
    agent: {
      // if true shows agent checkbox
      show: true,
      // use to change checkbox hint text
      hint: '',
      // show required badge if true, optional badge if false
      required: false,
      // pre-check agent checkbox if true
      checked: false,
    },
  };

  /**
   * Add watchers to control form for specific guides.
   * @type {Array}
   */
  registeredWatchers = [];

  constructor(vm) {
    this.vm = vm;
    this.origSettings = JSON.stringify(this.settings);
  }

  title(title) {
    this.setValue('title', title);
    return this;
  }

  optional(...optional) {
    return this.arraySet(optional, { required: false });
  }

  required(...required) {
    return this.arraySet(required, { required: true });
  }

  checked(...checked) {
    return this.arraySet(checked, { checked: true });
  }

  show(...show) {
    return this.arraySet(show, { show: true });
  }

  hide(...hide) {
    return this.arraySet(hide, { show: false });
  }

  labels(labels) {
    return this.objectSet(labels, 'label');
  }

  hints(hints) {
    return this.objectSet(hints, 'hint');
  }

  watchers(watchers) {
    watchers.forEach(({ watch, callback }) => {
      this.registeredWatchers.push(
        this.vm.$watch(watch, callback, { immediate: true }),
      );
    });
    return this;
  }

  active(bool = true) {
    this.setValue('active', bool);
    return this;
  }

  fetch(key, defaultVal = null) {
    return getValue(this.settings, key, defaultVal);
  }

  setValue(key, value) {
    this.settings = merge({}, this.settings, setValue({}, key, value));
  }

  reset() {
    this.settings = JSON.parse(this.origSettings);
    this.registeredWatchers.forEach(unwatch => unwatch());
    this.registeredWatchers = [];
  }

  arraySet(array, value) {
    array.forEach(key => this.setValue(key, value));
    return this;
  }

  objectSet(object, deepKey) {
    Object.entries(object).forEach(([key, value]) => {
      this.setValue(`${key}.${deepKey}`, value);
    });

    return this;
  }
}

export default Guide;
