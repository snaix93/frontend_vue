<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="webChecks/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteWebCheck"
  >
    <template #content>
      {{ $t('checks.deleteWebCheckConfirm', { check: useWebCheckHelpers_urlPreview(selectedWebCheck, Host) }) }}
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
  import useWebCheckHelpers from '@/mixins/useWebCheckHelpers';

  export default {
    components: {
      AppConfirmDialog,
    },
    mixins: [
      useBackendValidation,
      useWebCheckHelpers,
    ],
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('webChecks', {
        dialog: 'deleteDialog',
      }),
      ...mapState('webChecks', ['selectedWebCheck']),
      waitKey() {
        return this.$WAIT_FOR.WEB_CHECK.CONFIRM_DELETE_ID(this.selectedWebCheck.id);
      }
    },
    methods: {
      ...mapActions('webChecks', {
        deleteWebCheckAction: 'deleteWebCheck',
      }),
      deleteWebCheck({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteWebCheckAction({ WebCheck: this.selectedWebCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-delete', { success: true, WebCheck: this.selectedWebCheck });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, WebCheck: this.selectedWebCheck });
            });
      },
    },
  };
</script>
