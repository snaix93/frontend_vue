<template>
  <div class="mini-host-form">
    <BackendValidationAlert/>
    <form @submit.prevent="onSubmit">
      <VeeFormGroup
        key="fullUrl"
        :error-bag="validationErrors"
        :label="$t('form.field.fullUrlOfYourWebsite') | capitalize"
        :rules="validationRules.fullUrl"
        validation-key="fullUrl"
      >
        <template #default="prop">
          <v-text-field
            v-model="fullUrl"
            v-validate="prop.rules"
            :data-vv-name="prop.validationKey"
            :error-messages="prop.firstErrorMessage"
            :hint="$t('form.hint.fullUrlOfYourWebsite')"
            :label="prop.label"
            data-vv-validate-on="change"
            persistent-hint
            @change="onURLChange"
            @keydown="hostLocation_resetConnectType"
          >
            <template #append>
              <ConnectChip :connect-type="hostLocation_connectType"/>
            </template>
          </v-text-field>
        </template>
      </VeeFormGroup>
      <VeeFormGroup
        key="connect"
        :error-bag="validationErrors"
        :label="$t('form.field.expectedString') | capitalize"
        :rules="validationRules.expectedPattern"
        validation-key="expectedPattern"
      >
        <template #default="prop">
          <v-text-field
            v-model="expectedPattern"
            v-validate="prop.rules"
            :data-vv-name="prop.validationKey"
            :error-messages="prop.firstErrorMessage"
            :label="prop.label"
            data-vv-validate-on="blur"
          >
          </v-text-field>
        </template>
      </VeeFormGroup>
      <v-divider class="my-3"/>
      <v-layout
        align-end
        justify-space-between
        wrap
      >
        <v-flex>
          <v-btn
            class="caption mx-0"
            color="grey darken-2"
            flat
            @click="onCancel"
          >
            <v-icon
              left
              small
            >
              fas fa-backward
            </v-icon>
            <span class="ml-1">
              {{ $t('button.back') }}
            </span>
          </v-btn>
        </v-flex>
        <v-flex shrink>
          <span class="caption mr-2">
            {{ $t('host.guide.aLotMoreOptions') }}
          </span>
          <v-btn
            :disabled="waitConditionSubmit || waitConditionConnect"
            class="caption mx-0"
            color="primary"
            type="submit"
            @mousedown="submitFlag = true"
            @mouseup="submitFlag = false"
          >
            <v-progress-circular
              v-if="waitConditionSubmit || waitConditionConnect"
              :size="20"
              :width="2"
              color="white"
              indeterminate
            />
            <span class="ml-1">
              {{ $t('button.finish') }}
            </span>
          </v-btn>
        </v-flex>
      </v-layout>
    </form>
  </div>
</template>

<script>
  import { pick } from 'lodash-es';
  import { mapActions, mapMutations } from 'vuex';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import ConnectChip from '@/components/Hosts/ConnectChip';
  import hostLocationMixins from '@/mixins/hostLocation';
  import WebCheckModel from '@/models/WebCheck';
  import Host from '@/models/Host';

  export default {
    components: {
      ConnectChip,
    },
    mixins: [hostLocationMixins, useBackendValidation],
    data() {
      return {
        fullUrl: null,
        expectedPattern: null,
        submitFlag: false,
        Host: new Host(JSON.parse(JSON.stringify(Host.attributes))),
      };
    },
    computed: {
      validationRules() {
        const rules = pick(WebCheckModel.validationRules(), ['expectedPattern']);
        rules.fullUrl = {
          required: true,
          url: {
            require_protocol: true,
            protocols: ['http', 'https']
          }
        };

        return rules;
      },
      waitConditionConnect() {
        return this.$wait.is(this.$WAIT_FOR.CONNECT_VALIDATION);
      },
      waitConditionSubmit() {
        return this.$wait.is(this.$WAIT_FOR.HOST.GUIDE);
      },
    },
    mounted() {
      this.Host.cagent = this.useAgent;
    },
    methods: {
      ...mapActions('hosts', {
        createHostAction: 'createHost',
      }),
      ...mapActions('serviceChecks', {
        createServiceCheckAction: 'createServiceCheck',
      }),
      ...mapActions('webChecks', {
        createWebCheckAction: 'createWebCheck',
      }),
      ...mapMutations('hosts', ['toggleGuideDialog']),
      async onURLChange() {
        const result = await this.$validator.validate('fullUrl', this.fullUrl);
        if (! result) return;
        this.Host.connect = this.extractHostFromURL(this.fullUrl);
        this.Host.name = this.Host.connect;
        await this.getConnectType();
      },
      extractServiceFromURL(url) {
        const urlObj = new URL(url);
        return urlObj.protocol.slice(0, -1);
      },
      extractHostFromURL(url) {
        const urlObj = new URL(url);
        return urlObj.hostname;
      },
      extractPathFromURL(url) {
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search;
      },
      extractPortFromURL(url) {
        const urlObj = new URL(url);
        return urlObj.port === "" ? null : +urlObj.port;
      },
      async getConnectType() {
        this.hostLocation_resetConnectType();
        this.$nextTick(() => {
          this.useBackendValidation_reset();
          this.$validator.errors.remove('connect');
        });
        if (! this.Host.connect) return;
        await this.hostLocation_checkConnectType(this.Host);
        if (this.submitFlag) {
          await this.onSubmit();
        }
      },
      onCancel() {
        this.$emit('on-cancel', { Host: this.Host });
      },
      async onSubmit() {
        this.$wait.start(this.$WAIT_FOR.HOST.GUIDE);
        this.useBackendValidation_reset();
        const result = await this.$validator.validateAll();
        if (! result) {
          this.$wait.end(this.$WAIT_FOR.HOST.GUIDE);
          return;
        }

        try {
          await this.$dispatchWait.withoutWaiting(async () => {
            await this.createHostAction({ Host: this.Host });
            await Promise.all([
              this.createWebCheck(),
              this.createHTTPCheck()
            ]);
          });
          this.$flash.success(this.$t('message.success.hostAdd'));
          this.toggleGuideDialog(false);
          await this.$router.push(`/hosts/${this.Host.id}/host-added`);
        } catch ({ response }) {
          this.useBackendValidation_renderAnyErrors(response);
          this.$flash.error(this.$t('message.error.hostAdd'));
        } finally {
          this.$wait.end(this.$WAIT_FOR.HOST.GUIDE);
        }
      },
      async createWebCheck() {
        const WebCheck = new WebCheckModel({ ...WebCheckModel.attributes }).for(this.Host);
        WebCheck.path = this.extractPathFromURL(this.fullUrl);
        WebCheck.expectedPattern = this.expectedPattern;
        WebCheck.port = this.extractPortFromURL(this.fullUrl);
        await this.createWebCheckAction({ WebCheck, Host: this.Host });
      },
      async createHTTPCheck() {
        const ServiceCheck = this.Host.makeHttpPortServiceCheck();

        if (this.extractServiceFromURL(this.fullUrl) === 'https') {
          ServiceCheck.service = 'https';
          ServiceCheck.port = '443';
        }

        if (this.extractPortFromURL(this.fullUrl)) {
          ServiceCheck.port = this.extractPortFromURL(this.fullUrl);
        }
        
        await this.createServiceCheckAction({ ServiceCheck, Host: this.Host });
      },
    }
  };
</script>
