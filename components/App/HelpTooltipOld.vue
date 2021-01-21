<template>
  <div
    class="help-tooltip"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <span class="help-tooltip--activator">
      <slot/>
    </span>

    <div
      :class="
        'help-tooltip--wrap position-' +
          position +
          ' orientation-' +
          orientation +
          ' ' +
          (isVisible ? 'active' : '')
      "
      :style="
        'visibility: ' +
          (isVisible ? 'visible' : 'hidden') +
          (minWidth ? '; min-width: ' + minWidth : '')
      "
    >
      <div class="help-tooltip--content">
        <div
          v-if="getter !== null"
          v-html="getter"
        />
        <div
          v-else
          class="help-tooltip--loading"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            :size="18"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      getter: {
        required: true,
      },
      action: {
        type: Function,
      },
      orientation: {
        type: String,
        default: 'center',
      },
      positionProp: {
        type: String,
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
        position: this.positionProp,
      };
    },
    computed: {
      isVisible() {
        if (this.value !== undefined) return this.value;

        return this.show;
      },
    },
    methods: {
      onMouseOver(e) {
        if (this.show) return;

        if (e.relatedTarget
            && e.relatedTarget.getBoundingClientRect().bottom > window.innerHeight * 0.7
        ) {
          this.position = 'top';
        } else {
          this.position = 'bottom';
        }

        if (this.getter == null && this.action) this.action();

        if (this.value !== undefined) return;

        this.show = true;
      },
      onMouseLeave() {
        if (this.value !== undefined) return;

        this.show = false;
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .help-tooltip
    display: inline-block
    position: relative
    width: auto

    .help-tooltip--activator
      display: inline-block
      font-size: 18px
      cursor: pointer

      > .v-icon
        opacity: 1 !important

    .help-tooltip--wrap
      position: absolute
      left: 50%
      min-width: 250px
      max-width: 350px
      white-space: normal
      opacity: 0
      transform: translate(-50%, 2%)
      z-index: 2

      transition: all 0.2s ease-out

      &:before
        content: ' '
        display: block
        position absolute
        width: 0
        height: 0
        border-style: solid

      &.active
        opacity: 1
        transform: translate(-50%, 0)

      &.orientation-left
        left: 0
        transform: translate(0, 2%)

        &.active
          transform: translate(0, 0)

        &.position-top:before,
        &.position-bottom:before
          left: 10px

      &.orientation-right
        left: auto
        right: 0
        transform: translate(0, 2%)

        &.active
          transform: translate(0, 0)

        &.position-top:before,
        &.position-bottom:before
          left: auto
          right: 10px

      &.position-top
        bottom: 100%
        padding-bottom: 6px

        &:before
          left: 50%
          bottom: -3px
          border-width: 9px 6px 0 6px
          margin-left: -6px
          border-color: #616161 transparent transparent transparent

      &.position-bottom
        top: 100%
        padding-top: 6px

        &:before
          left: 50%
          top: -3px
          border-width: 0 6px 9px 6px
          border-color: transparent transparent #616161 transparent
          margin-left: -6px

      .help-tooltip--content
        background: #616161
        font-size: 12px
        font-weight: normal
        color: rgba(255, 255, 255, .87)
        padding: 12px
        border-radius: 4px
        box-shadow: 0 2px 1px -1px rgba(0, 0, 0, .2),
          0 1px 1px 0px rgba(0, 0, 0, .14),
          0 1px 3px 0px rgba(0, 0, 0, .12);

        .help-tooltip--loading
          text-align: center
</style>

<style lang="stylus">
  .help-tooltip .help-tooltip--content
    line-height: 1.4

    a
      color: white

    p:last-child
      margin-bottom: 0
</style>
