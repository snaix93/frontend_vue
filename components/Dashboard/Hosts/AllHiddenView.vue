<template>
  <v-layout justify-center wrap>
    <v-flex
      class="text-xs-center"
      md10 sm12
    >
      <v-alert
        :value="true"
        class="mx-5 mt-4 mb-0 pb-4 subheading font-weight-bold"
        color="primary"
      >
        {{ $t('dashboard.allHiddenView.alert') }}
      </v-alert>

      <v-alert
        :value="$userSettings.get('dashboard.showHostsWithIssuesOnly') || showFilteredMessage"
        class="mx-5 mt-0 mb-4"
        color="primary"
        outline
      >
        <slot name="message" v-if="showFilteredMessage" />
        <template v-if="$userSettings.get('dashboard.showHostsWithIssuesOnly')">
          <p
            class="mb-1"
            :class="{'mt-3': showFilteredMessage}"
          >
            {{ $tc('dashboard.allHiddenView.hostsWithIssuesFilterApplied') }}
          </p>
          <v-btn
            class="mx-auto"
            color="primary"
            small
            @click="disableShowHostsWithIssuesFilter"
          >
            {{ $t('dashboard.allHiddenView.disableShowHostsWithIssuesFilterBtn') }}
          </v-btn>
        </template>
      </v-alert>

      <i18n
        class=""
        path="dashboard.allHiddenView.hostsWithIssuesFilterAppliedHint"
        tag="p"
      >
        <template v-slot:link>
          <nuxt-link to="/hosts">{{
            $t('dashboard.allHiddenView.hostsWithIssuesFilterAppliedLink')
          }}</nuxt-link>
        </template>
      </i18n>
    </v-flex>
  </v-layout>
</template>

<script>
  import hostMixins from '@/mixins/host';

  export default {
    mixins: [hostMixins],
    props: {
      showFilteredMessage: {
        type: Boolean,
        required: false,
        default: false,
      }
    },
    methods: {
      disableShowHostsWithIssuesFilter() {
        this.$userSettings.set('dashboard.showHostsWithIssuesOnly', false).save();
      },
    },
  };
</script>
