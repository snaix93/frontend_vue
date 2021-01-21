import Model from '@/models/Model';

export default class JobmonResult extends Model {
  static className = 'JobmonResult';
  static filters = {
    ...this.defaultFilters,
  };

  primaryKey() {
    return 'jobId';
  }
}
