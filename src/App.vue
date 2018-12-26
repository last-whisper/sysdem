<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isRouterAlive: true
    }
  },
  name: 'App',
}
</script>

<style lang="stylus">
  //主题样式覆盖
  .el-radio-button:focus:not(.is-focus):not(:active)
    box-shadow none !important
  .el-button--primary
    border none
  .theme-button,.el-button--primary,.el-pager li:not(.disabled).active,.el-radio-button__orig-radio:checked+.el-radio-button__inner
    background-repeat no-repeat !important
    background-image  linear-gradient(#b6c4ff, #49a7f3) !important
    background-color #49a7f3 !important
    transition background ease-out 0.35s
    &:hover
      background-position 0 -10px !important
  #app .el-radio-button__orig-radio:checked+.el-radio-button__inner
    border-color #dcdfe6
    box-shadow -1px 0 0 0 #dcdfe6
  #app .theme-button.is-disabled,.el-button--primary.is-disabled
    background-repeat no-repeat !important
    background-image  linear-gradient(#c1c1c1, #eaeaea)  !important
    background-color #eaeaea !important
    transition background ease-out 0.35s
    &:hover
      background-position 0 -10px
</style>
