<template>
  <div>
    <v-layout align-center>
      <v-avatar
        size="24"
        class="mx-2"
      >
        <v-icon class="error--text">
          warning
        </v-icon>
      </v-avatar>
      <div class="body-2 d-inline">
        {{ $t('message.preflight.failedTitle') | capitalize }}
      </div>
    </v-layout>
    <p class="mt-2">
      {{ $t('message.preflight.failedText') }}
    </p>
    <kbd
      v-if="preflightResult"
      class="d-block pa-2"
      v-html="preflightResult.cmd + '<br>' + preflightResult.cmdResult"
    />
    <v-alert
      type="info"
      outline
      class="v-alert--light caption mt-3"
      value="true"
    >
      {{ $t('message.preflight.info') }}
    </v-alert>
  </div>
</template>

<script>
  export default {
    props: {
      preflightResult: {
        type: Object,
        required: true,
      },
    },
  };
</script>

<style lang="stylus" scoped>
  kbd
    &:before
      content: '# '
</style>
