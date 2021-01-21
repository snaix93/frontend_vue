import Model from '@/models/Model';

export default class SubUnit extends Model {
  static className = 'SubUnit';
  static filters = {
    ...this.defaultFilters,
  };
}
