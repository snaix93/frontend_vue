<template>
  <div class="mini-host-form">
    <BackendValidationAlert/>

    <form @submit.prevent="onSubmit">
      <VeeFormGroup
        v-if="showField('name')"
        key="name"
        :error-bag="validationErrors"
        :label="$t('form.field.name') | capitalize"
        :rules="validationRules.name"
        validation-key="name"
      >
        <template #default="prop">
          <v-text-field
            v-model="Host.name"
            v-validate="prop.rules"
            :data-vv-name="prop.validationKey"
            :error-messages="prop.firstErrorMessage"
            :hint="$t('form.field.hostNameHint')"
            :label="prop.label"
            data-vv-validate-on="change"
            persistent-hint
          >
          </v-text-field>
        </template>
      </VeeFormGroup>
      <VeeFormGroup
        v-if="showField('connect')"
        key="connect"
        :error-bag="validationErrors"
        :label="$t('form.field.connect') | capitalize"
        :rules="validationRules.connect"
        validation-key="connect"
      >
        <template #default="prop">
          <v-text-field
            v-model="Host.connect"
            v-validate="prop.rules"
            :data-vv-name="prop.validationKey"
            :error-messages="prop.firstErrorMessage"
            :label="prop.label"
            data-cy="connect"
            data-vv-validate-on="blur"
            @change="getConnectType"
            @keydown="hostLocation_resetConnectType"
            @keydown.enter.stop.prevent="getConnectTypeThenSubmit"
          >
            <template #append>
              <ConnectChip
                :connect-type="hostLocation_connectType"
              />
            </template>
          </v-text-field>
        </template>
      </VeeFormGroup>
      <div
        v-if="showField('services')"
        class="mt-3"
      >
        <label class="subheading">{{ $t('host.guide.servicesToCheck') }}</label>
        <v-checkbox
          v-for="(service, i) in services"
          :key="`service-${i}`"
          v-model="service.enabled"
          :label="`${$options.filters.capitalize(service.text)}`"
          hide-details
        />
      </div>
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
  import { mapActions, mapMutations } from 'vuex';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import ConnectChip from '@/components/Hosts/ConnectChip';
  import hostLocationMixins from '@/mixins/hostLocation';
import useValidationMixins from '@/mixins/useValidation';
  import Host from '@/models/Host';

  export default {
    props: {
      exclude: {
        type: Array,
        required: false,
        default: []
      },
      useAgent: {
        type: Boolean,
        required: false,
        default: false
      },
    },
    components: {
      ConnectChip,
    },
    mixins: [hostLocationMixins, useValidationMixins, useBackendValidation],
    created() {
      this.initValidation();
    },
    mounted() {
      this.Host.cagent = this.useAgent;
    },
    data() {
      return {
        currentTask: '',
        services: [
          {
            createAction: this.createICMPCheck,
            text: this.$t('checks.icmp'),
            enabled: false,
          },
          {
            createAction: () => this.createHTTPCheck(false),
            text: this.$t('checks.http'),
            enabled: false,
          },
          {
            createAction: () => this.createHTTPCheck(true),
            text: this.$t('checks.https'),
            enabled: false,
          },
          {
            createAction: this.createSMTPCheck,
            text: this.$t('checks.smtp'),
            enabled: false,
          }
        ],
        Host: new Host(JSON.parse(JSON.stringify(Host.attributes))),
        submitFlag: false,
      };
    },
    computed: {
      validationRules() {
        return Host.validationRules({
          connectIsRequiredField: ! this.useAgent
        });
      },
      waitConditionConnect() {
        return this.$wait.is(this.$WAIT_FOR.CONNECT_VALIDATION);
      },
      waitConditionSubmit() {
        return this.$wait.is(this.$WAIT_FOR.HOST.GUIDE);
      },
    },
    methods: {
      ...mapActions('hosts', {
        createHostAction: 'createHost',
      }),
      ...mapActions('serviceChecks', {
        createServiceCheckAction: 'createServiceCheck',
      }),
      ...mapMutations('hosts', ['toggleGuideDialog']),
      showField(key) {
        return this.exclude.indexOf(key) === -1;
      },
      async getConnectTypeThenSubmit() {
        await this.getConnectType();
        await this.onSubmit();
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
      initValidation() {
        this.useValidation_extendUniqueHostName(this.Host);
        this.useValidation_extendTags();
        this.useValidation_extendFrontman();
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
            await this.createServiceChecks();
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
      async createServiceChecks() {
        const services = this.services.filter(({ enabled }) => enabled);

        const requests = [];
        services.forEach((service) => {
          requests.push(service.createAction());
        });

        await Promise.all(requests);
      },
      async createICMPCheck() {
        const ServiceCheck = this.Host.makeICMPServiceCheck();
        await this.createServiceCheckAction({ ServiceCheck, Host: this.Host });
      },
      async createHTTPCheck(secure) {
        const ServiceCheck = this.Host.makeHttpPortServiceCheck();
        if (secure) {
          ServiceCheck.service = 'https';
          ServiceCheck.port = '443';
        }
        await this.createServiceCheckAction({ ServiceCheck, Host: this.Host });
      },
      async createSMTPCheck() {
        const ServiceCheck = this.Host.makeCustomPortServiceCheck();
        ServiceCheck.service = 'smtp';
        ServiceCheck.port = '25';
        await this.createServiceCheckAction({ ServiceCheck, Host: this.Host });
      }
    }
  };
</script>
