<template>
    <div class="coin-recommend">
      <!--操作栏-->
      <div class="control-wrapper flex">
        <el-form class="search" @submit.native.prevent>
          <el-input
            :disabled="currentFunc==='remove'"
            ref="search_input"
            v-model="keyWords"
            clearable
            placeholder="输入 Token名称 或 别名全称 或 智能合约地址"
            @keyup.13.native="search"
          >
          </el-input>
          <el-button :disabled="!Boolean(keyWords.trim())" @click="search">
            <i class="el-icon-search"></i>
          </el-button>
        </el-form>
        <el-upload
          :headers="{'Authorization':cookies('token')}"
          class="upload"
          accept=".csv"
          :action="action"
          name="csvtokens"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-progress="uploadProgress"
          :on-success="uploadSuccess"
          :on-error="uploadFail"
          :disabled="currentFunc==='remove'"
        >
          <el-button class="gradual" :disabled="currentFunc==='remove'">
            <p><i :class="csvBtnIcon"></i>导入CSV文件</p>
            <div></div>
          </el-button>
        </el-upload>
        <el-select
          @change="modeChanged"
          v-model="currentFunc"
          :disabled="btnLoading"
          placeholder="选择功能"
        >
          <el-option
            v-for="(item,index) in funcOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <el-transfer
        :data="listData"
        v-model="selected"
        :props="{
          key:'address',
          label:'name',
          disabled:'isRecommend'
        }"
        :titles="['代币列表','已选择']"
        :button-texts="transferButtonTexts"
        :format="{
          noChecked:'${total}',
          hasChecked:'${checked}/${total}'
        }"
      >
        <span class="list-content" slot-scope="{option}">
          <img :src="option.logo" alt="">
          <div>
            <p>{{`${option.name}(${option.symbol})`}}</p>
            <p>{{option.address}}</p>
          </div>
        </span>
        <el-button
          v-if="currentFunc==='add'"
          type="primary"
          slot="right-footer"
          :disabled="selected.length === 0"
          :loading="btnLoading"
          @click="send"
        >
          设为推荐
        </el-button>
        <el-button
          v-else
          type="primary"
          slot="right-footer"
          :disabled="selected.length === 0"
          :loading="btnLoading"
          @click="send"
        >
          取消推荐
        </el-button>
      </el-transfer>
      <el-dialog
        width="400px"
        top="30vh"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :visible.sync="loadingDialog"
        custom-class="loading-dialog"
      >
        <img src="@img/loading.gif" alt="loading">
      </el-dialog>
    </div>
</template>

<script>
  import {mapMutations} from 'vuex'
  import {post,get,put} from '@/axios'
  import {cookies,Encrypt} from '@js/tools'
  import api from '@/axios/api'
  import config from '@js/config'
  export default {
    name: "coinsrecommend",
    data(){
      return {
        //顶条
        currentFunc:'add',
        funcOptions:[
          {
            value:'add',
            label:'添加推荐'
          },
          {
            value:'remove',
            label:'取消推荐'
          }
        ],
        keyWords:'',
        csvBtnIcon:'el-icon-upload',
        action:config.host+api.CSV_UPLOAD,
        cookies,
        //顶条
        listData:[],
        loadingDialog:false,
        btnLoading:false,
        selected:[],
      }
    },
    computed:{
      transferButtonTexts(){
        if(this.currentFunc === 'add'){
          return ['移出队列','添加推荐']
        }
        return ['移出队列','取消推荐']
      }
    },
    methods:{
      ...mapMutations(['changeTokenInvalid']),
      //列表
      getTokens(page=1,pageSize=1000,belongTo='ethereum'){
        this.listData = this.selected = [];
        this.loadingDialog = true;
        get(api.TOKENS,{pageSize,page,q:this.keyWords,belongTo})
          .then(({data})=>{
            this.loadingDialog = false;
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }
            this.listData = data.data;
          }).catch(err=>{
          this.loadingDialog = false;
          this.$message.error(err.message || '出错啦～')
        })
      },
      search(){
        this.getTokens()
      },
      //上传CSV
      beforeUpload(){
        this.keyWords = '';
        this.listData = [];
        this.total = 0
      },
      uploadProgress(){
        this.csvBtnIcon = 'el-icon-loading';
      },
      uploadSuccess(response){
        this.csvBtnIcon = 'el-icon-upload';
        if(response.code === 7001 || response.code === 7002){
          this.changeTokenInvalid(true);
          return
        }
        this.listData = response;
        this.selected = [];
        this.$message.success('导入成功')
      },
      uploadFail(){
        this.csvBtnIcon = 'el-icon-upload';
        this.$message.error('导入失败')
      },
      //推荐
      modeChanged(){
        this.selected = this.listData = [];
        if(this.currentFunc === 'remove'){
          this.keyWords = '';
          this.loadingDialog = true;
          get(api.TOKEN_RECOMMENDED).then(({data})=>{
            this.loadingDialog = false;
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }
            data.forEach(item=>{
              item.isRecommend = !item.isRecommend
            });
            this.listData = data;
          }).catch(err=> {
            this.loadingDialog = false;
            this.$message.error(err.message || '未知错误！')
          })
        }
      },
      updateTokens(items,option){
        let searchQuery = '?';
        let addressArr = [];
        items.forEach(item=>{
          addressArr.push('address='+item.address)
        });
        searchQuery += addressArr.join('&');
        return put(api.TOKEN_UPDATE+searchQuery,option)
      },
      send(){
        //准备数据
        let items = [];
        let option = {};
        this.selected.forEach(item=>{
          let one = this.listData.find(i=>i.address === item);
          one?items.push(one):null
        });
        //发起推荐或取消推荐请求
        this.btnLoading = true;
        this.currentFunc === 'add'?option={isRecommend:true}:option={isRecommend:false};
        this.updateTokens(items,option)
          .then(({data})=>{
            this.btnLoading = false;
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }
            if(data.code === 0){
              this.$message.success('操作成功！');
              if(this.currentFunc === 'remove'){
                //全部清空，重新获取最新推荐代币列表
                this.selected = this.listData = [];
                this.loadingDialog = true;
                get(api.TOKEN_RECOMMENDED).then(({data})=>{
                  this.loadingDialog = false;
                  if(data.code === 7001 || data.code === 7002){
                    this.changeTokenInvalid(true);
                    return
                  }
                  data.forEach(item=>{
                    item.isRecommend = !item.isRecommend
                  });
                  this.listData = data;
                }).catch(err=>{
                  this.loadingDialog = false;
                  this.$message.error(err.message || '未知错误！')
                })
              }else {
                //清空待推荐列表，将listData.isRecommend=>true
                this.selected = [];
                items.forEach(item=>{
                  item.isRecommend = true
                });
              }
            }else if(data.code === 9003){
              this.$message.error('操作失败，推荐总数不能超过20个！')
            }else {
              this.$message.error('操作失败！')
            }
          })
          .catch(err=>{
            this.btnLoading = false;
            this.$message.error(err.message || '操作失败，未知错误！')
          })
      }
    },
    mounted(){
      this.$refs.search_input.focus()
    }
  }
</script>

<style lang="stylus">
  .coin-recommend
    .el-transfer
      display flex
      justify-content space-between
      align-items center
    .el-transfer-panel
      width 44%
      height 500px
      .el-transfer-panel__body
        height 460px
        overflow scroll
      .el-checkbox-group
        height auto
      .el-transfer-panel__footer button
        border none
        width 100%
        border-radius 0
        height 40px
      img
        height 30px
        width 30px
        margin-right 20px
      .el-transfer-panel__list label
        display flex
        align-items center
        height 60px
        .list-content
          display flex
          line-height 24px
          align-items center

        &:nth-child(even)
          background #f5f7fa
        span
          position static

    .el-transfer__buttons
      padding 0 20px
      box-sizing border-box
      width 12%
      height 100px
      display flex
      flex-direction column
      justify-content space-around
      >*
        margin 0
    .search
      width 600px
      box-shadow 0 0 5px #e7e7e7
      border-radius 5px
      display flex
      justify-content space-between
      >*
        border none
      input
        width 100%
        border none !important
        &:focus
          border none

      button
        width 60px
        background #f4f4f4
        color #c1c1c1
        font-weight bold
        &:hover
          background #f4f4f4
          color #8c939d
    .upload
      button
        color #fff
        border none
        background linear-gradient(-45deg, #5092f7, #43f9e9)
        height 40px
        margin-left 50px
        margin-right 10px
        position relative
        overflow hidden
        width 150px
        & span>*
          width 100%
          height 100%
          position absolute
          left 0
          top 0
        p
          z-index 2
          line-height 40px
          i
            margin-right 10px
        div
          z-index 1
          opacity 0
          transition opacity ease-in-out .2s
          background: linear-gradient(-45deg, #35d3f7, #f9eb3a);
        &:hover div
          opacity 1
    .el-select
      width 120px
      input
        background-image  linear-gradient(#c1c1c1, #49a7f3)
        border none
        color #fff
        text-align center

</style>
