import Model from '@/models/Model';

export default class HostActivity extends Model {
  static className = 'HostActivity';
  static resource = 'activity/hosts';
  static filters = {
    ...this.defaultFilters,
    month: null,
  };

  static filter({ page, limit, sortBy, search, month }) {
    return super.filter({ page, limit, sortBy, search })
                .where('month', month);
  }
}
