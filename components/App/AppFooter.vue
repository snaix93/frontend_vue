<template>
  <v-footer
    v-if="isVisible"
    height="48"
    light
    :color="float ? 'transparent' : ''"
    :class="{'float': float}"
    data-cy="appFooter"
  >
    <v-layout
      row
      wrap
      :justify-center="!float"
    >
      <v-btn
        flat
        small
        :class="{ 'text-capitalize' : float }"
        data-cy="appFooterLinkFeedback"
        href="mailto:service@cloudradar.io"
      >
        {{ $t('app.footer.feedback') }}
      </v-btn>
      <v-btn
        flat
        small
        :class="{ 'text-capitalize' : float }"
        :href="legalLinks.terms"
        data-cy="appFooterLinkTerms"
        target="_blank"
      >
        {{ $t('app.footer.terms') }}
      </v-btn>
      <v-btn
        flat
        small
        :class="{ 'text-capitalize' : float }"
        :href="legalLinks.privacy"
        data-cy="appFooterLinkPrivacy"
        target="_blank"
      >
        {{ $t('app.footer.privacy') }}
      </v-btn>
      <v-btn
        flat
        small
        :class="{ 'text-capitalize' : float }"
        :href="legalLinks.imprint"
        data-cy="appFooterLinkImprint"
        target="_blank"
      >
        {{ $t('app.footer.imprint') }}
      </v-btn>
    </v-layout>
  </v-footer>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    props: {
      float: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    computed: {
      ...mapState('app', ['legalLinks', 'appDrawer', 'appDrawerMini', 'currentRoute']),
      isVisible() {
        return this.appDrawer;
      },
    },
  };
</script>
