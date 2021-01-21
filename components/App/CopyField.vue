<template>
  <v-tooltip right>
    <span>
      {{ $t('button.copyToClipboard') | capitalize }}
    </span>
    <v-chip
      slot="activator"
      class="copy-field pointer ma-0"
      :color="success ? 'success' : 'secondary'"
      text-color="white"
      :label="!!compact"
      @click="copyToClipboard"
    >
      <v-avatar
        :class="{
          'copy-field--icon' : true,
          'success' : success,
          'secondary' : !success,
          'darken-1' : true
        }"
        :tile="!!compact"
      >
        <v-icon
          size="16px"
          color="white"
        >
          {{ success ? 'check' : 'file_copy' }}
        </v-icon>
      </v-avatar>
      <span class="copy-field--value font-weight-medium">
        <slot />
      </span>
    </v-chip>
  </v-tooltip>
</template>
<script>
  import appMixins from '@/mixins/app';

  export default {
    mixins: [appMixins],
    props: {
      toCopy: {
        validator: prop => typeof prop === 'string' || prop === undefined,
        required: true,
      },
      success: {
        type: Boolean,
        required: false,
        default: false,
      },
      message: {
        type: String,
        required: false,
      },
      compact: {
        type: Boolean,
        required: false,
        default: false,
      },
      customElement: {
        required: false,
      },
    },
    methods: {
      copyToClipboard() {
        const successMessage = this.message || this.$t('message.success.copy');
        const errorMessage = this.$t('message.error.copy');
        const el = this.customElement || this.$el;

        this.$emit('copy', this.toCopy);
        this.copyText(
          this.toCopy,
          successMessage,
          errorMessage,
          el
        );
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .copy-field
    border: 2px solid var(--v-secondary-base)
    transition: all 0.25s ease-in

    &:hover
      opacity: 0.8

    .copy-field--icon
      transition: all 0.25s ease-in

    .copy-field--value
      font-family: monospace
      letter-spacing: 0.5px
</style>
