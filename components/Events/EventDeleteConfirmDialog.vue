<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    :wait="waitKey"
    custom-dialog-hide-mutation="events/toggleDeleteDialog"
    @confirm="deleteEvent"
  >
    <template #content>
      <p>
        {{
          $t('message.events.clearEvent', {
            issue: selectedEvent.issueDescription
          }) | capitalize
        }}
      </p>
    </template>
    <template #button>
      <v-icon>delete</v-icon>
      {{ $t('button.delete') }}
    </template>
  </AppConfirmDialog>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    components: {
      AppConfirmDialog,
    },
    mixins: [useBackendValidation],
    computed: {
      ...mapState('events', {
        dialog: 'deleteDialog',
      }),
      ...mapState('events', ['selectedEvent']),
      waitKey() {
        return this.$WAIT_FOR.EVENT.CONFIRM_DELETE_ID(this.selectedEvent.id);
      }
    },
    methods: {
      ...mapActions('events', {
        deleteEventAction: 'deleteEvent',
      }),
      deleteEvent({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteEventAction({ Event: this.selectedEvent })
            .then(() => {
              this.$emit('on-delete', { success: true, Event: this.selectedEvent });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, Event: this.selectedEvent });
            });
      },
    },
  };
</script>
