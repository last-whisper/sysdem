import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import {get,post} from '@/axios'

//用户模块
const user = {
  state:{
    userId:''
  },
  mutations: {
    changeUserId(state,id){
      state.userId = id
    }
  }
};

//菜单模块
const menu = {
  state:{
    menulist:[
      {
        LevelOne:'展示中心',
        icon:'el-icon-arrow-up',
        open:false,
        children:[
          {
            LevelTwo:'系统首页',
            pathName:'systemindex',
            icon:'el-icon-menu',
            active:false
          }
        ]
      },
      {
        LevelOne:'系统设置',
        icon:'el-icon-arrow-up',
        open:false,
        children:[
          {
            LevelTwo:'用户管理',
            pathName:'usercontrol',
            icon:'el-icon-star-on',
            active:false
          },
          {
            LevelTwo:'角色管理',
            pathName:'rolecontrol',
            icon:'el-icon-star-off',
            active:false
          },
          {
            LevelTwo:'权限管理',
            pathName:'powercontrol',
            icon:'el-icon-view',
            active:false
          }
        ]
      },
      {
        LevelOne:'APP维护',
        icon:'el-icon-arrow-up',
        open:false,
        children:[
          {
            LevelTwo:'版本管理',
            pathName:'versioncontrol',
            icon:'el-icon-sold-out',
            active:false
          },
          {
            LevelTwo:'币种管理',
            pathName:'coinscontrol',
            icon:'el-icon-edit',
            active:false
          },
          {
            LevelTwo:'轮播管理',
            pathName:'bannercontrol',
            icon:'el-icon-picture',
            active:false
          },
          {
            LevelTwo:'意见反馈',
            pathName:'messagelist',
            icon:'el-icon-message',
            active:false
          },
          {
            LevelTwo:'消息推送',
            pathName:'noticepush',
            icon:'el-icon-news',
            active:false
          }
        ]
      },
      {
        LevelOne:'网站维护',
        icon:'el-icon-arrow-up',
        open:false,
        children:[
          {
            LevelTwo:'首页轮播',
            pathName:'webbannercontrol',
            icon:'el-icon-picture-outline',
            active:false
          }
        ]
      },
      {
        LevelOne:'安全中心',
        icon:'el-icon-arrow-up',
        open:false,
        children:[
          {
            LevelTwo:'权限操作管理',
            pathName:'poweroperationcontrol',
            icon:'el-icon-setting',
            active:false
          },
          {
            LevelTwo:'操作日志',
            pathName:'operationlog',
            icon:'el-icon-edit-outline',
            active:false
          }
        ]
      }
    ],
    currentPath:{index:0,k:0},
    //主题色
    rgbaColors:{
      dominant:'rgb(64,158,255)',
      secondary: 'rgb(160,207,255)'
    }
  },
  mutations:{
    foldMenu(state,{index,byrouter=false}){
      if(byrouter){
        //路由跳转直接打开一级菜单
        state.menulist[index].open = true
      }else {
        //手动点击一级菜单进行取反操作
        state.menulist[index].open = !state.menulist[index].open
      }
    },
    active(state,{index,k}){
      for(let i = 0;i<state.menulist.length;i++){
        for(let j = 0;j<state.menulist[i].children.length;j++){
          state.menulist[i].children[j].active = false
        }
      }
      state.menulist[index].children[k].active = true;
      state.currentPath = {index,k}
    },
    changeRgbaColors(state,colors={
      dominant:'rgb(64,158,255)',
      secondary: 'rgb(160,207,255)'
    }){
      state.rgbaColors = colors;
    }
  },
  getters:{
    breadPathList: state=>{
      return [
        state.menulist[state.currentPath.index].LevelOne,
        state.menulist[state.currentPath.index].children[state.currentPath.k].LevelTwo
      ]
    }
  }

};

//公共对话框模块
const tip = {
  state:{
    tipContent:{
      message:'',
      err:false,
      sure:'确定',
      exit:'',
      show:false
    },
    tokenInvalid:false,//control.vue watch tokenInvalid 弹出token失效确认框
  },
  mutations:{
    changeTokenInvalid(state,bool=false){
      state.tokenInvalid = bool;
    },
    //创建对话框
    createDialog(state,obj){
      state.tipContent.show = true;
      state.tipContent.message = obj.message;
      state.tipContent.exit = obj.exit || '';
      state.tipContent.err = obj.err || false;
      state.tipContent.sure = obj.sure || '确定'
    }
    ,
    //删除对话框
    deleteDialog(state){
      state.tipContent = {
        message:'',
        err:false,
        sure:'确定',
        exit:'',
        show:false
      }
    }
  }
};

export default new Vuex.Store({
  modules:{
    user,
    menu,
    tip
  }
})

