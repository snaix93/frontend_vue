<template>
  <Modal
    :dialog="dialog"
    :on-cancel="onCancel"
    :on-submit="onSubmit"
    :wait-key="$WAIT_FOR.SUB_UNIT.ALL"
  >
    <template #title>
      <template v-if="selectedSubUnit.hasId()">
        {{ $t('subUnit.updateSubUnit') | capitalize }}
      </template>
      <template v-else>
        {{ $t('subUnit.addSubUnit') | capitalize }}
      </template>
    </template>

    <BackendValidationAlert/>

    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.shortId') | capitalize"
      :rules="validationRules.shortId"
      data-cy="subUnitShortIdFormGroup"
      validation-key="shortId"
    >
      <template #default="prop">
        <v-text-field
          v-model="selectedSubUnit.shortId"
          v-validate="prop.rules"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :hint="$t('form.hint.shortId') | capitalize"
          :label="prop.label"
          data-vv-validate-on="blur"
          persistent-hint
          prepend-inner-icon="perm_contact_calendar"
          single-line
          counter="20"
        />
      </template>
    </VeeFormGroup>

    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.name') | capitalize"
      :rules="validationRules.name"
      data-cy="subUnitNameFormGroup"
      validation-key="name"
    >
      <template #default="prop">
        <v-text-field
          v-model="selectedSubUnit.name"
          v-validate="prop.rules"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :label="prop.label"
          data-vv-validate-on="blur"
          single-line
        />
      </template>
    </VeeFormGroup>

    <VeeFormGroup
      :error-bag="validationErrors"
      :label="$t('form.field.additionalInformation') | capitalize"
      :rules="validationRules.information"
      validation-key="information"
    >
      <template #default="prop">
        <v-textarea
          v-model="selectedSubUnit.information"
          v-validate="prop.rules"
          :data-vv-name="prop.validationKey"
          :error-messages="prop.firstErrorMessage"
          :label="prop.label"
          data-vv-validate-on="blur"
        />
      </template>
    </VeeFormGroup>

    <template #button>
      <template v-if="selectedSubUnit.hasId()">
        {{ $t('subUnit.buttonUpdateSubUnit') }}
      </template>
      <template v-else>
        {{ $t('subUnit.buttonAddSubUnit') }}
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
          shortId: 'required|max:20|uniqueShortId|patternShortId',
          name: 'required|max:150',
          information: 'max:1000',
        },
      };
    },
    computed: {
      ...mapState('subUnits', {
        dialog: 'subUnitDialog',
      }),
      ...mapState('subUnits', ['selectedSubUnit', 'subUnits']),
    },
    created() {
      this.$validator.extend('uniqueShortId', {
        getMessage: () => {
          return this.$options.filters.capitalize(this.$t('validation.uniqueShortId'));
        },
        validate: (value) => {
          return this.subUnits
                     .filter(({ id }) => id !== this.selectedSubUnit.id)
                     .map(({ shortId }) => shortId.toLowerCase())
                     .indexOf(value.toLowerCase()) === -1;
        },
      });
      this.$validator.extend('patternShortId', {
        getMessage: () => {
          return this.$t('validation.patternShortId');
        },
        validate: (value) => {
          // only letters, digits, dashes, underscores and whitespaces
          return /^[\w\d-_\s]+$/.test(value.trim());
        },
      });
    },
    methods: {
      ...mapActions('subUnits', {
        updateSubUnitAction: 'updateSubUnit',
        createSubUnitAction: 'createSubUnit',
      }),
      ...mapMutations('subUnits', ['toggleSubUnitDialog']),
      async onSubmit() {
        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (!result) return;

        if (this.selectedSubUnit.hasId()) {
          this.updateSubUnit(this.selectedSubUnit);
        } else {
          this.createSubUnit(this.selectedSubUnit);
        }
      },
      updateSubUnit(SubUnit) {
        this.updateSubUnitAction({ SubUnit })
            .then(() => {
              this.$emit('on-update', { success: true, SubUnit });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-update', { success: false, SubUnit });
            });
      },
      createSubUnit(SubUnit) {
        this.createSubUnitAction({ SubUnit })
            .then(() => {
              this.$emit('on-create', { success: true, SubUnit });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, SubUnit });
            });
      },
      onCancel() {
        this.toggleSubUnitDialog();
      },
    },
  };
</script>
