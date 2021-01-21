<template>
  <v-layout
    justify-center
    row
  >
    <PageToolbar>
      <v-toolbar-title>
        {{ $tc('settings.name') | capitalize }}
      </v-toolbar-title>
      <v-spacer/>
    </PageToolbar>

    <v-flex grow>
      <SettingsForm
        :date-formats="dateFormats"
        :frontmen="publicFrontmen"
        :regions="estimatedRegionsOptions"
        :team="$auth.team"
        :timezones="timezones"
        :user="$auth.user"
        @on-update="onUpdate"
      />

      <Modal
        :dialog="showCreditCardDialog"
        :on-cancel="onCancelCreditCardDialog"
        :on-submit="onSubmitCreditCardDialog"
        :wait-key="stripeWaitKey"
        button-color="white"
        button-outline
        cancel-button-color="white"
        cancel-class="white--text"
        card-class="primary white--text"
        hide-cancel
        max-width="400px"
        title-class="primary white--text"
      >
        <template #title>
          <slot name="title">
            <span class="subheading" data-cy="updateCardDetailsHeading">
              {{ $t('settings.updateCardDetails') | capitalize }}
            </span>
          </slot>
        </template>

        <v-alert
          :value="stripeError"
          outline
          transition="slide-y-transition"
          type="error"
        >
          {{ stripeError }}
        </v-alert>
        <keep-alive>
          <div ref="cardElement"/>
        </keep-alive>

        <template #button>
          {{ $t('button.save') }}
        </template>
      </Modal>

      <v-layout
        class="mt-3"
        row
        wrap
      >
        <!-- PLAN / BILLING GROUP-->
        <SettingsGroup
          :title="$t('settings.group.planBilling')"
          class="qa-settings-plan-billing"
          data-cy="settingsGroupPlanBilling"
          fill-row
        >
          <template #settings>
            <v-layout
              align-center row
              style="min-height: 64px;"
            >
              <AppWait
                v-if="$wait.is(waitKey.checkout)"
                :wait="$wait.is(waitKey.checkout)"
                height="99%"
                hide-message
                opacity="0"
                small
              />
              <v-flex v-else>
                <!-- PLAN -->
                <Setting
                  :divider="showBilling"
                  class="qa-plan"
                  custom-button
                  data-cy="planSetting"
                  wide
                >
                  <template #label>
                    {{ $t('settings.currentPlan') | capitalize }}
                  </template>
                  <template #static>
                    <div class="d-inline-flex align-center">
                      <span class="text-uppercase">
                        {{
                          $auth.user.onTrialOrFrozenPlan()
                          ? $tc('settings.plans.trial')
                          : $tc('settings.plans.' + $auth.team.plan)
                        }}
                      </span>
                      <template v-if="$auth.team.onFrozenPlan()">
                        <AppChip
                          class="ml-3 my-0"
                          color="warning darken-1"
                          icon="watch_later"
                          outline
                          small
                          text-color="warning darken-1"
                        >
                          {{ $tc('settings.plans.' + $auth.team.plan) | capitalize }}
                        </AppChip>
                      </template>
                      <template v-else>
                        <AppChip
                          v-if="canceled_at"
                          class="ml-3 my-0"
                          color="warning darken-1"
                          icon="remove_circle"
                          outline
                          small
                          text-color="warning darken-1"
                        >
                          {{ $t('settings.canceledEffectiveOn', { date: formattedDate(canceled_at) }) }}
                        </AppChip>
                        <AppChip
                          v-if="$auth.team.onTrial()"
                          class="ml-3 my-0"
                          color="warning darken-1"
                          icon="timer"
                          outline
                          small
                          text-color="warning darken-1"
                        >
                          {{ $t('settings.daysLeft', { num: user_trialRemaining }) }}
                        </AppChip>
                      </template>
                    </div>
                  </template>
                  <template #action-button>
                    <v-btn
                      v-if="$auth.user.isAdmin()"
                      :color="$auth.user.onTrialOrFrozenPlan() ? 'tertiary' : 'primary'"
                      :outline="!$auth.user.onTrialOrFrozenPlan()"
                      block
                      class="ma-0"
                      small
                      @click="onUpgrade"
                    >
                      {{ $t('settings.changePlan') }}
                    </v-btn>
                  </template>
                </Setting>
                <!-- BILLING -->
                <Setting
                  v-if="showBilling"
                  class="qa-billing"
                  custom-button
                  data-cy="billingSetting"
                  wide
                >
                  <template #label>
                    {{ $t('settings.paymentMethod') | capitalize }}
                  </template>
                  <template #static>
                    <v-fade-transition leave-absolute>
                      <div
                        v-if="isCardPayment"
                        class="d-block qa-method"
                      >
                        <div>
                          <span class="text-capitalize">{{ checkoutData.card_brand }}</span>
                          **** **** **** {{ checkoutData.card_last4 }}
                        </div>
                        <span class="caption">
                          {{ $tc('settings.exp') | capitalize }}
                          {{ checkoutData.card_exp_month }} /
                          {{ checkoutData.card_exp_year }}
                        </span>
                      </div>
                      <div v-else-if="isSepaPayment">
                        SEPA **** **** {{ checkoutData.last4 }}
                      </div>
                    </v-fade-transition>
                  </template>
                  <template #action-button>
                    <v-menu
                      v-if="$auth.user.isAdmin()"
                    >
                      <template v-slot:activator="{ on }">
                        <v-btn
                          v-on="on"
                          block
                          class="ma-0"
                          color="primary"
                          small
                        >
                          {{ $tc('settings.manageBilling') }}
                          <v-icon
                            color="white"
                            right
                          >
                            expand_more
                          </v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-tile
                          v-for="(item, index) in checkoutActions"
                          :key="index"
                          @click="item.action"
                        >
                          <v-list-tile-action v-if="!!item.icon">
                            <v-icon
                              color="primary"
                              small
                              v-text="item.icon"
                            />
                          </v-list-tile-action>
                          <v-list-tile-title>
                            {{ item.text | capitalize }}
                          </v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                  </template>
                </Setting>
              </v-flex>
            </v-layout>
          </template>
        </SettingsGroup>
      </v-layout>
      <v-layout
        class="mt-3"
        row
        wrap
      >
        <!-- DELETE ACCOUNT GROUP -->
        <SettingsGroup
          class="qa-settings-delete-account"
          data-cy="settingsGroupDeleteAccount"
          fill-row
        >
          <template #settings>
            <!-- DELETE ACCOUNT -->
            <Setting
              class="qa-delete"
              custom-button
              data-cy="deleteAccountSetting"
              two-col
              wide
            >
              <template #label>
                <div class="title">
                  {{ $tc('settings.deleteAccountAndAllData') | capitalize }}
                </div>
                <span
                  class="caption headline"
                >
                  {{ $t('settings.noBackups') }}
                </span>
              </template>
              <template #action-button>
                <v-btn
                  block
                  class="ma-0"
                  color="error"
                  outline
                  small
                  @click.native.stop="showDeleteDialog(true)"
                >
                  {{ $tc('settings.deleteAccount') }}
                </v-btn>
              </template>
            </Setting>
          </template>
        </SettingsGroup>
      </v-layout>

      <div v-if="formUrl && stripeKey">
        <form
          ref="settingsStripeForm"
          :action="formUrl"
          class="settings--stripe-form"
          method="POST"
          style="display:none"
        >
          <input
            ref="stripeTokenField"
            name="stripeToken"
            type="hidden"
          >
          <input type="submit">
        </form>
      </div>
    </v-flex>

    <DeleteAccountDialog
      :dialog="deleteDialog"
      :team-members="teamMembers"
      @cancel="showDeleteDialog(false)"
      @on-delete="onDeleteUser"
    />
  </v-layout>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import moment from 'moment';
  import AppChip from '@/components/App/AppChip';
  import PageToolbar from '@/components/App/Toolbar/PageToolbar';
  import DeleteAccountDialog from '@/components/Settings/DeleteAccountDialog';
  import Modal from '@/components/App/Modal';
  import SettingsForm from '@/components/Settings/SettingsForm';
  import SettingsGroup from '@/components/Settings/SettingsGroup';
  import Setting from '@/components/Settings/Setting';
  import AppWait from '~/components/App/AppWait';
  import useDateTime from '@/mixins/useDateTime';
  import planMixins from '@/mixins/plan';
  import userMixins from '@/mixins/user';
  import useCheckout from '@/mixins/useCheckout';
  import useAuth from '@/mixins/useAuth';
  import User from '@/models/User';

  export default {
    layout: 'admin',
    components: {
      AppWait,
      AppChip,
      PageToolbar,
      DeleteAccountDialog,
      Modal,
      SettingsForm,
      SettingsGroup,
      Setting,
    },
    mixins: [
      useDateTime,
      planMixins,
      userMixins,
      useCheckout,
      useAuth
    ],
    async fetch() {
      await this.getCheckoutData({ User: this.$auth.user });
      await this.setCheckoutDetails();
    },
    data() {
      return {
        deleteDialog: false,
        email: null,
        formUrl: null,
        showCreditCardDialog: false,
        clientSecret: null,
        stripe: null,
        stripeKey: null,
        stripeWaitKey: 'checkout.stripe',
        stripeError: '',
        canceled_at: null,
        waitKey: {
          checkout: this.$WAIT_FOR.USER.CHECKOUT_DATA,
        },
      };
    },
    computed: {
      ...mapState('user', ['checkoutData']),
      ...mapState('refData', ['timezones', 'publicFrontmen']),
      ...mapState('teamMembers', {
        teamMembers: 'teamMembers',
      }),
      user() {
        return this.$auth.user;
      },
      mainTimezone() {
        return this.estimatedMainTimezone ? this.estimatedMainTimezone.value : '';
      },
      estimatedMainTimezone() {
        const mainTimezoneObj = this.timezones.filter(
          el => el.utc.indexOf(this.$auth.team.timezone) > -1,
        );
        return mainTimezoneObj[0];
      },
      estimatedRegionsOptions() {
        let regions = [];
        if (this.estimatedMainTimezone) {
          regions = this.estimatedMainTimezone.utc;
        }
        return regions;
      },
      dateFormats() {
        const now = moment().utc().tz(this.$auth.team.timezone);
        return this.endianFormatMap().map(({ endian }) => ({
          value: endian,
          text: this.parseEndianFormatFromMoment(now, endian),
        }));
      },
      teamAdmins() {
        return this.teamMembers.filter(({ roles }) => roles === User.userRoles.ADMIN);
      },
      checkoutBaseUrl() {
        return this.checkoutData.handover.baseUrl;
      },
      showBilling() {
        return ! this.$auth.user.onTrialOrFrozenPlan() && ! this.$auth.team.onFreePlan();
      },
      isSepaPayment() {
        return this.checkoutData.type === 'sepa_debit';
      },
      isCardPayment() {
        return this.checkoutData.type === 'card';
      },
      checkoutActions() {
        let result = [];

        if (this.isCardPayment)
          result.push({
            icon: 'credit_card',
            text: this.$tc('settings.updateCardDetails'),
            action: this.openCreditCardDialog,
          });

        if (this.isSepaPayment)
          result.push({
            icon: 'account_balance',
            text: this.$tc('settings.viewBankMandate'),
            action: this.onViewBankMandate,
          });

        if (this.isCardPayment || this.isSepaPayment)
          result = result.concat([
            {
              icon: 'receipt',
              text: this.$tc('settings.viewAndDownloadInvoices'),
              action: this.onListInvoices,
            },
            {
              icon: 'next_week',
              text: this.$tc('settings.viewAndUpdateBillingAddress'),
              action: this.onChangeBillingAddress,
            },
          ]);

        return result;
      },
    },
    async created() {
      await Promise.all([
        this.getTimezones(),
        this.getPublicFrontmen()
      ]);
    },
    methods: {
      ...mapActions('user', ['getCheckoutData']),
      ...mapActions('refData', ['getPublicFrontmen', 'getTimezones']),
      setCheckoutDetails() {
        this.formUrl = null;
        this.stripeKey = null;
        this.clientSecret = null;

        if (this.checkoutData.paid) {
          this.canceled_at = this.checkoutData.canceled_at;
          this.email = this.checkoutData.email || '';
        }

        // Wait for next tick so stripe form can rerender
        this.$nextTick(() => {
          this.formUrl = this.checkoutData.formUrl;
          this.stripeKey = this.checkoutData.stripeKey;

          if (this.checkoutData.setup_intent) {
            this.clientSecret = this.checkoutData.setup_intent.client_secret;
          }

          const waitForStripe = setInterval(() => {
            if (this.stripe) {
              clearInterval(waitForStripe);
              return;
            }

            if (
              typeof Stripe !== 'undefined'
              && typeof Stripe === 'function'
            ) {
              this.stripe = Stripe(this.stripeKey);
              clearInterval(waitForStripe);
            }
          }, 100);
        });

        this.canceled_at = null;
      },
      async openCreditCardDialog() {
        const elements = this.stripe.elements();
        const style = {
          base: {
            color: 'white',
            lineHeight: '18px',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '14px',
            '::placeholder': {
              color: 'white'
            },
          },
          invalid: {
            color: '#d50000',
            iconColor: '#d50000'
          }
        };

        this.stripeCardElement = elements.create('card', { style });

        this.stripeCardElement.on('change', (event) => {
          if (event.error) {
            this.stripeError = event.error.message;
          } else {
            this.stripeError = '';
          }
        });

        this.showCreditCardDialog = true;

        this.$nextTick(() => {
          this.stripeCardElement.mount(this.$refs.cardElement);
        });
      },
      async onSubmitCreditCardDialog() {
        this.$wait.start(this.stripeWaitKey);
        this.stripeError = '';

        try {
          const result = await this.stripe.handleCardSetup(
            this.clientSecret,
            this.stripeCardElement,
            {},
          );

          if (result.error) {
            this.stripeError = result.error.message;
          } else {
            this.$refs.stripeTokenField.value = JSON.stringify(result.setupIntent);
            this.$refs.settingsStripeForm.querySelector('input[type="submit"]').click();
          }
        } catch (e) {
          console.error(e);
          this.stripeError = this.$t('message.error.stripeError');
        } finally {
          this.$wait.end(this.stripeWaitKey);
        }
      },
      onCancelCreditCardDialog() {
        this.showCreditCardDialog = false;
        this.stripeError = '';
        this.$wait.end(this.stripeWaitKey);
      },
      onUpgrade() {
        this.useCheckout_open(this.checkoutBaseUrl, 'upgrade');
      },
      onListInvoices() {
        this.useCheckout_open(this.checkoutBaseUrl, 'list-invoices');
      },
      onChangeBillingAddress() {
        this.useCheckout_open(this.checkoutBaseUrl, 'change-billing-address');
      },
      onViewBankMandate() {
        this.useCheckout_openBankMandate(this.checkoutData.mandate_url);
      },
      onUpdate({ success }) {
        if (success) {
          this.$flash.success(this.$t('message.success.userSettingsSaved'));
        } else {
          this.$flash.error(this.$t('message.error.userSettingsSaved'));
        }
      },
      onDeleteUser({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.userDelete'));
          this.useAuth_logout();
        } else {
          this.$flash.error(this.$t('message.error.userDelete'));
        }
      },
      showDeleteDialog(show) {
        this.deleteDialog = show;
      },
    },
    head() {
      return {
        script: [
          {
            src: 'https://js.stripe.com/v3/',
            defer: true,
          }
        ]
      };
    },
  };
</script>
