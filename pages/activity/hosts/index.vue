<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $t('activity.hostActivities') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
    </PageToolbar>

    <HostActivitiesTable/>
  </v-layout>
</template>
<script>
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import HostActivitiesTable from '@/components/Activities/HostActivitiesTable';

  export default {
    layout: 'admin',
    components: {
      PageToolbar,
      HostActivitiesTable,
    },
    middleware: 'canWrite',
  };
</script>
