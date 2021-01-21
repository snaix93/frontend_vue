import Model from '@/models/Model';

export default class Report extends Model {
  static className = 'Report';
  static persistableFilterKey = 'report';
  static filters = {
    ...this.defaultFilters,
    from: undefined,
    to: undefined,
    host: undefined,
  };

  static filter({ page, limit, search, host, from, to }) {
    const filter = super.filter({ page, limit, search });

    if (host !== undefined) filter.where('host', host);
    if (from !== undefined) filter.where('from', from);
    if (to !== undefined) filter.where('to', to);

    return filter;
  }

  static downloadReports(from, to) {
    return this.$http.$get(`/reports/download?filter[from]=${from}&filter[to]=${to}`)
               .then(({ data }) => data);
  }
}
