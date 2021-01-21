<template>
  <v-layout justify-center>
    <PageToolbar>
      <v-toolbar-title>
        {{ $t('events.name') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
    </PageToolbar>
    <EventsTable
      @on-update="onUpdate"
      @on-delete="onDelete"
    />
  </v-layout>
</template>

<script>
  import EventDeleteConfirmDialog from '@/components/Events/EventDeleteConfirmDialog';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import EventsTable from '@/components/Events/EventsTable';

  export default {
    components: {
      EventDeleteConfirmDialog,
      EventsTable,
      PageToolbar
    },
    layout: 'admin',
    methods: {
      onUpdate({ Event, success = true }) {
        const issue = Event.issueDescription;
        if (success) {
          this.$flash.success(this.$t('message.success.remindersCancelled', { issue }));
        } else {
          this.$flash.error(this.$t('message.error.remindersCancelled', { issue }));
        }
      },
      onDelete({ Event, success = true }) {
        const issue = Event.issueDescription;
        if (success) {
          this.$flash.success(this.$t('message.success.clearEvent', { issue }));
        } else {
          this.$flash.error(this.$t('message.error.clearEvent', { issue }));
        }
      },
    }
  };
</script>

<style scoped>

</style>
