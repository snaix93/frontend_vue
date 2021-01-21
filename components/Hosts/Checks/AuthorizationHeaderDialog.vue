<template>
  <v-dialog
    persistent
    :value="dialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('checks.addBasicAuthorizationHeader') | capitalize }}
        </span>
        <v-spacer/>
        <v-btn
          icon
          class="mr-0"
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>

      <form @submit.prevent="onSubmit">
        <v-card-text>
          <VeeFormGroup
            validation-key="username"
            :rules="validationRules.username"
            :error-bag="validationErrors"
            :label="$t('form.field.username') | capitalize"
          >
            <template #default="prop">
              <v-text-field
                v-model="credentials.username"
                v-validate="prop.rules"
                :label="prop.label"
                data-vv-validate-on="blur"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
              />
            </template>
          </VeeFormGroup>
          <VeeFormGroup
            validation-key="password"
            :rules="validationRules.password"
            :error-bag="validationErrors"
            :label="$t('form.field.password') | capitalize"
          >
            <template #default="prop">
              <v-text-field
                v-model="credentials.password"
                v-validate="prop.rules"
                :label="prop.label"
                data-vv-validate-on="blur"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
              />
            </template>
          </VeeFormGroup>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            flat
            @click="onCancel"
          >
            {{ $t('button.cancel') }}
          </v-btn>
          <v-btn
            flat
            color="primary"
            type="submit"
          >
            {{ $t('button.addHeader') }}
          </v-btn>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';

  export default {
    data() {
      return {
        credentials: {
          username: null,
          password: null,
        },
        validationRules: {
          username: 'required',
          password: 'required',
        },
      };
    },
    computed: {
      ...mapState('webChecks', {
        dialog: 'authorizationHeaderDialog',
      }),
    },
    beforeDestroy() {
      this.reset();
    },
    methods: {
      ...mapMutations('webChecks', ['toggleAuthorizationHeaderDialog']),
      onSubmit() {
        this.$validator.validateAll().then((result) => {
          if (!result) {
            return;
          }

          const credentials64 = btoa(Object.values(this.credentials).join(':'))

          this.$emit('on-create', `Basic ${credentials64}`);
          this.toggleAuthorizationHeaderDialog();
        });
      },
      onCancel() {
        this.toggleAuthorizationHeaderDialog();
      },
      reset() {
        this.credentials.username = null;
        this.credentials.password = null;
        this.$validator.reset();
      },
    },
  };
</script>
