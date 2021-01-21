<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    :wait="waitKey"
    custom-dialog-hide-mutation="events/toggleReminderDeleteDialog"
    @confirm="deleteEventReminder"
  >
    <template #content>
      <p>
        {{
          $t('message.reminders.cancelRemindersConfirm', {
            event: selectedEvent.checkKey + ' ' + selectedEvent.message,
            host: selectedEvent.host ? selectedEvent.host.name : '',
          })
        }}
      </p>
      <p class="mb-0">
        <v-icon
          class="pr-1"
          color="warning"
          small
        >
          warning
        </v-icon>
        <span class="warning--text">{{
            $t('message.reminders.cancelRemindersWarning')
          }}</span>
      </p>
    </template>
    <template #button>
      <v-icon>notifications_off</v-icon>
      {{ $t('button.cancelReminders') }}
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
        dialog: 'deleteReminderDialog',
      }),
      ...mapState('events', ['selectedEvent']),
      waitKey() {
        return this.$WAIT_FOR.EVENT.CONFIRM_CANCEL_REMINDER_ID(this.selectedEvent.id);
      }
    },
    methods: {
      ...mapActions('events', {
        updateEventAction: 'updateEvent',
      }),
      deleteEventReminder({ onSuccess, onFailed }) {
        this.selectedEvent.reminders = false;
        this.useBackendValidation_reset();
        this.updateEventAction({ Event: this.selectedEvent })
            .then(() => {
              this.$emit('on-update', { success: true, Event: this.selectedEvent });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, Event: this.selectedEvent });
            });
      },
    },
  };
</script>
