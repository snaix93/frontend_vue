<template>
  <v-flex
    :class="{
      'active' : active,
      'mb-4': $vuetify.breakpoint.smAndDown
    }"
    class="guide-choice"
    md4 xs12
  >
    <v-hover>
      <template #default="{ hover }">
        <v-card
          :class="{ pointer: hover }"
          :elevation="hover ? 4 : 2"
          class="mx-0 pb-0 guide-choice--card"
          color="white"
          height="100%"
          @click="onClick"
        >
          <v-card-title class="shrink">
            <v-layout
              align-baseline
              justify-space-between
            >
              <v-flex grow>
                <span class="subheading font-weight-bold">{{ title | capitalize }}</span>
              </v-flex>
              <v-flex
                class="icons"
                shrink
              >
                <v-layout
                  fill-height
                  justify-end
                  row
                >
                  <slot name="title-icons"/>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text class="grow">
            <slot name="description"/>
          </v-card-text>
          <v-card-actions
            class="caption shrink my-2 ml-2"
            mb-0 pb-0
          >
            <slot name="footer"/>
          </v-card-actions>
        </v-card>
      </template>
    </v-hover>
  </v-flex>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        default: false
      },
    },
    methods: {
      onClick() {
        this.$emit('host-guide-choice-click');
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .guide-choice {
    opacity: 0.4;
    transition: all 0.1s ease-in;
    filter: blur(2px);

    &--card {
      display: flex !important;
      flex-direction: column;
      justify-content: flex-start;
    }

    &.active {
      opacity: 1;
      filter: none;
    }
  }
</style>
