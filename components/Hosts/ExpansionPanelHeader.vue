<template>
  <v-layout
    align-center
    justify-start
    wrap
  >
    <v-flex
      xs12
      sm12
      :xl2="!slim"
      :lg3="!slim"
      :md4="!slim"
      :xl5="!!slim"
      :lg6="!!slim"
      :md7="!!slim"
    >
      <v-layout
        align-center
        justify-start
      >
        <v-flex
          v-if="
            (
              $vuetify.breakpoint.smAndDown
              || $vuetify.breakpoint.lgAndUp
            ) && !!avatarIcon
          "
          :mr-2="$vuetify.breakpoint.lgAndUp"
          shrink
        >
          <template v-if="!slim">
            <v-avatar
              :color="iconColor"
              :class="{'lighten-3': upgradePanel}"
              size="24px"
            >
              <v-icon
                color="white"
                :size="iconSize"
              >
                {{ avatarIcon }}
              </v-icon>
            </v-avatar>
          </template>
          <template v-else>
            <v-avatar
              color="transparent"
              :class="{'lighten-3': upgradePanel}"
              size="24px"
            >
              <v-icon
                :color="iconColor"
                small
              >
                {{ avatarIcon }}
              </v-icon>
            </v-avatar>
          </template>
        </v-flex>
        <v-flex
          class="qa-head-panel text-truncate"
          :class="{
            'body-2' : !slim,
            'body-1' : !!slim,
          }"
        >
          {{ title | capitalize }}
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex
      :xl10="!slim"
      :lg9="!slim"
      :md8="!slim"
      :sm11="!slim"
      :xs10="!slim"

      :xl7="!!slim"
      :lg6="!!slim"
      :md5="!!slim"
      :sm12="!!slim"
      :xs12="!!slim"
    >
      <v-layout
        wrap
        align-center
        justify-start
      >
        <slot/>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    props: {
      avatarIcon: {
        type: String,
        required: false,
      },
      iconColor: {
        type: String,
        required: false,
        default: 'secondary',
      },
      iconSize: {
        type: String,
        required: false,
        default: '16px',
      },
      upgradePanel: {
        type: Boolean,
        required: false,
        default() {
          return false;
        },
      },
      title: {
        type: String,
        required: true,
      },
      slim: {
        type: Boolean,
        required: false,
        default() {
          return false;
        },
      },
    },
  };
</script>

<style scoped>

</style>
