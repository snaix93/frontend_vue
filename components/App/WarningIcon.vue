<template>
  <svg
    class="warning-cross"
    :width="width"
    :height="height"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-6 -6 52 52"
  >
    <circle
      class="warning-cross__circle"
      cx="26"
      cy="26"
      r="25"
      fill="none"
    />
    <path
      class="warning-cross__cross"
      fill="none"
      d="M 10,10 L 30,30 M 30,10 L 10,30"
    />
  </svg>
</template>

<script>
  export default {
    props: {
      height: {
        type: String,
        required: false,
        default: '56px',
      },
      width: {
        type: String,
        required: false,
        default: '56px',
      },
    },
  };
</script>

<style lang="stylus" scoped>
  red = #C52828
  cubic-bezier = cubic-bezier(0.650, 0.000, 0.450, 1.000)

  .warning-cross
    /*width: 56px*/
    /*height: 56px*/
    border-radius: 50%
    display: block
    stroke-width: 2
    stroke: #fff
    stroke-miterlimit: 10
    margin: 10% auto
    box-shadow: inset 0px 0px 0px red
    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both

  .warning-cross__circle
    stroke-dasharray: 166
    stroke-dashoffset: 166
    stroke-width: 2
    stroke-miterlimit: 10
    stroke: red
    fill: none
    animation: stroke .6s cubic-bezier forwards

  .warning-cross__cross
    transform-origin: 50% 50%
    stroke-dasharray: 48
    stroke-dashoffset: 48
    animation: stroke .3s cubic-bezier .8s forwards

  @keyframes stroke
    100%
      stroke-dashoffset: 0

  @keyframes scale
    0%, 100%
      transform: none
    50%
      transform: scale3d(1.1, 1.1, 1)

  @keyframes fill
    100%
      box-shadow: inset 0px 0px 0px 30px red
</style>
