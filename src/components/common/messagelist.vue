<template>
  <div class="message-list" >
    <!--筛选器-->
    <el-radio-group v-model="previewRange" @change="getMessage(range,true)">
      <el-radio-button label='all'>全&nbsp&nbsp&nbsp&nbsp部</el-radio-button>
      <el-radio-button label='unreplied'>未处理</el-radio-button>
      <el-radio-button label='replied'>已处理</el-radio-button>
    </el-radio-group>
    <div class="message-list-content main-table-list">
      <!--列表-->
      <el-table
        v-show="!loading"
        class="message-list-table"
        :data="messageData"
      >
        <el-table-column
          fixed
          label="状态"
          width="130">
          <template slot-scope="scope">
            <i :class="[scope.row.replied?'el-icon-success':'el-icon-warning']"></i>
            <span :class="[scope.row.replied?'replied':'unreply']">
          {{scope.row.replied | isReply}}
        </span>
          </template>
        </el-table-column>

        <el-table-column
          max-width="500"
          min-width="400"
          label="反馈内容">
          <template slot-scope="scope">
            <div class="ellipsis">{{scope.row.content}}</div>
          </template>
        </el-table-column>
        <el-table-column
          min-width="150"
          label="提交时间">
          <template slot-scope="scope">
        <span class="ellipsis">
          {{scope.row.createdAt | fromNow}}
        </span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="150"
          label="回复时间">
          <template slot-scope="scope">
        <span class="ellipsis">
          {{scope.row.replyAt | fromNow}}
        </span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="80">
          <template slot-scope="scope">
            <el-button
              class="reply"
              v-if="!scope.row.replied"
              @click="replyMessage(scope.row)"
              type="button" size="small"
            >
              回复
            </el-button>
            <el-button
              class="preview"
              v-else
              type="button" size="small"
              @click="previewMessage(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--列表loading-->
      <div v-show="loading" class="loading-wrap">
        <img src="../../assets/images/loading.gif" alt="">
      </div>
    </div>
    <!--分页-->
    <div class="block pagesInfo">
      <el-pagination
        background
        @current-change="changePages"
        :current-page.sync="currentPage"
        :page-size="8"
        layout="prev, pager, next, jumper, total"
        :total="totalItems">
      </el-pagination>
    </div>

    <!--外层对话框-回复弹窗-->
    <el-dialog title="回复用户"  :visible.sync="outerVisible">
      <div class="message-info">
        <el-row>
          <el-col :span="24">
            <div class="grid-content bg-purple">
              <el-tag type="info">钱包ID：{{replyData.walletId }}</el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content bg-purple">
              <el-tag type="info">提交时间：{{replyData.createdAt | localTime}}</el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content bg-purple-light">
              <el-tag type="info">邮箱地址：{{replyData.contact}}</el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="grid-content bg-purple-dark">
              <p class="mask-title">反馈内容：</p>
              <el-tag type="info" class="previewMessage">
                {{replyData.content}}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </div>

      <div ref="reply_text_area" class="reply-text-area">
        <p class="mask-title">回复内容：</p>
        <el-input
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 16}"
          placeholder="请输入内容"
          v-model="replyContent">
        </el-input>
      </div>

      <!--内层对话框-取消编辑-->
      <el-dialog
        width="30%"
        title="是否确定退出编辑？您所编辑的内容将丢失！"
        :visible.sync="innerVisibleExit"
        append-to-body>
        <div slot="footer" class="dialog-footer">
          <el-button @click="exitReply">退出编辑</el-button>
          <el-button @click="innerVisibleExit = false">继续编辑</el-button>
        </div>
      </el-dialog>

      <!--内层对话框-提交-->
      <el-dialog
        width="30%"
        title="是否确定提交回复？该操作不可撤回！"
        :visible.sync="innerVisibleSure"
        append-to-body
      >
        <div slot="footer" class="dialog-footer">
          <el-button @click="sendReply">确定提交</el-button>
          <el-button @click="innerVisibleSure = false">继续编辑</el-button>
        </div>
      </el-dialog>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancleReply">取 消</el-button>
        <el-button :disabled="disabled" @click="innerVisibleSure = true">提 交</el-button>
      </div>
    </el-dialog>

    <!--外层对话框-提交loading-->
    <el-dialog
      width="30%"
      :visible.sync="outerLoadingDialog"
    >
      <div class="dialog-loading">
        <img src="../../assets/images/loading.gif" alt="loading...">
      </div>
    </el-dialog>

    <!--外层对话框-查看弹窗-->
    <el-dialog title="预览信息" :visible.sync="previewdialog">
      <div class="message-info">
        <el-row>
          <el-col :span="24">
            <div class="grid-content bg-purple">
              <el-tag type="info">钱包ID：{{previewMessageData.walletId }}</el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content bg-purple">
              <el-tag type="info">提交时间：{{previewMessageData.createdAt | localTime}}</el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content bg-purple-light">
              <el-tag type="info">邮箱地址：{{previewMessageData.contact}}</el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="grid-content bg-purple-dark">
              <p class="mask-title">反馈内容：</p>
              <el-tag type="info" class="previewMessage">
                {{previewMessageData.content}}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="grid-content bg-purple-dark">
              <p class="mask-title">回复内容：</p>
              <el-tag type="info" class="previewMessage">
                {{previewMessageData.replyContent}}
              </el-tag>
            </div>
            <el-tag type="info">回复时间：{{previewMessageData.replyAt | localTime}}</el-tag>

          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewdialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {cookies} from '@/assets/js/tools'
  import api from '@/axios/api'
  import {mapMutations} from 'vuex'
  import moment from 'moment'
  import {post,get,put} from '@/axios'
  export default {
    name:'messagelist',
    data(){
      return {
        loading:false,
        previewRange:'all',//反馈信息查看范围
        messageData:[],//反馈信息数据
        innerVisibleExit:false,//退出编辑对话框
        innerVisibleSure:false,//确定提交对话框
        outerVisible:false,//外层回复对话框
        previewdialog:false,//外层查看对话框
        replyData:{},//选中的反馈信息数据
        replyContent:'',//管理员正在编辑的回复内容
        previewMessageData:{},//查看的反馈信息的数据
        totalItems:0,//默认信息条数
        currentPage:1,//当前分页
        outerLoadingDialog:false,//提交回复请求loading对话框
      }
    },
    computed:{
      disabled(){//判断提交按钮是否可用
        if(this.replyContent.trim()) return false;
        return true
      },
      range(){
        if(this.previewRange === 'replied'){//已回复
          return {replied:true}
        }else if(this.previewRange === 'unreplied'){//未回复
          return {replied:false}
        }else {//全部
          return {}
        }
      }
    },
    methods:{
      ...mapMutations(['createDialog']),
      //请求反馈信息数据
      getMessage(obj={},b){
        return //暂时不请求，需要重做改功能
        this.loading = true;
        get(api.MESSAGE_LIST, Object.assign({pageSize:8,page:1},obj))
          .then(({data})=>{
            if(data.code){
              //请求失败
              switch (data.code) {
                case 7001 || 7002://token失效，清除token和保存的用户名，重定向至登陆页
                  cookies('token','');
                  cookies('username','');
                  window.location.reload()
                  break;
                default://弹出未知错误对话框
                  this.totalItems = 0;
                  this.createDialog({message:data.message || '未知错误',err:true});
                  break;
              }
            }else {
              //请求成功

              //如果是切换显示范围，将页码显示调整至第一页
              if(b) this.currentPage = 1;
              this.messageData = data.data;
              this.totalItems = data.total
            }
            this.loading = false//请求完成，隐藏loading图
          })
      },
      //回复反馈信息
      replyMessage(data){
        this.replyData = data;
        this.outerVisible = true;
        this.$nextTick(()=>{
          let el = this.$refs.reply_text_area.getElementsByTagName('textarea')[0];
          el.focus()
        })
      },
      //确定退出编辑
      exitReply(){
        this.replyData = {};
        this.replyContent = '';
        this.innerVisibleExit = false;
        this.outerVisible = false;
      },
      //退出编辑
      cancleReply(){
        if(this.disabled){
          this.replyData = {};
          this.outerVisible = false;
        }else {
          this.innerVisibleExit = true;
        }
      },
      //确认提交回复
      sendReply(){
        //loading对话框
        this.outerLoadingDialog = true;
        put(api.REPLY_MESSAGE+this.replyData._id,{replyContent:this.replyContent})
          .then(({data})=>{
            if(data.code === 0){
              //提交成功，清空本次提交的内容，关闭loading对话框，关闭确认提交对话框，关闭回复对话框，请求更新后的数据
              this.replyContent = '';
              this.replyData = {};
              this.outerLoadingDialog = this.innerVisibleSure = this.outerVisible = false;

              if(this.previewRange === 'all'){//如果筛选选项为全部，回复成功后留在当前页
                this.getMessage(Object.assign({page:this.currentPage},this.range));
              }else {//如果筛选选项不为全部，回复成功后切换到第一页
                this.currentPage = 1;
                this.getMessage(this.range);
              }

            }
          })
          .catch(err=>{
            //提交失败，弹出公用对话框，关闭组件对话框
            this.createDialog({message:'提交失败',err:true});
            this.outerLoadingDialog = this.innerVisibleSure = false;
          })
      },
      //查看已回复的反馈信息
      previewMessage(data){
        this.previewdialog = true;
        this.previewMessageData = data;
      },
      //页码切换
      changePages(val){
        this.getMessage(Object.assign({page:val},this.range))
      }
    },
    created(){
      //暂时不获取数据，可能需要重做该功能
      //this.getMessage()
    },
    filters:{
      fromNow(iso){
        if(!iso){
          return ''
        }
        let diff = moment().diff(moment(iso))
        if(diff < 60000*60){
          return Math.ceil(diff / 60000) + '分钟前'
        }else if(diff > 60000*60 && diff <60000*60*24){
          let str = parseInt( diff /(60000*60));
          return str+'小时前'
        }else {
          return moment(iso).format('YYYY-MM-DD HH:mm')
        }
      },
      localTime(iso){
        return moment(iso).format('YYYY-MM-DD HH:mm')
      },
      isReply(b){
        if(b) return '已处理';
        return '未处理';
      }
    }
  }
</script>
<style lang="stylus">
  @import '../../assets/css/stdio.stylus'
  .message-list
    .dialog-loading
      text-align center
    span.unreply
      color #ff9898
    span.replied
      color #54d885
    .el-radio-group
      margin-bottom 30px
    .message-info
      line-height 30px
      word-break break-all
      text-align justify
    span.el-tag
      white-space normal
      line-height 30px
      margin-bottom  15px
      height auto
      padding 10px 20px
    .mask-title
      margin-bottom 15px
    i.el-icon-warning
      color #ff9898
    i.el-icon-success
      color #54d885
    .message-list-table
      button.reply,button.preview
        background #4a4949
        color #fff
        border 1px solid #4a4949
        font-weight normal
        transition all ease-in-out .2s
        &:hover
          background #098df5
          border 1px solid #098df5
      button.reply
        background #ffb900
        border 1px solid #ffb900
    .message-info .previewMessage
      width 100%
      min-height 175px
    thead
      color #333232
    .el-pagination__total
      vertical-align baseline
    input.el-input__inner
      height-line 40px
</style>

