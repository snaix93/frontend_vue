<template>
  <v-card
    class="qa-register-form"
    flat
  >
    <v-card-text class="pa-0">
      <h2 class="mb-2">
        <v-layout
          v-if="hasInvitationCode"
          align-center
          justify-center
        >
          <v-icon
            :size="46"
            class="mr-4"
          >
            fa-gifts
          </v-icon>
          <span
            v-html="$t('register.invitation.formHeading', {
              savings,
              days: trialPeriod.days
            })"
          />
        </v-layout>
        <template v-else>
          <div class="headline font-weight-bold mb-2">
            {{ $t('register.main.form.heading') }}
          </div>
          <div class="secondary--text font-weight-bold body-1">
            {{ $t('register.main.form.subheading', { days: trialPeriod.days }) }}
          </div>
        </template>
        <template v-else>
          {{ $t('register.thanks.heading') }}
        </template>
      </h2>
      <p class="mt-2 mb-4 caption">
        <span class="text--secondary">{{ $t('register.alreadyRegistered') }}</span>
        <a
          class="secondary--text font-weight-bold text-capitalize no-text-decoration"
          href="/auth"
        >
          {{ $t('register.logIn') }}
        </a>
      </p>
      <RegisterForm
        :invitation-code="invitationCode"
        :legal-links="legalLinks"
        :prefill-email="$route.params.email"
        :show-invitation-field="!!hasInvitationCode"
        @on-input-invite-code="onInputInviteCode"
      >
        {{ $t('register.form.button') }}
      </RegisterForm>
    </v-card-text>
  </v-card>
</template>

<script>
  import geo from 'geolocator';
  import collect from 'collect.js';
  import RegisterForm from '@/components/Auth/RegisterForm';
  import euroCountries from '@/data/euro-countries';
  import registerMixins from '@/mixins/register';
  import appMixins from '@/mixins/app';
  import { mapState } from 'vuex';

  export default {
    layout: 'public-guest',
    components: {
      RegisterForm,
    },
    mixins: [
      appMixins,
      registerMixins,
    ],
    data() {
      return {
        trialPeriod: {
          days: 15,
        },
        currency: 'USD',
        invitationCode: null,
      };
    },
    computed: {
      ...mapState('app', ['legalLinks']),
      hasInvitationCode() {
        return !! this.$route.params.code;
      },
      savings() {
        if (this.currency === 'EUR') return `${this.trialPeriod.savings[this.currency]} €`;

        return `$${this.trialPeriod.savings[this.currency]} USD`;
      },
    },
    async beforeMount() {
      const { code, state } = this.$route.params;

      if (state) {
        await this.$router.replace('/register');
      }

      if (this.hasInvitationCode) {
        if (this.codeExp.test(code)) {
          this.trialPeriod = this.getTrialPeriodFromCode(code);
        } else {
          [this.trialPeriod] = this.trialPeriods;
        }

        this.invitationCode = this.$route.params.code;

        const location = await this.getLocation();

        if (
          location?.address?.countryCode
          && this.isEuroCountry(location.address.countryCode)
        ) {
          this.currency = 'EUR';
        }
      }
    },
    methods: {
      onInputInviteCode(code) {
        const trialPeriod = this.getTrialPeriodFromCode(code);

        if (trialPeriod) this.trialPeriod = trialPeriod;

        this.invitationCode = code;
      },
      isEuroCountry(countryCode) {
        return collect(euroCountries).where('alpha2Code', countryCode).count() > 0;
      },
      getLocation() {
        return new Promise((resolve) => {
          geo.locateByIP({
            addressLookup: false,
            timezone: false,
            staticMap: false,
          }, (err, location) => {
            if (err) return;

            resolve(location);
          });
        });
      },
    },
  };
</script>
