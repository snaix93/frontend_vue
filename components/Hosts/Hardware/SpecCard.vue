<template>
  <v-card
    :class="{
      'fill-height' : !!fillHeight && !!value
    }"
    elevation="1"
  >
    <v-card-title
      class="grey lighten-3 subheading pointer"
      @click="toggle"
    >
      <slot name="title"/>

      <v-spacer />

      <v-btn
        class="ma-0"
        color="secondary"
        flat
        icon
        small
      >
        <v-icon small>
          {{ value ? 'expand_less' : 'expand_more' }}
        </v-icon>
      </v-btn>
    </v-card-title>
    <v-expand-transition>
      <div v-show="value">
        <slot name="content"/>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
  export default {
    props: {
      value: {
        type: Boolean,
        required: true,
      },
      fillHeight: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      toggle() {
        this.$emit('input', !this.value);
      },
    },
  };
</script>
