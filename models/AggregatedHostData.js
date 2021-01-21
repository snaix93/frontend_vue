import Model from '@/models/Model';
import Event from '@/models/Event';
import { DASHBOARD_AGGREGATE_BY } from '@/constants/dashboard';

export default class AggregatedHostData extends Model {
  static className = 'AggregatedHostData';
  static activeFilters = {};

  static filter({ page, limit, sortBy, subUnit, group, tag, withIssuesOnly, aggregateEntity }) {
    AggregatedHostData.activeFilters = arguments[0];

    const filter = super.filter({ page, limit, sortBy });

    if (subUnit !== undefined) filter.where('sub-unit', subUnit);
    if (tag !== undefined) filter.where('tag', tag);
    if (group !== undefined) filter.where('group', group);
    if (aggregateEntity !== undefined) filter.where('aggregate-entity', aggregateEntity);
    if (withIssuesOnly !== undefined) filter.where('with-issues-only', withIssuesOnly);

    return filter;
  }

  setAggregatedType(groupBy) {
    AggregatedHostData.resource = `hosts/aggregated/${groupBy}`;

    return this;
  }

  events() {
    const eventQuery = new Event;
    eventQuery._builder = this._builder;
    eventQuery.custom(`/${this.resource()}/${eventQuery.resource()}`);
    return eventQuery;
  }

  renderTitle() {
    switch (this.groupedBy) {
      case DASHBOARD_AGGREGATE_BY.GROUP:
        const { 0: group, 1: tagStr } = this.groupedEntity.split(':');
        return `${group}: <strong>${tagStr}</strong>`;
      case DASHBOARD_AGGREGATE_BY.SUB_UNIT:
        return this.groupedEntity.shortId;
    }
  }
}
