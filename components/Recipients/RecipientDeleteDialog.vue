<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="recipients/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteRecipient"
  >
    <template #content>
      {{ $t('recipients.deleteConfirm', {
        sendto: selectedRecipient.sendto,
      }) }}
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
  import AppMixin from '@/mixins/app';

  export default {
    components: {
      AppConfirmDialog,
    },
    mixins: [useBackendValidation, AppMixin],
    computed: {
      ...mapState('recipients', {
        dialog: 'deleteDialog',
      }),
      ...mapState('recipients', ['selectedRecipient']),
      waitKey() {
        return this.$WAIT_FOR.RECIPIENT.CONFIRM_DELETE_ID(this.selectedRecipient.id);
      }
    },
    methods: {
      ...mapActions('recipients', {
        deleteRecipientAction: 'deleteRecipient',
      }),
      deleteRecipient({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteRecipientAction({ Recipient: this.selectedRecipient })
            .then(() => {
              this.$emit('on-delete', { success: true, Recipient: this.selectedRecipient });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, Recipient: this.selectedRecipient });
            });
      },
    },
  };
</script>
