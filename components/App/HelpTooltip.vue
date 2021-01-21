<template>
  <v-menu
    v-model="show"
    :bottom="orientation === 'bottom'"
    :close-on-content-click="false"
    :left="orientation === 'left'"
    :min-width="minWidth ? minWidth : '250'"
    :offset-x="horizontalOrientation"
    :offset-y="verticalOrientation"
    :right="orientation === 'right'"
    :top="orientation === 'top'"
    max-width="350"
    open-on-hover
  >
    <template #activator="{ on }">
      <slot :on="on">
        <v-icon
          v-on="on"
          class="help-tooltip__trigger"
          color="grey darken-4"
          size="21px"
        >
          help
        </v-icon>
      </slot>
    </template>

    <v-card
      class="darken-2"
      color="grey"
      dark
    >
      <v-card-text class="caption">
        <v-fade-transition mode="out-in">
          <div
            v-if="!content"
            class="text-xs-center"
          >
            <v-progress-circular
              indeterminate
              size="16"
              width="2"
            />
          </div>
          <div
            v-else
            class="help-tooltip__content"
            v-html="content"
          />
        </v-fade-transition>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  export default {
    props: {
      tooltip: {
        type: Function,
        required: true,
      },
      orientation: {
        type: String,
        required: false,
        default: 'bottom',
      },
      minWidth: {
        type: String,
      },
      value: {},
    },
    data() {
      return {
        show: false,
        content: null,
      };
    },
    computed: {
      verticalOrientation() {
        return this.orientation === 'bottom' || this.orientation === 'top';
      },
      horizontalOrientation() {
        return this.orientation === 'left' || this.orientation === 'right';
      }
    },
    watch: {
      async show(value) {
        if (value) {
          await this.fetchContent();
        }
      },
    },
    methods: {
      async fetchContent() {
        this.content = await this.tooltip();
      }
    },
  };
</script>

<style lang="stylus" scoped>
  .help-tooltip
    &__trigger
      cursor: default

    &__content >>> p
      margin-bottom: 0
</style>
