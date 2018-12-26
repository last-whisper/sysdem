<template>
  <div class="coin-instance">

    <!--操作栏-->
    <div class="control-wrapper flex">
      <el-form class="search" @submit.native.prevent>
        <el-input ref="search_input" v-model="keyWords" clearable
          placeholder="输入 Token名称 或 别名全称 或 智能合约地址"
          @keyup.13.native="search"
        >
        </el-input>
        <el-button  :disabled="!Boolean(keyWords.trim())" @click="search">
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
        >
        <el-button class="gradual">
          <p><i :class="csvBtnIcon"></i>导入CSV文件</p>
          <div></div>
        </el-button>
      </el-upload>
      <el-button
        type="primary"
        icon="el-icon-tickets"
        :disabled="checkItems.length === 0"
        @click="allDoOfficial(checkItems)"
      >
        批量认证
      </el-button>
    </div>

    <!--列表-->
    <div class="list-wrapper">
      <el-table
        :stripe="true"
        ref="list-wrapper"
        :data="listData"
        style="width: 100%"
        @selection-change="selectChange"
      >
        <el-table-column label="LOGO" width="80">
          <template slot-scope="scope">
            <img class="token-logo" :src="scope.row.logo">
          </template>
        </el-table-column>

        <el-table-column label="币名" width="250">
          <template slot-scope="scope">
            {{`${scope.row.name} (${scope.row.symbol})`}}
          </template>
        </el-table-column>

        <el-table-column label="合约地址" prop="address" min-width="380">
        </el-table-column>

        <el-table-column label="认证" width="90">
          <template slot-scope="scope">
            <el-switch
              active-color="#49a7f3"
              v-model="scope.row.isOfficial"
              @change="doOfficial($event,scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <!--暂时不开启这个功能-->
        <el-table-column label="转账" width="90">
          <template slot-scope="scope">
            <el-switch
              :disabled="true"
              active-color="#49a7f3"
              v-model="scope.row.canTrade"
              @change="trade($event,scope.row)"
            ></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="相关操作" width="90">
          <template slot-scope="scope">
            <div class="edit">
              <el-button
                @click="editItem(scope.row)"
                type="primary"
                size="small"
              >编辑</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="selection"  width="60" fixed="right">
        </el-table-column>
      </el-table>
      <div v-show="loading" class="loading-wrap">
        <img src="@img/loading.gif" alt="loading">
      </div>

      <!--页码-->
      <el-pagination
        class="pagesInfo"
        background
        @current-change="getTokens"
        :current-page.sync="currentPage"
        :page-size="8"
        layout="prev, pager, next, total"
        :total="total"
      >
      </el-pagination>
    </div>

    <!--'编辑'对话框-->
    <el-dialog
      title="币种编辑"
      :visible.sync="editDialog"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      @close="exitExitDialog"
      width="700px"
      custom-class="edit-dialog"
    >
      <div class="content">
        <div class="logo-upload">
          <el-upload
            :action="oss.host"
            :data="oss"
            :before-upload="logoBeforeUpload"
            :on-progress="logoUploadProgress"
            :on-success="logoSuccess"
            :on-error="logoUploadFail"
            :show-file-list="false"
            ref="upload"
            class="avatar-uploader"
            accept="image/png"
          >
            <div v-show="dialogLoading" class="mask"><i class="el-icon-loading"></i></div>
            <img width="120" height="120" align="center" :src="dialogPrevImg">
          </el-upload>
        </div>
        <div class="info">
          <p>全称：{{currentEdit.name}}</p>
          <p>简称：{{currentEdit.symbol}}</p>
          <p>精度：{{currentEdit.decimals}}</p>
          <p>合约地址：{{currentEdit.address}}</p>
        </div>
      </div>
      <span slot="footer">
        <p class="tip"><i class="el-icon-warning"></i>请上传大小不超过<strong>200kb</strong>且为<strong>PNG</strong>格式的图片</p>
        <el-button type="primary" @click="editDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!Boolean(updateLogo)" @click="send">提交</el-button>
      </span>
    </el-dialog>
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
  import {mapState,mapMutations} from 'vuex'
  import {post,get,put} from '@/axios'
  import {cookies,Encrypt} from '@js/tools'
  import api from '@/axios/api'
  import config from '@js/config'
  export default {
    name: "coinsinstance",
    data(){
      return {
        //列表相关
        listData:[],
        currentPage:1,
        total:0,
        keyWords:'',
        loading:false,
        checkItems:[],
        //导入相关
        csvBtnIcon:'el-icon-upload',
        action:config.host+api.CSV_UPLOAD,
        cookies,
        //编辑相关
        currentEdit:{},
        editDialog:false,
        oss: {
          key: '',
          dirPath:'',
          OSSAccessKeyId: '',
          policy: '',
          Signature: '',
          host: '',
          success_action_status: 200,
          callback: ''
        },
        dialogPrevImg:'',
        dialogLoading:false,
        loadingDialog:false,
        updateLogo:'',
      }
    },
    computed:{
      ...mapState({
        dominant:state=>state.menu.rgbaColors.dominant,
        secondary: state=>state.menu.rgbaColors.secondary,
      })
    },
    methods:{
      ...mapMutations(['changeTokenInvalid']),
      //oss上传logo
      editItem(item){
        this.currentEdit = item;
        this.editDialog = true;
        this.dialogPrevImg = item.logo || '' ;
      },
      logoBeforeUpload(file){
        if(file.size/1024/1024>0.2){
          this.$message.warning('上传的图片不能大于200kb');
          return false
        }
        this.dialogLoading = true;//正在获取签名
        return new Promise((resolve, reject) => {
          post(api.OSS_SIGN).then(({data})=>{
            this.dialogLoading = false;
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              reject();
              return
            }
            let {dirPath, key, host, policy, signature, callback, accessid} = data;
            this.oss.dirPath = dirPath;
            this.oss.OSSAccessKeyId = accessid;
            this.oss.policy = policy;
            this.oss.Signature = signature;
            this.oss.host = host;
            this.oss.callback = callback;
            this.oss.key = this.oss.dirPath + this.currentEdit.address + '.png';
            resolve();
          }).catch(err=>{
            reject(err);
            this.dialogLoading = false;
            this.$message.error(err.message || '获取签名失败')
          })
        })
      },
      logoUploadProgress(){
        this.loadingDialog = true;
      },
      logoSuccess(res,file) {
        this.loadingDialog = false;
        if(res.statusCode === 200){
          this.dialogPrevImg = URL.createObjectURL(file.raw);
          this.updateLogo = this.oss.host + '/' +res.result.filename;
          this.$message.success('图片上传成功，请提交');
        }else {
          this.$message.error('图片上传失败');
          this.updateLogo = '';
          this.dialogPrevImg = this.currentEdit.logo || '';
        }
      },
      logoUploadFail(err){
        this.$message.error(err.message || '图片上传失败')
        this.loadingDialog = false;
        this.updateLogo = '';
        this.dialogPrevImg = this.currentEdit.logo || '';
      },
      send(){
        this.loadingDialog = true;
        put(api.TOKEN_UPDATE+'?address='+this.currentEdit.address,{logo:this.updateLogo}).then(({data})=>{
          this.loadingDialog = false;
          if(data.code === 7001 || data.code === 7002){
            this.changeTokenInvalid(true);
            return
          }
          if(data.code == 0){
            this.currentEdit.logo = this.updateLogo;
            this.updateLogo = '';
            this.editDialog = false;
            this.$message.success('操作成功！');
          }else {
            this.$message.error('操作失败！');
          }
        })
          .catch(err=>{
            this.loadingDialog = false;
            this.$message.error(err.message || '操作失败！');
          })
      },
      exitExitDialog(){
        this.updateLogo = '';
      },

      //列表认证
      getTokens(page=this.currentPage,pageSize=8,belongTo='ethereum'){
        this.listData = [];
        this.loading = true;
        get(api.TOKENS,{pageSize,page,q:this.keyWords,belongTo})
          .then(({data})=>{
            this.loading = false;
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }
            data.data.forEach(item=>{
              if(item.canTrade===undefined){
                item.canTrade = true
              }
            });
            this.listData = data.data;
            this.total = data.total;
        }).catch(err=>{
          this.loading = false;
          this.$message.error(err.message || '出错啦～')
        })
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
      search(){
        this.currentPage = 1;
        this.getTokens()
      },
      doOfficial(ev,item){
        //阻止立即切换状态
        item.isOfficial = !ev;
        //弹出弹窗询问是否要进行认证切换，返回promise
        let title;
        ev?title='开启认证':title='关闭认证';
        this.$msgbox({
          title:`请确认是否${title}！`,
          message:`<div style="display: flex"><img width="80" height="80" src="${item.logo}">
          <div style="margin-left:15px;display:flex;justify-content:center;flex-direction:column;">
          <p>币名：${item.name} (${item.symbol})</p>
          <p>合约地址：${item.address}</p></div></div>`,
          dangerouslyUseHTMLString:true,
          lockScroll:false,
          showCancelButton:true,
          confirmButtonText:title,
          cancelButtonText:'取消',
        }).then((action)=>{
          if(action === 'confirm'){
            this.loadingDialog = true;
            this.updateTokens([item],{isOfficial:ev})
              .then(({data})=>{
                this.loadingDialog = false;
                //token过期
                if(data.code === 7001 || data.code === 7002){
                  this.changeTokenInvalid(true);
                  return
                }
                //认证成功
                if(data.code === 0){
                  item.isOfficial = ev;
                  this.$message({
                    type: 'success',
                    message: '操作成功！'
                  });
                }else {
                  this.$message({
                    type: 'error',
                    message: data.message || '操作失败'
                  });
                }
              })
              //认证失败
              .catch(err=>{
                this.loadingDialog = false;
                this.$message({
                  type: 'error',
                  message: err.message || '未知错误'
                });
              });
          }
        })
          .catch((action)=>{
            this.$message({
              type: 'info',
              message: '您已取消操作'
            });
          })
          .finally(()=>{
            document.activeElement.blur();
          })
      },
      allDoOfficial(items){
        //弹出弹窗询问是否要进行批量认证
        let title = '开启批量认证';
        this.$msgbox({
          title:`请确认是否${title}！`,
          message:`<div style="display: flex">本次操作将提交共 <strong> ${items.length} </strong> 个币种的认证</div>`,
          dangerouslyUseHTMLString:true,
          lockScroll:false,
          showCancelButton:true,
          confirmButtonText:title,
          cancelButtonText:'取消',
        }).then((action)=>{
          if(action === 'confirm'){
            this.loadingDialog = true;
            this.updateTokens(items,{isOfficial:true})
              .then(({data})=>{
                this.loadingDialog = false;
                //token过期
                if(data.code === 7001 || data.code === 7002){
                  this.changeTokenInvalid(true);
                  return
                }
                //认证成功
                if(data.code === 0){
                  items.forEach(item=>{
                    item.isOfficial = true
                  });
                  this.$message({
                    type: 'success',
                    message: '操作成功！'
                  });
                }else {
                  this.$message({
                    type: 'warning',
                    message: data.message || '操作失败'
                  });
                }
              })
              //认证失败
              .catch(err=>{
                this.loadingDialog = false;
                this.$message({
                  type: 'error',
                  message: err.message || '未知错误'
                });
              });
          }
        }).catch((action)=>{
          this.$message({
            type: 'info',
            message: '您已取消操作'
          });
        }).finally(()=>{
          document.activeElement.blur();
        })
      },
      selectChange(val){
        this.checkItems = val
      },
      //转账
      trade(ev,item){
        //阻止立即切换状态
        item.canTrade = !ev;
        //弹出弹窗询问是否要进行停止转账切换，返回promise
        let title;
        ev?title='开启转账':title='停止转账';
        this.$msgbox({
          title:`请确认是否${title}！`,
          message:`<div style="display: flex"><img width="80" height="80" src="${item.logo}">
          <div style="margin-left:15px;display:flex;justify-content:center;flex-direction:column;">
          <p>币名：${item.name} (${item.symbol})</p>
          <p>合约地址：${item.address}</p></div></div>`,
          dangerouslyUseHTMLString:true,
          lockScroll:false,
          showCancelButton:true,
          confirmButtonText:title,
          cancelButtonText:'取消'
        }).then(()=>{
          this.loadingDialog = true;
          this.updateTokens([item],{canTrade:ev})
            .then(({data})=>{
              this.loadingDialog = false;
              //token过期
              if(data.code === 7001 || data.code === 7002){
                this.changeTokenInvalid(true);
                return
              }
              //操作成功
              if(data.code === 0){
                item.canTrade = ev;
                this.$message({
                  type: 'success',
                  message: '操作成功！'
                });
              }else {
                this.$message({
                  type: 'warning',
                  message: data.message || '操作失败'
                });
              }
            })
            //操作失败
            .catch(err=>{
              this.loadingDialog = false;
              this.$message({
                type: 'error',
                message: err.message || '未知错误'
              });
            });
        }).catch(()=>{
          this.$message({
            type: 'info',
            message: '您已取消操作'
          });
        }).finally(()=>{
          document.activeElement.blur();
        })
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
        //token过期
        if(response.code === 7001 || response.code === 7002){
          this.changeTokenInvalid(true);
          return
        }
        this.listData = response;
        this.$message.success('导入成功')
      },
      uploadFail(){
        this.csvBtnIcon = 'el-icon-upload';
        this.$message.error('导入失败')
      }
    },
    mounted(){
      this.$refs.search_input.focus()
    }
  }
</script>

<style lang="stylus">
  .coin-instance
    .list-wrapper
      img.token-logo
        width 40px
        border-radius 5px
        vertical-align middle
    .search
      width 600px
      box-shadow 0 0 5px #e7e7e7
      border-radius 5px
      display flex
      justify-content space-between
      >*
        border none
      input
        width 500px
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


    .edit-dialog
      .content
        display flex
        .info
          display flex
          flex-direction column
          justify-content space-around
          margin-left 40px
        .logo-upload
          padding 10px
          border-radius 10px
          border 2px dashed #dedede
        .avatar-uploader
          position relative
          .mask
            position absolute
            width 120px
            height 120px
            left 0
            right 0
            margin auto
            background rgba(0,0,0,.4)
            line-height 120px
            font-size 50px
            color #fff
            text-align center
      .el-dialog__footer span
        display flex
        justify-content space-between
      p.tip
        flex-grow 1
        margin-right 10px
        line-height 40px
        color #8c939d
        font-size 14px
        text-align center
        background #d9e4f4
        border-radius 4px
        border 1px solid #cbd5e4
        i
          color orange
          margin-right 15px
        strong
          color orange
          padding 0 5px

</style>
