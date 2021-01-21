import Model from '@/models/Model';

export default class Frontman extends Model {
  static className = 'Frontman';
  static resource = 'frontmen';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    location: '',
  };

  fetchInstallSnippets() {
    return this.$http.$get(`/wizard/frontman/${this.id}`)
               .then(({ data }) => data);
  }
}
