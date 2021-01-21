<template>
  <Modal
    :dialog="dialog"
    :on-submit="onSubmit"
    :on-cancel="onCancel"
    button-color="error"
    max-width="600px"
  >
    <template #title>
      {{ $tc('settings.deleteAccount') | capitalize }}
    </template>

    <v-layout
      row
      wrap
    >
      <v-flex>
        <img
          src="~/assets/sad.png"
          class="sad-face"
          :alt="$tc('settings.deleteAccount')"
        >
      </v-flex>

      <v-flex xs9>
        <div
          v-if="teamMembers.length === 1"
          v-html="$t('settings.deleteAccountTeamHasNoOtherMembers')"
        />
        <div
          v-else-if="teamMembers.length > 1 && teamAdmins.length > 1"
          v-html="$t('settings.deleteAccountTeamHasAdmins')"
        />
        <div
          v-else-if="teamMembers.length > 1"
          v-html="$t('settings.deleteAccountTeamHasMembers')"
        />
      </v-flex>
    </v-layout>

    <v-layout
      row
      wrap
    >
      <v-flex xs12>
        <VeeFormGroup
          data-cy="deleteConfirmationField"
          validation-key="confirmation"
          :rules="validationRules.confirmation"
          :error-bag="validationErrors"
        >
          <template #default="prop">
            <v-text-field
              v-model="confirmation"
              v-validate="prop.rules"
              data-vv-validate-on="blur"
              :data-vv-name="prop.validationKey"
              :label="$t('settings.typeYes')"
              :error-messages="prop.firstErrorMessage"
            />
          </template>
        </VeeFormGroup>
      </v-flex>
    </v-layout>

    <v-layout
      v-show="confirmation === confirmationWord"
      row
      wrap
    >
      <v-flex xs12>
        <VeeFormGroup
          validation-key="why-leave-us"
          :rules="validationRules.whyDelete"
          :error-bag="validationErrors"
        >
          <template #default="prop">
            <v-radio-group
              v-model="whyDelete"
              v-validate="prop.rules"
              data-vv-validate-on="change|blur"
              :data-vv-name="prop.validationKey"
              :error-messages="prop.firstErrorMessage"
              :label="$t('settings.deleteAccountPleaseTellUsWhy') | capitalize"
            >
              <v-radio
                v-for="(text, key) in whyDeleteRadios"
                :key="key"
                :value="key"
              >
                <template #label>
                  {{ text }}
                </template>
              </v-radio>
            </v-radio-group>
          </template>
        </VeeFormGroup>
      </v-flex>

      <v-flex
        v-if="['missing-features', 'other'].indexOf(whyDelete) !== -1"
        xs12
      >
        <VeeFormGroup
          validation-key="freeText"
          :rules="validationRules.freeText"
          :error-bag="validationErrors"
        >
          <template #default="prop">
            <v-textarea
              v-model="freeText"
              v-validate="validationRules.freeText"
              :data-vv-name="prop.validationKey"
              :error-messages="prop.firstErrorMessage"
              :label="freeTextLabel | capitalize"
              outline
              rows="4"
            />
          </template>
        </VeeFormGroup>
      </v-flex>
    </v-layout>

    <template #button>
      {{ $t('settings.deleteAccount') }}
    </template>
  </Modal>
</template>

<script>
  import { mapActions } from "vuex";
  import Modal from '@/components/App/Modal';
  import User from "@/models/User";

  export default {
    components: { Modal },
    props: {
      dialog: {
        type: Boolean,
        default: () => false,
      },
      teamMembers: {
        type: Array,
        default: () => {
        },
      },
    },
    data() {
      return {
        whyDelete: '',
        confirmation: '',
        whyDeleteRadios: {
          'missing-features': this.$t(
            'settings.deleteAccountReasons.missingFeatures',
          ),
          'got-false-alerts': this.$t(
            'settings.deleteAccountReasons.gotFalseAlerts',
          ),
          'too-complicated': this.$t(
            'settings.deleteAccountReasons.tooComplicated',
          ),
          immature: this.$t('settings.deleteAccountReasons.immature'),
          other: this.$t('settings.deleteAccountReasons.other'),
        },
        freeText: '',
      };
    },
    computed: {
      user() {
        return this.$auth.user;
      },
      teamAdmins() {
        return this.teamMembers.filter(
          ({ roles }) => roles === User.userRoles.ADMIN,
        );
      },
      freeTextLabel() {
        if (this.whyDelete === 'missing-features') {
          return this.$t('settings.deleteAccountTellUsMissingFeatures');
        }

        return this.$t('settings.deleteAccountPleaseShareYourOpinionWithUs');
      },
      confirmationWord() {
        return this.$t('phrase.yes').toLowerCase();
      },
      validationRules() {
        return {
          confirmation: `required|confirmed:${this.confirmationWord}`,
          whyDelete: 'required',
          freeText: '',
        }
      },
    },
    created() {
      this.$validator.extend('confirmed', {
        getMessage: (field, [confirmationWord]) => this.$options.filters.capitalize(
          this.$t('validation.confirmation', { confirmationWord }),
        ),
        validate: (value, [confirmationWord]) => {
          return value ? value === confirmationWord : false
        },
      });
    },
    methods: {
      ...mapActions('user', {
        deleteUserAction: 'deleteUser'
      }),
      onCancel() {
        this.confirmation = '';
        this.whyDelete = '';
        this.freeText = '';
        this.$validator.reset();
        this.$emit('cancel');
      },
      async onSubmit() {
        const result = await this.$validator.validateAll();

        if (! result) return;

        this.deleteUserAction({
          User: this.$auth.user,
          'confirmation' : this.confirmation,
          reason: this.renderReasonWhy()
        })
          .then(() => {
            this.$emit('on-delete', { success: true });
          })
          .catch(() => {
            this.$emit('on-delete', { success: false });
          });
      },
      renderReasonWhy() {
        let reasonWhy = `${this.whyDeleteRadios[this.whyDelete]}`;

        if (
          ['missing-features', 'other'].indexOf(this.whyDelete) !== -1
          && this.freeText !== ''
        ) {
          const sectionName = this.whyDelete === 'missing-features'
                              ? 'Missing Features'
                              : 'Free Text';
          reasonWhy += ` - ${sectionName}: ${this.freeText}`;
        }

        return reasonWhy;
      },
    },
  };
</script>
