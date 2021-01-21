<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="customChecks/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteCustomCheck"
  >
    <template #content>
      {{ $t('checks.deleteCustomCheckConfirm', { check: selectedCustomCheck.name, }) }}
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
    mixins: [
      useBackendValidation,
    ],
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('customChecks', {
        dialog: 'deleteDialog',
      }),
      ...mapState('customChecks', ['selectedCustomCheck']),
      waitKey() {
        return this.$WAIT_FOR.CUSTOM_CHECK.CONFIRM_DELETE_ID(this.selectedCustomCheck.id);
      }
    },
    methods: {
      ...mapActions('customChecks', {
        deleteCustomCheckAction: 'deleteCustomCheck',
      }),
      deleteCustomCheck({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteCustomCheckAction({ CustomCheck: this.selectedCustomCheck, Host: this.Host  })
            .then(() => {
              this.$emit('on-delete', { success: true, CustomCheck: this.selectedCustomCheck });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, CustomCheck: this.selectedCustomCheck });
            });
      },
    },
  };
</script>
