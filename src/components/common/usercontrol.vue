<template>
  <div>
    <h1>用户管理</h1>
    <!--<el-button @click="x=true" type="primary">show</el-button>-->
    <!--<vue-ckeditor-->
      <!--v-model="content"-->
      <!--:config="config"-->
    <!--&gt;-->
    <!--</vue-ckeditor>-->
    <!--<el-dialog :visible="x">-->
      <!--<div>{{value}}</div>-->
      <!--<span slot="footer"><el-button @click="x=false">exit</el-button></span>-->
    <!--</el-dialog>-->
  </div>

</template>

<script>
  import VueCkeditor from 'vue-ckeditor2'
  export default {
    name: "usercontrol",
    data(){
      return {
        value:'',
        x:false,
        content:'',
        config: {
          height:600,
          uiColor:'#cca94c',
          //filebrowserBrowseUrl: '/browser/browse.php',
          filebrowserUploadUrl: '/uploader/upload.php'
        }
      }
    },
    mounted(){
    },
    components:{VueCkeditor}
  }
</script>

<style lang="stylus">

</style>
