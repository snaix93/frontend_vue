<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $tc('report.name') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
    </PageToolbar>
    <v-flex grow>
      <v-card>
        <ReportsTable/>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import 'moment-timezone';
  import 'vue-date-pick/dist/vueDatePick.css';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar.vue';
  import ReportsTable from '@/components/Reports/ReportsTable';
  import appMixins from '@/mixins/app';

  export default {
    layout: 'admin',
    components: {
      ReportsTable,
      PageToolbar,
    },
    mixins: [appMixins],
  };
</script>

<style lang="stylus" scoped>
  .v-menu__content
    box-shadow: none !important
</style>
