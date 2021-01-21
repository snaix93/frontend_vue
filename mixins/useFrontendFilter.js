import sanitizeHtml from 'sanitize-html';

export default {
  computed: {
    truncateLength() {
      let result = 25;
      if (this.$vuetify.breakpoint.xlOnly) result = 85;
      return result;
    },
  },
  methods: {
    useFrontendFilter_preprocessSearchExp(value) {
      return value.split('*')
                  .join('.*')
                  .replace(/[|\\{}()[\]^$+?]/g, '\\$&');
    },
    useFrontendFilter_expressionSearch(items, search) {
      if (! search) return items;

      return items.filter((item) => {
        item = Object.assign({}, item);

        let result = false;
        const searchExp = new RegExp(this.useFrontendFilter_preprocessSearchExp(search), 'i');
        const searchColumns = this.searchColumns ? this.searchColumns : Object.keys(item);

        searchColumns.forEach((k) => {
          const value = item[k];

          if (typeof value === 'string') {
            if (searchExp.test(value)) result = true;
          }
        });

        return result;
      });
    },
    useFrontendFilter_highlightSearchResults(value, search) {
      if (! search)
        return value;

      const sanitizedValue = sanitizeHtml(value);

      const searchExp = new RegExp(`(${this.useFrontendFilter_preprocessSearchExp(search)})`, 'gi');
      const template = '<span class="highlighted-search-result yellow lighten-3">$1</span>';
      return sanitizedValue.replace(searchExp, template);
    },
    exceedsTruncateLength(value) {
      return !! value && !! value.length && value.length >= this.truncateLength;
    },
  },
};
