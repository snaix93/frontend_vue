import { Model as BaseModel } from 'vue-api-query';
import { kebabCase } from 'lodash-es';

export default class Model extends BaseModel {
  static className;
  static resource;
  static defaultFilters = {
    page: 1,
    limit: 10,
    sortBy: '-date-created',
    search: null,
  };
  #meta;
  #payload;
  #originalAttributes;

  constructor(...attributes) {
    let data = attributes;
    if (data.length === 0) {
      super(...data);
    } else {
      [attributes] = attributes;
      data = attributes;
      if (attributes.hasOwnProperty('data')) {
        data = attributes.data;
      }
      super(data);
      this._setMetaToModel(attributes);
    }

    this.#originalAttributes = JSON.stringify(data);
  }

  /**
   * Get classname from static private property defined on child model.
   * @return {string}
   */
  static getClassName() {
    return (new this).getClassName();
  }

  static filter({ page, limit, sortBy, search }) {
    return this
      .params({ search })
      .orderBy(sortBy?.option || sortBy)
      .page(page)
      .limit(limit);
  }

  _setMetaToModel(attributes) {
    let meta = null;
    if (attributes.hasOwnProperty('meta')) {
      meta = attributes.meta || null;
    }

    this.#meta = meta;
  }

  reset() {
    let originalValues = JSON.parse(this.#originalAttributes);
    for (let prop in this) {
      if (originalValues.hasOwnProperty(prop)) {
        this[prop] = originalValues[prop];
      } else {
        delete this[prop];
      }
    }
  }

  /**
   * Useful for making a clone of the model without all the Vue reactive stuff.
   * @return {Model}
   */
  makeClone() {
    const fromResource = this?._fromResource || null;
    const model = new this.constructor(JSON.parse(JSON.stringify(this)));
    if (fromResource) {
      model._from(fromResource);
    }
    return model;
  }

  getLastRequestMeta(key = null) {
    return key ? this.#meta[key] : this.#meta;
  }

  orderBy(...args) {
    args = args.map((sortBy) => sortBy?.option || sortBy)
               .filter((sortBy) => sortBy !== 'null');

    if (args.length) {
      this._builder.orderBy(...args);
    }

    return this;
  }

  resource() {
    let resource = this.constructor.resource;
    if (!resource) {
      let className = this.getClassName();
      if (className) {
        return kebabCase(className) + 's';
      }

      throw new Error('You need to define the resource on the child class.');
    }

    return resource;
  }

  parameterNames() {
    let parameterNames = super.parameterNames();
    return {
      ...parameterNames,
      page: 'page[number]',
      limit: 'page[size]',
    };
  }

  baseURL() {
    // intentionally empty so nuxt axios config pulls in base url
    return '';
  }

  request(config) {
    return this.$http.request(config);
  }

  /**
   * Get classname from current instance of Model.
   * @return {string}
   */
  getClassName() {
    let className = this.constructor.className;
    if (!className) {
      throw new Error('You need to define the className on the child class.');
    }
    return className;
  }

  params(payload) {
    if (this._builder === undefined) {
      this.#payload = payload;
    } else {
      this._builder.params(payload);
    }

    return this;
  }

  endpoint() {
    let endpoint = super.endpoint();
    if (this.#payload) {
      const queryString = Object.keys(this.#payload)
                                .map((key) => `${key}=${this.#payload[key]}`)
                                .join('&');
      if (/\?.+=.*/g.test(endpoint)) {
        endpoint = endpoint + '&' + queryString;
      } else {
        endpoint = endpoint + '?' + queryString;
      }
    }
    this.#payload = null;
    return endpoint;
  }

  _create() {
    return this.request({
      method: 'POST',
      url: this.endpoint(),
      data: this,
    }).then((response) => {
      return Object.assign(this, response?.data?.data);
    });
  }

  patchSave() {
    if (!this.hasId()) {
      throw new Error('You cannot patch save a new model. It is for partially updating existing models only.');
    }

    return this._update('PUT', true);
  }

  _update(method = 'PUT', partial = false) {
    return this.request({
      method,
      url: this.endpoint(),
      data: this,
    }).then((response) => {
      if (partial) return this;
      this._setMetaToModel(response?.data);
      return Object.assign(this, response?.data?.data);
    });
  }
}
