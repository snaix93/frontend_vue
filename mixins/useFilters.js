import { hasDiff } from '@/use/objectDiffCheck';

export default {
  data() {
    return {
      $__initialLoadComplete: false,
      $__storedFilters: null,
      $__origFilters: null,
    };
  },
  watch: {
    filters: {
      async handler(filters) {
        if (this.$__storedFilters === undefined) {
          this.$__storedFilters = { ...this.filters };
          return;
        }

        if (hasDiff(
          { ...filters, page: null, sortBy: null },
          { ...this.$__storedFilters, page: null, sortBy: null })
        ) {
          filters.page = 1;
        }

        this.$__storedFilters = { ...filters };

        if (this.$__skipFilteringThisTime) {
          this.$__skipFilteringThisTime = false;
          return;
        }

        this.$bus.$emit('filter:pre-execute');
        this.$fetch ? await this.$fetch() : await this.filter();
        this.$bus.$emit('filter:post-execute');
      },
      immediate: true,
      deep: true,
    },
  },
  created() {
    this.$__origFilters = JSON.stringify(this.filters);
    this.$__skipFilteringThisTime = false;
    this.$bus.$on('filter', () => this.filter());
    this.$bus.$on('filters:clear', () => this.clearFilters());
  },
  computed: {
    useFilters_initialLoadComplete() {
      return this.$data.$__initialLoadComplete;
    }
  },
  beforeDestroy() {
    this.$bus.$off('filter');
    this.$bus.$off('filters:clear');
  },
  methods: {
    useFilters_initialLoadCompleted() {
      if (this.$data.$__initialLoadComplete) return;
      setTimeout(() => {
        this.$data.$__initialLoadComplete = true;
      }, 150);
    },
    setFilters(filters, withoutFiltering = false) {
      if (hasDiff(filters, this.filters)) {
        if (withoutFiltering) {
          this.skipFilteringThisTime();
        }
        this.filters = { ...this.filters, ...filters };
      }
    },
    clearFilters() {
      this.setFilters(JSON.parse(this.$__origFilters));
    },
    skipFilteringThisTime() {
      this.$__skipFilteringThisTime = true;
    },
  },
};
