<template>
  <Modal
    :dialog="dialog"
    :on-cancel="onCancel"
    :on-submit="onSubmit"
    :wait-key="$WAIT_FOR.FRONTMAN.ALL"
  >
    <template #title>
      <template v-if="selectedFrontman.hasId()">
        {{ $t('frontman.updateFrontman') | capitalize }}
      </template>
      <template v-else>
        {{ $t('frontman.addFrontman') | capitalize }}
      </template>
    </template>

    <v-layout mb-3>
      <v-flex>
        <p class="mb-3">
          {{ $t('frontman.install.description') }}
        </p>
        <ol>
          <li
            v-for="(list, index) in installList"
            :key="index"
          >
            {{ list }}
          </li>
        </ol>
      </v-flex>
      <v-flex>
        <img
          alt="frontman"
          class="icon large ml-1"
          src="~/assets/icons/icons8-hierarchy.svg"
        >
      </v-flex>
    </v-layout>

    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.frontmanDescription') | capitalize"
      :rules="validationRules.location"
      validation-key="location"
    >
      <template #default="prop">
        <v-text-field
          v-model="selectedFrontman.location"
          v-validate="prop.rules"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :placeholder="prop.label"
          data-vv-validate-on="blur"
          single-line
        />
      </template>
    </VeeFormGroup>

    <BackendValidationAlert/>

    <template #button>
      <template v-if="selectedFrontman.hasId()">
        {{ $t('frontman.buttonUpdateFrontman') }}
      </template>
      <template v-else>
        {{ $t('frontman.buttonAddFrontman') }}
      </template>
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
    data() {
      return {
        validationRules: {
          location: 'required|min:3|max:50',
        },
        installList: [
          this.$t('frontman.install.list.createALocation'),
          this.$t('frontman.install.list.installTheFrontmanSoftware'),
          this.$t('frontman.install.list.addDevices'),
        ],
      };
    },
    computed: {
      ...mapState('frontmen', {
        dialog: 'frontmanDialog',
      }),
      ...mapState('frontmen', ['selectedFrontman']),
    },
    methods: {
      ...mapActions('frontmen', {
        updateFrontmanAction: 'updateFrontman',
        createFrontmanAction: 'createFrontman',
      }),
      ...mapMutations('frontmen', ['toggleFrontmanDialog']),
      async onSubmit() {
        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (!result) return;

        if (this.selectedFrontman.hasId()) {
          this.updateFrontman(this.selectedFrontman);
        } else {
          this.createFrontman(this.selectedFrontman);
        }
      },
      updateFrontman(Frontman) {
        this.updateFrontmanAction({ Frontman })
            .then(() => {
              this.$emit('on-update', { success: true, Frontman });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, Frontman });
            });
      },
      createFrontman(Frontman) {
        this.createFrontmanAction({ Frontman })
            .then(() => {
              this.$emit('on-create', { success: true, Frontman });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, Frontman });
            });
      },
      onCancel() {
        this.toggleFrontmanDialog();
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .icon
    height: 60px
    width: 60px
</style>
