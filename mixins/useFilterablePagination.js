const DEFAULTS = {
  descending: true,
  page: 1,
  sortBy: 'date-created',
  rowsPerPage: 10,
};

export default {
  data() {
    return {
      pagination: {
        ...DEFAULTS
      },
      rowsPerPage: [10, 25, 50, 75, 100],
    };
  },
  watch: {
    pagination: {
      handler({ sortBy, descending, page, rowsPerPage: limit }) {
        if (sortBy === null) sortBy = DEFAULTS.sortBy;
        if (descending === null) descending = DEFAULTS.descending;
        this.filters = {
          ...this.filters,
          page,
          limit,
          sortBy: `${descending ? '-' : ''}${sortBy}`,
        };
      },
      deep: true,
    },
  },
};
