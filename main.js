import App from './App'
import store from '@/store'
import vuexStore from '@/store/$u.mixin.js'
import mixin from '@/common/mixin'
// 导入API工厂SDK
import WXAPI from 'apifm-uniapp'
// 导入配置文件
import config from './config.js'

import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  // app.component https://uniapp.dcloud.net.cn/tutorial/vue3-components.html
  // app.component('my-component', myComponent) // 调用app.component方法全局注册组件
  // app.config https://uniapp.dcloud.net.cn/tutorial/vue3-api.html
  // app.directive app.mixin app.provide app.use
  // 初始化SDK
  WXAPI.init(config.subDomain)
  WXAPI.setMerchantId(config.merchantId)
  app.use(store)
  app.mixin(vuexStore)
  app.mixin(mixin)
  // 全局挂载
  app.config.globalProperties.$wxapi = WXAPI
  return {
    app,
	// Vuex // 注意，如果 nvue 使用 vuex 的各种map工具方法时，必须 return Vuex
  }
}