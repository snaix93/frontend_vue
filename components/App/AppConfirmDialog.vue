<template>
  <v-dialog
    v-model="dialog"
    max-width="400px"
    persistent
  >
    <v-card class="position-relative">
      <v-card-title class="subheading">
        <slot name="content"/>
      </v-card-title>
      <v-card-text class="py-0 my-0">
        <BackendValidationAlert/>
        <slot name="content-body"/>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          :disabled="loading"
          flat
          @click="onCancel"
        >
          <slot name="button-cancel">
            {{ $t('button.cancel') }}
          </slot>
        </v-btn>
        <v-btn
          :loading="loading"
          color="primary"
          data-cy="dialogConfirmButton"
          flat
          @click="onConfirm"
        >
          <slot name="button">
            {{ $t('button.confirm') }}
          </slot>
        </v-btn>
      </v-card-actions>
      <AppWait
        :wait="loading"
        height="100%"
      />
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState } from 'vuex';
  import AppWait from '@/components/App/AppWait';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    components: { AppWait },
    mixins: [useBackendValidation],
    props: {
      customDialog: {
        required: false,
      },
      customDialogHideMutation: {
        required: false,
      },
      wait: {
        type: String,
        required: false,
      },
    },
    data() {
      return {
        loading: false,
      };
    },
    computed: {
      ...mapState('app', {
        appConfirmDialog: 'confirmDialog'
      }),
      dialog() {
        return this.customDialog
               ? this.customDialog
               : this.appConfirmDialog;
      },
    },
    beforeMount() {
      if (this.dialog && this.wait) {
        this.$wait.start(this.wait);
      }
    },
    beforeDestroy() {
      if (this.wait) {
        this.$wait.end(this.wait);
      }
      this.useBackendValidation_reset();
    },
    methods: {
      onCancel() {
        this.useBackendValidation_reset();
        this.closeDialog();
        this.loading = false;
        this.$emit('cancel');
      },
      onConfirm() {
        this.useBackendValidation_reset();
        this.loading = true;
        this.$emit('confirm', {
          onSuccess: () => {
            this.loading = false;
            this.closeDialog();
          },
          onFailed: () => {
            this.loading = false;
          }
        });
      },
      closeDialog() {
        if (this.customDialogHideMutation) {
          this.$store.commit(this.customDialogHideMutation);
        } else {
          this.$store.commit('app/hideConfirmDialog');
        }
      },
    },
  };
</script>
