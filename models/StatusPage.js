import Model from './Model';

export default class StatusPage extends Model {
  static className = 'StatusPage';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    title: '',
    meta: {
      header: null,
      footer: null,
      hostTags: [],
      groupByTag: false,
      history: 10,
      showWarnings: false,
      hideOperational: false,
    },
  };

  static filter({ page, limit, sortBy, search, email }) {
    return super.filter({ page, limit, sortBy, search, email });
  }

  async fetchImage() {
    return new File([
      await this.$http.$get(`/status-pages/${this.id}/image`, {
        responseType: 'blob',
        headers: {
          Accept: this.imageContentType,
        }
      })
    ], `status_page_image_${this.id}`);
  }

  deleteImage() {
    return this.$http.$delete(`/status-pages/${this.id}/image`);
  }
}
