<template>
  <div class="coins-control">
    <el-radio-group v-model="tabPosition" @change="tabComponent">
      <el-radio-button label="public">公链维护</el-radio-button>
      <el-radio-button label="instance">代币维护</el-radio-button>
      <el-radio-button label="recommend">推荐设置</el-radio-button>
    </el-radio-group>
    <keep-alive include="coinsinstance,coinsrecommend">
      <component :is="currentComponent"></component>
    </keep-alive>
  </div>
</template>

<script>
  import CoinsPublic from '@tpl/common/coinspublic'
  import CoinsInstans from '@tpl/common/coinsinstance'
  import CoinsRecommend from '@tpl/common/coinsrecommend'

  export default {
    name: "coinscontrol",
    data(){
      return{
        tabPosition:'instance',
        currentComponent:CoinsInstans,
        coinsArray:[],
      }
    },
    methods:{
      tabComponent(){
        if(this.tabPosition === 'public'){
          this.currentComponent = CoinsPublic
        }else if(this.tabPosition === 'instance') {
          this.currentComponent = CoinsInstans
        }else if(this.tabPosition === 'recommend'){
          this.currentComponent = CoinsRecommend
        }
      }
    },
    mounted(){

    }

  }
</script>

<style lang="stylus">

</style>
