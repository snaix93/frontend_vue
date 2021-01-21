<template>
  <AppConfirmDialog
    :custom-dialog="dialog"
    :wait="waitKey"
    custom-dialog-hide-mutation="rules/toggleDeleteDialog"
    @confirm="deleteRule"
  >
    <template #content>
      {{ $t('rule.deleteConfirm', { rule: selectedRule.id }) }}
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
      ...mapState('rules', {
        dialog: 'deleteDialog',
      }),
      ...mapState('rules', ['selectedRule']),
      waitKey() {
        return this.$WAIT_FOR.RULE.CONFIRM_DELETE_ID(this.selectedRule.id);
      }
    },
    methods: {
      ...mapActions('rules', {
        deleteRuleAction: 'deleteRule',
      }),
      deleteRule({ onSuccess, onFailed }) {
        this.useBackendValidation_reset();
        this.deleteRuleAction({ Rule: this.selectedRule })
            .then(() => {
              this.$emit('on-delete', { success: true, Rule: this.selectedRule });
              onSuccess();
            })
            .catch(({ response }) => {
              onFailed();
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-delete', { success: false, Rule: this.selectedRule });
            });
      },
    },
  };
</script>
