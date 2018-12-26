import Vue from 'vue'
import Router from 'vue-router'
import CoinuIndex from '@/components/view/index'
import ControlAside from '@/components/view/control'
import MessageList from '@/components/common/messagelist'
import SystemIndex from '@tpl/common/systemindex'
import UserControl from '@tpl/common/usercontrol'
import RoleControl from '@tpl/common/rolecontrol'
import PowerControl from '@tpl/common/powercontrol'
import CoinsControl from '@tpl/common/coinscontrol'
import NoticePush from '@tpl/common/noticepush'
import BannerControl from '@tpl/common/bannercontrol'
import WebBannerControl from '@tpl/common/webbannercontrol'
import PowerOperationControl from '@tpl/common/poweroperationcontrol'
import OperationLog from '@tpl/common/operationlog'
import VersionControl from '@tpl/common/versioncontrol'



import {post} from '@/assets/js/tools'
import store from '@/store'
import {cookies} from '@/assets/js/tools'
Vue.use(Router)

const router = new Router({
  mode:'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component:CoinuIndex
    },
    {
      path:'/control',
      component:ControlAside,
      meta:{requiresAuth: true},
      children:[
        {
          path:'',
          component:SystemIndex,
          name:'systemindex'
        },
        {
          path:'messagelist',
          component:MessageList,
          name:'messagelist'
        },
        {
          path:'usercontrol',
          component:UserControl,
          name:'usercontrol'
        },
        {
          path:'rolecontrol',
          component:RoleControl,
          name:'rolecontrol'
        },
        {
          path:'powercontrol',
          component:PowerControl,
          name:'powercontrol'
        },
        {
          path:'coinscontrol',
          component:CoinsControl,
          name:'coinscontrol'
        },
        {
          path:'bannercontrol',
          component:BannerControl,
          name:'bannercontrol'
        },
        {
          path:'webbannercontrol',
          component:WebBannerControl,
          name:'webbannercontrol'
        },
        {
          path:'poweroperationcontrol',
          component:PowerOperationControl,
          name:'poweroperationcontrol'
        },
        {
          path:'operationlog',
          component:OperationLog,
          name:'operationlog'
        },
        {
          path:'noticepuch',
          component:NoticePush,
          name:'noticepush'
        },
        {
          path:'versioncontrol',
          component:VersionControl,
          name:'versioncontrol'
        }

      ]
    }
  ],
});
router.beforeEach((to,from,next)=>{
  let token = cookies('token');
  let username = cookies('username');

  if(to.name === 'home'){//前往登陆页
    if(token && username){//有token和用户名重定向系统主页
      store.commit('changeUserId',cookies('username'));
      next({name:'systemindex'})
    }else {
      next()//没有token,在登陆页使用账号密码登陆
    }
  }else {
    if(token && username){
      store.commit('changeUserId',cookies('username'));

      //路由控制对应二级菜单的高亮，并且需要打开相应的一级菜单
      let menulist = store.state.menu.menulist;
      let subIndex = 0;//高亮二级菜单的index，默认第一个二级菜单高亮
      let index = menulist.findIndex((item,index)=>{//需要自动打开的一级菜单
        let r= item.children.findIndex((i,k)=>{
           if(i.pathName === to.name){
             subIndex = k;//设计需要高亮的二级菜单
             return true
           }
        });
        if(r>-1) return true
      });
      if(index === -1){//如果没有，默认打开第一个一级菜单
        index = 0
      }
      store.commit('foldMenu',{index,byrouter:true});
      store.commit('active',{index,k:subIndex});
      next()
    }else {
      next({name:'home'})
    }
  }

});

export default router
