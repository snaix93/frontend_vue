<template>
  <v-chip
    :color="color"
    :small="small"
    :icon="icon"
    :icon-class="iconClass"
    :icon-right="iconRight"
    :icon-right-class="iconRightClass"
    :label="label"
    :outline="outline"
    :text-color="textColor"
    disabled
  >
    <v-avatar
      v-if="icon"
      :class="iconClass"
    >
      <v-icon
        :color="textColorComputed"
        v-html="icon"
      />
    </v-avatar>

    <slot/>

    <v-avatar
      v-if="iconRight"
      :class="iconRightClass"
    >
      <v-icon
        right
        :color="textColorComputed"
        v-html="iconRight"
      />
    </v-avatar>
  </v-chip>
</template>

<script>
  export default {
    props: {
      color: {
        default: 'orange',
        type: String,
        required: false,
      },
      icon: {
        type: String,
        required: false,
      },
      iconClass: {
        required: false,
        default: () => ['mr-0'],
      },
      iconRight: {
        type: String,
        required: false,
      },
      iconRightClass: {
        type: Object,
        required: false,
        // default: () => ['mr-0']
      },
      textColor: {
        type: String,
        required: false,
        default: () => 'white',
      },
      small: {
        default: false,
        type: Boolean,
        required: false,
      },
      label: {
        default: false,
        type: Boolean,
        required: false,
      },
      outline: {
        default: false,
        type: Boolean,
        required: false,
      },
    },
    computed: {
      textColorComputed() {
        let { textColor } = this;
        if (this.outline) textColor = this.color;

        return textColor;
      },
    },
  };
</script>
