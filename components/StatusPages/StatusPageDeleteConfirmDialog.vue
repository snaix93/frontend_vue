<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="statusPages/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteStatusPage"
  >
    <template #content>
      <v-layout>
        <v-flex shrink>
          {{ $t('statusPages.deleteConfirm', { title: selectedStatusPage.title }) }}
        </v-flex>
        <v-spacer/>
      </v-layout>
    </template>
    <template #button>
      <v-icon left>
        delete_forever
      </v-icon>
      {{ $t('button.delete') }}
    </template>
  </AppConfirmDialog>
</template>

<script>
  import { mapActions, mapState} from 'vuex';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    components: {
      AppConfirmDialog,
    },
    mixins: [useBackendValidation],
    computed: {
      ...mapState('statusPages', {
        dialog: 'deleteDialog',
      }),
      ...mapState('statusPages', [
        'selectedStatusPage'
      ]),
      waitKey() {
        return this.$WAIT_FOR.STATUS_PAGE.CONFIRM_DELETE_ID(this.selectedStatusPage.id);
      }
    },
    methods: {
      ...mapActions('statusPages', {
        deleteStatusPageAction: 'deleteStatusPage',
      }),
      deleteStatusPage({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteStatusPageAction({StatusPage: this.selectedStatusPage})
            .then(() => {
              this.$emit('on-delete', {success: true, StatusPage: this.selectedStatusPage});
              onSuccess();
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              onFailed();
              this.$emit('on-delete', {success: false, StatusPage: this.selectedStatusPage});
            })
      },
    },
  };
</script>
