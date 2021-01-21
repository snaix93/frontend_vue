<template>
  <div class="d-inline info-badge">
    <v-btn
      v-if="hasClickListener"
      :class="buttonClass"
      :color="color"
      :title="title"
      depressed
      round
      @click="handleClick()"
    >
      <v-avatar
        v-if="withNumber"
        :class="avatarClass"
      >
        {{ number }}
      </v-avatar>
      {{ badgeText() }}
    </v-btn>

    <v-chip
      v-else
      :class="buttonClass"
      :color="color"
      :title="title"
      disabled
    >
      <v-avatar
        v-if="withNumber"
        :class="avatarClass"
      >
        {{ number }}
      </v-avatar>
      {{ badgeText() }}
    </v-chip>
  </div>
</template>

<script>
  import AppMixins from '@/mixins/app';

  export default {
    mixins: [AppMixins],
    props: {
      size: {
        required: false,
        type: String,
        default: 'large',
      },
      number: {
        required: false,
        default: false
      },
      color: {
        required: false,
        type: String,
      },
      title: {
        required: false,
        type: String,
        default: '',
      },
      labelLangKey: {
        required: true,
        type: String,
      },
      qaClassName: {
        required: false,
        type: String,
        default: '',
      },
    },
    computed: {
      withNumber() {
        return !! this.number;
      },
      buttonClass() {
        return [
          this.qaClassName,
          {
            'with-avatar': this.withNumber,
            'info-badge-button-small v-chip--small': this.size === 'small',
            'info-badge-button-large': this.size === 'large',
          },
          'info-badge-button white--text reset-text v-chip v-chip--disabled ml-0',
        ];
      },
      avatarClass() {
        return [this.color, 'darken-1'];
      },
      hasClickListener() {
        return this.$listeners && !! this.$listeners['ib-click'];
      },
    },
    methods: {
      handleClick() {
        this.$emit('ib-click');
      },
      badgeText() {
        return this.withNumber
               ? this.capitalize(this.$tc(this.labelLangKey, this.number))
               : this.capitalize(this.$t(this.labelLangKey));
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .info-badge >>> .info-badge-button.with-avatar .v-btn__content
    justify-content: start !important

  .v-btn >>> .v-avatar
    margin-left: -10px !important

  .v-btn.info-badge-button
    padding: 0 12px 0 10px
    margin: 0 3px !important
    display: inline-flex !important
    min-width: 0 !important

  .v-btn.info-badge-button-small,
  .v-chip.info-badge-button-small
    font-size 12px
    font-weight: normal !important
    margin-top 0 !important
    margin-bottom 0 !important

    .v-avatar
      font-size 14px

  .v-chip.info-badge-button-small.with-avatar
    padding-left: 0 !important

  .v-btn.info-badge-button-large,
  .v-chip.info-badge-button-large
    font-size 13px
    font-weight: 500 !important
    height: 32px !important
    margin-top 0 !important
    margin-bottom 0 !important

    .v-avatar
      font-size 20px
</style>
