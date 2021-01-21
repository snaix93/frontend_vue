import { hasDiff } from '@/use/objectDiffCheck';

export default {
  data() {
    return {
      persistableFilterKey: undefined,
    };
  },
  created() {
    if (! this.persistableFilterKey) return;
    this.__origSettings = undefined;
    this.$__executeUsePersistableFilters();
  },
  async beforeDestroy() {
    if (! this.persistableFilterKey) return;

    const newSettings = {
      page: this.filters.page,
      limit: this.filters.limit,
      search: this.filters.search,
      sortBy: this.filters.sortBy,
    };
    if (hasDiff(newSettings, this.__origSettings)) {
      try {

        await this.$userSettings
                  .set(`filters.${this.persistableFilterKey}`, newSettings)
                  .save();
        this.__origSettings = newSettings;

      } catch (e) {
        // Do nothing
      }
    }
  },
  methods: {
    $__executeUsePersistableFilters() {
      const settings = this.$userSettings.get(`filters.${this.persistableFilterKey}`);
      this.__origSettings = settings;
      this?.pagination ? this.pagination = {
        ...this.pagination,
        page: settings.page,
        rowsPerPage: settings.limit,
        sortBy: settings.sortBy.replace(/^-/, ''),
        descending: settings.sortBy && settings.sortBy[0] === '-',
      } : null;

      this?.setFilters ? this.setFilters({
        ...this.filters,
        ...settings,
      }, true) : null;
    }
  },
};
