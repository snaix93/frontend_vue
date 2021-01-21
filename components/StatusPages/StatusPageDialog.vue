<template>
  <Modal
    :content-class="['status-dialog']"
    :dialog="dialog"
    :on-cancel="onCancel"
    :on-submit="onSubmit"
    :wait-key="$WAIT_FOR.STATUS_PAGE.ALL"
    max-width="960px"
  >
    <template #title>
      <template v-if="isUpdating">
        {{ $t('statusPages.update') | capitalize }}
      </template>

      <template v-if="isCreating">
        {{ $t('statusPages.create') | capitalize }}
      </template>
    </template>

    <v-layout>
      <v-flex xs8>
        <VeeFormGroup
          :error-bag="validationErrors"
          :label="$t('form.field.title') | capitalize"
          :rules="validationRules.title"
          validation-key="title"
        >
          <template #default="prop">
            <v-text-field
              v-model="statusPage.title"
              v-validate="prop.rules"
              :counter="titleCharLimit"
              :data-vv-name="prop.validationKey"
              :error-messages="prop.firstErrorMessage"
              :label="prop.label"
              data-vv-validate-on="blur"
            />
          </template>
        </VeeFormGroup>

        <VeeFormGroup
          :error-bag="validationErrors"
          :label="$t('form.field.header') | capitalize"
          :rules="validationRules.header"
          validation-key="header"
        >
          <template #default="prop">
            <EditorDialog
              v-model="statusPage.meta.header"
              :active="dialog"
              :counter="headerCharLimit"
              :error-messages="prop.firstErrorMessage"
              :hint="$t('statusPages.htmlHint') | capitalize"
              :is-optional="true"
              :label="prop.label"
            />
          </template>
        </VeeFormGroup>
        <VeeFormGroup
          :error-bag="validationErrors"
          :label="$t('form.field.footer') | capitalize"
          :rules="validationRules.footer"
          validation-key="footer"
        >
          <template #default="prop">
            <EditorDialog
              v-model="statusPage.meta.footer"
              :active="dialog"
              :counter="footerCharLimit"
              :error-messages="prop.firstErrorMessage"
              :hint="$t('statusPages.htmlHint') | capitalize"
              :is-optional="true"
              :label="prop.label"
            />
          </template>
        </VeeFormGroup>
      </v-flex>
      <v-flex
        style="position: relative;"
        xs4
      >
        <div
          v-if="hasImage && !imagePreFilled"
          class="image-upload-loading-overlay"
        >
          {{ $t('statusPages.imageLoading') | capitalize }}...
        </div>
        <picture-input
          :key="pictureInputKey"
          ref="pictureInput"
          :alert-on-error="false"
          :crop="false"
          accept="image/jpeg,image/gif,image/webp,image/png"
          :custom-strings="uploadStrings"
          :hide-change-button="true"
          :prefill="statusPageImagePrefill"
          :removable="true"
          :size="imageUploadMaxSizeInMB"
          :z-index="400"
          height="250"
          margin="10"
          radius="3"
          remove-button-class="v-btn v-btn--flat theme--light"
          width="250"
          @change="onChanged"
          @error="onError"
          @prefill="onImagePreFill"
          @remove="onRemoved"
        />
        <div
          v-if="validationErrors.has('image')"
          class="text-xs-center v-messages error--text"
        >
          {{ validationErrors.first('image') }}
        </div>
      </v-flex>
    </v-layout>

    <div
      class="grey lighten-4 px-3"
      style="margin-left: -16px; margin-right: -16px"
    >
      <div
        class="subheading grey lighten-4 elevation-1 py-2 mt-4 px-3"
        style="margin-left: -16px; margin-right: -16px"
      >
        {{ $t('statusPages.pageSettings') | titlecase }}
      </div>

      <v-layout
        v-if="hostTags"
        align-center
      >
        <v-flex shrink>
          <v-radio-group
            v-model="hostVisibilityOptions"
            row
          >
            <v-radio
              :label="$t('statusPages.includeAllHosts') | capitalize"
              :value="false"
            />
            <v-radio
              :disabled="!hostTags.length"
              :label="$t('statusPages.limitHostsByTags') | capitalize"
              :value="true"
            />
          </v-radio-group>
        </v-flex>
        <v-flex
          v-if="!hostTags.length"
          class="caption"
        >
          <v-icon
            class="mr-2"
            small
          >
            fas fa-info-circle
          </v-icon>
          {{ $t('statusPages.noTagsExist') }}
        </v-flex>
        <v-flex v-else>
          <VeeFormGroup
            v-if="showHostTagsDropdown"
            #default="prop"
            :error-bag="validationErrors"
            :label="$t('statusPages.selectTag') | capitalize"
            :rules="validationRules.hostTags"
            validation-key="hostTags"
          >
            <v-combobox
              v-model="statusPage.meta.hostTags"
              v-validate="prop.rules"
              :data-vv-name="prop.validationKey"
              :error-messages="prop.firstErrorMessage"
              :items="hostTags"
              :label="prop.label"
              append-icon=""
              clearable
              data-vv-validate-on="change|blur"
              deletable-chips
              hide-selected
              multiple
              small-chips
            >
              <template #label>
                {{ prop.label }}
              </template>
              <template #selection="data">
                <v-chip
                  :key="JSON.stringify(data.item)"
                  :disabled="data.disabled"
                  :selected="data.selected"
                  class="pb-0 mb-0"
                  close
                  color="primary"
                  small
                  text-color="white"
                  @input="removeTag(data.item)"
                >
                  {{ data.item }}
                </v-chip>
              </template>
            </v-combobox>
          </VeeFormGroup>
        </v-flex>
      </v-layout>

      <v-layout
        align-center
        wrap
      >
        <v-flex
          v-if="hasTags"
          sm3
          xs6
        >
          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('statusPages.groupByTag') | capitalize"
            :rules="validationRules.groupByTag"
            validation-key="groupByTag"
          >
            <template #default="prop">
              <v-checkbox
                v-model="statusPage.meta.groupByTag"
                v-validate="prop.rules"
                :data-vv-name="prop.validationKey"
                :disabled="!statusPage.meta.hostTags.length"
                :error-messages="prop.firstErrorMessage"
                :label="prop.label"
              />
            </template>
          </VeeFormGroup>
        </v-flex>
        <v-flex
          :sm3="hasTags"
          :sm4="!hasTags"
          :xs12="!hasTags"
          :xs6="hasTags"
        >
          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('statusPages.hideOperational') | capitalize"
            :rules="validationRules.hideOperational"
            validation-key="hideOperational"
          >
            <template #default="prop">
              <v-switch
                v-model="statusPage.meta.hideOperational"
                v-validate="prop.rules"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :label="prop.label"
                data-vv-validate-on="blur"
              />
            </template>
          </VeeFormGroup>
        </v-flex>
        <v-flex
          :sm3="hasTags"
          :sm4="!hasTags"
          xs12
        >
          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('statusPages.history') | capitalize"
            :rules="validationRules.history"
            validation-key="history"
          >
            <template #default="prop">
              <v-select
                v-model="statusPage.meta.history"
                v-validate="prop.rules"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :items="historyItems"
                :label="prop.label"
                data-vv-validate-on="blur"
              />
            </template>
          </VeeFormGroup>
        </v-flex>
        <v-flex
          :sm3="hasTags"
          :sm4="!hasTags"
          xs12
        >
          <VeeFormGroup
            :error-bag="validationErrors"
            :label="$t('statusPages.eventsToInclude') | capitalize"
            :rules="validationRules.showWarnings"
            validation-key="showWarnings"
          >
            <template #default="prop">
              <v-select
                v-model="statusPage.meta.showWarnings"
                v-validate="prop.rules"
                :data-vv-name="prop.validationKey"
                :error-messages="prop.firstErrorMessage"
                :items="eventItems"
                :label="prop.label"
                data-vv-validate-on="blur"
              />
            </template>
          </VeeFormGroup>
        </v-flex>
      </v-layout>
    </div>

    <template #button>
      <template v-if="isUpdating">
        {{ $t('button.updateStatusPage') }}
      </template>

      <template v-if="isCreating">
        {{ $t('button.createStatusPage') }}
      </template>
    </template>

    <BackendValidationAlert/>
  </Modal>
</template>

<script>
  import { mapActions, mapState, mapMutations } from 'vuex';
  import Host from '@/models/Host';
  import AppMixin from '@/mixins/app';
  import Modal from '@/components/App/Modal';
  import PictureInput from 'vue-picture-input';
  import { sortBy, sortedUniq } from 'lodash-es';
  import EditorDialog from '@/components/StatusPages/EditorDialog';
  import useBackendValidation from '@/mixins/useBackendValidation';

  export default {
    components: {
      Modal,
      PictureInput,
      EditorDialog,
    },
    mixins: [
      useBackendValidation,
      AppMixin
    ],
    data() {
      return {
        loadedHostTags: {},
        pictureInputKey: 1,
        titleCharLimit: 150,
        headerCharLimit: 500,
        footerCharLimit: 500,
        statusPageImage: null,
        imageUploadMaxSizeInMB: 0.3,
        hostVisibilityOptions: false,
        statusPageImagePrefill: null,
        eventItems: [
          {
            text: this.$options.filters.capitalize(this.$t('statusPages.alertsOnly')),
            value: false,
          },
          {
            text: this.$options.filters.capitalize(this.$t('statusPages.alertsAndWarnings')),
            value: true,
          },
        ],
        imagePreFilled: false,
      };
    },
    async fetch() {
      this.loadedHostTags = await Host.fetchActiveTags();
    },
    computed: {
      ...mapState('statusPages', {
        statusPage: 'selectedStatusPage',
        dialog: 'statusPageDialog'
      }),
      showHostTagsDropdown() {
        return this.hasTags || this.hostVisibilityOptions;
      },
      validationRules() {
        return {
          title: `required|min:3|max:${this.titleCharLimit}`,
          header: `min:3|max:${this.headerCharLimit}`,
          footer: `min:3|max:${this.footerCharLimit}`,
          hostTags: 'tags',
          groupByTag: 'required',
          history: 'required|integer|between:0,30',
          showWarnings: 'required',
          hideOperational: '',
        };
      },
      uploadStrings() {
        const header = this.$options.filters.capitalize(this.$t('statusPages.headerImage'));
        const body = this.$options.filters.capitalize(this.$t('statusPages.dropZoneText'));
        return {
          drag: `<div class="subheading" style="line-height: 1.4; margin: 0 15px;">
                     <div class="mb-2">${header}:</div>
                     <div class="body-1">${body}</div>
                     <div class="mt-2 caption">(${this.$t('phrase.optional')})</div>
                 </div>`,
          remove: this.$options.filters.capitalize(this.$t('phrase.removeImage')),
        };
      },
      hostTags() {
        if (this.loadedHostTags.length) {
          return sortedUniq(sortBy(
            [...Object.values(this.loadedHostTags)].map(
              t => (t.includes(':') ? `${t.split(':')[0]}:*` : t),
            ).concat(Object.values(this.loadedHostTags)),
          ));
        }
        return this.loadedHostTags;
      },
      historyItems() {
        return [...new Array(31)].map((_, i) => ({
          text: `${i} ${this.$tc('phrase.day', i)}`,
          value: i,
        }));
      },
      isUpdating() {
        return !! this.statusPage.id;
      },
      isCreating() {
        return ! this.isUpdating;
      },
      htmlHint() {
        return `${this.$options.filters.capitalize(this.$t('phrase.optional'))} | ${this.$t(
          'statusPages.htmlHint',
        )}`;
      },
      hasTags() {
        return !! this.statusPage.meta.hostTags.length;
      },
      hasImage() {
        return !! this.statusPage.imageContentType;
      },
    },
    watch: {
      dialog: {
        handler(value) {
          if (value) {
            this.pictureInputKey++;
            this.fetchImage(this.statusPage);
            this.hostVisibilityOptions = !! this.statusPage.meta.hostTags.length;
            this.$nextTick(() => {
              window.dispatchEvent(new Event('resize'));
            });
          } else {
            this.$nextTick(() => {
              this.hostVisibilityOptions = false;
              this.setSelectedStatusPage();
              this.statusPageImage = null;
              this.statusPageImagePrefill = null;
              this.imagePreFilled = false;
              this.$validator.reset();
            });
          }
        },
        immediate: true
      },
      hostVisibilityOptions(value) {
        if (! value) {
          this.statusPage.meta.hostTags = [];
        }
      },
    },
    created() {
      this.initValidator();
    },
    methods: {
      ...mapMutations('statusPages', [
        'setSelectedStatusPage',
        'toggleStatusPageDialog'
      ]),
      ...mapActions('statusPages', {
        updateStatusPageAction: 'updateStatusPage',
        createStatusPageAction: 'createStatusPage',
        deleteStatusPageImageAction: 'deleteStatusPageImage',
        createStatusPageImageAction: 'createStatusPageImage'
      }),
      onChanged() {
        this.validationErrors.remove('image');
        this.statusPageImage = this.$refs.pictureInput.file;
      },
      onRemoved() {
        this.statusPageImage = false;
        this.validationErrors.remove('image');
      },
      onError({ message }) {
        this.validationErrors.add({
          field: 'image',
          msg: message,
        });
      },
      onImagePreFill() {
        this.imagePreFilled = true;
      },
      async fetchImage(StatusPage) {
        if (StatusPage.imageContentType) {
          this.statusPageImagePrefill = await StatusPage.fetchImage();
          this.statusPageImage = true;
        }
      },
      removeTag(tag) {
        const i = this.statusPage.meta.hostTags.indexOf(tag);
        this.statusPage.meta.hostTags.splice(i, 1);
        return true;
      },
      initValidator() {
        this.$validator.attach({
          alias: this.$t('form.field.header'),
          name: 'header',
          rules: this.validationRules.header,
          // strip html so we can judge length correctly.
          getter: () => this.stripHTML(this.statusPage.meta.header),
        });

        this.$validator.attach({
          alias: this.$t('form.field.footer'),
          name: 'footer',
          rules: this.validationRules.footer,
          // strip html so we can judge length correctly.
          getter: () => this.stripHTML(this.statusPage.meta.footer),
        });

        this.$validator.extend('tags', {
          getMessage: field => `The ${field} value contains invalid characters.`,
          validate: tags => tags.every(tag => ! tags.length || this.isValidTag(tag)),
        });
      },
      stripHTML(string) {
        if (string) {
          string = string.replace(/(<([^>]+)>)/ig, '');
        }
        return string;
      },
      isValidTag(tag) {
        return /^[\w\d-_.:*\s]+$/i.test(tag.trim());
      },
      async onSubmit() {
        this.useBackendValidation_reset();
        this.validationErrors.remove('image');

        if (! await this.$validator.validateAll()) return;

        if (this.isUpdating) {
          this.updateStatusPage();
        } else {
          this.createStatusPage();
        }
      },
      updateStatusPage() {
        this.updateStatusPageAction({ StatusPage: this.statusPage })
            .then(() => {
              this.statusPageMessage(false, 'on-update', true);
            })
            .catch(({ response }) => {
              this.statusPageMessage(response, 'on-update', false);
            });

        if (this.statusPageImage instanceof File) {
          // we have an image to save - either as a replacement or a new one
          this.createStatusPageImageAction({
            image: this.statusPageImage,
            StatusPage: this.statusPage,
          });
        } else if (! this.statusPageImage && !! this.statusPageImagePrefill) {
          // we had an image, now we don't, so delete it server-side...
          this.deleteStatusPageImageAction({ StatusPage: this.statusPage });
        }
      },
      createStatusPage() {
        this.createStatusPageAction({ StatusPage: this.statusPage })
            .then(async () => {
              if (this.statusPageImage) {
                await this.createStatusPageImageAction({
                  image: this.statusPageImage,
                  StatusPage: this.statusPage
                });
              }
              this.statusPageMessage(false, 'on-create', true);
            })
            .catch(({ response }) => {
              this.statusPageMessage(response, 'on-create', false);
            });
      },
      statusPageMessage(response, action, success) {
        if (response) {
          this.useBackendValidation_renderAnyErrors(response);
        }
        this.$emit(action, { StatusPage: this.statusPage, success: success });
      },
      onCancel() {
        this.toggleStatusPageDialog();
      },
    },
  };
</script>

<style lang="stylus">
  .status-dialog
    overflow-y visible !important
</style>

<style lang="stylus" scoped>
  .image-upload-loading-overlay
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    font-weight: bold;
</style>
