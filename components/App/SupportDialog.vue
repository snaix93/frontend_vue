<template>
  <v-dialog
    :value="dialog"
    max-width="800px"
    persistent
  >
    <v-card>
      <v-card-title
        v-if="!success"
        :style="success ? 'padding-bottom:0' : ''"
        class="py-2 grey lighten-3"
      >
        <span class="headline">
          {{ $t('app.support.sendASupportInquiry') | capitalize }}
        </span>
        <v-spacer/>
        <v-btn
          class="mr-0"
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text
        v-if="success"
        class="text-xs-center pt-4"
      >
        <v-icon
          class="mb-3"
          color="success"
          x-large
        >
          check_circle
        </v-icon>

        <h3 class="title mb-2">
          {{ $t('app.support.thankYouForYourMessage') | capitalize }}
        </h3>

        <p class="body-1 mb-4">
          {{
            $t('app.support.normallyYouWillGetAnAnswerWithin24Hours')
              | capitalize
          }}
        </p>

        <v-btn
          block
          color="primary"
          data-cy="requestSubmitted"
          @click="onCancel"
        >
          {{ $t('button.close') | capitalize }}
        </v-btn>
      </v-card-text>

      <form
        v-if="!success"
        data-cy="supportDialogForm"
        @submit.prevent="onSubmit"
      >
        <v-card-text>
          {{ $t('app.support.weAreHereToHelpYou') | capitalize }}
        </v-card-text>
        <v-card-text>
          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('form.field.subject') | capitalize"
            :rules="validationRules.subject"
            data-cy="subjectInput"
            validation-key="subject"
          >
            <template #default="prop">
              <v-text-field
                v-model="subject"
                v-validate="prop.rules"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :hint="$t('form.hint.subject') | capitalize"
                :placeholder="prop.label"
                data-vv-validate-on="blur"
                persistent-hint
                single-line
              />
            </template>
          </VeeFormGroup>
        </v-card-text>

        <v-card-text>
          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('form.field.body') | capitalize"
            :rules="validationRules.body"
            data-cy="bodyInput"
            validation-key="body"
          >
            <template #default="prop">
              <v-textarea
                v-model="body"
                v-validate="prop.rules"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :hint="$t('form.hint.body') | capitalize"
                :placeholder="prop.label"
                data-vv-validate-on="blur"
                persistent-hint
                rows="20"
              />
            </template>
          </VeeFormGroup>
        </v-card-text>

        <input
          ref="file"
          data-cy="imageInput"
          multiple
          name="selectFiles"
          type="file"
        />

        <BackendValidationAlert/>

        <v-divider/>

        <v-card-actions>
          <v-btn
            flat
            @click="onCancel"
          >
            {{ $t('button.cancel') | capitalize }}
          </v-btn>
          <v-spacer/>
          <v-btn
            color="primary"
            flat
            type="submit"
          >
            {{ $t('app.support.sendMessage') | capitalize }}
          </v-btn>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    mixins: [useBackendValidation],
    data() {
      return {
        success: false,
        validationRules: {
          subject: 'required|min:5|max:999',
          body: 'required|min:5',
        },
        selectedFiles: [],
      };
    },
    computed: {
      ...mapState('app', {
        dialog: 'supportDialog',
        supportSubject: 'supportSubject',
        supportBody: 'supportBody',
      }),
      subject: {
        get() {
          return this.supportSubject;
        },
        set(value) {
          this.setSupportSubject(value);
        }
      },
      body: {
        get() {
          return this.supportBody;
        },
        set(value) {
          this.setSupportBody(value);
        }
      },
    },
    methods: {
      ...mapMutations('app', ['setSupportSubject', 'setSupportBody']),
      onSubmit() {
        this.useBackendValidation_reset();

        let formData = new FormData();

        for (let i = 0; i < this.$refs.file.files.length; i++) {
          let file = this.$refs.file.files[i];
          formData.append('attachment[' + i + ']', file);
        }

        formData.append('subject', this.subject);
        formData.append('body', this.body);

        this.$validator.validateAll().then((result) => {
          if (result) {
            this.$axios
                .$post('/support-requests', formData)
                .then(() => {
                  this.success = true;
                })
                .catch(({ response }) => {
                  this.useBackendValidation_renderAnyErrors(response);
                });
          }
        });
      },
      onCancel() {
        this.reset();
        this.$store.commit('app/hideSupportDialog');
      },
      reset() {
        this.$emit('reset');

        if (this.success) {
          this.success = false;
          this.subject = null;
          this.body = null;
        }

        this.useBackendValidation_reset();
        this.$validator.reset();
      },
    },
  };
</script>
