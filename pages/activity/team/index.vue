<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $t('activity.teamActivities') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
    </PageToolbar>
    <TeamActivitiesTable/>
  </v-layout>
</template>
<script>
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import TeamActivitiesTable from '@/components/Activities/TeamActivitiesTable';

  export default {
    layout: 'admin',
    components: {
      PageToolbar,
      TeamActivitiesTable,
    },
    middleware: 'canWrite',
  };
</script>
