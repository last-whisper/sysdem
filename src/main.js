import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import store from '@/store/'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/common.stylus'
import 'mavon-editor/dist/css/index.css'
Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
