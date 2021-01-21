import Model from '@/models/Model';

export default class EventComment extends Model {
  static className = 'EventComment';
  static resource = 'comments';
  static filters = {
    page: 1,
    limit: 5,
  };
  static attributes = {
    text: '',
    visibleToGuests: true,
    statuspage: false,
    forward: true,
  };
}
