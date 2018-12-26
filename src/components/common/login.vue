<template>
  <div class="user-login" >
    <el-row type="flex">
      <el-input
        placeholder="用户名"
        size="medium"
        clearable
        class="username-input input-item"
        @blur="userBlur"
        @input="userInput"
        @focus="onFocus"
        v-model="username">
      </el-input>
      <el-input
        class="password-input input-item"
        placeholder="密码"
        size="medium"
        @blur="passBlur"
        @input="passInput"
        @focus="onFocus"
        @keyup.13.native="login"
        clearable
        v-model="password">
      </el-input>
      <p v-show="usernameTtip" class="username-tip tip">{{usernameTtip}}</p>
      <p v-show="passwordTip" class="password-tip tip">{{passwordTip}}</p>
    </el-row>
    <el-button
      :class="{err:loginErr,ready:!isdisabled}"
      :loading="isloading"
      size="medium"
      :disabled="isdisabled"
      @click="login"
    >
      {{tip}}
    </el-button>
  </div>
</template>
<script>
  import {cookies} from '@/assets/js/tools'
  import api from '@/axios/api'
  import {mapMutations} from 'vuex'
  import {post} from '@/axios/'
  export default {
    data(){
      return {
        loginErr:false,
        username:'',
        password:'',
        tip:'登 录',
        isloading:false,
        usernameTtip:'',
        passwordTip:''
      }
    },
    computed:{
      isdisabled(){
        if(this.username.trim() && this.password.trim()){
          return false
        }else {
          return true
        }
      }
    },
    methods:{
      ...mapMutations(['changeUserId']),
      login(){
        if(this.isdisabled) return;
        this.loginErr = false;
        this.tip = '登陆中...';
        this.isloading = true;
        this.$emit('imgSupBlur');

        post(api.USER_LLOGIN,{//登陆不需要携带token，第三个参数需传入{}
          username:this.username,
          password:this.password
        },false).then(({data})=>{
          if(data.code){//登陆错误
            this.loginErr = true;
            this.isloading = false;
            switch (data.code) {
              case 6001:
                this.tip = '用户名或密码错误';
                break;
              default:
                this.tip = '未知错误';
                break;
            }
          }else {//登陆成功
            cookies('token',data.token);
            cookies('username',data.username);
            this.changeUserId(data.username);
            this.$router.push({name:'systemindex'})
          }
        })
      },
      userBlur(){
        if(!this.username.trim()){
          this.usernameTtip = '用户名不能为空'
        }else {
          this.usernameTtip = ''
        }
        this.$emit('imgFocus')

      },
      passBlur(){
        if(!this.password.trim()){
          this.passwordTip = '密码不能为空'
        }else {
          this.passwordTip = ''
        }
        this.$emit('imgFocus')

      },
      userInput(){
        if(!this.username.trim()){
          this.usernameTtip = '用户名不能为空'
        }else {
          this.usernameTtip = ''
        }
      },
      passInput(){
        if(!this.password.trim()){
          this.passwordTip = '密码不能为空'
        }else {
          this.passwordTip = ''
        }
      },
      onFocus(){
        this.tip = '登 陆';
        this.loginErr = false;
        this.$emit('imgBlur')
      }

    }
  }
</script>
<style lang="stylus">
  @import '../../assets/css/stdio.stylus'
  .user-login .loginTip
    position relative
    color #c8c8c8
    margin-bottom 30px
    margin-top 20px
    h2
      font-weight normal
      font-size 20px
      margin-bottom 15px
    p
      font-size 14px
      color #959595
    img
      position absolute
      right 0
      top -10px
  .user-login .el-row
    flex-direction column
    justify-content  space-around
    height 160px
    position relative
    p.tip
      position absolute
      height-line 26px
      width 100%
      font-size 12px
      color #ff9898
    p.password-tip
      top 145px
  .user-login .el-button
    display block
    border-radius 0
    font-weight normal
    -webkit-font-smoothing antialiased
    width 150px
    height 50px
    left 0
    right 0
    margin auto
    border-radius 25px
    margin-top 15px
    font-size 18px
    background #fff linear-gradient(#fff 0%,#fff 40%, #dbdddf 100%)
    color #000
    position absolute
    bottom -50px
    opacity 0
    transition bottom ease-out .2s .2s,opacity ease-out .2s,width ease-in-out .25s
    border none
    &.ready
      bottom 0px
      opacity 1
    &.err
      width 100%
      background #ff360e linear-gradient(#ff360e 0%,#ff360e 50%, #ff720e 100%)
      color #fff
      &:hover
        background #ff360e linear-gradient(#ff360e 0%,#ff360e 50%, #ff720e 100%)
        color #fff
    &:hover
      color #000
      transition bottom ease-out .5s,opacity ease-out .2s .4s,width ease-in-out .25s

  .user-login .input-item .el-input__inner
    box-sizing border-box
    height-line 50px
    color #fff
    border none
    border-bottom 1px solid rgba(255,255,255,.15)
    background none
    border-radius 0

  .user-login
    margin  40px 25px
    position relative
    height 225px
    overflow hidden
    input::-webkit-input-placeholder, textarea::-webkit-input-placeholder
      color #fff
    input:-moz-placeholder, textarea:-moz-placeholder
      color #fff
    input::-moz-placeholder, textarea::-moz-placeholder
      color #fff
    input:-ms-input-placeholder, textarea:-ms-input-placeholder
      color #fff

</style>
