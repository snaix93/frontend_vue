import EventComment from '@/models/EventComment';
import Model from '@/models/Model';

export default class Event extends Model {
  static className = 'Event';
  static persistableFilterKey = 'event';
  static filters = {
    ...this.defaultFilters,
  };

  get issueDescription() {
    return `${this.checkKey} ${this.message}`;
  }

  eventComments(attributes) {
    const eventComment = this.hasMany(EventComment);

    if (attributes) {
      Object.assign(eventComment, JSON.parse(JSON.stringify(attributes)));
      delete eventComment._builder;
    }

    return eventComment;
  }
}
