<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="info"
    :width="width"
    :height="height"
    viewBox="0 0 330 330"
  >
    <circle
      class="info__circle"
      cx="26"
      cy="26"
      r="25"
      fill="none"
    />
    <path
      class="info__exclaim"
      d="M164.998 70c-11.026 0-19.996 8.976-19.996 20.009 0 11.023 8.97 19.991 19.996 19.991 11.026 0 19.996-8.968 19.996-19.991 0-11.033-8.97-20.009-19.996-20.009zM165 140c-8.284 0-15 6.716-15 15v90c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15v-90c0-8.284-6.716-15-15-15z"
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
  blue = #50B6EF
  cubic-bezier = cubic-bezier(0.650, 0.000, 0.450, 1.000)

  .info
    /*width: 56px*/
    /*height: 56px*/
    border-radius: 50%
    display: block
    stroke-width: 2
    stroke: #fff
    stroke-miterlimit: 10
    margin: 10% auto
    box-shadow: inset 0px 0px 0px blue
    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both

  .info__circle
    stroke-dasharray: 166
    stroke-dashoffset: 166
    stroke-width: 2
    stroke-miterlimit: 10
    stroke: blue
    fill: none
    animation: stroke .6s cubic-bezier forwards

  .info__exclaim
    transform-origin: 50% 50%
    stroke-dasharray: 48
    stroke-dashoffset: 48
    fill: white
    animation: opac 0.6s cubic-bezier forwards, stroke .3s cubic-bezier .8s forwards

  @keyframes opac
    from
      opacity: 0
    to
      opacity: 1

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
      box-shadow: inset 0px 0px 0px 30px blue
</style>
