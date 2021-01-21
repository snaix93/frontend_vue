<template>
  <v-chip
    class="ml-1 warning--text text--darken-1"
    color="warning darken-1"
    outline
    small
  >
    <v-icon
      color="warning darken-1"
      small
      class="ml-0 mr-1"
    >
      fas fa-flask
    </v-icon>
    {{ $t('phrase.experimental') }}
  </v-chip>
</template>
