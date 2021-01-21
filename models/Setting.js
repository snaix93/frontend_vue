import Model from '@/models/Model';
import { set } from 'lodash-es';

export default class Setting extends Model {
  static className = 'Setting';

  constructor(...attributes) {
    super(attributes);
    const _this = this;
    return new Proxy(this, {
      get(target, prop, receiver) {
        const value = _this._getValueByKey(prop);
        if (value) return value;
        return Reflect.get(...arguments);
      }
    });
  }

  static createForModel(model) {
    const instance = new Setting;
    instance.withSettings(model._settings);
    instance.setResource(`${model.resource()}-settings`);
    return instance;
  }

  resource() {
    return this._resource;
  }

  withSettings(settings) {
    this._settings = settings;
  }

  _assertSettingExists(key) {
    const value = this._getValueByKey(key);
    if (value === undefined) {
      throw new TypeError(`SETTINGS ERROR: This key does not exist for this entity's settings.`);
    }
    return true;
  }

  _getValueByKey(key) {
    try {
      return key.split('.').reduce((a, b) => a[b], this._settings);
    } catch (e) {
      // Catch and release because above will return undefined in the event of an error.
    }
  }

  get(key) {
    this._assertSettingExists(key);
    return this._getValueByKey(key);
  }

  save() {
    return this.request({
      method: 'PUT',
      url: this.endpoint(),
      progress: false,
      data: {
        settings: JSON.parse(JSON.stringify(this._settings))
      }
    });
  }

  set(key, value = null) {
    let values = key;
    if (typeof values === 'string') {
      values = {
        [key]: value
      };
    }

    Object.entries(values).forEach(([key, value]) => {
      this._assertSettingExists(key);
      set(this._settings, key, value);
    });

    return this;
  }

  setResource(resource) {
    this._resource = resource;
  }
}
