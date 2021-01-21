<template>
  <div v-if="totalCount > 10 || search">
    <v-card-text class="mt-0 pt-0 grey lighten-5">
      <v-layout justify-end ma-0 pa-0>
        <SearchBox
          v-model="search"
          :search-by="searchBy"
        />
      </v-layout>
    </v-card-text>
    <v-divider/>
  </div>
</template>

<script>
  import SearchBox from '@/components/Form/SearchBox';

  export default {
    name: 'CheckSearchPanel',
    components: { SearchBox },
    props: {
      value: {},
      totalCount: {
        type: Number,
        required: true,
      },
      searchBy: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        search: this.value,
      };
    },
    watch: {
      value() {
        this.search = this.value;
      },
      search(value) {
        this.$emit('input', value);
      }
    },
  };
</script>

<style scoped>

</style>
