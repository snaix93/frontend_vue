export default {
  data() {
    return {
      event_descriptionTruncateLength: 54,
    };
  },
  methods: {
    event_formatLastValue(template, value) {
      let result = template.replace('%s',
        `<span class="font-weight-medium grey--text text--darken-3">${value}</span>`);

      result = result.replace('%%', '%');

      return result;
    },
  },
};
