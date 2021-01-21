<template>
  <v-dialog
    lazy
    persistent
    :value="dialog"
    max-width="950px"
  >
    <form
      class="v-card white"
      @submit.prevent="onSubmit()"
    >
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ $t('rule.wizards.processRule.headline') }}
        </span>

        <v-spacer/>

        <v-btn
          icon
          class="mr-0"
          @click="onCancel()"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text
        class="py-0"
        :class="{
          'px-3' : !!$vuetify.breakpoint.mdAndDown,
          'px-5' : !$vuetify.breakpoint.mdAndDown
        }"
      >
        <v-timeline dense>
          <v-timeline-item
            color="primary"
            fill-dot
            icon="edit"
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
          >
            <v-layout
              row
              wrap
              align-center
            >
              <v-flex
                md12
                lg5
                class="pr-3"
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <span class="font-weight-medium subheading">{{
                    $t('rule.wizards.ruleForValidFor')
                  }}</span>
                </div>
              </v-flex>

              <v-flex
                md12
                lg7
              >
                <VeeFormGroup
                  validation-key="hostMatchPart"
                  :rules="validationRules.hostMatchPart"
                  :error-bag="validationErrors"
                >
                  <template #default="prop">
                    <v-radio-group
                      v-model="Rule.hostMatchPart"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      row
                      :data-vv-name="prop.validationKey"
                      data-vv-validate-on="blur"
                    >
                      <v-radio value="none">
                        <template #label>
                          {{ $t('form.field.allHosts') }}
                        </template>
                      </v-radio>
                      <v-radio value="uuid">
                        <template #label>
                          <span v-html="$t('form.field.singleHost', { host: Host.name })"/>
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>
          </v-timeline-item>

          <v-timeline-item
            v-show="selectedProcess.cmdline"
            color="primary"
            fill-dot
            icon="edit"
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
          >
            <v-layout
              wrap
              align-center
            >
              <v-flex
                md12
                lg5
                class="pr-3"
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <span class="font-weight-medium subheading">{{
                    $t('rule.wizards.processRule.processIdentifiedBy')
                  }}</span>
                </div>
              </v-flex>

              <v-flex
                md12
                lg7
              >
                <VeeFormGroup
                  validation-key="checkKey"
                  :rules="validationRules.checkKey"
                  :error-bag="validationErrors"
                >
                  <template #default="prop">
                    <v-radio-group
                      v-model="Rule.checkKey"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      row
                      :data-vv-name="prop.validationKey"
                      data-vv-validate-on="blur"
                    >
                      <v-radio value="proc.list@Name">
                        <template #label>
                          {{ $t('form.field.processName') }}
                        </template>
                      </v-radio>
                      <v-radio value="proc.list@Cmdline">
                        <template #label>
                          {{ $t('form.field.processCmdline') }}
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>
          </v-timeline-item>

          <v-timeline-item
            color="primary"
            fill-dot
            icon="edit"
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
          >
            <v-layout
              row
              wrap
              align-center
            >
              <v-flex
                md12
                lg5
                class="pr-2"
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <span
                    class="font-weight-medium subheading"
                    v-html="$t('rule.wizards.processRule.alterMatchString')"
                  />
                </div>
              </v-flex>

              <v-flex
                md12
                lg7
              >
                <VeeFormGroup
                  validation-key="keyFunctionValue"
                  :rules="validationRules.keyFunctionValue"
                  :error-bag="validationErrors"
                  :label="$t('form.field.matchString')"
                >
                  <template #default="prop">
                    <v-text-field
                      v-model="Rule.keyFunction.value"
                      v-validate="prop.rules"
                      :label="prop.label"
                      persistent-hint
                      :hint="$t('form.hint.useWildCardForProcessRule')"
                      :error-messages="prop.firstErrorMessage"
                      :data-vv-name="prop.validationKey"
                      data-vv-validate-on="blur"
                    />
                  </template>
                </VeeFormGroup>
              </v-flex>
            </v-layout>
          </v-timeline-item>

          <v-timeline-item
            color="primary"
            fill-dot
            icon="edit"
            :hide-dot="!!$vuetify.breakpoint.xsOnly"
            :small="!!$vuetify.breakpoint.smAndDown"
          >
            <v-layout
              row
              wrap
              align-center
            >
              <v-flex
                md12
                lg5
                class="pr-2"
              >
                <div class="section-subheaders mb-2 grey lighten-2 pa-3">
                  <span class="font-weight-medium subheading">{{
                    $t('rule.wizards.actionSend')
                  }}</span>
                </div>
              </v-flex>

              <v-flex
                md12
                lg7
              >
                <VeeFormGroup
                  validation-key="alert"
                  :rules="validationRules.alert"
                  :error-bag="validationErrors"
                >
                  <template #default="prop">
                    <v-radio-group
                      v-model="Rule.action"
                      v-validate="prop.rules"
                      :error-messages="prop.firstErrorMessage"
                      row
                      :data-vv-name="prop.validationKey"
                      data-vv-validate-on="blur"
                    >
                      <v-radio value="alert">
                        <template #label>
                          {{ $t('form.field.anAlert') }}
                        </template>
                      </v-radio>
                      <v-radio value="warn">
                        <template #label>
                          {{ $t('form.field.aWarning') }}
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </template>
                </VeeFormGroup>
              </v-flex>

              <v-flex
                xs12
                class="mt-3 pa-3 grey lighten-3"
              >
                {{ summaryText }}
              </v-flex>
            </v-layout>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <v-layout
          row
          wrap
        >
          <v-flex>
            <BackendValidationAlert/>
          </v-flex>

          <v-flex class="text-xs-right">
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
              {{ $t('button.addRule') }}
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </form>
  </v-dialog>
</template>

<script>
  import {mapActions, mapGetters, mapMutations, mapState} from 'vuex';
  import useBackendValidation from '@/mixins/useBackendValidation';
  import Rule from "@/models/Rule";

  export default {
    mixins: [
      useBackendValidation,
    ],
    props: {
      Host: {
        required: true,
        type: Object,
      },
    },
    data() {
      return {
        validationRules: {
          hostMatchPart: 'required',
          checkKey: 'required',
          keyFunctionValue: 'required|min:3',
          alert: 'required',
        },
        Rule: {},
      };
    },
    computed: {
      ...mapState('hosts', {
        dialog: 'addRuleForProcessDialog',
        selectedProcess: 'selectedProcessForNewRule',
      }),
      ...mapGetters('rules', ['getBaseRuleForRuleWizard']),
      summaryText() {
        const host = this.Rule.hostMatchCriteria === 'any' ? 'any host' : this.Host.name;
        const action = this.Rule.action === 'alert' ? 'an alert' : 'a warning';
        return this.$t('rule.wizards.processRule.summaryText', { host, action });
      },
    },
    watch: {
      'Rule.hostMatchPart': function () {
        if (this.Rule.hostMatchPart === 'none') {
          this.Rule.hostMatchCriteria = 'any';
        } else {
          this.Rule.hostMatchCriteria = this.Host.id;
        }
      },
      'Rule.checkKey': function () {
        this.setKeyFunctionValue();
      },
      dialog() {
        if (this.dialog) {
          this.setKeyFunctionValue();
        }
      },
    },
    created() {
      this.resetBaseRule();
    },
    beforeDestroy() {
      this.reset();
    },
    methods: {
      ...mapActions('rules', {
        addRuleAction: 'addRule',
      }),
      ...mapMutations('hosts', ['toggleAddRuleForProcessDialog']),
      setKeyFunctionValue() {
        if (this.Rule.checkKey === 'proc.list@Name') {
          this.Rule.keyFunction.value = this.selectedProcess.name;
        } else {
          this.Rule.keyFunction.value = this.selectedProcess.cmdline;
        }
      },
      async onSubmit() {
        this.useBackendValidation_reset();

        const result = await this.$validator.validateAll();
        if (!result) return;

        this.addRule(this.Rule);
      },
      addRule(Rule){
        this.addRuleAction({Rule})
            .then(() => {
              this.$emit('on-create', { success: true, Rule });
            })
            .catch(({ response }) => {
              this.useBackendValidation_renderAnyErrors(response);
              this.$emit('on-create', { success: false, Rule });
            });
      },
      onCancel() {
        this.toggleAddRuleForProcessDialog();
      },
      reset() {
        this.resetBaseRule();
        this.useBackendValidation_reset();
        this.$validator.reset();
      },
      resetBaseRule() {
        const rule = this.getBaseRuleForRuleWizard('processRule');
        this.Rule = new Rule(JSON.parse(JSON.stringify(rule)));
      },
    },
  };
</script>
