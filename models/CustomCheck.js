import Model from '@/models/Model';

export default class CustomCheck extends Model {
  static className = 'CustomCheck';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    name: '',
    expectedUpdateInterval: 90,
  };
}
