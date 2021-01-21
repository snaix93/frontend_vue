<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="jobmonResults/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteJobmonResult"
  >
    <template #content>
      {{ $t('host.jobmonResults.deleteConfirm', { job: stringPreview(selectedJobmonResult.jobId, 36)}) }}
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

  import appMixins from '@/mixins/app';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    components: {
      AppConfirmDialog,
    },
    mixins: [
      appMixins,
      useBackendValidation,
    ],
    computed: {
      ...mapState('jobmonResults', {
        dialog: 'deleteDialog',
      }),
      ...mapState('jobmonResults', ['selectedJobmonResult']),
      waitKey() {
        return this.$WAIT_FOR.JOBMON_RESULT.CONFIRM_DELETE_ID(this.selectedJobmonResult.jobId);
      }
    },
    methods: {
      ...mapActions('jobmonResults', {
        deleteJobmonResultAction: 'deleteJobmonResult',
      }),
      deleteJobmonResult({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteJobmonResultAction({ JobmonResult: this.selectedJobmonResult })
            .then(() => {
              this.$emit('on-delete', { success: true, JobmonResult: this.selectedJobmonResult });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, JobmonResult: this.selectedJobmonResult });
            });
      },
    },
  };
</script>
