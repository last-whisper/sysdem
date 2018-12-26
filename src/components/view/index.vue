<template>
  <div id="main" ref="main">
    <div class="main-title clear">
      <img src="@img/coinu.png" alt="coinu">
      <h1 class="ellipsis">CoinU后台管理系统</h1>
      <div class="copyright">© Creditshares（Beijing）Technology Co., Ltd.</div>
    </div>
    <div ref="mainWrap" class="main-wrap">
      <login-bar
        @imgBlur="imgBlur"
        @imgFocus="imgOnBlur = false"
        @imgSupBlur="imgSupOnBlur = true"
      ></login-bar>
    </div>
    <div
      class="bg-wrap"
      ref="bg_wrap"
    >
      <img
        ref="cur"
        :class="[imgOnBlur&&isChrome?'blurLevelOne':'',imgSupOnBlur&&isChrome?'blurLevelTwo':'']"
        >
      <img
        ref="next"
        :class="[imgOnBlur&&isChrome?'blurLevelOne':'',imgSupOnBlur&&isChrome?'blurLevelTwo':'']"
        >
    </div>
  </div>
</template>

<script>
  import LoginBar from '@/components/common/login.vue'
  import {throttle} from '@/assets/js/tools.js'
  import bg1 from '@img/bg/bg1.jpg'
  import bg2 from '@img/bg/bg2.jpg'
  import bg3 from '@img/bg/bg3.jpg'
  import bg4 from '@img/bg/bg4.jpg'
  import bg5 from '@img/bg/bg5.jpg'
  import bg6 from '@img/bg/bg6.jpg'
  import bg7 from '@img/bg/bg7.jpg'
  import bg8 from '@img/bg/bg8.jpg'
  import bg9 from '@img/bg/bg9.jpg'
  export default {
    data(){
      return {
        isChrome:false,
        timer:null,
        imgOnBlur:false,
        imgSupOnBlur:false,
        curImg:0,
        bgData:[
          {
            src:bg1,
            direction:'toBottom'
          },
          {
            src:bg2,
            direction:'circle'
          },
          {
            src:bg3,
            direction:'toTop'
          },
          {
            src:bg4,
            direction:'toBottom'
          },
          {
            src:bg5,
            direction:'toBottom'
          },
          {
            src:bg6,
            direction:'toLeft'
          },
          {
            src:bg7,
            direction:'toTop'
          },
          {
            src:bg8,
            direction:'toLeft'
          },
          {
            src:bg9,
            direction:'toTop'
          }
        ],
        t:null,
        t2:null,
      }
    },
    computed:{
      beginCss(){
        if(this.bgData[this.curImg].direction === 'toLeft'){
          return {minWidth:'115%',minHeight:'100%',left:'0%',top:'0%',transform:'scale(1)'}
        }else if(this.bgData[this.curImg].direction === 'toRight'){
          return {minWidth:'115%',minHeight:'100%',left:'-15%',top:'0%',transform:'scale(1)'}
        }else if(this.bgData[this.curImg].direction === 'toTop'){
          return {minWidth:'100%',minHeight:'115%',top:'0%',left:'0%',transform:'scale(1)'}
        }else if(this.bgData[this.curImg].direction === 'circle'){
          return {
            minWidth:'100%',
            minHeight:'100%',
            left:'0%',
            top:'0%',
            transformOrigin:'center',
            transform:'scale(1.15)',
          }
        }else {
          return {minWidth:'100%',minHeight:'115%',top:'-15%',left:'0%',transform:'scale(1)'}
        }
      },
      targetCss(){
        if(this.bgData[this.curImg].direction === 'toLeft'){
          return {left:'-15%'}
        }else if(this.bgData[this.curImg].direction === 'toRight'){
          return {left:'0%'}
        }else if(this.bgData[this.curImg].direction === 'toTop'){
          return {top:'-15%'}
        }else if(this.bgData[this.curImg].direction === 'circle'){
          return {
            transform:'scale(1)'
          }
        }else {
          return {top:'0%'}
        }
      }
    },
    methods:{
      setVerticalCenter(){
        let el = this.$refs.mainWrap;
        el.style.paddingTop = Math.max((window.innerHeight - el.offsetHeight)/2,0)-20 + 'px'
      },
      imgBlur(){
        this.imgOnBlur = true;
        this.imgSupOnBlur = false;
      },
      //生成一个与当前播放的src不重复的src,下一次使用
      createNextImg(){
        let filterArr = [];
        this.bgData.forEach((item,i)=>{
          if(i!=this.curImg){
            filterArr.push(i)
          }
        });
        return filterArr[Math.floor(Math.random()*filterArr.length,10)];
      },
      autoPlay(){
        let This = this;
        this.t = new TimelineMax();
        this.t.to(This.$refs.cur,8,{
          onStart(){
            This.$refs.cur.src = This.bgData[This.curImg].src;
            This.$refs.cur.style.opacity = 1;
            This.$refs.cur.style.zIndex = 2;
          },
          startAt:This.beginCss,
          ...This.targetCss,
          ease:Linear.easeNone
        });
        this.t.to(This.$refs.cur,1.5,{
          onStart(){
            This.curImg = This.createNextImg();
            This.$refs.next.src = This.bgData[This.curImg].src;
            //下一张
            This.t2 = new TimelineMax();
            This.t2.to(This.$refs.next,8,{
              onStart(){
                This.$refs.next.style.opacity = 1;
              },
              startAt:This.beginCss,
              ...This.targetCss,
              ease:Linear.easeNone
            });
            This.t2.to(This.$refs.next,1.5,{
              onStart(){
                This.$refs.next.style.zIndex = 3;
                This.curImg = This.createNextImg();
                This.$refs.cur.src = This.bgData[This.curImg].src;
                This.autoPlay()
              },
              opacity:0,
              onComplete(){
                This.$refs.next.style.zIndex = 0;
              }
            },6.5)
          },
          opacity:0,
          onComplete(){
            This.$refs.cur.style.zIndex = 0;
          }
        },6.5)

      }
    },
    created(){
      this.isChrome = /Chrome/i.test(navigator.appVersion);
      this.curImg = Math.floor(Math.random()*this.bgData.length,10);
    },
    mounted(){
      this.autoPlay();
      let mainEl = this.$refs.main;
      let bgwrap = this.$refs.bg_wrap;
      mainEl.style.height = window.innerHeight + 'px';
      bgwrap.style.height = window.innerHeight + 'px';
      this.setVerticalCenter();
      window.onresize = ()=>{
        bgwrap.style.height = window.innerHeight + 'px';
        mainEl.style.height = window.innerHeight + 'px';
        throttle(this.timer,this.setVerticalCenter.bind(this))
      }
    },
    beforeDestroy(){
      this.t && this.t.clear();
      this.t2 && this.t2.clear()
    },
    destroyed(){
      window.onresize = null;
    },
    components:{
      LoginBar
    }
  }
</script>

<style lang="stylus">
  @import '../../assets/css/stdio.stylus'
  #main
    overflow hidden
    position relative
    .bg-wrap
      position absolute
      z-index 1
      width 100%
      filter brightness(45%)
      background-color #000
      img
        min-height 100%
        min-width 100%
        position absolute
        transition filter ease-out .3s
        &.blurLevelOne
          filter blur(10px)
        &.blurLevelTwo
          filter blur(50px)
  .main-wrap
    position absolute
    z-index 2
    width 30%
    min-width 450px
    left 0
    right 0
    margin auto
    padding-top 0
    transition padding-top ease-out .25s
  #main .main-title
    display flex
    justify-content center
    align-items center
    position absolute
    left 0
    right 0
    bottom 50px
    margin auto
    z-index 1111
    color rgba(214, 214, 214, 0.45)
    font-size 14px
    -webkit-font-smoothing antialiased
    img
      width 32px
      height 32px
  #main .main-title h1
    margin-left 10px
    margin-right 20px
    font-size 14px
    font-weight normal
    padding-right 20px
    border-right 1px solid rgba(255,255,255,.3)

</style>
