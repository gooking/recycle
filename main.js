import App from './App'
// 导入API工厂SDK
import WXAPI from 'apifm-uniapp'
// 导入配置文件
import config from './config.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
// 初始化SDK
WXAPI.init(config.appKey)
WXAPI.setMerchantId(config.merchantId)
// 全局挂载
Vue.prototype.$wxapi = WXAPI
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  // 初始化SDK
  WXAPI.init(config.appKey)
  WXAPI.setMerchantId(config.merchantId)
  // 全局挂载
  app.config.globalProperties.$wxapi = WXAPI
  return {
    app
  }
}
// #endif