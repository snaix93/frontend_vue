<template>
  <v-flex md5 xs12>
    <v-text-field
      v-model.trim="search"
      :hide-details="!searchHint"
      :hint="searchHint"
      :label="$t('form.field.search') | capitalize"
      :persistent-hint="!!searchHint"
      :placeholder="$attrs.placeholder"
      append-icon="search"
      clearable
      single-line
      @keydown.enter="onEnter"
    />
  </v-flex>
</template>

<script>
  import { debounce } from 'lodash-es';

  export default {
    name: 'SearchBox',
    props: {
      value: {},
      searchBy: {
        type: [Array, Boolean],
        required: false,
        default: false
      },
    },
    data() {
      return {
        search: this.value,
      };
    },
    computed: {
      searchHint() {
        if (! this.searchBy) return this.$attrs?.hint ?? '';
        return `Search by: ${this.searchBy.join(', ').trim(', ')}`;
      }
    },
    watch: {
      value() {
        this.search = this.value;
      },
      search: {
        handler: debounce(function (value) {
          this.$emit('input', value);
        }, 300),
      },
    },
    methods: {
      onEnter() {
        this.$emit('input', this.search);
      },
    },
  };
</script>
