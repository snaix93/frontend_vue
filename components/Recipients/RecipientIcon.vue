<template>
  <v-badge
    color="error"
    overlap
  >
    <template #badge>
      <span v-if="!verified">!</span>
    </template>
    <v-avatar size="24">
      <img
        v-if="isImg"
        :src="require(`~/assets/icons/${icon}.png`)"
        alt=""
        class="filter-grayscale"
      />
      <v-icon
        v-else
        class="cursor-default"
      >
        {{ icon }}
      </v-icon>
    </v-avatar>
  </v-badge>
</template>

<script>
  /* eslint-disable global-require */
  export default {
    props: {
      mediatype: {
        type: String,
        required: true,
      },
      verified: null,
    },
    computed: {
      isImg() {
        return this.mediatype === 'integromat'
               || this.mediatype === 'msteams'
               || this.mediatype === 'pushover';
      },
      icon() {
        switch (this.mediatype) {
          case 'email':
            return 'email';
          case 'slack':
            return 'fab fa-slack';
          case 'msteams':
            return 'msteams';
          case 'telegram':
            return 'fab fa-telegram-plane';
          case 'pushover':
            return 'pushover';
          case 'sms':
            return 'textsms';
          case 'phonecall':
            return 'call';
          case 'integromat':
            return 'integromat';
          case 'webhook':
            return 'code';
          default:
            return 'send';
        }
      },
    },
  };
</script>
