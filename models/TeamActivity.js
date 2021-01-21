import Model from '@/models/Model';

export default class TeamActivity extends Model {
  static className = 'TeamActivity';
  static resource = 'activity/team';
  static filters = {
    ...this.defaultFilters,
    from: null,
    to: null,
  };

  static filter({ page, limit, sortBy, search, from, to }) {
    return super.filter({ page, limit, sortBy, search })
                .where('from', from)
                .where('to', to);
  }
}
