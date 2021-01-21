import Model from '@/models/Model';

export default class SnmpCheck extends Model {
  static className = 'SnmpCheck';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    preset: 'bandwidth',
    checkInterval: 90,
    active: true,
  };
}
