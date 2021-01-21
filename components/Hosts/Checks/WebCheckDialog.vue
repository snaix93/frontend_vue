<template>
  <v-dialog
    :value="dialog"
    lazy
    max-width="800px"
    persistent
    scrollable
  >
    <form
      class="v-card white"
      @submit.prevent="onSubmit"
    >
      <v-card-title class="py-2 grey lighten-3">
        <div class="headline">
          {{
            (selectedWebCheck.hasId()
             ? $tc('checks.updateWebCheck')
             : $tc('checks.addWebCheck')) | capitalize
          }}
        </div>
        <HelpTooltip
          v-if="tooltipKey"
          :tooltip="$tooltip(tooltipKey)"
        />
        <v-spacer/>
        <v-btn
          class="mr-0"
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-container
          class="pa-3"
          fluid
          grid-list-lg
        >
          <PreflightErrorMessage
            v-if="usePreflight_hasError"
            :preflight-result="usePreflight_preflightResult"
          />

          <template v-else>
            <v-alert
              :value="Host.connectIsIP()"
              class="pa-2 mb-4"
              type="warning"
            >
              {{ $t('checks.warningIsIp') }}
            </v-alert>

            <v-card flat>
              <v-card-text class="pt-0 px-0">
                <v-layout
                  row
                  wrap
                >
                  <v-flex xs12>
                    <span class="subheading">{{ $t('checks.urlToCheck') }} </span><span
                    class="text-word-wrap grey--text text--darken-2"
                  >{{ useWebCheckHelpers_urlPreview(selectedWebCheck, Host) }}</span>
                  </v-flex>
                  <v-flex
                    xs3
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :label="$t('form.field.protocol') | capitalize"
                      :rules="validationRules.protocol"
                      validation-key="protocol"
                    >
                      <template #default="prop">
                        <v-select
                          v-model="selectedWebCheck.protocol"
                          v-validate="prop.rules"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :items="protocols"
                          :label="prop.label"
                          data-vv-validate-on="blur"
                          item-disabled="disabled"
                          item-value="value"
                          suffix="://"
                        >
                          <template #selection="data">
                            {{ $t('checks.protocol.' + data.item.key) }}
                          </template>

                          <template #item="data">
                            {{ $t('checks.protocol.' + data.item.key) }}
                          </template>
                        </v-select>
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                  <v-flex
                    class="subheading grey--text text--darken-2 text-xs-center px-3"
                    shrink
                    style="padding-top: 36px"
                  >
                    {{ Host.connect }}
                  </v-flex>
                  <v-flex
                    xs3
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :label="$t('form.field.port') | capitalize"
                      :rules="validationRules.port"
                      validation-key="port"
                    >
                      <template #default="prop">
                        <v-text-field
                          v-model="selectedWebCheck.port"
                          v-validate="prop.rules"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :label="prop.label"
                          data-vv-validate-on="blur"
                          prefix=":"
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <v-flex
                    class="pt-0"
                    xs12
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :label="$t('form.field.path') | capitalize"
                      :rules="validationRules.path"
                      validation-key="path"
                    >
                      <template #default="prop">
                        <v-text-field
                          v-model="selectedWebCheck.path"
                          v-validate="prop.rules"
                          :counter="pathMaxLength"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :label="prop.label"
                          :prefix="!selectedWebCheck.path ? '/': ''"
                          placeholder="example/path"
                          @input="onPathInput"
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                </v-layout>
              </v-card-text>
            </v-card>

            <v-layout
              row
              wrap
            >
              <v-flex xs6>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.method') | capitalize"
                  :rules="validationRules.method"
                  validation-key="method"
                >
                  <template #default="prop">
                    <v-select
                      v-model="selectedWebCheck.method"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      :items="methods"
                      :label="prop.label"
                      data-vv-validate-on="blur"
                      item-disabled="disabled"
                      item-value="value"
                    >
                      <template #selection="data">
                        {{ $t('checks.method.' + data.item.key) }}
                      </template>

                      <template #item="data">
                        {{ $t('checks.method.' + data.item.key) }}

                        <v-chip
                          v-if="data.item.disabled"
                          class="pull-right"
                          color="orange"
                          small
                          text-color="white"
                        >
                          {{ $t('phrase.coming_soon') }}
                        </v-chip>
                      </template>
                    </v-select>
                  </template>
                </VeeFormGroup>
              </v-flex>
              <v-flex xs6>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.expectedHttpStatus') | capitalize"
                  :rules="validationRules.expectedHttpStatus"
                  validation-key="expectedHttpStatus"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="selectedWebCheck.expectedHttpStatus"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      data-vv-validate-on="blur"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>

            <v-layout
              v-show="selectedWebCheck.method === 'GET'"
              row wrap
            >
              <v-flex>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.expectedString') | capitalize"
                  :rules="validationRules.expectedPattern"
                  validation-key="expectedPattern"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="selectedWebCheck.expectedPattern"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      data-vv-validate-on="blur"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
              <v-flex shrink>
                <div class="v-label theme--light caption mt-1">
                  {{ $t('form.field.expectedStringPresence') | capitalize }}
                </div>
                <VeeFormGroup
                  v-show="selectedWebCheck.method === 'GET'"
                  :error-bag="validationErrors"
                  validation-key="expectedPatternPresence"
                >
                  <template #default="prop">
                    <v-radio-group
                      v-model="selectedWebCheck.expectedPatternPresence"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      class="mt-2"
                      data-vv-validate-on="blur"
                      hide-details
                      row
                    >
                      <v-radio
                        v-for="option in expectedPatternPresentOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </v-radio-group>
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>

            <VeeFormGroup
              v-show="selectedWebCheck.method === 'POST'"
              :error-bag="validationErrors"
              :label="$t('form.field.postData') | capitalize"
              validation-key="postData"
            >
              <template #default="prop">
                <v-textarea
                  v-model="selectedWebCheck.postData"
                  :data-vv-name="prop.validationKey"
                  :error-messages="prop.firstErrorMessage"
                  class="font-monospace"
                  data-vv-validate-on="blur"
                >
                  <template #label>
                    <div class="font-reset">
                      {{ prop.label }}
                    </div>
                  </template>
                </v-textarea>
              </template>
            </VeeFormGroup>

            <div class="my-4">
              <v-layout
                align-center
                mb-2
              >
                <v-flex
                  class="subheading"
                  shrink
                  v-text="$t('checks.httpHeaders')"
                />
                <v-fade-transition>
                  <template v-if="!httpHeaders.length">
                    <v-btn
                      class="ml-0"
                      color="primary"
                      flat
                      small
                      @click="addHttpHeader"
                    >
                      <v-icon
                        left
                        small
                      >
                        add_circle
                      </v-icon>
                      {{ $t('button.addCustomHeader') }}
                    </v-btn>
                  </template>
                </v-fade-transition>
                <v-fade-transition>
                  <template v-if="!hasAuthorizationHeader">
                    <v-btn
                      class="ml-0"
                      color="primary"
                      flat
                      small
                      @click="toggleAuthorizationHeaderDialog"
                    >
                      <v-icon
                        left
                        small
                      >
                        add_circle
                      </v-icon>
                      {{ $t('button.addBasicAuthorizationHeader') }}
                    </v-btn>
                  </template>
                </v-fade-transition>
              </v-layout>

              <v-fade-transition group>
                <v-layout
                  v-for="(header, index) in httpHeaders"
                  :key="index"
                  row
                  wrap
                >
                  <v-flex
                    pt-0
                    xs6
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :label="$t('form.field.httpHeaderName') | capitalize"
                      :rules="validationRules.httpHeaders[index].name"
                      :validation-key="`headerName-${index}`"
                    >
                      <template #default="prop">
                        <v-text-field
                          v-model="httpHeaders[index].name"
                          v-validate="prop.rules"
                          :data-vv-as="prop.label"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :label="prop.label"
                          class="mt-0 monospace-text-field"
                          data-vv-validate-on="blur"
                        />
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                  <v-flex
                    pr-0
                    pt-0
                    xs6
                  >
                    <VeeFormGroup
                      :error-bag="validationErrors"
                      :label="$t('form.field.httpHeaderValue') | capitalize"
                      :rules="validationRules.httpHeaders[index].value"
                      :validation-key="`headerValue-${index}`"
                    >
                      <template #default="prop">
                        <v-text-field
                          v-model="httpHeaders[index].value"
                          v-validate="prop.rules"
                          :data-vv-as="prop.label"
                          :data-vv-name="prop.validationKey"
                          :error-messages="prop.firstErrorMessage"
                          :label="prop.label"
                          class="mt-0 monospace-text-field"
                          data-vv-validate-on="blur"
                        >
                          <template #append-outer>
                            <div style="width: 76px">
                              <v-btn
                                :title="$t('button.removeHeader') | capitalize"
                                class="ma-0"
                                flat
                                icon
                                @click="removeHttpHeader(index)"
                              >
                                <v-icon color="grey darken-3">
                                  delete_forever
                                </v-icon>
                              </v-btn>
                              <v-fade-transition>
                                <v-btn
                                  v-show="index === httpHeaders.length-1"
                                  :title="$t('button.addCustomHeader') | capitalize"
                                  class="ma-0"
                                  color="primary"
                                  flat
                                  icon
                                  @click="addHttpHeader"
                                >
                                  <v-icon>add_circle</v-icon>
                                </v-btn>
                              </v-fade-transition>
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                    </VeeFormGroup>
                  </v-flex>
                </v-layout>
              </v-fade-transition>
            </div>

            <VeeFormGroup
              :label="$t('form.field.dontFollowRedirects') | capitalize"
            >
              <template #default="prop">
                <v-checkbox
                  v-model="selectedWebCheck.dontFollowRedirects"
                  :label="prop.label"
                />
              </template>
            </VeeFormGroup>

            <VeeFormGroup
              :label="$t('form.field.searchHtmlSource') | capitalize"
            >
              <template #default="prop">
                <v-checkbox
                  v-model="selectedWebCheck.searchHtmlSource"
                  :label="prop.label"
                  class="mt-0"
                />
              </template>
            </VeeFormGroup>

            <VeeFormGroup
              v-show="selectedWebCheck.protocol === 'https'"
              :label="$t('form.field.ignoreSSLErrors') | capitalize"
            >
              <template #default="prop">
                <v-checkbox
                  v-model="selectedWebCheck.ignoreSSLErrors"
                  :label="prop.label"
                  class="mt-0"
                />
              </template>
            </VeeFormGroup>

            <v-layout
              row
              wrap
            >
              <v-flex xs6>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.timeOut') | capitalize"
                  :rules="validationRules.timeOut"
                  validation-key="timeOut"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="selectedWebCheck.timeOut"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      :label="prop.label"
                      data-vv-validate-on="blur"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>

              <v-flex xs6>
                <VeeFormGroup
                  :error-bag="validationErrors"
                  :label="$t('form.field.checkInterval') | capitalize"
                  :rules="validationRules.checkInterval"
                  validation-key="checkInterval"
                >
                  <template #default="prop">
                    <v-select
                      v-model="selectedWebCheck.checkInterval"
                      v-validate="prop.rules"
                      :data-vv-name="prop.validationKey"
                      :error-messages="prop.firstErrorMessage"
                      :items="useCheckIntervals_checkIntervals"
                      :label="prop.label"
                      data-vv-validate-on="blur"
                      item-disabled="disabled"
                      item-value="value"
                    >
                      <template #selection="data">
                        {{ readableTime(data.item.value) }}
                      </template>

                      <template #item="data">
                        {{ readableTime(data.item.value) }}

                        <v-chip
                          v-if="data.item.disabled"
                          class="pull-right"
                          color="orange"
                          small
                          text-color="white"
                        >
                          {{ $t('phrase.premium') }}
                        </v-chip>
                      </template>
                    </v-select>
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>
          </template>
        </v-container>
      </v-card-text>
      <v-divider/>
      <v-card-actions class="justify-space-between">
        <template v-if="!usePreflight_hasError">
          <v-btn
            flat
            @click="onCancel"
          >
            {{ $t('button.cancel') }}
          </v-btn>
          <BackendValidationAlert/>
          <v-btn
            color="primary"
            flat
            type="submit"
            @click="usePreflight_togglePreflightOn(Host, 'webCheck', selectedWebCheck)"
          >
            <template v-if="selectedWebCheck.hasId()">
              {{ $t('checks.buttonUpdateCheck') }}
            </template>
            <template v-else>
              {{ $t('checks.buttonAddCheck') }}
            </template>
          </v-btn>
        </template>
        <template v-else>
          <v-btn
            flat
            type="submit"
            @click="usePreflight_togglePreflightOff(Host, 'webCheck', selectedWebCheck)"
          >
            <template v-if="selectedWebCheck.hasId()">
              {{ $t('checks.buttonUpdateCheckAnyways') }}
            </template>
            <template v-else>
              {{ $t('checks.buttonAddCheckAnyways') }}
            </template>
          </v-btn>
          <v-spacer/>
          <v-btn
            color="primary"
            flat
            type="submit"
            @click="usePreflight_togglePreflightOn(Host, 'webCheck', selectedWebCheck)"
          >
            <v-icon left>
              replay
            </v-icon>
            {{ $t('checks.reValidate') }}
          </v-btn>
          <v-btn
            color="primary"
            flat
            @click="usePreflight_preflightReset"
          >
            <v-icon left>
              edit
            </v-icon>
            {{ $t('checks.buttonEditCheck') }}
          </v-btn>
          <v-btn
            color="primary"
            flat
            @click.prevent="onCancel"
          >
            {{ $t('button.cancel') }}
          </v-btn>
        </template>
      </v-card-actions>
    </form>

    <AppWait
      :wait="$wait.is([
        $WAIT_FOR.WEB_CHECK.PREFLIGHT,
        $WAIT_FOR.WEB_CHECK.CREATE,
        $WAIT_FOR.WEB_CHECK.UPDATE
      ])"
    >
      <template v-if="$wait.is($WAIT_FOR.WEB_CHECK.PREFLIGHT)">
        {{ $t('message.wait.checkPreflight') | capitalize }}
      </template>
      <template v-if="$wait.is($WAIT_FOR.WEB_CHECK.CREATE)">
        {{ $t('message.wait.checkAdd') | capitalize }}
      </template>
      <template v-if="$wait.is($WAIT_FOR.WEB_CHECK.UPDATE)">
        {{ $t('message.wait.checkUpdate') | capitalize }}
      </template>
    </AppWait>

    <AuthorizationHeaderDialog
      @on-create="onBasicAuthorizationHeaderSubmit"
    />
  </v-dialog>
</template>

<script>
  import {mapActions, mapMutations, mapState} from 'vuex';

  import WebCheck from '@/models/WebCheck';
  import AppWait from '@/components/App/AppWait';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import PreflightErrorMessage from '@/components/Hosts/Checks/PreflightErrorMessage';
  import AuthorizationHeaderDialog from '@/components/Hosts/Checks/AuthorizationHeaderDialog';

  import useBackendValidation from '@/mixins/useBackendValidation';
  import useDateTime from '@/mixins/useDateTime';
  import usePreflight from '@/mixins/usePreflight';
  import useCheckIntervals from '@/mixins/useCheckIntervals';
  import useWebCheckHelpers from '@/mixins/useWebCheckHelpers';

  export default {
    components: {
      AppWait,
      HelpTooltip,
      PreflightErrorMessage,
      AuthorizationHeaderDialog,
    },
    mixins: [
      useBackendValidation,
      useDateTime,
      usePreflight,
      useCheckIntervals,
      useWebCheckHelpers,
    ],
    props: {
      tooltipKey: null,
    },
    data() {
      return {
        checkType: 'web',
        customPort: null,
        httpHeaders: [],
        pathMaxLength: 254,
        protocols: [
          {
            key: 'http',
            value: 'http',
            port: 80,
          },
          {
            key: 'https',
            value: 'https',
            port: 443,
          },
        ],
        methods: [
          {
            key: 'get',
            value: 'GET',
          },
          {
            key: 'head',
            value: 'HEAD',
          },
          {
            key: 'post',
            value: 'POST',
          },
        ],
        expectedPatternPresentOptions: [
          {
            label: this.$t('form.field.expectedStringPresent'),
            value: 'present',
          },
          {
            label: this.$t('form.field.expectedStringAbsent'),
            value: 'absent',
          },
        ]
      };
    },
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('webChecks', {
        dialog: 'webCheckDialog',
      }),
      ...mapState('webChecks', ['selectedWebCheck']),
      validationRules() {
        const rules = WebCheck.validationRules({ pathMaxLength : this.pathMaxLength });

        // if an HTTP Header is added and one of the fields is dirty the other field is required, too
        if (this.httpHeaders.length > 0) {
          this.httpHeaders.forEach((header) => {
            if (header.name !== '' || header.value !== '') {
              rules.httpHeaders.push({ name: 'required', value: 'required' });
            } else {
              rules.httpHeaders.push({ name: '', value: '' });
            }
          });
        }
        return rules;
      },
      hasAuthorizationHeader() {
        return !! this.httpHeaders.find(({ name }) => name.toLowerCase() === 'authorization');
      },
    },
    created() {
      if (this.selectedWebCheck.headers) {
        // map object entries to array
        Object.entries(this.selectedWebCheck.headers).forEach(([key, value]) => {
          this.httpHeaders.push({ name: key, value });
        });
      }

      this.setupValidation();
    },
    beforeDestroy() {
      this.reset();
    },
    methods: {
      ...mapMutations('webChecks', [
        'resetSelectedWebCheck',
        'toggleWebCheckDialog',
        'toggleAuthorizationHeaderDialog',
      ]),
      ...mapActions('webChecks', {
        updateWebCheckAction: 'updateWebCheck',
        createWebCheckAction: 'createWebCheck',
      }),
      onPathInput() {
        this.$nextTick(() => {
          if (this.selectedWebCheck.path.length > this.pathMaxLength)
            this.selectedWebCheck.path = this.selectedWebCheck.path.substring(0, this.pathMaxLength);
        })
      },
      addHttpHeader() {
        this.httpHeaders.push({ name: '', value: '' });
      },
      removeHttpHeader(key) {
        this.httpHeaders.splice(key, 1);
      },
      onBasicAuthorizationHeaderSubmit(value) {
        this.httpHeaders.push({ name: 'Authorization', value });
      },
      formatPath() {
        this.selectedWebCheck.path = this.useWebCheckHelpers_formattedPath(this.selectedWebCheck.path);
      },
      buildHeaders() {
        // map array of objects to object entries
        if (this.httpHeaders.length > 0) {
          this.selectedWebCheck.headers = {};
          this.httpHeaders.forEach((header) => {
            if (header.name !== '') {
              this.selectedWebCheck.headers[header.name] = header.value;
            }
          });
        } else {
          this.selectedWebCheck.headers = null;
        }
      },
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (! result) return;

        this.formatPath();
        this.buildHeaders();

        if (this.selectedWebCheck.hasId()) {
          this.updateWebCheck(this.selectedWebCheck);
        } else {
          this.createWebCheck(this.selectedWebCheck);
        }
      },
      createWebCheck(WebCheck) {
        this.createWebCheckAction({ WebCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-create', { success: true, WebCheck });
            })
            .catch(({ response }) => {
              if (! this.useBackendValidation_renderAnyErrors(response) && response?.status === 412) {
                this.usePreflight_renderResponseError(response.data.data);
              }
              this.$emit('on-create', { success: false, WebCheck });
            });
      },
      updateWebCheck(WebCheck) {
        this.updateWebCheckAction({ WebCheck, Host: this.Host })
            .then(() => {
              this.$emit('on-update', { success: true, WebCheck });
            })
            .catch(({ response }) => {
              if (! this.useBackendValidation_renderAnyErrors(response) && response?.status === 412) {
                this.usePreflight_renderResponseError(response.data.data);
              }
              this.$emit('on-update', { success: false, WebCheck });
            });
      },
      onCancel() {
        this.toggleWebCheckDialog(false);
      },
      reset() {
        this.resetSelectedWebCheck(this.Host);
        this.httpHeaders = [];
      },
      setupValidation() {
        this.$validator.extend('port', {
          validate: (value) => {
            const port = parseInt(value);
            return port && port > 0 && port < 65536;
          },
        });
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .v-card-text
    height: 70vh

  .pull-right
    margin-left: auto;
</style>
