<template>
  <Modal
    :dialog="dialog"
    :on-cancel="onCancel"
    :on-submit="onSubmit"
    :wait-key="$WAIT_FOR.HOST.ID(Host.id)"
  >
    <template #title>
      {{ $t('phrase.areYouSure') }}
    </template>

    <v-layout column>
      <v-flex>
        <BackendValidationAlert/>
      </v-flex>
      <v-flex>
        <p>
          {{ $t('host.hideFromDashboardConfirm', { host: Host.name }) }}
        </p>
        <p class="font-weight-bold">
          {{ $t('phrase.wantToProceed') }}
        </p>
      </v-flex>
    </v-layout>

    <template #button>
      {{ $t('button.confirm') }}
    </template>
  </Modal>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import Modal from '@/components/App/Modal';

  export default {
    components: { Modal },
    mixins: [useBackendValidation],
    computed: {
      ...mapState('dashboard', {
        dialog: 'hideHostDialog',
      }),
      ...mapState('dashboard', ['Host']),
    },
    methods: {
      ...mapActions('dashboard', ['removeHostFromDashboard']),
      ...mapMutations('dashboard', ['toggleHideHostDialog']),
      async onSubmit() {
        this.useBackendValidation_reset();
        this.Host.dashboard = false;
        this.removeHostFromDashboard({ Host: this.Host })
            .then(() => {
              this.$emit('on-update', { success: true, Host: this.Host });
              this.toggleHideHostDialog();
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.Host.dashboard = true;
              this.$emit('on-update', { success: false, Host: this.Host });
            });
      },
      onCancel() {
        this.useBackendValidation_reset();
        this.toggleHideHostDialog();
      },
    },
  };
</script>
