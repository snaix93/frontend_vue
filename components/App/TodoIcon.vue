<template>
  <img
    class="animate-opacity mt-1"
    :width="width"
    :height="height"
    alt="todo"
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAzFBMVEUAAAAA/wAA/wBVqlX/VVU/vz//Pz//MzP/VSr+ODj/TDP+RS7pPz9LrVFKr0/1RDX2QzXxQTTzRDXzQzT0QzVLrlBLr09MrlBMr09KrVFMr09LrlBMr0/zQzXzQzZMr0/0Qjb0Qjb0QzX0QjX0Qjb0QzX0QzbzQzX0QjfzQjXzQzXzQzbzQjbzQzX0QzZMr0/0Qjb0QzX0QjX0Qjb0Qzb0QzVNr0/0QzVMr1BMsE9Mr09LrlD0Qzb0QjbzQjbzQjZMrlBMr1CQyvn0QzY9GPBBAAAAQXRSTlMAAQIDAwQEBQYJCgsMLzA0OTpDREhih5KTlpacnZ6fo6Spq6ytra2vsLGxtri5uru8vr/BwcLDw9PZ3Ovv8PX4/ieYmuAAAADiSURBVHja7ZLHDsIwEAWd0BLTe2+h996r8f//E2sk+4TwIiSkCObgvcyc/MifFxjF9Ht+iV0xRSTrkT5jRYR/YFWP9EsGkdyeQYAMY1AoXx8YBVH4pK8JVLGXviZQhfRxGBPw1+CjMbdsZ6JMVeRNV28pnPtsSxpcsCVN8OUtuZpozRInUIkj/SPvW+A7/BRDBXXOofA7cDqowB6C2mvBM6O4n7ZH/MGcYqdhj4W/oOgtedsi6FrYwFvnD5pQ6FD+ZgZPA1eUQV0G6RRODRUkznwVJASKS4qgSA5D4tAB+L/LHbqAbylu5U1MAAAAAElFTkSuQmCC"
  >
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

  .animate-opacity
    animation: opac 0.6s cubic-bezier forwards, scale .3s ease-in-out .9s both

  @keyframes opac
    from
      opacity: 0
    to
      opacity: 1

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
      box-shadow: inset 0px 0px 0px 30px blue
</style>
