<template>
  <v-layout
    fill-height
    justify-center
    align-center
  >
    <v-flex
      shrink
      class="text-xs-center"
    >
      <v-icon size="64">
        sentiment_very_dissatisfied
      </v-icon>
      <p
        v-if="error.statusCode === 404"
        class="display-1"
        data-cy="errorPageNotFoundMessage"
      >
        {{ $t('message.error.pageNotFound') | capitalize }}
      </p>
      <p
        v-else
        class="display-1"
        data-cy="errorPageErrorMessage"
      >
        {{ $t('message.error.default') | capitalize }}
      </p>
      <v-btn
        color="secondary"
        to="/"
        data-cy="errorPageHomeButton"
      >
        {{ $t('button.goToDashboard') }}
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    /* eslint-disable vue/require-prop-types */
    props: ['error'],
  };
</script>
