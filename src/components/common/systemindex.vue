<template>
  <div>
    <h1>系统首页</h1>
    <img class="building" src="@img/building.gif" alt="">
  </div>

</template>

<script>
  import {TweenMax} from 'gsap';
  export default {
    name: "systemindex",
    data(){
      return {
      }
    },

  }
</script>

<style lang="stylus">
  .building
    width 60%
    display block
    margin 200px auto 0
    opacity .5

</style>
