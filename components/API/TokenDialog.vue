<template>
  <Modal
    :dialog="dialog"
    :on-submit="onSubmit"
    :on-cancel="onCancel"
    :wait-key="waitKey"
  >
    <template #title>
      {{ $t('api.createToken') | capitalize }}
    </template>

    <BackendValidationAlert/>
    <VeeFormGroup
      class="mt-2 mb-1"
      validation-key="capability"
      :rules="validationRules.capability"
      :error-bag="validationErrors"
      :label="$t('form.field.permission') | capitalize"
    >
      <template #default="prop">
        <v-select
          v-model="token.capability"
          :items="capabilities"
          :label="prop.label"
          :error-messages="prop.firstErrorMessage"
          item-text="text"
          item-value="value"
        />
      </template>
    </VeeFormGroup>

    <VeeFormGroup
      validation-key="name"
      :rules="validationRules.name"
      :error-bag="validationErrors"
      :label="$t('form.field.name') | capitalize"
    >
      <template #default="prop">
        <v-text-field
          v-model="token.name"
          v-validate="prop.rules"
          :data-vv-name="prop.validationKey"
          data-vv-validate-on="blur"
          :error-messages="prop.firstErrorMessage"
          :placeholder="prop.label"
          single-line
        />
      </template>
    </VeeFormGroup>

    <template #button>
      {{ $t('button.createToken') }}
    </template>
  </Modal>
</template>

<script>
  import {mapActions, mapMutations, mapState} from "vuex";
  import Modal from '@/components/App/Modal';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    components: { Modal },
    mixins: [ useBackendValidation ],
    data() {
      return {
        token: {
          name: null,
          capability: 'ro',
        },
        capabilities: [
          {
            text: this.$options.filters.capitalize(
              this.$tc('api.capabilities.readOnly'),
            ),
            value: 'ro',
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('api.capabilities.readAndWrite'),
            ),
            value: 'rw',
          },
        ],
        validationRules: {
          name: 'required|min:3|max:30|uniqueTokenName',
          capability: 'required',
        },
      };
    },
    computed: {
      ...mapState('api', [
        'tokens',
      ]),
      ...mapState('api', {
        dialog: 'tokenDialog',
      }),
      waitKey() {
        return this.$WAIT_FOR.API_TOKEN.CREATE;
      },
    },
    created() {
      this.$validator.extend('uniqueTokenName', {
        validate: value => this.tokens
                             .map(({ name }) => name.toLowerCase())
                             .indexOf(value.toLowerCase()) === -1,
      });
    },
    methods: {
      ...mapActions('api', {
        createTokenAction: 'createToken',
      }),
      ...mapMutations('api', ['toggleTokenDialog']),
      createToken(token) {
        this.createTokenAction(token)
            .then(() => {
              this.$emit('on-create', { success: true, token });
              this.reset();
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);

              this.$emit('on-create', { success: false, token });
            });
      },
      async onSubmit() {
        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (!result) return;

        this.createToken(this.token);
      },
      onCancel() {
        this.reset();
        this.toggleTokenDialog(false);
      },
      reset() {
        this.token.name = null;
        this.token.capability = 'ro';
        this.$validator.reset();
        this.useBackendValidation_reset();
      },
    },
  };
</script>
