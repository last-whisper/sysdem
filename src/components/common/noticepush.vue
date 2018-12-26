<template>
  <div class="notice-push">
    <!--操作栏-->
    <div class="control-wrapper flex">
      <span class="label">消息类型</span>
      <el-select v-model="selectData.msgType.value">
        <el-option
          v-for="(item,index) in selectData.msgType.options"
          :key="index"
          :value="item.value"
          :label="item.label"
        >
        </el-option>
      </el-select>
      <span class="label">发送状态</span>
      <el-select
        v-model="selectData.status.value"
        @change="selectData.status.value===''?getNoticeList():getNoticeList({status: Number(selectData.status.value)})"
      >
        <el-option
          v-for="(item,index) in selectData.status.options"
          :key="index"
          :value="item.value"
          :label="item.label"
        >
        </el-option>
      </el-select>
      <el-button class="gradual"
        @click="openDialog(true)"
      >
        <p><i class="el-icon-edit-outline"></i>添加推送消息</p>
        <div></div>
      </el-button>
      <el-button
        type="primary"
        :icon="displayMode==='table'?'el-icon-document':'el-icon-more'"
        @click="displayMode==='table'?displayMode='doc':displayMode='table'"
      >
        {{displayMode==='table'?'详情模式':'精简模式'}}
      </el-button>
    </div>

    <div class="list-wrapper">
      <!--精简模式列表-->
        <el-table
          class="table-animation"
          v-show="displayMode==='table'"
          :data="listData"
          :stripe="true"
        >
          <el-table-column prop="msgId" label="消息ID" width="160px">
          </el-table-column>
          <el-table-column label="消息类型" width="120px">
            <template slot-scope="scope">
              <span v-if="scope.row.msgType==='1'">系统消息</span>
            </template>
          </el-table-column>
          <el-table-column prop="contents.zh_CN.title" label="标题">
          </el-table-column>
          <el-table-column label="预发送时间" width="200px">
            <template slot-scope="scope">
              <span v-if="scope.row.sendTime">
                {{new Date(scope.row.sendTime).toLocaleString()}}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100px">
            <template slot-scope="scope">
              <span v-if="scope.row.status===0">编辑中</span>
              <span v-else-if="scope.row.status===1">待推送</span>
              <span v-else-if="scope.row.status===2">已推送</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="250px">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.status!==2"
                @click="openDialog(scope.row,true)"
                type="primary"
                size="small">
                修改
              </el-button>
              <el-button
                type="primary"
                size="small"
                v-if="scope.row.status===1"
                @click="pushNow(scope.row)"
              >
                立即推送
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="deleteNotice(scope.row)"
              >
                删除
              </el-button>
              <el-button
                v-if="scope.row.status===2"
                type="primary"
                size="small"
                @click="openDialog(scope.row)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      <!--详情模式列表-->
        <div class="notice-detail-list" v-show="displayMode==='doc'">
          <div
            class="notice-detail-list-item"
            v-for="(item,index) in listData"
            :key="index"
          >
            <div class="top clear">
              <p class="float-left">
                <strong v-if="item.msgType==='1'">【系统公告】</strong>
                {{item.contents[noticeItemLang[index]].title}}
              </p>
              <div class="float-right">
                <span
                  :class="{'theme-button':noticeItemLang[index]===k}"
                  v-for="(i,k,n) in item.contents"
                  :key="n"
                  @click="$set(noticeItemLang,index,k)"
                  v-if="i.title"
                >
                {{i.lang}}
              </span>
              </div>
            </div>
            <div class="doc">
              <div class="text float-left">
                <p>{{item.contents[noticeItemLang[index]].content}}</p>
              </div>
              <div class="button float-right">
                <el-button
                  round
                  v-if="item.status!==2"
                  @click="openDialog(item,true)"
                  type="primary"
                >
                  修改
                </el-button>
                <el-button
                  round
                  type="primary"
                  v-if="item.status===1"
                  @click="pushNow(item)"
                >
                  立即推送
                </el-button>
                <el-button
                  round
                  type="primary"
                  @click="deleteNotice(item)"
                >
                  删除
                </el-button>
                <el-button
                  round
                  v-if="item.status===2"
                  type="primary"
                  @click="openDialog(item)"
                >
                  查看
                </el-button>
              </div>
            </div>
            <div class="bottom">
              <span>预定发送时间：{{new Date(item.sendTime).toLocaleString()}}</span>
              <span v-if="item.status===0">编辑中</span>
              <span v-else-if="item.status===1">待推送</span>
              <span v-else>已推送</span>
            </div>
          </div>
        </div>
      <!--页码-->
      <el-pagination
        class="pagesInfo"
        background
        @current-change="getNoticeList"
        :current-page.sync="currentPage"
        :page-size="8"
        layout="prev, pager, next, total"
        :total="total"
      >
      </el-pagination>
    </div>
    <!--表单dialog-->
    <el-dialog
      width="1000px"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="isView"
      :visible.sync="msgDialog"
      custom-class="msg-dialog"
      :title="msgDialogTitle"
      @closed="closeDialog"
    >
      <!--倒计时-->
      <div class="count-down" v-if="timer">
        <span>请于<strong>{{remainingTime | lastTime}}</strong>内完成编辑（若时间紧迫，您可以点击取消推送以完成编辑）</span>
        <el-button
          icon="el-icon-warning"
          type="danger"
          @click="cancelPush"
        >取消推送</el-button>
      </div>
      <!--语言切换卡-->
      <div class="tabLang">
        <div
          v-for="(item,key,index) in editingMSG.contents"
          :class="{'cur':curLang===key}"
          :key="index"
          @click="curLang=key"
        >
          {{item.lang}}
          <i :class="judgeResult[key]"></i>
        </div>
      </div>
      <!--表单内容-->
      <div class="form-list-item">
        <div class="label">标题</div>
        <el-input
          :disabled="isView"
          v-model="editingMSG.contents[curLang].title"
          placeholder="必填"
        ></el-input>
      </div>
      <div class="form-list-item">
        <div class="label">副标题</div>
        <el-input
          :disabled="isView"
          v-model="editingMSG.contents[curLang].subTitle"
          placeholder="选填"
        ></el-input>
      </div>
      <div class="form-list-item">
        <div class="label">内容</div>
        <el-input
          type="textarea"
          :autosize="{minRows:3,maxRows:10}"
          :disabled="isView"
          maxlength="500"
          placeholder="必填"
          v-model="editingMSG.contents[curLang].content"
        >
        </el-input>
      </div>
      <p class="textarea-tip" v-if="!isView">
        还能输入{{500-editingMSG.contents[curLang].content.length}}个字
      </p>
      <div class="form-list-item">
        <div class="label">内容链接</div>
        <el-input
          :disabled="isView"
          v-model="editingMSG.contents[curLang].url"
          placeholder="选填"
        ></el-input>
      </div>
      <div class="form-list-item">
        <div class="label">消息类型</div>
        <el-select :value="editingMSG.msgType" :disabled="isView">
          <el-option
            v-for="(item,index) in selectData.msgTypeDialog.options"
            :key="index"
            :value="item.value"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </div>
      <div class="form-list-item">
        <div class="label">目标用户</div>
        <el-select :value="selectData.targetUser.value" :disabled="isView">
          <el-option
            v-for="(item,index) in selectData.targetUser.options"
            :key="index"
            :value="item.value"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </div>
      <div class="form-list-item choose-time">
        <div class="label">推送时间</div>
        <el-select
          :disabled="isView"
          v-model="selectData.sendTime.value"
          @change="setDefaultTime"
        >
          <el-option
            v-for="(item,index) in selectData.sendTime.options"
            :key="index"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-date-picker
          v-show="selectData.sendTime.value==='2'"
          v-model="editingMSG.sendTime"
          :picker-options="pickerOptions"
          :disabled="isView"
          :default-value="Date.now()"
          type="datetime"
          value-format="timestamp"
          placeholder="选择日期时间">
        </el-date-picker>

      </div>
      <span slot="footer" class="msg-dialog-footer">
        <el-button
          type="primary"
          v-if="!isView"
          :disabled="!judgeForm"
          @click="send"
        >
          提交
        </el-button>
        <el-button
          @click="isView?msgDialog = false:exitComfirmDialog = true"
          type="primary"
        >
          {{isView?'关闭':'取消'}}
        </el-button>
      </span>
    </el-dialog>

    <!--确认退出编辑dialog-->
    <el-dialog
      width="600px"
      title="请确认是否退出编辑？确认退出将清除您所编辑的信息！"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :visible.sync="exitComfirmDialog"
      custom-class="exit-comfirm-dialog"
    >
      <span slot="footer" class="exit-comfirm-dialog-footer">
        <el-button type="primary" @click="msgDialog = false">
          退出
        </el-button>
        <el-button type="primary" @click="exitComfirmDialog = false">
          取消
        </el-button>
      </span>
    </el-dialog>

    <!--loading-dialog-->
    <el-dialog
      width="400px"
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
  import {deepClone} from "@js/tools"
  import moment from 'moment'
  import api from '@/axios/api'
  import {post,get,put,Delete} from '@/axios'
  export default {
    name: "noticepush",
    data(){
      return {
        listData:[],
        currentPage:1,
        total:0,
        selectData:{
          targetUser:{
            options:[
              {
                value:'0',
                label:'全部用户'
              }
            ],
            value:'0'
          },
          msgTypeDialog:{
            options:[
              {
                value:'1',
                label:'系统公告'
              }
            ],
            value:'1'
          },
          msgType:{
            options:[
              {
                value:'1',
                label:'系统公告'
              }
            ],
            value:'1'
          },
          status:{
            options:[
              {
                value:'',
                label:'全部'
              },
              {
                value:'0',
                label:'编辑中'
              },
              {
                value:'1',
                label:'待推送'
              },
              {
                value:'2',
                label:'已推送'
              }
            ],
            value:''
          },
          sendTime:{
            options:[
              {
                value:'0',
                label:'仅保存'
              },
              {
                value:'1',
                label:'立即发送'
              },
              {
                value:'2',
                label:'定时发送'
              }
            ],
            value:'0'
          }
        },
        displayMode:'table',
        loadingDialog:false,
        msgDialog:false,
        exitComfirmDialog:false,
        isView:false,//是否以查看模式打开表单对话框（禁止修改内容）
        msgDialogTitle:'',
        curLang:'zh_CN',
        editingMSG:{
          msgType:'1',
          sendTime:0,
          contents:{
            zh_CN:{
              lang:'简体中文',
              title:'',
              subTitle:'',
              content:'',
              url:''
            }
          },
          msgId:'',
          states:0
        },
        judgeResult:{},//表单各语种信息填写是否完整
        noticeItemLang:[],//详情模式下每条消息当前显示的语种
        timer:null,
        remainingTime:null,//消息推送剩余毫秒数
        pickerOptions:{
          disabledDate(time){
            return time.getTime() < Date.now() - 8.64e7
          }
        },
        isChanged:false,//编辑对话框退出后是否重新请求数据
      }
    },
    computed:{
      //判断表单是否能进行提交
      judgeForm(){
        //推送时间为仅保存进行简单判定，只有有任意语种的任意字段有值则判定通过
        let result = false;
        let data = this.editingMSG.contents;
        if(this.selectData.sendTime.value === '0'){
          let arr = [];
          for(let attr in data){
            if(typeof data[attr]==='object'){
              for(let key in data[attr]){
                if(key==='lang'){
                  continue
                }else {
                  arr.push(data[attr][key])
                }
              }
            }
          }
          arr.find(item=>item.trim()!='')?result = true:null
        }else {
          //推送时间不为仅保存进行严格判定，中文和英文必须填写，其他语种以后再考虑
          if(data.zh_CN.title.trim() && data.zh_CN.content.trim() && data.en_US.title.trim() && data.en_US.content.trim()){
            result = true
          }else {
            result = false
          }
        }
        return result
      }
    },
    methods:{
      ...mapMutations(['changeTokenInvalid']),
      //提交
      send(){
        this.loadingDialog = true;
        this.selectData.sendTime.value === '1'?this.editingMSG.sendTime = new Date().valueOf():null;
        let contents = [];
        for(let attr in this.editingMSG.contents){
          if(typeof this.editingMSG.contents[attr] === 'object'){
            let obj = {};
            obj.lang = attr.replace(/_/,'-');
            obj.title = this.editingMSG.contents[attr].title;
            obj.content = this.editingMSG.contents[attr].content;
            obj.subTitle = this.editingMSG.contents[attr].subTitle;
            obj.url = this.editingMSG.contents[attr].url;
            contents.push(obj)
          }
        }
        let params = {
          msgType:this.editingMSG.msgType,
          contents:JSON.stringify(contents),
          sendTime:Date.parse(new Date(this.editingMSG.sendTime))/1000
        };
        //提交修改
        if(this.editingMSG.msgId){
          put(api.NOTICE_UPDATE+this.editingMSG.msgId,params).then(({data})=>{
            this.loadingDialog = false;
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }
            if(data.code===0){
              this.$message.success('操作成功！');
              this.msgDialog = false;
              this.getNoticeList();
            }else {
              this.$message.error('操作失败！')
            }
          })
            .catch(err=>{
              this.loadingDialog = false;
              this.$message.error(err.message || '未知错误')
            })
        }else {//提交新增
          post(api.NOTICE_LIST,params).then(({data})=>{
            this.loadingDialog = false;
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }
            if(data.code===0){
              this.$message.success('操作成功！');
              this.msgDialog = false;
              this.getNoticeList();
            }else {
              this.$message.error('操作失败！')
            }
          })
            .catch(err=>{
              this.loadingDialog = false;
              this.$message.error(err.message || '未知错误')
            })
        }
      },
      //打开消息编辑弹窗
      openDialog(mode,bool){
        this.msgDialog = true;
        mode.sendTime?this.selectData.sendTime.value = '2':null;
        //新增(如果以后添加新语种，只需要在contents字段中添加一个语种,同时，为了实现
        // 修改功能中能够添加之前没有添加的语种功能，同样需要添加一个语种)
        if(mode && typeof mode === 'boolean'){
          this.msgDialogTitle = '新增推送消息';
          this.editingMSG = {
            msgType:'1',
            sendTime:0,
            contents:{
              zh_CN:{
                lang:'简体中文',
                title:'',
                subTitle:'',
                content:'',
                url:''
              },
              en_US:{
                lang:'English',
                title:'',
                subTitle:'',
                content:'',
                url:''
              }
            }
          };
        }else if(mode && typeof mode === 'object' && bool){
        //修改
          this.msgDialogTitle = '修改推送消息';
          this.editingMSG = deepClone(mode);
          //here,以后新增语种，this.editingMSG.contents.new_lang={...}

          //如果当前编辑的消息状态为定时推送，则在弹窗中开启编辑倒计时提醒
          this.editingMSG.status === 1 && this.countDown();
        }else if(mode && typeof mode === 'object' && !bool){
        //查看
          this.msgDialogTitle = '查看推送消息';
          this.editingMSG = mode;
          this.isView = true;
        }
      },
      //关闭消息编辑弹窗
      closeDialog(){
        this.isChanged && this.getNoticeList();
        clearInterval(this.timer);
        this.msgDialogTitle = '';
        this.timer = null;
        this.curLang = 'zh_CN';
        this.isChanged = this.isView = this.exitComfirmDialog = false;
        this.selectData.targetUser.value = this.selectData.sendTime.value = '0'
      },
      //判断表单内容填写状态，未填写、填写不完整、完整
      judgeInput(data){
        if(!data.title.trim() && !data.subTitle.trim() && !data.url.trim() && !data.content.trim()){
          return ''//未填写
        }else if(!data.title.trim() || !data.content.trim()){
          return 'el-icon-warning'//填写不完整
        }else {
          return 'el-icon-success'//填写完整
        }
      },
      //消息推送倒计时
      countDown(){
        let time = this.editingMSG.sendTime;
        if(!time) return;
        this.timer=setInterval(()=>{
          this.remainingTime = moment(time).diff(moment().valueOf())
        },1000)
      },
      //取消推送
      cancelPush(){
        this.loadingDialog = true;
        put(api.NOTICE_UPDATE+this.editingMSG.msgId,{sendTime:0})
          .then(({data})=>{
            this.loadingDialog = false;
            if(data.code === 7001 || data.code === 7002){
              this.changeTokenInvalid(true);
              return
            }
            if(data.code === 0){
              this.$message.success('操作成功！');
              this.isChanged = true;
              clearInterval(this.timer);
              this.selectData.sendTime.value = '0';
              this.editingMSG.sendTime = 0;
              this.remainingTime = 0;
              this.timer = null;
            }else {
              this.$message.error('操作失败！')
            }
          })
          .catch(err=>{
            this.loadingDialog = false;
            this.$message.error(err.message || '未知错误！');
          });
      },
      getNoticeList(params){
        this.loadingDialog = true;
        get(api.NOTICE_LIST,Object.assign({
          pageSize:8,
          page:this.currentPage,
          msgType:this.selectData.msgType.value
        },params)).then(({data})=>{
          this.loadingDialog = false;
          if(data.code === 7001 || data.code === 7002){
            this.changeTokenInvalid(true);
            return
          }
          this.noticeItemLang = Array(data.data.length).fill('zh_CN');
          data.data.forEach(item=>{
            item.sendTime = item.sendTime*1000;
          });
          this.listData = data.data;
          this.total = data.total
        })
          .catch(err=>{
            this.loadingDialog = false;
            this.$message.error(err.message || '未知错误！');
          })
      },
      pushNow(item){
        this.$confirm('标题：'+item.contents.zh_CN.title,'请确实是否立即推送该消息',{
          cancelButtonText:'取消',
          confirmButtonText:'确认',
          type:'warning',
        }).then(()=>{
          this.loadingDialog = true;
          put(api.NOTICE_UPDATE+item.msgId,{sendTime:Date.parse(new Date())/1000})
            .then(({data})=>{
              this.loadingDialog = false;
              if(data.code === 7001 || data.code === 7002){
                this.changeTokenInvalid(true);
                return
              }
              if(data.code === 0){
                this.$message.success('操作成功！');
                this.getNoticeList();
              }else {
                this.$message.error('操作失败！')
              }
            })
            .catch(err=>{
              this.$message.error(err.message || '未知错误')
            })
        }).catch(()=>{
          this.$message.info('操作已取消');
        }).finally(()=>{
          document.activeElement.blur();
        })
      },
      deleteNotice(item){
        this.$confirm('标题：'+item.contents.zh_CN.title,'请确实是否删除该推送消息',{
          cancelButtonText:'取消',
          confirmButtonText:'确认',
          type:'warning',
        }).then(()=>{
          this.loadingDialog = true;
          Delete(api.NOTICE_UPDATE+item.msgId)
            .then(({data})=>{
              this.loadingDialog = false;
              if(data.code === 7001 || data.code === 7002){
                this.changeTokenInvalid(true);
                return
              }
              if(data.code === 0){
                this.$message.success('操作成功！');
                this.getNoticeList();
              }else {
                this.$message.error('操作失败！')
              }
            })
            .catch(err=>{
              this.$message.error(err.message || '未知错误')
            })
        }).catch(()=>{
          this.$message.info('操作已取消');
        }).finally(()=>{
          document.activeElement.blur();
        })
      },
      setDefaultTime(val){
        val !== '0'?this.editingMSG.sendTime = new Date().valueOf():this.editingMSG.sendTime = 0;
      }
    },
    filters:{
      //将时间戳转化成剩余时间
      lastTime(time){
        return moment.duration(time).days()+'天'+moment.duration(time).hours()+'小时'+moment.duration(time).minutes()+'分'+moment.duration(time).seconds()+'秒'
      }
    },
    created(){
      this.getNoticeList()
    },
    watch:{
      'editingMSG.contents':{
        handler(newval,oldval){
          for(let attr in newval){
            this.judgeResult[attr] = this.judgeInput(newval[attr])
          }
        },
        immediate:true,
        deep:true
      },
      listData:function(newVal,oldVal){
        if(this.displayMode === 'doc'){
          this.$nextTick(()=>{
            let el = document.querySelectorAll('.notice-detail-list-item');
            document.querySelector('.notice-detail-list').style.height = el.length*260+'px'
            el.forEach((item,index,arr)=>{
              let t = new TimelineMax();
              t.to(item,0.4,{
                top:index*260,
                ease:Quint.easeOut,
                startAt:{
                  top:0,
                  zIndex:arr.length-index
                }
              })
            })
          })
        }
      },
      displayMode:function (newVal,oldVal) {
        if(newVal==='doc'){
          let el = document.querySelectorAll('.notice-detail-list-item');
          document.querySelector('.notice-detail-list').style.height = el.length*260+'px'
          el.forEach((item,index,arr)=>{
            let t = new TimelineMax();
            t.to(item,0.4,{
              top:index*260,
              ease:Quint.easeOut,
              startAt:{
                zIndex:arr.length-index
              }
            })
          })
        }else {
          let el = document.querySelectorAll('.notice-detail-list-item');
          el.forEach((item,index)=>{
            item.style.top = 0;
          })
        }
      }
    }
  }
</script>
<style lang="stylus">
  .notice-push
    .control-wrapper
      margin 0 0 30px !important
      .el-select
        margin 0 20px
      .label
        line-height 40px
        font-size 14px
    .count-down
      background #ffeae8
      line-height 60px
      border-radius 5px
      box-sizing border-box
      padding 0 20px
      border 1px solid #ffd1ce
      display flex
      justify-content space-between
      align-items center
      button
        height 40px
      strong
        padding 0 10px
        color #ff9898
    .tabLang
      display flex
      border-bottom 1px solid #eef0f6
      line-height 40px
      margin 20px 0
      position relative
      i.el-icon-success
        color #54d885
      i.el-icon-warning
        color #ff9898
      &>div
        cursor pointer
        padding 0 10px
        border-top-left-radius 6px
        border-top-right-radius 6px
        background #eef0f6
        border 1px solid #eef0f6
        margin-bottom -1px
        &:not(first-child)
          margin-left -1px
        &.cur
          border-bottom 1px solid #fff
          background #fff
    .form-list-item
      display flex
      margin-bottom 20px
      .label
        width 80px
        line-height 40px
      .el-input,.el-textarea
        width 840px
      &.choose-time
        .el-input
          width 250px
        .el-date-editor
          margin-left 20px
    .notice-detail-list
      position relative
      .top
        color #333
        span
          line-height 35px
          padding 0 20px
          background-color #fff
          display inline-block
          margin-left 20px
          border-radius 20px
          cursor pointer
          font-size 14px
          &.theme-button
            color #fff
        p
          font-weight bold
          line-height 35px
          font-size 20px
          text-indent -10px
      .bottom
        span
          margin-right 20px
          color #acacac
      .doc
        overflow hidden
        .text
          overflow scroll
          width 45%
          color #333
          font-size 14px
          line-height 26px
          height 100px
        .button
          margin-top 35px
    .notice-detail-list-item
      display flex
      flex-direction column
      justify-content space-between
      box-sizing border-box
      padding 15px 30px
      position absolute
      left 0
      right 0
      width 98%
      background linear-gradient(#fbfbfb, #f1f1f1)
      border-radius 8px
      box-shadow 0 3px 8px 1px #e0e0e0
      height 240px
      margin 0 auto
    .textarea-tip
      font-size 12px
      color #ccc
      text-align right
      margin-bottom 20px
      margin-top -15px
</style>
