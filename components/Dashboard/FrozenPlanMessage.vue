<template>
  <v-layout
    align-center
    justify-center
    wrap
  >
    <v-flex class="text-xs-center">
      <v-icon
        class="mb-3"
        color="grey darken-1"
        size="48"
      >
        watch_later
      </v-icon>
      <div class="title mb-2">
        {{ $t('dashboard.frozenPlanMessage.trialHasEnded') | capitalize }}
      </div>
      <div class="grey--text text--darken-1 mb-3">
        {{ $t('dashboard.frozenPlanMessage.upgradeYourAccount') | capitalize }}
      </div>
      <v-btn
        color="success"
        large
        :loading="$wait.is(checkoutDataWaitKey)"
        :disabled="$wait.is(checkoutDataWaitKey)"
        @click="onUpgrade"
      >
        {{ $t('dashboard.frozenPlanMessage.upgradeMyAccountNow') }}
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
  import { isEmpty } from 'lodash-es';
  import { mapState } from 'vuex';

  import useCheckout from "@/mixins/useCheckout";

  export default {
    mixins: [useCheckout],
    computed: {
      ...mapState('user', ['checkoutData']),
      checkoutDataWaitKey() {
        return this.$WAIT_FOR.USER.CHECKOUT_DATA;
      }
    },
    methods: {
      onUpgrade() {
        if(isEmpty(this.checkoutData)) {
          this.useCheckout_getHandoverAndUpgrade(this.$auth.user);
        } else {
          this.useCheckout_open(this.checkoutData.handover.baseUrl, 'upgrade')
        }
      },
    },
  };
</script>
