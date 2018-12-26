<template>
   <div class="coinu-version">

     <div class="control-wrapper flex">
       <el-button class="gradual" @click="toAddVersion">
         <p><i class="el-icon-plus"></i>添加新版本</p>
         <div></div>
       </el-button>
     </div>

     <!--列表-->
     <div class="list-wrapper">
       <el-table
         :stripe="true"
         :data="listData"
         style="width: 100%"
       >
         <el-table-column label="版本号" width="150" prop="number">
         </el-table-column>

         <el-table-column label="平台" width="150" prop="platform">
         </el-table-column>

         <el-table-column label="系统" width="150" prop="system" >
         </el-table-column>

         <el-table-column label="发布时间" min-width="300">
           <template slot-scope="scope">
             <span>{{new Date(scope.row.newstime).toLocaleDateString()}}</span>
           </template>
         </el-table-column>

         <el-table-column label="当前状态" prop="status" width="150">
           <template slot-scope="scope">
             <span :class="[scope.row.status==='1'?'status-on':'status-off']">{{scope.row.status==='1'?'使用中':'已停用'}}</span>
           </template>
         </el-table-column>

         <el-table-column label="相关操作" width="250">
           <template slot-scope="scope">
             <div class="edit">
               <el-button
                 type="primary"
                 size="small"
                 @click="checkVersion(scope.row)"
               >
                 查看
               </el-button>
               <el-button
                 type="primary"
                 size="small"
               >
                 <span @click="taggleStatus(scope.row)">{{scope.row.status==='1'?'停用':'启用'}}</span>
               </el-button>
               <el-button
                 type="primary"
                 size="small"
               >
                 <span @click="remove(scope.row)">删除</span>
               </el-button>
             </div>
           </template>
         </el-table-column>
       </el-table>
       <div v-show="loading" class="loading-wrap">
         <img src="@img/loading.gif" alt="loading">
       </div>

       <!--页码-->
       <el-pagination
         class="pagesInfo"
         background
         @current-change="getVersions"
         :current-page.sync="currentPage"
         :page-size="8"
         layout="prev, pager, next, total"
         :total="total"
       >
       </el-pagination>

       <!--查看版本信息弹窗-->
       <el-dialog
         title="详细信息"
         width="650px"
         top="15vh"
         :visible.sync="infoDialog"
         custom-class="info-dialog"
         @closed="checkVersionDate = {}"
       >
         <p>平台：{{checkVersionDate.platform}}</p>
         <p>系统：{{checkVersionDate.system}}</p>
         <p>版本：{{checkVersionDate.number}}</p>
         <p>当前状态：
           <span :class="[checkVersionDate.status==='1'?'status-on':'status-off']">
            {{checkVersionDate.status==='1'?'使用中':'已停用'}}
           </span>
         </p>
         <p v-if="checkVersionDate.url">URL:{{checkVersionDate.url}}</p>
         <div v-if="!checkVersionDate.url">
          <p>更新描述信息：</p>
           <textarea
             v-for="(val,key,index) in checkVersionDate.description"
             v-model="checkVersionDate.description[key]"
             :key="index"
             disabled
             cols="30"
             rows="7"
           ></textarea>
         </div>
       </el-dialog>

       <!--添加版本信息弹窗-->
       <el-dialog
         title="添加版本"
         width="650px"
         top="15vh"
         :visible.sync="addVersionDialog"
         custom-class="addVersion-dialog"
         :before-close="confirmExit"
         @closed="exited"
       >
         <div class="row">
           <span class="label">平台：</span>
           <el-select v-model="addVersionDate.platform">
             <el-option value="app" label="app"></el-option>
             <el-option value="web" label="web"></el-option>
           </el-select>
         </div>
         <div class="row">
           <span class="label">系统：</span>
           <el-select v-model="addVersionDate.system">
             <el-option value="android" label="android"></el-option>
             <el-option value="ios" label="ios"></el-option>
           </el-select>
         </div>
         <div class="row">
           <span class="label">版本号：</span>
           <el-input v-model="addVersionDate.number"></el-input>
         </div>
         <div class="row">
           <span class="label">状态：</span>
           <el-switch
             v-model="addVersionDate.status"
             active-text="启用"
             inactive-text="停用"
             active-value="1"
             inactive-value="2"
           >
           </el-switch>
         </div>
         <div class="row" v-if="addVersionDate.platform==='web'">
           <span class="label">URL:</span>
           <el-input v-model="addVersionDate.url"></el-input>
         </div>
         <div class="row" v-else>
           <span class="label">更新描述:</span>
           <el-input
             type="textarea"
             v-for="(val,key,index) in addVersionDate.description"
             v-model="addVersionDate.description[key]"
             :placeholder="key"
             :key="index"
             cols="30"
             rows="7"
           ></el-input>
         </div>
         <span slot="footer" class="dialog-footer">
           <el-button @click="confirmExit">取 消</el-button>
           <el-button type="primary" :disabled="!checkAddVersionDate" @click="addVersion">确 定</el-button>
         </span>
       </el-dialog>
     </div>
   </div>
</template>

<script>
  import {deepClone} from '@js/tools'
  import {mapMutations} from 'vuex'
  import {get,post,Delete,put} from '@/axios'
  import api from '@/axios/api'
  export default {
    name: "versioncontrol",
    data(){
      return {
        listData:[],
        total:0,
        loading:false,
        currentPage:1,
        infoDialog:false,
        addVersionDialog:false,
        checkVersionDate:{},//当前查看的版本数据
        addVersionDate:{
          platform:'app',
          system:'android',
          number:'',
          url:'',
          status:'2',
          description:{
            zhCN:'',
            enUS:''
          }
        },//添加的版本数据
      }
    },
    computed:{
      checkAddVersionDate(){
        if(!this.addVersionDate.number.trim()){
          return false
        }
        if(this.addVersionDate.platform === 'app'){
          if(!this.addVersionDate.description.zhCN || !this.addVersionDate.description.enUS){
            return false
          }
        }else {
          if(!this.addVersionDate.url.trim()){
            return false
          }
        }
        return true
      }
    },
    methods:{
      ...mapMutations(['changeTokenInvalid']),
      remove(data){
        this.$confirm(`是否删除 ${data.platform}-${data.system}-${data.number} 版本信息`)
          .then(()=>{
            Delete(api.VERSION_LIST+`/${data._id}`)
              .then(({data})=>{
                if(data.code === 7001 || data.code === 7002){
                  this.changeTokenInvalid(true);
                  return
                }else if(data.code===0){
                  this.$message({type:'success',message:'操作成功'});
                  this.addVersionDialog = false;
                  this.getVersions()
                }
              })
              .catch(err=>{
                this.loading = false;
                this.$message.error(err.message || '出错啦～')
              })
          })
          .catch(err=>{
            this.$message.info('您已取消操作')
          })


      },
      exited(){
        this.addVersionDate = {
          platform:'app',
          system:'android',
          number:'',
          url:'',
          status:'2',
          description:{
            zhCN:'',
            enUS:''
          }
        }
      },
      addVersion(){
        let data = deepClone(this.addVersionDate);
        data.description = JSON.stringify(data.description);
        if(!data.url){
          delete data.url
        }
        post(api.VERSION_LIST,data)
          .then(({data})=>{
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }else if(data.code===0){
              this.$message({type:'success',message:'操作成功'});
              this.addVersionDialog = false;
              this.getVersions()
            }
          })
          .catch(err=>{
            this.loading = false;
            this.$message.error(err.message || '出错啦～')
          })
      },
      confirmExit(done){
        this.$confirm('关闭该对话框您将丢失已输入的文本内容！')
          .then(()=>{
            this.addVersionDialog = false;
            done()
          })
          .catch(()=>{})
      },
      toAddVersion(){
        this.addVersionDialog = true;
      },
      taggleStatus(data){
        let buttonText = {confirmText:'',cancelText:'取消'}
        data.status === '1'? buttonText.confirmText='停用':buttonText.confirmText='启用';
        this.$confirm(`是否${buttonText.confirmText}${data.number}版本`,{
          cancelButtonText:buttonText.cancelText,
          confirmButtonText:buttonText.confirmText,
          type:'warning'
        }).then(()=>{
          put(api.VERSION_LIST+`/${data._id}`,{
            number:data.number,
            platform:data.platform,
            status:data.status === '1'?'2':'1'
          }).then(({data})=>{
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }else if(data.code===0){
              this.$message({type:'success',message:'操作成功'});
              this.getVersions()
            }
          })
            .catch(err=>{
              this.loading = false;
              this.$message.error(err.message || '出错啦～')
            })
        })
          .catch(err=>{
            this.loading = false;
            this.$message.info('您已取消操作')
          })
      },
      checkVersion(data){
        this.checkVersionDate = data;
        this.infoDialog = true;
      },
      getVersions(){
        this.loading = true;
        get(api.VERSION_LIST,{pageSize:8,page:this.currentPage}).then(({data})=>{
          this.loading = false;
          if(data.code === 7001 || data.code === 7002){
            this.changeTokenInvalid(true);
            return
          }
          this.listData = data.data;
          this.total = data.total;
        }).catch(err=>{
          this.loading = false;
          this.$message.error(err.message || '出错啦～')
        })
      }
    },
    created(){
      this.getVersions()
    }
  }
</script>

<style lang="stylus">
  .coinu-version
    .addVersion-dialog
      .el-textarea
        margin 10px 0
      div.row
        margin-bottom 15px
        span.label
          display inline-block
          width 80px
      div.el-input
        width 485px
    .info-dialog
      p
        line-height 30px
      textarea
        display block
        width 100%
        border-radius 5px
        border 1px solid #ccc
        margin 10px 0
        padding 10px
        color #c0c4cc
    span.status-on
      color #54d885
    span.status-off
      color #ff9898


</style>
