<template>
  <v-tabs
    dark
    color="secondary"
    right
    slider-color="white"
    class="mr-3"
    style="width: auto"
  >
    <v-tab
      v-if="$auth.user.isNotReadOnly()"
      id="hostTabsSettings"
      :to="'/hosts/' + hostId"
      nuxt
      replace
    >
      <v-icon
        small
        class="mr-1"
      >
        settings
      </v-icon>
      <span class="hidden-sm-and-down">{{ $t('button.settings') }}</span>
    </v-tab>
    <v-tab
      id="hostTabsLatestData"
      :to="'/hosts/' + hostId + '/latest-data'"
      nuxt
      replace
    >
      <v-icon
        small
        class="mr-1"
      >
        bar_chart
      </v-icon>
      <span class="hidden-sm-and-down">{{ $t('button.latestData') }}</span>
    </v-tab>
  </v-tabs>
</template>

<script>
  import userMixins from '@/mixins/user';

  export default {
    mixins: [userMixins],
    props: {
      hostId: {
        type: String,
        required: true,
      },
    },
  };
</script>
