<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    custom-dialog-hide-mutation="api/toggleDeleteDialog"
    :wait="waitKey"
    @confirm="deleteToken(selectedToken)"
  >
    <template #content>
      {{ $t('api.deleteConfirm', { name: selectedToken.name }) }}
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
      ...mapState('api', {
        dialog: 'deleteDialog',
      }),
      ...mapState('api', ['selectedToken']),
      waitKey() {
        return this.$WAIT_FOR.API_TOKEN.CONFIRM_DELETE_ID(this.selectedToken.id);
      }
    },
    methods: {
      ...mapActions('api', {
        deleteTokenAction: 'deleteToken',
      }),
      deleteToken(token) {
        this.deleteTokenAction(token)
            .then(() => {
              this.$emit('on-delete', { success: true, token });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, token });
            });
      },
    },
  };
</script>
