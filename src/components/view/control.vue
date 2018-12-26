<template>
  <div id="control-wrap">
    <el-container>
      <!--左侧侧导航-->
      <el-aside id="side-bar" width="300px">
        <div class="inner-wrapper">
          <h1>
            <p>Coinu Management</p>
            <p>System</p>
          </h1>
          <div class="line"></div>
          <div class="side-nav">
            <ul>
              <li v-for="(item,index) in menulist" :key="index">
                <p @click="fold({index})">{{item.LevelOne}}
                  <i
                    :class="[item.icon,{fold:!item.open}]"
                  ></i>
                </p>
                <ul
                  :style="{height:item.children.length*40+'px'}"
                  class="inner overflow-hidden"
                  :class="{hide:!item.open}"
                >
                  <router-link
                    tag="li"
                    :to="{name:i.pathName}"
                    :class="{active:i.active}"
                    class="inner"
                    v-for="(i,k) in item.children"
                    :key="k"
                  >
                    <i :class="i.icon"></i>
                    <span>{{i.LevelTwo}}</span>
                  </router-link>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        <!--背景图-->
        <img
          v-for="(item,index) in bgData"
          :class="{cur:currentIndex === index}"
          ref="item"
          :key="index"
          :src="bgData[index].src"
        >
      </el-aside>

      <!--右侧操作面板-->
      <el-container id="main-content">
        <el-header height="70px">
          <div class="bread-nav">
            <h1>CoinU后台管理系统</h1>
            <span v-for="(item,index) in breadPathList" :key="index">
              <i class="el-icon-arrow-right"></i>
              {{item}}
            </span>
            <div class="user-info float-right">
              <span>您好! <strong>{{userId}}</strong></span>
              <i></i>
              <span class="drop-out" @click="dropOut">安全退出</span>
            </div>
          </div>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

    <!--公用对话框-->
    <el-dialog
      title="提示"
      :visible="tipContent.show"
      :before-close="handleClose"
      width="30%"
    >
      <span>{{tipContent.message}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="$store.commit('deleteDialog')"
          v-show="tipContent.sure">{{tipContent.sure}}</el-button>
        <el-button
          @click="$store.commit('deleteDialog')"
          v-show="tipContent.exit">{{tipContent.exit}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import { mapState,mapMutations,mapGetters } from 'vuex'
  import RGBaster from '@js/rgbaster.js'
  import {throttle,cookies} from '@/assets/js/tools.js'
  import bg1 from '@img/sidebg/bg1.jpg'
  import bg2 from '@img/sidebg/bg2.jpg'
  import bg3 from '@img/sidebg/bg3.jpg'
  import bg4 from '@img/sidebg/bg4.jpg'
  import bg5 from '@img/sidebg/bg5.jpg'
  import bg6 from '@img/sidebg/bg6.jpg'
  import bg7 from '@img/sidebg/bg7.jpg'
  import bg8 from '@img/sidebg/bg8.jpg'
  import bg9 from '@img/sidebg/bg9.jpg'
  export default {
    data(){
      return {
        timer:null,
        bgData:[
          {
            src:bg1
          },
          {
            src:bg2
          },
          {
            src:bg3
          },
          {
            src:bg4
          },
          {
            src:bg5
          },
          {
            src:bg6
          },
          {
            src:bg7
          },
          {
            src:bg8
          },
          {
            src:bg9
          }
        ],
        currentIndex:0,
      }
    },
    beforeRouteUpdate(to,from,next){
      this.createOne();
      this.getColors();
      next()
    },
    methods:{
      ...mapMutations(['foldMenu','active','createDialog','deleteDialog','changeRgbaColors','changeTokenInvalid']),
      fold(obj){
        this.foldMenu(obj)
      },
      setMinHeight(){
        let el = document.getElementById('main-content');
        el.style.height =  window.innerHeight + 'px';
        document.getElementById('side-bar').style.height = window.innerHeight + 'px';
      },
      handleClose(){
        this.deleteDialog()
      },
      dropOut(){
        cookies('token','');
        cookies('username','');
        window.location.reload();
      },
      //返回一个不等于currentIndex的随机数
      createOne(){
        let filterArr = [];
        this.bgData.forEach((item,i)=>{
          if(i!=this.currentIndex){
            filterArr.push(i)
          }
        });
        this.currentIndex = filterArr[Math.floor(Math.random()*filterArr.length,10)];
      },
      prepare(el=this.$refs.item[this.currentIndex],bool=false){
        let x = -(el.offsetWidth-300)/2 + 'px';
        let y = -(el.offsetHeight-el.parentNode.offsetHeight)/2 + 'px';
        if(!bool){
          el.style.left = x;
          el.style.top = y;
        }else {
          let t = new TimelineMax();
          t.to(el,0.25,{
            left:x,
            top:y,
            ease:Sine.easeIn
          })
        }
      },
      mouseEv(ev){
        let el = this.$refs.item[this.currentIndex];
        if(!el) return;
        let [x,y] = [ev.clientX,ev.clientY];
        el.style.left = (x/300)*(-((el.offsetWidth-300)/2))+'px';
        el.style.top = (y/window.innerHeight)*(-((el.offsetHeight-window.innerHeight)/2))+'px';
      },
      getColors(img=this.$refs.item[this.currentIndex]){
        let This = this;
        RGBaster.colors(img,{
          success(payload){
            This.changeRgbaColors({
              dominant:payload.dominant,
              secondary:payload.secondary
            })
          },
          paletteSize:2,
          exclude:['rgb(255,255,255)','rgb(0,0,0)']
        })
      }
    },
    computed:{
      ...mapState({
        tokenInvalid:state=>state.tip.tokenInvalid,
        menulist:state=>state.menu.menulist,
        userId:state=>state.user.userId,
        tipContent:state=>state.tip.tipContent,
        dominant:state=>state.menu.rgbaColors.dominant,
        secondary: state=>state.menu.rgbaColors.secondary,
      }),
      ...mapGetters(['breadPathList']),
    },
    created(){
      this.currentIndex = Math.floor(Math.random()*this.bgData.length,10);
    },
    mounted(){
      this.setMinHeight();
      document.getElementById('side-bar').onmousemove= (ev)=>{
        this.mouseEv(ev)
      };
      document.getElementById('side-bar').onmouseleave=()=>{
        this.prepare(undefined,true);
      };
      this.$refs.item[this.currentIndex].onload=()=>{
        this.prepare();
      };
      window.onresize = ()=>{
        this.prepare();
        this.setMinHeight()
      };
      this.getColors()
    },
    destroyed(){
      window.onresize = null;
    },
    watch:{
      //监控tokenInvalid的值判断是否弹出确认重新登录对话框
      tokenInvalid:function (newVal,oldVal) {
        if(newVal){
          this.$confirm('是否跳转至登录页？该操作将丢失您已编辑的文本信息！','登录信息过期',{
            confirmButtonText:'跳转登录',
            cancelButtonText:'留在本页',
            type:'warning'
          }).then(()=>{
            this.changeTokenInvalid();
            cookies('token','');
            cookies('username','');
            window.location.reload()
          }).catch(()=>{
            this.changeTokenInvalid();
            this.$message.warning('您已取消重新登录，将失去全部操作权限！')
          })
        }
      }
    }
  }
</script>

<style lang="stylus">
  @import '../../assets/css/stdio.stylus'
  #control-wrap
    button
      border none
      transition background ease-out .35s
  #side-bar
    box-shadow 0 0 10px 1px #000
    overflow hidden
    height 100vh
  #side-bar .inner-wrapper
    left 0
    height 100vh
    overflow-x hidden
    overflow-y scroll
    width 300px
    padding-right 25px
    position relative
    z-index 20
    .line
      width 220px
      height 1px
      margin 0px auto 40px
      background rgba(255, 255, 255, 0.49)
    h1
      padding 100px 40px 40px
      color #fff
      line-height 50px
      p:first-child
        font-size 22px
      p:last-child
        font-size 42px
  #side-bar img
    filter brightness(38%)
    min-width 110%
    min-height 110%
    top 0%
    left 0%
    position absolute
    opacity 0
    transition opacity ease-in .35s
    &.cur
      z-index 3
      opacity 1
  .el-select-dropdown
    text-align center
  #main-content
    overflow scroll
    background #fff
    padding 20px 50px
    .el-main
      padding 0
      margin 30px 0
    &>.el-container
      background #333232
    .drop-out
      cursor pointer
      &:hover
        color #098df5
    .pagesInfo
      float right
      padding-right 60px
      padding-top 60px
    .loading-wrap
      text-align center
    .control-wrapper.flex
      display flex
      justify-content flex-end
      position relative
    .control-wrapper
      margin 30px 0
      button.gradual
        color #fff
        border none
        background linear-gradient(-45deg, #cbaaff, #23a3ff)
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
          transition background ease-out .35s
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
  #control-wrap .side-nav li.inner
    user-select none
    height-line 40px
    cursor pointer
    color #fff
    padding-left 55px
    transition background ease-out .5s
    &:hover
      transition background ease-in .25s
      background rgba(255,255,255,.1)
    & span
      font-size 14px
      -webkit-font-smoothing antialiased
      font-weight normal
    & i
      width 25px
      display inline-block
      box-sizing border-box
    &.active
      color #098df5
  #control-wrap .side-nav
    padding-bottom 50px
    ul.inner.hide
      height 0px !important
    ul.inner
      transition all ease-in-out .25s
    p
      -webkit-font-smoothing antialiased
      height-line 40px
      color #fff
      font-size 14px
      padding 0 40px
      user-select none
      cursor pointer
      i
        float right
        line-height 40px
        transition all ease-in-out .25s
        transform rotateZ(0deg)
        &.fold
          transform rotateZ(-180deg)
          transform-origin center
  #control-wrap .el-aside
    position relative
    background #333232
  #control-wrap .el-header
    height-line 70px
    color #666
    border-bottom 1px solid #ececec
    padding 0
    i
      color #ccc
    .user-info i
      border-right 1px solid #c3c3c3
      margin 0 12px
    .user-info strong
      color #098df5
      margin 0 10px
    h1
      display inline
      font-size 18px
  #control-wrap .logo
    margin 30px auto
    text-align center
    size 150px
    line-height 150px
    border-radius 50%
    font-size 0px
    img
      vertical-align middle

</style>
